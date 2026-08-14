function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* Voight kompff terminal feed pool (CHECKPOINT J).
   Fixed pre-paired hex + word combinations — each feed entry picks ONE
   complete pair; hex and word are locked together and never mixed. */
const VOIGHT_POOL = [
  "1F7 dossier",
  "4A2 flow",
  "09C glitch",
  "E34 veja",
  "7B4 chlorofyl",
  "2D9 moss",
  "F60 pulse",
  "A17 renfri",
  "5E8 drift",
  "C42 myrra",
  "91B recall",
  "3F0 imprint",
  "B6E greenie",
  "8C1 lichen",
  "E11 heard",
  "92C spore",
  "9A9 spot",
  "C13 lorax",
  "55A scapy",
  "00B injekt",
  "ED4 graft",
  "D0D low",
  "3B4 familiar",
  "111 libra",
  "99F lotsof"
];

function sectionDivider() {
  return `
    <div class="section-divider reveal" aria-hidden="true">
      ${dividerBranch()}
    </div>`;
}

function renderSectionTitle(text, withLeaf = false) {
  const icon = withLeaf ? iconLeaf() : "";
  const modifier = withLeaf ? " section-title--with-icon" : "";
  return `<h2 class="section-title${modifier} reveal">${icon}${escapeHtml(text)}</h2>`;
}

function renderHubIntro(introEl, text, accent) {
  if (!introEl) return;

  const icon = accent === "tree" ? iconTree() : accent === "leaf" ? iconLeaf() : "";

  if (!icon) {
    introEl.textContent = text || "";
    introEl.classList.remove("page-intro--has-accent");
    return;
  }

  const body = text?.trim()
    ? `<span class="page-intro-text">${escapeHtml(text)}</span>`
    : "";

  introEl.innerHTML = `
    <span class="page-intro-accent${body ? "" : " page-intro-accent--solo"}">
      <span class="page-intro-icon">${icon}</span>
      ${body}
    </span>`;
  introEl.classList.add("page-intro--has-accent");
}

function isNavActive(navPage, currentPage) {
  if (navPage === currentPage) return true;
  if (navPage === "writing" && currentPage === "writing-post") return true;
  return currentPage.startsWith(`${navPage}-`);
}

function renderNav(navItems, currentPage) {
  const nav = document.getElementById("site-nav");
  if (!nav) return;

  nav.innerHTML = navItems
    .filter((item) => !item.deferred)
    .map(
      (item) =>
        `<a href="${item.href}" class="${isNavActive(item.page, currentPage) ? "active" : ""}">${escapeHtml(item.label)}</a>`
    )
    .join("");
}

function isPlaceholderEntry(item) {
  return !item.title?.trim() && !item.slug?.trim();
}

function hasWritingPost(item) {
  return Boolean(item.slug?.trim()) && Array.isArray(item.body) && item.body.length > 0;
}

function renderEntryTitle(item, writingMode) {
  const title = escapeHtml(item.title?.trim() || "[Untitled]");

  if (writingMode && hasWritingPost(item)) {
    const slug = encodeURIComponent(item.slug.trim());
    return `<h3><a href="writing-post.html?slug=${slug}" class="entry-title-link">${title}</a></h3>`;
  }

  return `<h3>${title}</h3>`;
}

