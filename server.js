const https = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const tlsPemPath = process.env.TLS_PEM_PATH;
const tlsKeyPath = process.env.TLS_KEY_PATH;
const tlsCertPath = process.env.TLS_CERT_PATH;

const resolveFromRepoRoot = (p) => {
  if (!p) return p;
  return path.isAbsolute(p) ? p : path.join(__dirname, p);
};

const assertFileReadable = (label, filePath) => {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
  } catch (e) {
    throw new Error(
      `[TLS] ${label} not readable at: ${filePath}. ` +
        `Set TLS_PEM_PATH or TLS_KEY_PATH/TLS_CERT_PATH in your .env.`
    );
  }
};

let httpsOptions;
if (tlsKeyPath || tlsCertPath) {
  if (!tlsKeyPath || !tlsCertPath) {
    throw new Error(
      "[TLS] If using separate files, you must set BOTH TLS_KEY_PATH and TLS_CERT_PATH."
    );
  }

  const resolvedKey = resolveFromRepoRoot(tlsKeyPath);
  const resolvedCert = resolveFromRepoRoot(tlsCertPath);
  assertFileReadable("TLS key", resolvedKey);
  assertFileReadable("TLS cert", resolvedCert);

  httpsOptions = {
    key: fs.readFileSync(resolvedKey),
    cert: fs.readFileSync(resolvedCert),
  };
} else {
  const resolvedPem = resolveFromRepoRoot(tlsPemPath);
  assertFileReadable("TLS PEM", resolvedPem);

  httpsOptions = {
    key: fs.readFileSync(resolvedPem),
    cert: fs.readFileSync(resolvedPem),
  };
}

app.prepare().then(() => {
  https
    .createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(port, hostname, () => {
      console.log(`> HTTPS Server running at https://${hostname}:${port}`);
    });
});
