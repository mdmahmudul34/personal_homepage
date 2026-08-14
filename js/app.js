function initTheme() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  // The symbol is driven by CSS via the .dark class on <html>/<body> (see
  // styles.css), so we never text-swap it here and it can never flash the wrong
  // theme's symbol while loading. Just keep the theme class in sync.
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
    document.documentElement.classList.add("dark");
  }

  btn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    // Keep <html> and <body> in sync so the document root is always themed
    // (prevents a white frame on the next navigation / first paint).
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    toggle.classList.toggle("open");
    toggle.setAttribute("aria-expanded", nav.classList.contains("open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

async function initApp(page) {
  initTheme();
  initMobileNav();

  try {
    const site = await loadSiteData();
    renderNav(site.navigation, page);
    renderFooter(site, page);
    return site;
  } catch (err) {
    console.error("Failed to load site data:", err);
    return null;
  }
}

async function initHomePage() {
  const site = await initApp("home");
  if (!site) return;

  renderHero(site.personal, site.meta, site.home);
  initScrollReveal();
}

async function initWorkHubPage() {
  await initApp("work");
  const data = await loadWorkData();
  renderHubPage(data, "work.html", { botanical: "work" });
  initScrollReveal();
}

async function initWritingHubPage() {
  await initApp("writing");
  const data = await loadWritingData();
  renderHubPage(data, "writing.html", { botanical: "writing" });
  initScrollReveal();
}

async function initWorkCategoryPage(categoryId) {
  await initApp(`work-${categoryId}`);
  const data = await loadWorkData();
  renderCategoryPage(data, categoryId, "work.html", "Work");
  initScrollReveal();
}

async function initWritingCategoryPage(categoryId) {
  await initApp(`writing-${categoryId}`);
  const data = await loadWritingData();
  renderCategoryPage(data, categoryId, "writing.html", "Writing", { writingMode: true });
  initScrollReveal();
}

async function initWritingPostPage() {
  await initApp("writing-post");

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug?.trim()) {
    renderWritingPostNotFound("Missing slug");
    initScrollReveal();
    return;
  }

  try {
    const data = await loadWritingData();
    const result = findWritingBySlug(data, slug);

    if (!result) {
      renderWritingPostNotFound("Not found");
      initScrollReveal();
      return;
    }

    renderWritingPost(result);
    initScrollReveal();
  } catch (err) {
    console.error("Failed to load writing post:", err);
    renderWritingPostNotFound("Error loading post");
  }
}

async function initExperiencePage() {
  const site = await initApp("experience");
  if (!site) return;

  renderEducationTable(site.educationTable);
  initScrollReveal();
}

async function initAboutPage() {
  const site = await initApp("about");
  if (!site) return;

  const hobbies = await loadHobbiesData();
  renderAboutPage(site, hobbies);
  initScrollReveal();
}

async function initContactPage() {
  const site = await initApp("contact");
  if (!site) return;

  renderContact(site.meta);
  initScrollReveal();
}

async function initPlaygroundPage() {
  await initApp("playground");
  initFortuneGenerator();
  initWeightConverter();
  initStopwatch();
  initTodoList();
  initScrollReveal();
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "writing-post") {
    initWritingPostPage();
    return;
  }
  if (page?.startsWith("work-")) {
    initWorkCategoryPage(page.slice(5));
    return;
  }
  if (page?.startsWith("writing-")) {
    initWritingCategoryPage(page.slice(8));
    return;
  }

  switch (page) {
    case "home":
      initHomePage();
      break;
    case "work":
      initWorkHubPage();
      break;
    case "writing":
      initWritingHubPage();
      break;
    case "experience":
      initExperiencePage();
      break;
    case "about":
      initAboutPage();
      break;
    case "contact":
      initContactPage();
      break;
    case "playground":
      initPlaygroundPage();
      break;
    default:
      initApp(page || "home");
  }
});
