const path = require("path");
const express = require("express");
const { expressStaticGzip } = require("express-static-gzip");

const app = express();

// Required if you built with Threads / SharedArrayBuffer:
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

const buildRoot = path.join(__dirname, ""); // contains index.html & Build/

app.use("/", expressStaticGzip(buildRoot, {
  enableBrotli: true,
  // Prefer Brotli and do NOT fall back to gzip
  orderPreference: ["br"],
  serveStatic: {
    setHeaders: (res, filePath) => {
      // Correct MIME types for Unity artifacts
      if (filePath.endsWith(".wasm") || filePath.endsWith(".wasm.br")) {
        res.setHeader("Content-Type", "application/wasm");
      } else if (filePath.endsWith(".js") || filePath.endsWith(".js.br")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (filePath.endsWith(".data") || filePath.endsWith(".data.br")) {
        res.setHeader("Content-Type", "application/octet-stream");
      } else if (filePath.endsWith(".symbols.json")) {
        res.setHeader("Content-Type", "application/json");
      }
    }
  }
}));

// SPA fallback so deep links/refresh work
app.get("*", (req, res) => {
  res.sendFile(path.join(buildRoot, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Unity WebGL (Brotli) on http://localhost:${port}`)
);