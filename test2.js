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

// Candidate CSS combos
const candidates = {
  baseline: ``,
  voightCenter: `.footer-voight{ justify-content:center; }`,
  voightBetween: `.footer-voight{ justify-content:space-between; }`,
  voightCenterReducePad: `.footer-voight{ justify-content:center; padding-top:0; padding-bottom:0; }
    .footer-voight .voight-label{line-height:1;}
    .footer-voight .voight-dots{margin-top:0.05rem;}
    .footer-voight .voight-feed{margin-top:0;}`,
  termTighter_voightFill: `
    .footer-status .term-line{ line-height:1.05; margin:0.02rem 0; }
    .footer-status .footer-label{ line-height:1.2; margin-bottom:0.04rem; }
    .footer-voight{ justify-content:space-between; }
    .footer-voight .voight-dots{margin-top:0.02rem;}
    .footer-voight .voight-feed{margin-top:0;}`,
  bothCenter: `
    .footer-status-text{ display:flex; flex-direction:column; justify-content:center; }
    .footer-voight{ justify-content:center; }`,
};

server.listen(0, async () => {
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/index.html`;
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new", args: ["--no-sandbox"],
  });

  function report(tb, vb, tc, vc, boxH) {
    // tb: terminal content top, terminal content bottom
    // vb: voight content top/bottom
    const tSpan = +(tc[1]-tc[0]).toFixed(1), vSpan = +(vc[1]-vc[0]).toFixed(1);
    const voightTopGap = +(vc[0]-vb[0]).toFixed(1), voightBottomGap = +(vb[1]-vc[1]).toFixed(1);
    const termTopGap = +(tc[0]-tb[0]).toFixed(1), termBottomGap = +(tb[1]-tc[1]).toFixed(1);
    const boxTopMatch = Math.abs(tb[0]-vb[0]) < 0.5, boxBottomMatch = Math.abs(tb[1]-vb[1]) < 0.5;
    return `termContent[${tc[0]}..${tc[1]} span=${tSpan} | topGap=${termTopGap} botGap=${termBottomGap}] `
         + `voightContent[${vc[0]}..${vc[1]} span=${vSpan} | topGap=${voightTopGap} botGap=${voightBottomGap}] `
         + `box[${tb[0]}..${tb[1]} h=${boxH}] |> topMatch=${boxTopMatch} botMatch=${boxBottomMatch}`;
  }

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
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        const tb = r(".footer-status-text");
        const vb = r(".footer-voight");
        const firstTerm = document.querySelector(".footer-status-text").firstElementChild;
        const termLines = Array.from(document.querySelectorAll(".footer-status-text .term-line"));
        const lastTerm = termLines[termLines.length-1];
        const tc = [firstTerm.getBoundingClientRect().top, lastTerm.getBoundingClientRect().bottom];
        const vcTop = r(".footer-voight .voight-label").top;
        const vcBottom = r(".footer-voight .voight-dots").bottom;
        return { tb:[+tb.top.toFixed(1),+tb.bottom.toFixed(1)], vb:[+vb.top.toFixed(1),+vb.bottom.toFixed(1)],
                 tc:tc.map(v=>+v.toFixed(1)), vc:[+vcTop.toFixed(1),+vcBottom.toFixed(1)], boxH:+tb.height.toFixed(1) };
      });
      console.log(`[${label}] ${name.padEnd(24)} ${report(d.tb,d.vb,d.tc,d.vc,d.boxH)}`);
      await page.close();
    }
  }

  await run(500, "w500");
  await run(360, "w360");
  await browser.close();
  server.close();
});
