import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import multipart from "@fastify/multipart";
import { registerRoutes } from "./routes/index.js";
import { initializeClient } from "./floimg/setup.js";

const fastify = Fastify({
  logger: true,
});

async function main() {
  // Initialize floimg client with plugins before anything else
  initializeClient();

  // Register Fastify plugins
  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(websocket);

  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
  });

  // Register routes
  await registerRoutes(fastify);

  // Start server
  const port = parseInt(process.env.PORT || "3001", 10);
  const host = process.env.HOST || "0.0.0.0";

  try {
    await fastify.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();
