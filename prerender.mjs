import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "dist");

const { render } = await import("./dist/server/entry-server.js");

const template = fs.readFileSync(
  path.resolve(distPath, "index.html"),
  "utf-8",
);

const routes = [
  "/",
  "/case/msk-developer",
  "/case/revitale-clinic",
  "/case/me-esoterics",
];

for (const url of routes) {
  console.log(`Prerendering: ${url}`);
  const appHtml = render(url);

  const html = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`,
  );

  const filePath =
    url === "/"
      ? path.resolve(distPath, "index.html")
      : path.resolve(distPath, ...url.slice(1).split("/"), "index.html");

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html);
  console.log(`  -> ${path.relative(distPath, filePath)}`);
}

console.log("\nPrerender complete");
