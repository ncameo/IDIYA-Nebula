import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";

// NCameo forms ({formId}.json) and menu.json, imported in src/main.js as "@ncameo-forms/...".
const NCAMEO_FORMS_DIR = "/Users/arunyadav/MyProjects/nebula-products/ncameo/quzlglsembkgyxy";

const REACT_GLOBALS_MARKER = "<!-- React 18.2.0 globals";

// Vite merges every module script into one bundle and injects it at the end of <head>,
// after the plugin scripts. Move it back to the React globals marker so React is on
// globalThis before the plugins execute.
function bundleBeforePlugins() {
  return {
    name: "bundle-before-plugins",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const bundle = html.match(/\s*<script type="module"[^>]*src="[^"]*assets\/[^"]*"><\/script>/);
        if (!bundle || !html.includes(REACT_GLOBALS_MARKER)) return html;
        html = html.replace(bundle[0], "");
        const markerEnd = html.indexOf("-->", html.indexOf(REACT_GLOBALS_MARKER)) + 3;
        return html.slice(0, markerEnd) + bundle[0] + html.slice(markerEnd);
      }
    }
  };
}

// Dev-only endpoint behind the Sync button: POST /__sync runs scripts/sync-forms.mjs push
// (datasources + forms + menu) with this server's environment (NCAMEO_TOKEN etc.) and returns its output.
function syncEndpoint() {
  const script = fileURLToPath(new URL("./scripts/sync-forms.mjs", import.meta.url));
  return {
    name: "sync-endpoint",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__sync", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          return res.end();
        }
        execFile(process.execPath, [script, "push"], { timeout: 120000 }, (err, stdout, stderr) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: !err, output: `${stdout}${stderr}`.trim() }));
        });
      });
    }
  };
}

export default defineConfig({
  base: "./",
  // Built UI Extension plugins (<plugin>/ncameo.js + main.css) are served from the site root
  // and copied into dist/ on build.
  publicDir: fileURLToPath(new URL("../NCameoAdmin-Plugins-Solution/output", import.meta.url)),
  plugins: [bundleBeforePlugins(), syncEndpoint()],
  resolve: { alias: { "@ncameo-forms": NCAMEO_FORMS_DIR } },
  server: { port: 3000, open: true, fs: { allow: [fileURLToPath(new URL(".", import.meta.url)), NCAMEO_FORMS_DIR] } },
  preview: { port: 3000 }
});
