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

    // Orbit the sun/moon icons inside the toggle (icon only — the button box
    // itself is untouched). A transient class on <html> drives the CSS keyframes
    // so the animation plays only on toggle, in both directions.
    const root = document.documentElement;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;
    const toDark = "theme-anim-to-dark";
    const toLight = "theme-anim-to-light";
    const active = isDark ? toDark : toLight;
    const other = isDark ? toLight : toDark;
    root.classList.remove(other);
    // restart the animation if toggled again quickly
    root.classList.remove(active);
    void root.offsetWidth;
    root.classList.add(active);
    window.clearTimeout(window.__themeAnimT);
    window.__themeAnimT = window.setTimeout(
      () => root.classList.remove(active),
      650
    );
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

function initContactButton() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const btn = form.querySelector(".contact-submit");
  if (!btn) return;

  btn.addEventListener("click", function (event) {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    ripple.style.left = (event.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (event.clientY - rect.top - size / 2) + "px";

    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    btn.textContent = "Send it over";
    btn.disabled = true;
    btn.classList.remove("error", "success");

    const formData = new FormData(form);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        btn.textContent = "Got it, thanks ✓";
        btn.classList.add("success");
        btn.classList.remove("error");
        btn.disabled = false;
        form.reset();
      } else {
        btn.textContent = "Transmission failed ✕";
        btn.disabled = false;
        btn.classList.add("error");
        btn.classList.remove("success");
      }
    } catch (error) {
      btn.textContent = "Transmission failed ✕";
      btn.disabled = false;
      btn.classList.add("error");
      btn.classList.remove("success");
    }
  });

  form.querySelectorAll("input, textarea").forEach(function (field) {
    field.addEventListener("input", function () {
      btn.textContent = "Send it over";
      btn.classList.remove("error", "success");
    });
  });
}

function initContactStatus() {
  const statusEl = document.querySelector(".contact-status");
  const wordEl = statusEl ? statusEl.querySelector(".contact-word") : null;
  if (!statusEl || !wordEl) return;

  const words = [
    "awake",
    "connected",
    "online",
    "listening",
    "present",
    "active",
    "transmitting",
    "unbound",
  ];
  let index = 0;
  let timeout;

  function typeWord(word, onDone) {
    let i = 0;
    const interval = setInterval(() => {
      wordEl.textContent = word.substring(0, i + 1);
      i++;
      if (i >= word.length) {
        clearInterval(interval);
        onDone();
      }
    }, 100);
  }

  function cycle() {
    typeWord(words[index], () => {
      timeout = setTimeout(() => {
        index = (index + 1) % words.length;
        wordEl.textContent = "";
        cycle();
      }, 2500);
    });
  }

  timeout = setTimeout(cycle, 3000);
}

async function initContactPage() {
  const site = await initApp("contact");
  if (!site) return;

  renderContact(site.meta);
  initScrollReveal();
  initContactButton();
  initContactStatus();
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