function renderFooter(site, currentPage = "") {
  const footer = document.querySelector("footer");
  if (!footer) return;

  const meta = site?.meta || {};
  const personal = site?.personal || {};
  const navItems = (site?.navigation || []).filter((item) => !item.deferred);

  const name = personal.name?.trim() || "Himel Kabir";
  const tagline =
    personal.role?.trim() ||
    meta.tagline?.trim() ||
    "CS Student · Cybersecurity · Blockchain · Cryptography";
  const path = window.location.pathname.split("/").pop() || "/";
  const lastModified = new Date(document.lastModified).toLocaleString();
  const isDark = document.body.classList.contains("dark");

  // Footer "Explore" links — exclude the Contact page here (it only appears
  // as the text link in the footer bottom line alongside GitHub & LinkedIn).
  const footerLinks = navItems
    .filter((item) => item.page !== "contact")
    .map(
      (item) =>
        `<li><a href="${escapeHtml(item.href)}" class="${isNavActive(item.page, currentPage) ? "active" : ""}">${escapeHtml(item.label)}</a></li>`
    )
    .join("");

  footer.innerHTML = `
    <div class="footer-wave-container" aria-hidden="true">
      <div class="footer-wave-left"></div>
      <div class="footer-wave-right"></div>
    </div>
    <div class="footer-voight" aria-hidden="true">
      <span class="voight-label">voight kompff ::</span>
      <div class="voight-feed"></div>
      <span class="voight-dots"><span></span><span></span><span></span></span>
    </div>
    <div class="footer-top">
      <div class="footer-brand">
        <span class="footer-brand-icon" aria-hidden="true">${iconTreeCeltic()}</span>
        <div class="footer-brand-text">
          <p class="footer-name">${escapeHtml(name)}</p>
          <p class="footer-tagline">${escapeHtml(tagline)}</p>
        </div>
      </div>

      <nav class="footer-nav" aria-label="Footer navigation">
        <p class="footer-label"><span class="footer-dot" aria-hidden="true"></span>Explore</p>
        <ul class="footer-links">
          ${footerLinks}
        </ul>
      </nav>

      <div class="footer-status" aria-label="System status">
        <p class="footer-label"><span class="footer-dot footer-dot--pulse" aria-hidden="true"></span>System Status</p>
        <p class="term-line"><span class="term-prompt" aria-hidden="true">$</span> whoami <span class="term-sep" aria-hidden="true">→</span> <span class="term-value">${escapeHtml(name)}</span></p>
        <p class="term-line"><span class="term-prompt" aria-hidden="true">$</span> locate <span class="term-sep" aria-hidden="true">→</span> <span class="term-value">${escapeHtml(path)}</span></p>
        <p class="term-line"><span class="term-prompt" aria-hidden="true">$</span> theme <span class="term-sep" aria-hidden="true">→</span> <span class="term-value term-theme">${isDark ? "dark" : "light"}</span><span class="term-cursor" aria-hidden="true">▍</span></p>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="footer-copy">
        © 2026 Himel Kabir
        · <a href="contact.html">Contact</a>
        · <a href="https://github.com/mdmahmudul34" target="_blank" rel="noopener noreferrer">GitHub</a>
        · <a href="https://www.linkedin.com/in/mdmahmudul34" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </p>
      <p class="footer-meta">
        <canvas id="footer-globe" width="28" height="28" aria-hidden="true"></canvas>
        <span id="footer-origin-text">LEAF://origin :: sync <span id="footer-time">00:00:00</span> · DAY <span id="footer-day">001</span> / <span id="footer-year">2026</span></span>
      </p>
    </div>
  `;

  const termTheme = footer.querySelector(".term-theme");
  if (termTheme) {
    const updateTheme = () => {
      termTheme.textContent = document.body.classList.contains("dark") ? "dark" : "light";
    };
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    updateTheme();
  }

  // Initialize live-updating origin line immediately after footer renders
  initFooterOrigin();

  // Initialize footer tree (3D Three.js tree, falls back to SVG)
  initFooterTree();

  // Initialize the top-right voight kompff terminal feed (CHECKPOINT J)
  initVoightFeed();

  // Glitch effect on the feed lines (single random line at a time)
  initVoightGlitch();

  // Wake-up wave — one-time stronger wave on page load in dark mode
  if (document.body.classList.contains("dark")) {
    const waveContainer = footer.querySelector(".footer-wave-container");
    if (waveContainer) {
      waveContainer.classList.add("footer-wave-wakeup");

      const cleanup = () => {
        waveContainer.classList.remove("footer-wave-wakeup");
        leftWave?.removeEventListener("animationend", cleanup);
        rightWave?.removeEventListener("animationend", cleanup);
        clearTimeout(fallbackTimer);
      };

      const leftWave = waveContainer.querySelector(".footer-wave-left");
      const rightWave = waveContainer.querySelector(".footer-wave-right");

      leftWave?.addEventListener("animationend", cleanup, { once: false });
      rightWave?.addEventListener("animationend", cleanup, { once: false });

      // Fallback cleanup in case animationend doesn't fire
      const fallbackTimer = setTimeout(cleanup, 8000);
    }
  }
}

function renderSpotlightCard(spotlight) {
  if (!spotlight) return "";

  const label = spotlight.label?.trim();
  const description = spotlight.description?.trim();
  const href = spotlight.href?.trim();
  const image = spotlight.image?.trim();
  const tag = href ? "a" : "div";
  const hrefAttr = href ? ` href="${escapeHtml(href)}"` : "";
  const staticClass = href ? "" : " spotlight-card--static";

  const imageHtml = image
    ? `<img class="spotlight-image" src="${escapeHtml(image)}" alt="${escapeHtml(spotlight.imageAlt || label || "")}" />`
    : "";

  const inner = `
    ${imageHtml}
    <span class="spotlight-label">${label ? escapeHtml(label) : '<span class="section-placeholder">[PLACEHOLDER]</span>'}</span>
    <p class="spotlight-desc">${description ? escapeHtml(description) : '<span class="section-placeholder">[PLACEHOLDER]</span>'}</p>
  `;

  return `<${tag}${hrefAttr} class="spotlight-card reveal delay${staticClass}">${inner}</${tag}>`;
}

