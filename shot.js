const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const ROOT = __dirname;
const MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg", ".png": "image/png",
};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end("404"); }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.listen(0, async () => {
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/index.html`;
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new", args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 500, height: 900, deviceScaleFactor: 1 });
  await page.setRequestInterception(true);
  page.on("request", (r) => { if (r.url().includes("three.min.js")) r.abort(); else r.continue(); });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));
  const footer = await page.$("footer");
  // screenshot just the footer-system-status area
  const clip = await page.evaluate(() => {
    const el = document.querySelector(".footer-status");
    const b = el.getBoundingClientRect();
    return { x: Math.floor(b.left) - 8, y: Math.floor(b.top) - 8, width: Math.ceil(b.width + 16), height: Math.ceil(b.height + 16) };
  });
  await page.screenshot({ path: "footer-shots/footer-status.png", clip: { x: Math.max(0, clip.x), y: Math.max(0, clip.y), width: clip.width, height: clip.height } });
  // highlight the two boxes
  await page.evaluate(() => {
    const s = document.querySelector(".footer-status-text");
    const v = document.querySelector(".footer-voight");
    s.style.outline = "2px solid red";
    v.style.outline = "2px solid blue";
    // also draw a green box around voight content
  });
  await new Promise((r) => setTimeout(r, 200));
  const clip2 = await page.evaluate(() => {
    const el = document.querySelector(".footer-status");
    const b = el.getBoundingClientRect();
    return { x: Math.floor(b.left) - 8, y: Math.floor(b.top) - 8, width: Math.ceil(b.width + 16), height: Math.ceil(b.height + 16) };
  });
  await page.screenshot({ path: "footer-shots/footer-outlined.png", clip: { x: Math.max(0, clip2.x), y: Math.max(0, clip2.y), width: clip2.width, height: clip2.height } });
  await browser.close();
  server.close();
});
