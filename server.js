// Load environment variables (.env, .env.production) immediately for GoDaddy container
try {
  const { loadEnvConfig } = require("@next/env");
  loadEnvConfig(process.cwd());
} catch (e) {
  // @next/env fallback if not present
}

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false;
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let isReady = false;

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Immediate health check response for GoDaddy container probes
  if (pathname === "/health" || pathname === "/ping" || pathname === "/api/health" || pathname === "/_health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", ready: isReady }));
    return;
  }

  // If Next.js is still preparing on initial container startup, wait for it
  if (!isReady) {
    if (req.method === "HEAD" || req.headers["user-agent"]?.includes("GoDaddy") || req.headers["user-agent"]?.includes("HealthCheck")) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Warming up");
      return;
    }
    await appReadyPromise;
  }

  try {
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error("Error handling request", req.url, err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
});

// Explicitly bind to 0.0.0.0 and process.env.PORT as required by GoDaddy
server.listen(port, "0.0.0.0", (err) => {
  if (err) {
    console.error("Failed to bind port:", err);
    process.exit(1);
  }
  console.log(`> AURA SPARKLES listening immediately on 0.0.0.0:${port}`);
});

const appReadyPromise = app.prepare().then(() => {
  isReady = true;
  console.log("> Next.js application ready to receive traffic");
}).catch((err) => {
  console.error("Error preparing Next.js app:", err);
});
