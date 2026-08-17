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

const candidates = {
  voightBetween: `.footer-voight{ justify-content:space-between; }`,
  voightBetween_Pad0: `.footer-voight{ justify-content:space-between; padding-top:0; padding-bottom:0; }`,
  voightBetween_055: `.footer-voight{ justify-content:space-between; padding-top:0.13rem; padding-bottom:0.13rem; }
    .footer-voight .voight-feed{margin-top:0.02rem;}
    .footer-voight .voight-dots{margin-top:0.05rem;}`,
};

server.listen(0, async () => {
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/index.html`;
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new", args: ["--no-sandbox"],
  });
  async function run(width, label) {
    for (const [name, css] of Object.entries(candidates)) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      await page.setRequestInterception(true);
      page.on("request", (r) => { if (r.url().includes("three.min.js")) r.abort(); else r.continue(); });
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
      if (css) await page.addStyleTag({ content: css });
      await page.waitForSelector(".footer-status .term-line", { timeout: 8000 });
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
      await new Promise((r) => setTimeout(r, 400));
      const d = await page.evaluate(() => {
        const glb = (s) => document.querySelector(s).getBoundingClientRect();
        const tb = glb(".footer-status-text"), vb = glb(".footer-voight");
        const label = glb(".footer-status .footer-label");
        const lines = Array.from(document.querySelectorAll(".footer-status .term-line"));
        const whoami = lines[0], theme = lines[lines.length - 1];
        const vlab = glb(".footer-voight .voight-label");
        const vfeed = glb(".footer-voight .voight-feed");
        const vdots = glb(".footer-voight .voight-dots");
        const R = (n) => (n ? +n.toFixed(1) : null);
        return {
          tb: [R(tb.top), R(tb.bottom)],
          termContent: [R(label.top), R(theme.bottom)],
          whoamiTop: R(whoami.top),
          themeBottom: R(theme.bottom),
          voightContent: [R(vlab.top), R(vdots.bottom)],
          vlab: [R(vlab.top), R(vlab.bottom)],
          vfeed: [R(vfeed.top), R(vfeed.bottom)],
          vdots: [R(vdots.top), R(vdots.bottom)],
        };
      });
      if (!d.termContent[1]) { console.log(`[${label}] ${name}: NO_DATA`); await page.close(); continue; }
      const tBottomGap = +(d.tb[1] - d.termContent[1]).toFixed(1);
      const vBottomGap = +(d.tb[1] - d.voightContent[1]).toFixed(1);
      const tSpan = +(+d.termContent[1] - +d.termContent[0]).toFixed(1);
      const vSpan = +(+d.voightContent[1] - +d.voightContent[0]).toFixed(1);
      const vfeedspan = +(+d.vfeed[1] - +d.vfeed[0]).toFixed(1);
      console.log(`[${label}] ${name.padEnd(26)} boxH=${(+d.tb[1] - +d.tb[0]).toFixed(1)} | term span=${tSpan}(botGap=${tBottomGap}) whoami=${d.whoamiTop} themeBottom=${d.themeBottom} | voig span=${vSpan}(topGap=${(+d.voightContent[0] - +d.tb[0]).toFixed(1)} botGap=${vBottomGap}) feed[${d.vfeed} span=${vfeedspan}] dots[${d.vdots}] | CONTENT-bottom-diff=${(+d.termContent[1] - +d.voightContent[1]).toFixed(1)}`);
      await page.close();
    }
  }
  await run(500, "w500");
  await run(360, "w360");
  await browser.close();
  server.close();
});
