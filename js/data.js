const DATA_BASE = "data";

async function loadJSON(filename) {
  const res = await fetch(`${DATA_BASE}/${filename}`);
  if (!res.ok) throw new Error(`Failed to load ${filename}`);
  return res.json();
}

async function loadSiteData() {
  return loadJSON("site.json");
}

async function loadProjectsData() {
  return loadJSON("projects.json");
}

async function loadHobbiesData() {
  return loadJSON("hobbies.json");
}

async function loadFortunesData() {
  return loadJSON("fortunes.json");
}

async function loadWorkData() {
  return loadJSON("work.json");
}

async function loadWritingData() {
  return loadJSON("writing.json");
}

function findWritingBySlug(data, slug) {
  const normalized = slug?.trim();
  if (!normalized) return null;

  for (const category of data.categories) {
    const item = category.items.find((entry) => entry.slug?.trim() === normalized);
    if (item) return { item, category };
  }

  return null;
}
