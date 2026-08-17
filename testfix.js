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
  baseline: "",
  center: `
    .footer-status-text{ display:flex; flex-direction:column; justify-content:center; }
  `,
  spaceBetween: `
    .footer-status-text{ display:flex; flex-direction:column; justify-content:space-between; }
  `,
  spaceEvenly: `
    .footer-status-text{ display:flex; flex-direction:column; justify-content:space-evenly; }
  `,
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
      await new Promise((r) => setTimeout(r, 400));
      const d = await page.evaluate(() => {
        const v = document.querySelector(".footer-voight").getBoundingClientRect();
        const first = document.querySelector(".footer-status-text").firstElementChild.getBoundingClientRect();
        const lines = Array.from(document.querySelectorAll(".footer-status-text .term-line"));
        const last = lines[lines.length - 1].getBoundingClientRect();
        const fst = document.querySelector(".footer-status-text").getBoundingClientRect();
        const vo = document.querySelector(".footer-voight");
        const vfeed = vo.querySelector(".voight-feed").getBoundingClientRect();
        const vdots = vo.querySelector(".voight-dots").getBoundingClientRect();
        return {
          voightTop: +v.top.toFixed(2), voightBottom: +v.bottom.toFixed(2), voightH: +v.height.toFixed(2),
          boxTop: +fst.top.toFixed(2), boxBottom: +fst.bottom.toFixed(2),
          firstTop: +first.top.toFixed(2),
          lastBottom: +last.bottom.toFixed(2),
          gapTop: +(first.top - v.top).toFixed(2),
          gapBottom: +(v.bottom - last.bottom).toFixed(2),
          vfeedBottom: +vfeed.bottom.toFixed(2),
          vdotsBottom: +vdots.bottom.toFixed(2),
        };
      });
      console.log(`[${label}] ${name.padEnd(13)} voight[${d.voightTop}..${d.voightBottom} h=${d.voightH}] box[${d.boxTop}..${d.boxBottom}] firstTop=${d.firstTop} lastBottom=${d.lastBottom} gaps(top=${d.gapTop}, bottom=${d.gapBottom}) __ vfeedBottom=${d.vfeedBottom} vdotsBottom=${d.vdotsBottom}`);
      await page.close();
    }
  }

  await run(500, "w500");
  await run(360, "w360");
  await browser.close();
  server.close();
});
