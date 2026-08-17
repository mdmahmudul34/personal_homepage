const D = () => {
  const q = (s) => document.querySelector(s).getBoundingClientRect();
  const cs = (s) => getComputedStyle(document.querySelector(s));
  const box = q(".footer-status-text");
  const vo = q(".footer-voight");
  const termLines = Array.from(document.querySelectorAll(".footer-status-text .term-line")).map((el)=>{const b=el.getBoundingClientRect();return [+b.top.toFixed(1),+b.bottom.toFixed(1)];});
  const label = q(".footer-status .footer-label");
  const vfeed = q(".footer-voight .voight-feed");
  const vdots = q(".footer-voight .voight-dots");
  const vlabel = q(".footer-voight .voight-label");
  const feedEntries = Array.from(document.querySelectorAll(".footer-voight .voight-entry")).map((el)=>+el.getBoundingClientRect().height.toFixed(1));
  return {
    termFont: cs(".footer-status .term-line").fontFamily,
    termFontSize: cs(".footer-status .term-line").fontSize,
    voightFont: cs(".footer-voight .voight-entry").fontFamily,
    terminalBox: [+box.top.toFixed(1), +box.bottom.toFixed(1), +box.height.toFixed(1)],
    voightBox: [+vo.top.toFixed(1), +vo.bottom.toFixed(1), +vo.height.toFixed(1)],
    // terminal content span (first child top -> last term-line bottom)
    terminalFirstTop: +label.top.toFixed(1),
    terminalLastBottom: +termLines[termLines.length-1][1].toFixed(1),
    termLines,
    // voight content span (label top -> dots bottom)
    voightContentTop: +vlabel.top.toFixed(1),
    voightContentBottom: +vdots.bottom.toFixed(1),
    voightFeedBottom: +vfeed.bottom.toFixed(1),
    voightFeedEntryHeights: feedEntries,
    // System status heading line-height
    labelLineHeight: cs(".footer-status .footer-label").lineHeight,
  };
};
console.log(JSON.stringify(D(), null, 1));