function renderHero(personal, meta, home) {
  const hero = document.getElementById("hero");
  if (!hero) return;

  // Fallbacks keep the environment identity intact even if the data file is
  // reset to placeholders.
  const name = (personal?.name || "").trim() || "Md. Mahmudul Kabir";
  const highlight = (personal?.highlight || "").trim() || "Himel";
  const role =
    (personal?.role || "").trim() ||
    "Computer Science Student · Cybersecurity · Blockchain · Cryptography";
  const bio =
    (personal?.bio || "").trim() ||
    "I explore secure software, computer vision, and decentralized systems.";
  const pic = (personal?.profileImage || "").trim() || "images/profile.jpg";
  const picAlt = (personal?.profileAlt || "").trim() || "Md. Mahmudul Kabir Himel";

  hero.innerHTML = `
    <div class="home-hero-inner">
      <div class="home-hero-profile reveal">
        <img class="profile-pic" src="${escapeHtml(pic)}" alt="${escapeHtml(picAlt)}" />
      </div>
      <div class="home-hero-text reveal">
        <p class="home-hero-greeting">Hi, I’m</p>
        <h1 class="home-hero-name">${escapeHtml(name)} <span class="highlight">${escapeHtml(highlight)}</span></h1>
        <p class="home-hero-role">${escapeHtml(role)}</p>
        <p class="home-hero-bio">${escapeHtml(bio)}</p>
        <div class="home-hero-actions">
          <a href="work.html" class="btn btn-primary">Explore Work</a>
          <a href="about.html" class="btn btn-outline">About Me</a>
        </div>
      </div>
    </div>
  `;
}

function renderAbout(personal) {
  const about = document.getElementById("about-section");
  if (!about) return;

  const bannerHtml = personal.bannerImage?.trim()
    ? `<img class="external-img" src="${escapeHtml(personal.bannerImage)}" alt="${escapeHtml(personal.bannerAlt || "")}" />`
    : `<div class="about-banner-placeholder" aria-hidden="true"></div>`;

  about.innerHTML = `
    ${renderSectionTitle("About Me", true)}
    <div class="about-grid reveal delay">
      <p>${personal.bio?.trim() ? escapeHtml(personal.bio) : '<span class="section-placeholder">[PLACEHOLDER]</span>'}</p>
      ${bannerHtml}
    </div>
  `;
}

function renderEducation(education) {
  const section = document.getElementById("education-section");
  if (!section) return;

  const hasContent = education.degree?.trim() || education.institution?.trim() || education.location?.trim();

  section.innerHTML = `
    ${sectionDivider()}
    ${renderSectionTitle("Education")}
    <div class="card reveal delay">
      ${
        hasContent
          ? `<h3>${escapeHtml(education.degree)}</h3>
             <p><em>${escapeHtml(education.institution)}</em>${education.location ? `, ${escapeHtml(education.location)}` : ""}</p>`
          : `<p class="section-placeholder">[PLACEHOLDER]</p>`
      }
    </div>
  `;
}

function renderLanguages(languages) {
  const section = document.getElementById("languages-section");
  if (!section) return;

  const items = (languages || []).filter((lang) => lang.name?.trim() || lang.level?.trim());

  section.innerHTML = `
    ${sectionDivider()}
    ${renderSectionTitle("Languages")}
    <div class="languages-list reveal delay">
      ${
        items.length
          ? items
              .map((lang) => {
                const name = lang.name?.trim() || "[language]";
                const level = lang.level?.trim();
                return `<span class="language-pill">${escapeHtml(name)}${level ? `<span class="language-level">${escapeHtml(level)}</span>` : ""}</span>`;
              })
              .join("")
          : `<span class="language-pill language-pill--empty">[PLACEHOLDER]</span>`
      }
    </div>
  `;
}

function renderSkillGroups(skillGroups) {
  const section = document.getElementById("skills-section");
  if (!section) return;

  const groups = skillGroups || [];

  section.innerHTML = `
    ${sectionDivider()}
    ${renderSectionTitle("Technical Skills", true)}
    <div class="skill-groups reveal delay">
      ${groups
        .map(
          (group) => {
            const tags = (group.tags || []).filter((tag) => tag?.trim());
            const tagsHtml = tags.length
              ? tags.map((tag) => `<span class="skill-tag">${escapeHtml(tag)}</span>`).join("")
              : `<span class="skill-tag skill-tag--empty">[tag]</span>`;

            return `
        <div class="skill-group">
          <h3 class="skill-group-title">${escapeHtml(group.title?.trim() || "[GROUP]")}</h3>
          <div class="skill-tags">${tagsHtml}</div>
        </div>`;
          }
        )
        .join("")}
    </div>
  `;
}

