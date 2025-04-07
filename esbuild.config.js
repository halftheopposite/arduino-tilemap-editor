const esbuild = require("esbuild");
const http = require("http");
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const isServe = args.includes("--serve");

const PORT = 3000;

// Check if we're building for GitHub Pages
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const buildOptions = {
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "public/bundle.js",
  minify: !isServe,
  sourcemap: isServe,
  target: ["es2020", "chrome80", "firefox80", "safari13"],
  loader: {
    ".png": "dataurl",
    ".jpg": "dataurl",
    ".svg": "text",
    ".tsx": "tsx",
    ".ts": "tsx",
  },
  jsx: "automatic",
  // Set the public path for GitHub Pages if needed
  publicPath: isGitHubPages ? "/arduino-tilemap-editor" : "/",
};

// Function to start the development server
function startDevServer() {
  // Start a simple HTTP server
  const server = http.createServer((req, res) => {
    const url = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(__dirname, "public", url.replace(/^\//, ""));
    const contentType = getContentType(filePath);

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === "ENOENT") {
          res.writeHead(404);
          res.end("File not found");
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
    console.log("Press Ctrl+C to stop");
  });
}

// Build and serve based on arguments
if (isServe) {
  // Use watch mode when serving
  esbuild
    .context(buildOptions)
    .then((context) => {
      // Start watch mode
      context.watch();
      console.log("Watch mode enabled - rebuilding on file changes");

      // Start the dev server
      startDevServer();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else {
  // Just build once for production
  esbuild
    .build(buildOptions)
    .then(() => {
      console.log("Build complete");
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

function getContentType(filePath) {
  const extname = path.extname(filePath);
  switch (extname) {
    case ".html":
      return "text/html";
    case ".js":
      return "text/javascript";
    case ".css":
      return "text/css";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    default:
      return "text/plain";
  }
}
