import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const PING_INTERVAL_MS = 14 * 60 * 1000;

function startKeepAlive() {
  const domain = process.env["REPLIT_DEV_DOMAIN"];
  if (!domain) {
    logger.warn("REPLIT_DEV_DOMAIN not set — keep-alive self-ping disabled");
    return;
  }

  const pingUrl = `https://${domain}/api/healthz`;
  logger.info({ pingUrl }, "Keep-alive self-ping enabled (every 14 min)");

  setInterval(async () => {
    try {
      const res = await fetch(pingUrl);
      logger.info({ status: res.status }, "Keep-alive ping sent");
    } catch (err) {
      logger.warn({ err }, "Keep-alive ping failed");
    }
  }, PING_INTERVAL_MS);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  startKeepAlive();
});