function renderCertifications(certifications) {
  const section = document.getElementById("certifications-section");
  if (!section) return;

  const items = certifications || [];

  section.innerHTML = `
    ${sectionDivider()}
    ${renderSectionTitle("Certifications")}
    <div class="cert-list reveal delay">
      ${items
        .map((cert) => {
          const title = cert.title?.trim();
          const issuer = cert.issuer?.trim();
          const date = cert.date?.trim();
          const hasContent = title || issuer || date;

          const titleHtml = title
            ? cert.url
              ? `<a href="${escapeHtml(cert.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>`
              : escapeHtml(title)
            : `<span class="section-placeholder">[PLACEHOLDER]</span>`;

          return `
        <article class="cert-card${hasContent ? "" : " cert-card--empty"}">
          <h3>${titleHtml}</h3>
          <p class="cert-meta">
            ${issuer ? `<span>${escapeHtml(issuer)}</span>` : ""}
            ${date ? `<time>${escapeHtml(date)}</time>` : ""}
          </p>
        </article>`;
        })
        .join("")}
    </div>
  `;
}

function renderLinks(links) {
  const section = document.getElementById("links-section");
  if (!section) return;

  const validLinks = (links || []).filter((link) => link.url && link.label?.trim());

  section.innerHTML = `
    ${sectionDivider()}
    ${renderSectionTitle("Quick Links")}
    ${
      validLinks.length
        ? `<div class="links-grid reveal delay">
            ${validLinks
              .map(
                (link) => `
              <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="link-card">
                <span class="link-icon">${link.icon || "🔗"}</span>
                <span>${escapeHtml(link.label)}</span>
              </a>`
              )
              .join("")}
          </div>`
        : `<p class="section-placeholder reveal delay">[PLACEHOLDER]</p>`
    }
  `;
}

function renderEducationTable(tableData) {
  const section = document.getElementById("education-table");
  if (!section) return;

  section.innerHTML = `
    <h2 class="section-title reveal">${escapeHtml(tableData.title)}</h2>
    <p class="section-intro reveal delay">${escapeHtml(tableData.summary)}</p>
    <div class="table-wrap reveal delay2">
      <table>
        <thead>
          <tr>${tableData.columns.map((col) => `<th>${escapeHtml(col)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${tableData.rows
            .map(
              (row) => `
            <tr>
              <td data-label="${escapeHtml(tableData.columns[0])}">${escapeHtml(row.domain)}</td>
              <td data-label="${escapeHtml(tableData.columns[1])}">${escapeHtml(row.details)}</td>
              <td data-label="${escapeHtml(tableData.columns[2])}">${escapeHtml(row.learned)}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderHubPage(data, hubHref, options = {}) {
  const container = document.getElementById("hub-content");
  const title = document.getElementById("page-title");
  const subtitle = document.getElementById("page-subtitle");
  const intro = document.getElementById("page-intro");

  if (title) title.innerHTML = `<span class="highlight">${escapeHtml(data.title)}</span>`;
  if (subtitle) subtitle.textContent = data.subtitle;
  renderHubIntro(intro, data.intro, options.accent);

  // Add botanical illustration for Work and Writing pages
  if (options.botanical) {
    // The forest scene is part of the header/scene visual shell and must exist
    // at the very first painted frame (no async-injection gap). Work/Writing
    // ship it as static markup — reuse that shell here when present; only build
    // it dynamically as a fallback for pages without the static shell.
    let forestSection = document.querySelector(
      ".forest-section, .forest-section-writing"
    );

    if (forestSection) {
      forestSection.classList.add("forest-section"); // normalize shared styles
      if (options.botanical === "writing") {
        forestSection.classList.add("forest-section-writing");
      } else {
        forestSection.classList.remove("forest-section-writing");
      }

      // Plant the header content into the forest wrapper (idempotent — the
      // static markup already nests the page-header inside the wrapper).
      const wrapper = forestSection.querySelector(".forest-content-wrapper");
      const headerEl = title.closest(".page-header");
      if (wrapper && headerEl && !wrapper.contains(headerEl)) {
        while (headerEl.children.length) {
          wrapper.appendChild(headerEl.children[0]);
        }
        headerEl.remove();
      }
    } else {
      const pageHeader = title.closest(".page-header");
      if (pageHeader) {
        forestSection = document.createElement("section");
        forestSection.className = "forest-section reveal";
        if (options.botanical === "writing") {
          forestSection.classList.add("forest-section-writing");
        }

        // Create a wrapper for the content (will be positioned above overlay)
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "forest-content-wrapper";

        // Move title, subtitle, and intro into the content wrapper
        while (pageHeader.children.length) {
          contentWrapper.appendChild(pageHeader.children[0]);
        }

        // Build: forest-section > forest-content-wrapper > (title, subtitle, intro)
        forestSection.appendChild(contentWrapper);

        // Insert forest section before main (as sibling, for full-width edge-to-edge)
        const main = document.querySelector("main");
        main.parentNode.insertBefore(forestSection, main);

        // Remove the original page-header since we've moved its content
        pageHeader.remove();
      }
    }
  }

  if (!container) return;

  container.innerHTML = `
    <div class="universe-grid">
      ${data.categories
        .map(
          (cat, i) => `
        <a href="${escapeHtml(cat.href)}" class="universe-card card-hover-accent reveal${i === 1 ? " delay" : i >= 2 ? " delay2" : ""}">
          <span class="universe-emoji">${iconForCategory(cat.id)}</span>
          <h2>${escapeHtml(cat.title)}</h2>
          <p>${escapeHtml(cat.description)}</p>
          <span class="universe-count">${cat.items.length} ${cat.items.length === 1 ? "entry" : "entries"}</span>
          <span class="universe-arrow">Explore →</span>
        </a>`
        )
        .join("")}
    </div>
  `;
}

function renderCategoryPage(data, categoryId, parentHref, parentLabel, options = {}) {
  const { writingMode = false } = options;
  const category = data.categories.find((c) => c.id === categoryId);
  if (!category) return;

  const title = document.getElementById("page-title");
  const subtitle = document.getElementById("page-subtitle");
  const breadcrumb = document.getElementById("breadcrumb");
  const container = document.getElementById("category-content");

  if (breadcrumb) {
    breadcrumb.innerHTML = `<a href="${escapeHtml(parentHref)}">${escapeHtml(parentLabel)}</a> <span>/</span> ${escapeHtml(category.title)}`;
  }
  if (title) title.textContent = category.title;
  if (subtitle) subtitle.textContent = category.description;
  if (!container) return;

  const items = category.items.filter((item) => !isPlaceholderEntry(item));

  if (!items.length) {
    container.innerHTML = `<p class="entry-empty reveal">No entries yet.</p>`;
    return;
  }

  container.innerHTML = items
    .map(
      (item, i) => `
    <article class="entry-card card-hover-accent reveal${i > 0 ? " delay" : ""}">
      <div class="entry-header">
        ${renderEntryTitle(item, writingMode)}
        ${item.date ? `<time>${escapeHtml(item.date)}</time>` : ""}
      </div>
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      ${item.tags?.filter((t) => t?.trim()).length ? `<div class="tags">${item.tags.filter((t) => t?.trim()).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
      ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="entry-external-link">${escapeHtml(item.linkLabel || "External link")} ↗</a>` : ""}
    </article>`
    )
    .join("");
}

function renderBodyBlocks(body) {
  if (!Array.isArray(body)) return "";

  return body
    .map((block) => {
      if (!block?.type) return "";

      switch (block.type) {
        case "paragraph":
          if (!block.text?.trim()) return "";
          return `<p class="post-paragraph">${escapeHtml(block.text)}</p>`;
        case "quote":
          if (!block.text?.trim()) return "";
          return `<blockquote class="post-quote">${escapeHtml(block.text)}</blockquote>`;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("");
}

function renderWritingPostNotFound(reason) {
  const postContent = document.getElementById("post-content");
  const postEmpty = document.getElementById("post-empty");
  const breadcrumb = document.getElementById("breadcrumb");

  if (postContent) postContent.hidden = true;
  if (breadcrumb) {
    breadcrumb.innerHTML = `<a href="writing.html">Writing</a>`;
  }

  if (postEmpty) {
    postEmpty.hidden = false;
    postEmpty.innerHTML = `
      <h1>${escapeHtml(reason)}</h1>
      <p>This writing piece could not be found. Check the URL or return to the writing hub.</p>
      <a href="writing.html" class="btn btn-primary">Back to Writing</a>
    `;
  }

  document.title = `${reason} | Writing`;
}

function renderWritingPost(result) {
  const { item, category } = result;
  const postContent = document.getElementById("post-content");
  const postEmpty = document.getElementById("post-empty");
  const breadcrumb = document.getElementById("breadcrumb");
  const postTitle = document.getElementById("post-title");
  const postDate = document.getElementById("post-date");
  const postTags = document.getElementById("post-tags");
  const postBody = document.getElementById("post-body");

  if (postEmpty) postEmpty.hidden = true;
  if (postContent) postContent.hidden = false;

  const title = item.title?.trim() || "[Untitled]";
  document.title = `${title} | ${category.title} | Writing`;

  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="writing.html">Writing</a>
      <span>/</span>
      <a href="${escapeHtml(category.href)}">${escapeHtml(category.title)}</a>
      <span>/</span>
      ${escapeHtml(title)}
    `;
  }

  if (postTitle) postTitle.textContent = title;

  if (postDate) {
    postDate.textContent = item.date?.trim() || "";
    postDate.hidden = !item.date?.trim();
  }

  if (postTags) {
    const tags = (item.tags || []).filter((t) => t?.trim());
    postTags.innerHTML = tags.length
      ? tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")
      : "";
    postTags.hidden = !tags.length;
  }

  if (postBody) {
    const bodyHtml = renderBodyBlocks(item.body);
    postBody.innerHTML = bodyHtml || `<p class="post-empty-body">No content yet.</p>`;
  }
}

function renderAboutPage(site, hobbies) {
  renderAbout(site.personal);
  renderEducation(site.education);
  renderLanguages(site.languages);
  renderSkillGroups(site.skillGroups);
  renderCertifications(site.certifications);
  renderLinks(site.links);

  const hobbiesSection = document.getElementById("hobbies-section");
  if (hobbiesSection && hobbies) {
    hobbiesSection.innerHTML = `
      ${sectionDivider()}
      ${renderSectionTitle("Hobbies")}
      <div class="hobby-gallery reveal delay">
        ${hobbies.hobbies
          .map(
            (hobby) => `
          <article class="hobby-card">
            ${hobby.image ? `<img src="${escapeHtml(hobby.image)}" alt="${escapeHtml(hobby.imageAlt || hobby.title)}" loading="lazy" />` : `<div class="hobby-placeholder">${escapeHtml(hobby.title.charAt(0))}</div>`}
            <div class="hobby-body">
              <h3>${escapeHtml(hobby.title)}</h3>
              <p>${escapeHtml(hobby.description)}</p>
            </div>
          </article>`
          )
          .join("")}
      </div>
      <div class="about-cta reveal delay2">
        <a href="contact.html" class="btn btn-primary">Get in Touch</a>
      </div>
    `;
  }
}

function renderContact(meta) {
  const form = document.getElementById("contact-form");
  if (form) {
    form.action = `mailto:${meta.email}`;
  }
}

function initScrollReveal() {
  // Page content has now been rendered to its final height. Release the
  // load-time min-height reservation so the footer sits exactly at the bottom
  // of the real content (see `main`/`body.content-ready main` in styles.css).
  document.body.classList.add("content-ready");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// Lightweight rotating dot-matrix globe for footer — no dependencies
function initFooterGlobe() {
  const canvas = document.getElementById("footer-globe");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const size = 28;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const dotR = 1.1;
  const dotCount = 100;

  // Fibonacci sphere distribution for even dot placement
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < dotCount; i++) {
    const y = 1 - (i / (dotCount - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = phi * i;
    points.push({
      x: Math.cos(theta) * radius,
      y: y,
      z: Math.sin(theta) * radius
    });
  }

  let angle = 0;
  const speed = 0.009;

  function getThemeColors() {
    const isDark = document.body.classList.contains("dark");
    return {
      land: isDark ? "140, 210, 170" : "40, 130, 60",
      ocean: isDark ? "35, 55, 45" : "180, 210, 185",
      bg: isDark ? "8, 11, 10" : "232, 245, 233"
    };
  }

  function draw() {
    const colors = getThemeColors();
    ctx.clearRect(0, 0, size, size);

    // Subtle background circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${colors.bg}, 0.35)`;
    ctx.fill();

    // Rotate and sort by depth
    const rotated = points.map(p => {
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      return {
        x: p.x * cosA - p.z * sinA,
        y: p.y,
        z: p.x * sinA + p.z * cosA
      };
    }).sort((a, b) => a.z - b.z);

    rotated.forEach(p => {
      const depth = (p.z + 1) / 2;
      const px = cx + p.x * r;
      const py = cy + p.y * r;
      const alpha = 0.35 + depth * 0.65;
      const dotSize = dotR * (0.55 + depth * 0.45);

      // Land vs ocean distinction based on latitude/position
      const isLand = Math.abs(p.y) < 0.65 && Math.sin(p.x * 3 + angle) > 0.1;
      const baseColor = isLand ? colors.land : colors.ocean;

      ctx.beginPath();
      ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseColor}, ${alpha})`;
      ctx.fill();
    });

    angle += speed;
    requestAnimationFrame(draw);
  }

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    draw();
  } else {
    // Static frame for reduced motion
    const colors = getThemeColors();
    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${colors.bg}, 0.35)`;
    ctx.fill();

    const rotated = points.map(p => ({
      x: p.x,
      y: p.y,
      z: p.z
    })).sort((a, b) => a.z - b.z);

    rotated.forEach(p => {
      const depth = (p.z + 1) / 2;
      const px = cx + p.x * r;
      const py = cy + p.y * r;
      const alpha = 0.35 + depth * 0.65;
      const dotSize = dotR * (0.55 + depth * 0.45);
      const isLand = Math.abs(p.y) < 0.65 && Math.sin(p.x * 3) > 0.1;
      const baseColor = isLand ? colors.land : colors.ocean;

      ctx.beginPath();
      ctx.arc(px, py, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseColor}, ${alpha})`;
      ctx.fill();
    });
  }
}

function initFooterGlobeDelayed() {
  const observer = new MutationObserver(() => {
    const canvas = document.getElementById("footer-globe");
    if (canvas) {
      initFooterGlobe();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => {
    const canvas = document.getElementById("footer-globe");
    if (canvas) {
      initFooterGlobe();
      observer.disconnect();
    }
  }, 500);
}

/* Footer brand mark — the actual Celtic Tree of Life SVG
   (tree-life-celtic-knotwork-roots-branches.svg) rendered by renderFooter().
   Kept as-is; no Three.js recreation. */
function initFooterTree() {
  // Celtic Tree of Life SVG is rendered by renderFooter() and kept as-is.
  // No Three.js recreation — the exact optimized SVG artwork stays in place.
  return;
}

function createMinimalTree(trunkHex, starHex, isDark) {
  const group = new THREE.Group();

  // --- Trunk: tapered cylinder ---
  // Bioluminescent emissive effect for dark mode
  const emissiveIntensity = isDark ? 0.35 : 0;
  const emissiveColor = new THREE.Color(isDark ? 0x43a047 : 0);

  const trunkGeom = new THREE.CylinderGeometry(0.12, 0.18, 0.7, 12, 1, true);
  trunkGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -0.35, 0));
  const trunkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(trunkHex),
    roughness: 0.8,
    metalness: 0.2,
    emissive: emissiveColor,
    emissiveIntensity: emissiveIntensity,
  });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // --- Canopy: layered flat leaf planes ---
  // 5 leaf planes at different heights, slightly rotated for organic look.
  // Colors range from dark to light green, adapting to light/dark theme.
  const greens = isDark
    ? [0x1b5e20, 0x2e7d32, 0x388e3c, 0x43a047, 0x66bb6a]
    : [0x2e7d32, 0x388e3c, 0x43a047, 0x5cb888, 0x66bb6a];

  for (let i = 0; i < 5; i++) {
    const leafGeom = new THREE.PlaneGeometry(0.5, 0.6);
    leafGeom.rotateX(-Math.PI / 2); // lay flat
    leafGeom.rotateZ((Math.random() - 0.5) * 0.3); // slight twist
    const leafMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(greens[i]),
      roughness: 0.3,
      metalness: 0.1,
      emissive: emissiveColor,
      emissiveIntensity: emissiveIntensity,
    });
    const leaf = new THREE.Mesh(leafGeom, leafMat);
    const layerY = -0.2 + i * 0.18;
    leaf.position.set(0, layerY, 0);
    leaf.rotation.y = (Math.random() - 0.5) * 0.2;
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    group.add(leaf);
  }

  // Small topper for mature tree silhouette (simple sphere, not game-like)
  const topperGeom = new THREE.SphereGeometry(0.12, 12, 12);
  const topperMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(starHex),
    roughness: 0.8,
    metalness: 0.1,
    emissive: emissiveColor,
    emissiveIntensity: emissiveIntensity,
  });
  const topper = new THREE.Mesh(topperGeom, topperMat);
  topper.position.set(0, 0.55, 0);
  topper.castShadow = true;
  topper.receiveShadow = true;
  group.add(topper);

  return group;
}

/*
 * Voight kompff terminal feed — top-right footer corner readout.
 * New entries enter at the top of the feed, pushing existing entries down;
 * opacity steps down by depth (newest brightest). Capped at 5 visible
 * entries (total readout: label + 5 entries + dots = 7 lines), oldest
 * dropped. Random 3-5s cadence. Uses a lightweight FLIP pass so the
 * push-down is a smooth slide, not a hard cut.
 */
let voightFeedTimer = null;

function voightEntryOpacity(index) {
  // Newest/top starts ~0.72 and steps down ~0.068 per entry across the full
  // 5-line feed, flooring at the label's ~0.45 so the corner readout always
  // stays quiet/secondary and the label remains the dimmest element.
  return Math.max(0.72 - index * 0.0675, 0.45).toFixed(2);
}

function initVoightFeed() {
  const feed = document.querySelector(".voight-feed");
  if (!feed) return;

  if (voightFeedTimer) {
    clearTimeout(voightFeedTimer);
    voightFeedTimer = null;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TRANS = reduced ? "none" : "opacity 0.55s ease, transform 0.55s ease";
  const MAX = 5;

  function step() {
    const pair = VOIGHT_POOL[Math.floor(Math.random() * VOIGHT_POOL.length)];
    const [hex, word] = pair.split(" ");

    // FIRST — current positions of the existing entries
    const existing = Array.from(feed.children);
    const first = existing.map((el) => el.getBoundingClientRect().top);

    // Prep the new entry at the top (start invisible, then fade/slide in)
    const entry = document.createElement("div");
    entry.className = "voight-entry";
    entry.innerHTML =
      `<span class="voight-hex">${escapeHtml(hex)}</span>` +
      (word ? ` <span class="voight-word">${escapeHtml(word)}</span>` : "");
    entry.style.transition = TRANS;
    entry.style.opacity = "0";
    feed.prepend(entry);

    // Drop the oldest beyond the cap, then re-measure surviving entries
    while (feed.children.length > MAX) {
      feed.removeChild(feed.lastChild);
    }
    const survivors = existing.filter((el) => el.isConnected);
    const last = survivors.map((el) => el.getBoundingClientRect().top);

    // INVERT — pin survivors at their pre-insertion spot so they look static
    survivors.forEach((el, i) => {
      const delta = first[i] - last[i];
      if (delta !== 0) {
        el.style.transition = "none";
        el.style.transform = `translateY(${delta}px)`;
      }
    });

    // PLAY — flush, then animate everything to its final depth/position
    void feed.offsetHeight;
    Array.from(feed.children).forEach((el, i) => {
      el.style.transition = TRANS;
      el.style.opacity = voightEntryOpacity(i);
      el.style.transform = "translateY(0)";
    });
  }

  step();

  const loop = () => {
    voightFeedTimer = setTimeout(() => {
      step();
      loop();
    }, 3000 + Math.floor(Math.random() * 2000));
  };
  loop();
}

/*
 * Voight glitch — glitches ONE randomly chosen feed line at a time via a
 * .glitching class that drives the ~120ms voight-glitch CSS animation.
 * Interval (1.5-3s) is re-randomized every cycle; first glitch lands within
 * ~1s of the feed appearing so visitors notice it quickly. Disabled entirely
 * under prefers-reduced-motion.
 */
let voightGlitchTimer = null;

function voightGlitchLines(wrapper) {
  return Array.from(wrapper.querySelectorAll(".voight-label, .voight-entry"));
}

function initVoightGlitch() {
  const wrapper = document.querySelector(".footer-voight");
  if (!wrapper) return;

  if (voightGlitchTimer) {
    clearTimeout(voightGlitchTimer);
    voightGlitchTimer = null;
  }

  // Respect prefers-reduced-motion: disable the glitch effect entirely.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function glitch() {
    // Only one line glitches at a time — clear any previous target first.
    wrapper.querySelectorAll(".glitching").forEach((el) => el.classList.remove("glitching"));
    void wrapper.offsetHeight; // flush so a re-picked line restarts its animation

    const lines = voightGlitchLines(wrapper);
    if (lines.length === 0) return;
    const target = lines[Math.floor(Math.random() * lines.length)];
    target.classList.add("glitching");
  }

  function schedule(ms) {
    voightGlitchTimer = setTimeout(() => {
      glitch();
      schedule(1500 + Math.floor(Math.random() * 1500)); // 1.5-3s, re-randomized
    }, ms);
  }

  // First glitch within ~1 second so the effect is noticed early.
  schedule(600 + Math.floor(Math.random() * 400));
}

// Live-updating footer origin line: LEAF://ORIGIN :: sync HH:MM:SS · DAY DDD / YYYY
let footerOriginInterval = null;

function initFooterOrigin() {
  const timeEl = document.getElementById("footer-time");
  const dayEl = document.getElementById("footer-day");
  const yearEl = document.getElementById("footer-year");
  if (!timeEl || !dayEl || !yearEl) return;

  // Clear existing interval to prevent duplicates
  if (footerOriginInterval) {
    clearInterval(footerOriginInterval);
    footerOriginInterval = null;
  }

  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function update() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    dayEl.textContent = String(getDayOfYear(now)).padStart(3, "0");
    yearEl.textContent = now.getFullYear();
  }

  update();
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    footerOriginInterval = setInterval(update, 1000);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFooterOrigin);
} else {
  initFooterOrigin();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFooterGlobeDelayed);
} else {
  initFooterGlobeDelayed();
}

