/**
 * Content Moderation Service
 *
 * Uses OpenAI's Moderation API to scan content before it's saved to disk.
 * SCAN BEFORE SAVE - Nothing touches disk without passing moderation.
 */

import OpenAI from "openai";

export interface ModerationResult {
  safe: boolean;
  flagged: boolean;
  categories: {
    sexual: boolean;
    sexualMinors: boolean;
    hate: boolean;
    hateThreatening: boolean;
    harassment: boolean;
    harassmentThreatening: boolean;
    selfHarm: boolean;
    selfHarmIntent: boolean;
    selfHarmInstructions: boolean;
    violence: boolean;
    violenceGraphic: boolean;
  };
  categoryScores: Record<string, number>;
  flaggedCategories: string[];
}

export interface ModerationOptions {
  /** Skip moderation (for self-hosted instances without API key) */
  skip?: boolean;
}

// Singleton OpenAI client
let openaiClient: OpenAI | null = null;

/**
 * Initialize the moderation service
 * Call this on server startup
 */
export function initModeration(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[Moderation] OPENAI_API_KEY not set. Content moderation is DISABLED.");
    console.warn("[Moderation] Set OPENAI_API_KEY to enable automatic content scanning.");
    return false;
  }

  openaiClient = new OpenAI({ apiKey });
  console.log("[Moderation] Content moderation enabled with OpenAI Moderation API");
  return true;
}

/**
 * Check if moderation is available
 */
export function isModerationEnabled(): boolean {
  return openaiClient !== null;
}

/**
 * Moderate text content (chart labels, diagram text, etc.)
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  if (!openaiClient) {
    // Moderation disabled - allow content through with warning
    return createPassResult();
  }

  try {
    const response = await openaiClient.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const result = response.results[0];
    return convertOpenAIResult(result);
  } catch (error) {
    console.error("[Moderation] Text moderation failed:", error);
    // On error, err on the side of caution - block content
    return createBlockResult("Moderation service unavailable");
  }
}

/**
 * Moderate image content
 *
 * @param imageBuffer - Raw image bytes
 * @param mimeType - Image MIME type (image/png, image/jpeg, etc.)
 */
export async function moderateImage(
  imageBuffer: Buffer,
  mimeType: string = "image/png"
): Promise<ModerationResult> {
  if (!openaiClient) {
    // Moderation disabled - allow content through with warning
    return createPassResult();
  }

  try {
    // Convert buffer to base64 data URL
    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const response = await openaiClient.moderations.create({
      model: "omni-moderation-latest",
      input: [
        {
          type: "image_url",
          image_url: {
            url: dataUrl,
          },
        },
      ],
    });

    const result = response.results[0];
    return convertOpenAIResult(result);
  } catch (error) {
    console.error("[Moderation] Image moderation failed:", error);
    // On error, err on the side of caution - block content
    return createBlockResult("Moderation service unavailable");
  }
}

/**
 * Moderate both text and image together
 * Useful for charts/diagrams that contain both text labels and generated images
 */
export async function moderateContent(
  text?: string,
  imageBuffer?: Buffer,
  mimeType?: string
): Promise<ModerationResult> {
  const results: ModerationResult[] = [];

  // Check text if provided
  if (text && text.trim().length > 0) {
    const textResult = await moderateText(text);
    results.push(textResult);
  }

  // Check image if provided
  if (imageBuffer && imageBuffer.length > 0) {
    const imageResult = await moderateImage(imageBuffer, mimeType);
    results.push(imageResult);
  }

  // If no content to check, pass
  if (results.length === 0) {
    return createPassResult();
  }

  // Combine results - flagged if ANY check is flagged
  return combineResults(results);
}

/**
 * Convert OpenAI moderation result to our format
 */
function convertOpenAIResult(result: OpenAI.Moderation): ModerationResult {
  const flaggedCategories: string[] = [];

  // Collect flagged categories
  for (const [category, flagged] of Object.entries(result.categories)) {
    if (flagged) {
      flaggedCategories.push(category);
    }
  }

  return {
    safe: !result.flagged,
    flagged: result.flagged,
    categories: {
      sexual: result.categories.sexual || false,
      sexualMinors: result.categories["sexual/minors"] || false,
      hate: result.categories.hate || false,
      hateThreatening: result.categories["hate/threatening"] || false,
      harassment: result.categories.harassment || false,
      harassmentThreatening: result.categories["harassment/threatening"] || false,
      selfHarm: result.categories["self-harm"] || false,
      selfHarmIntent: result.categories["self-harm/intent"] || false,
      selfHarmInstructions: result.categories["self-harm/instructions"] || false,
      violence: result.categories.violence || false,
      violenceGraphic: result.categories["violence/graphic"] || false,
    },
    categoryScores: result.category_scores as unknown as Record<string, number>,
    flaggedCategories,
  };
}

/**
 * Create a passing result (for when moderation is disabled)
 */
function createPassResult(): ModerationResult {
  return {
    safe: true,
    flagged: false,
    categories: {
      sexual: false,
      sexualMinors: false,
      hate: false,
      hateThreatening: false,
      harassment: false,
      harassmentThreatening: false,
      selfHarm: false,
      selfHarmIntent: false,
      selfHarmInstructions: false,
      violence: false,
      violenceGraphic: false,
    },
    categoryScores: {},
    flaggedCategories: [],
  };
}

/**
 * Create a blocking result (for errors/unavailability)
 */
function createBlockResult(reason: string): ModerationResult {
  return {
    safe: false,
    flagged: true,
    categories: {
      sexual: false,
      sexualMinors: false,
      hate: false,
      hateThreatening: false,
      harassment: false,
      harassmentThreatening: false,
      selfHarm: false,
      selfHarmIntent: false,
      selfHarmInstructions: false,
      violence: false,
      violenceGraphic: false,
    },
    categoryScores: {},
    flaggedCategories: [reason],
  };
}

/**
 * Combine multiple moderation results
 * Flagged if ANY result is flagged
 */
function combineResults(results: ModerationResult[]): ModerationResult {
  const combined = createPassResult();

  for (const result of results) {
    if (result.flagged) {
      combined.safe = false;
      combined.flagged = true;
      combined.flaggedCategories.push(...result.flaggedCategories);

      // Merge categories
      for (const [key, value] of Object.entries(result.categories)) {
        if (value) {
          (combined.categories as Record<string, boolean>)[key] = true;
        }
      }

      // Merge scores (take max)
      for (const [key, value] of Object.entries(result.categoryScores)) {
        const currentScore = combined.categoryScores[key] || 0;
        combined.categoryScores[key] = Math.max(currentScore, value);
      }
    }
  }

  // Dedupe flagged categories
  combined.flaggedCategories = [...new Set(combined.flaggedCategories)];

  return combined;
}

/**
 * Log a moderation incident for admin review
 */
export function logModerationIncident(
  type: "generated" | "uploaded",
  result: ModerationResult,
  context?: Record<string, unknown>
): void {
  const incident = {
    timestamp: new Date().toISOString(),
    type,
    flagged: result.flagged,
    categories: result.flaggedCategories,
    scores: result.categoryScores,
    context,
  };

  // For now, just log to console
  // In production, this would go to a database or logging service
  console.warn("[Moderation] Content flagged:", JSON.stringify(incident, null, 2));
}
