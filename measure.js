const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const ROOT = __dirname;
const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) {
    res.writeHead(404);
    return res.end("404");
  }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.listen(0, async () => {
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/index.html`;

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox"],
  });

  async function measure(width, height, label) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    // block external three.js CDN to speed up; footer doesn't need it
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      if (r.url().includes("three.min.js")) r.abort();
      else r.continue();
    });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    // ensure themes don't matter; measure computed rects
    const info = await page.evaluate(() => {
      function rect(sel, which) {
        const el = document.querySelector(sel);
        if (!el) return null;
        const b = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          top: +b.top.toFixed(2),
          bottom: +b.bottom.toFixed(2),
          height: +b.height.toFixed(2),
          width: +b.width.toFixed(2),
          pt: cs.paddingTop,
          pb: cs.paddingBottom,
          display: cs.display,
          flexDir: cs.flexDirection,
          justify: cs.justifyContent,
          alignSelf: cs.alignSelf,
          alignItems: cs.alignItems,
        };
      }
      // first .term-line and last .term-line tops/bottoms
      const terms = Array.from(document.querySelectorAll(".footer-status .term-line"));
      const t = terms.map((el) => {
        const b = el.getBoundingClientRect();
        return { top: +b.top.toFixed(2), bottom: +b.bottom.toFixed(2), height: +b.height.toFixed(2) };
      });
      // voight inner pieces
      const vlabel = document.querySelector(".footer-voight .voight-label");
      const vfeed = document.querySelector(".footer-voight .voight-feed");
      const vdots = document.querySelector(".footer-voight .voight-dots");
      const vlb = vlabel ? vlabel.getBoundingClientRect() : null;
      const vdb = vdots ? vdots.getBoundingClientRect() : null;
      const vfb = vfeed ? vfeed.getBoundingClientRect() : null;
      const statusLabel = document.querySelector(".footer-status .footer-label");
      const slb = statusLabel ? statusLabel.getBoundingClientRect() : null;
      return {
        status: rect(".footer-status"),
        statusText: rect(".footer-status-text"),
        voight: rect(".footer-voight"),
        termLines: t,
        statusLabel: slb ? { top: +slb.top.toFixed(2), bottom: +slb.bottom.toFixed(2) } : null,
        voightLabel: vlb ? { top: +vlb.top.toFixed(2), bottom: +vlb.bottom.toFixed(2) } : null,
        voightFeed: vfb ? { top: +vfb.top.toFixed(2), bottom: +vfb.bottom.toFixed(2) } : null,
        voightDots: vdb ? { top: +vdb.top.toFixed(2), bottom: +vdb.bottom.toFixed(2) } : null,
        fontSize: getComputedStyle(document.querySelector(".footer-status .term-line")).fontSize,
      };
    });
    console.log(`\n===== ${label} width=${width} =====`);
    console.log(JSON.stringify(info, null, 1));
    await page.close();
  }

  await measure(500, 800, "mobile-main-720-400");
  await measure(360, 800, "narrow-under400");

  await browser.close();
  server.close();
});
