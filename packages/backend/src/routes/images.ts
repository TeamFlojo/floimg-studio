import type { FastifyInstance } from "fastify";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

const OUTPUT_DIR = "./data/images";

export async function imagesRoutes(fastify: FastifyInstance) {
  // List all images
  fastify.get("/", async (request, reply) => {
    try {
      const files = await readdir(OUTPUT_DIR);
      const images = await Promise.all(
        files
          .filter((f) => /\.(png|jpg|jpeg|webp|svg)$/i.test(f))
          .map(async (filename) => {
            const filePath = join(OUTPUT_DIR, filename);
            const stats = await stat(filePath);
            const id = filename.replace(/\.[^.]+$/, "");
            const ext = filename.split(".").pop() || "png";
            const mime =
              ext === "svg"
                ? "image/svg+xml"
                : ext === "jpg" || ext === "jpeg"
                  ? "image/jpeg"
                  : `image/${ext}`;

            return {
              id,
              filename,
              mime,
              size: stats.size,
              createdAt: stats.birthtime.getTime(),
            };
          })
      );

      // Sort by creation time descending
      images.sort((a, b) => b.createdAt - a.createdAt);

      return images;
    } catch (error) {
      // Directory might not exist yet
      return [];
    }
  });

  // Get image blob
  fastify.get<{ Params: { id: string } }>("/:id/blob", async (request, reply) => {
    const { id } = request.params;

    try {
      const files = await readdir(OUTPUT_DIR);
      const file = files.find((f) => f.startsWith(id));

      if (!file) {
        reply.code(404);
        return { error: "Image not found" };
      }

      const filePath = join(OUTPUT_DIR, file);
      const buffer = await readFile(filePath);
      const ext = file.split(".").pop() || "png";
      const mime =
        ext === "svg"
          ? "image/svg+xml"
          : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : `image/${ext}`;

      reply.header("Content-Type", mime);
      reply.header("Cache-Control", "public, max-age=31536000");
      return buffer;
    } catch (error) {
      reply.code(404);
      return { error: "Image not found" };
    }
  });

  // Get image metadata
  fastify.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const { id } = request.params;

    try {
      const files = await readdir(OUTPUT_DIR);
      const file = files.find((f) => f.startsWith(id));

      if (!file) {
        reply.code(404);
        return { error: "Image not found" };
      }

      const filePath = join(OUTPUT_DIR, file);
      const stats = await stat(filePath);
      const ext = file.split(".").pop() || "png";
      const mime =
        ext === "svg"
          ? "image/svg+xml"
          : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : `image/${ext}`;

      return {
        id,
        filename: file,
        mime,
        size: stats.size,
        createdAt: stats.birthtime.getTime(),
      };
    } catch (error) {
      reply.code(404);
      return { error: "Image not found" };
    }
  });
}
