/**
 * Content Moderation Module
 *
 * Provides content scanning using OpenAI's Moderation API.
 * SCAN BEFORE SAVE - Nothing touches disk without passing moderation.
 */

export {
  initModeration,
  isModerationEnabled,
  moderateText,
  moderateImage,
  moderateContent,
  logModerationIncident,
  type ModerationResult,
  type ModerationOptions,
} from "./moderator.js";
