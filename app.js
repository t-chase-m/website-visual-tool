const pageShell = document.getElementById("page-shell");
const form = document.getElementById("visual-form");
const urlInput = document.getElementById("url-input");
const generateButton = form.querySelector(".primary-button");
const previewStage = document.getElementById("preview-stage");
const previewStatus = document.getElementById("preview-status");
const toggleGroups = document.querySelectorAll("[data-toggle-group]");
const actionButtons = document.querySelectorAll("[data-action]");

const state = {
  device: "Desktop",
  style: "Clean",
  isLoading: false,
  hasGenerated: false,
  loadingTimer: null,
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function normalizeUrl(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "example.com";
  }

  try {
    const withProtocol = trimmed.startsWith("http")
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProtocol);

    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return trimmed.replace(/^https?:\/\//, "");
  }
}

function getDomainParts(domain) {
  const cleanDomain = normalizeUrl(domain).toLowerCase();
  const [host] = cleanDomain.split("/");
  const parts = host.split(".").filter(Boolean);
  const root = parts[0] || "example";
  const tld = parts[parts.length - 1] || "com";

  return {
    domain: host,
    root,
    tld,
  };
}

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildBrandName(root) {
  const cleaned = root.replace(/[^a-z0-9]+/gi, " ").trim();

  if (!cleaned) {
    return "Example";
  }

  return cleaned
    .split(/\s+/)
    .map((part) => toTitleCase(part))
    .join(" ");
}

function getSiteProfile(rawUrl) {
  const { domain, root, tld } = getDomainParts(rawUrl);
  const brandName = buildBrandName(root);
  const seed = `${root}${tld}`;

  const profileOptions = [
    {
      match: ["studio", "design", "creative", "brand"],
      label: "Creative Studio",
      kicker: "Creative partner",
      headline: `Design systems and launch visuals for ${brandName}`,
      copy: `${brandName} presents a polished digital studio with featured work, service highlights, and a confident introduction.`,
      nav: ["Work", "Services", "Process"],
      cards: [
        ["Selected work", "Recent identity and campaign launches."],
        ["Capabilities", "Brand design, websites, and social kits."],
        ["Client trust", "Structured delivery for growing teams."],
      ],
      metrics: ["Brand refresh", "Case studies", "Fast turnaround"],
    },
    {
      match: ["shop", "store", "market", "goods"],
      label: "Online Store",
      kicker: "New arrivals",
      headline: `A simple storefront experience for ${brandName}`,
      copy: `${brandName} looks like a modern commerce homepage with featured products, supporting offers, and helpful browsing sections.`,
      nav: ["Shop", "Collections", "Support"],
      cards: [
        ["Best sellers", "Popular picks surfaced above the fold."],
        ["Collections", "Curated rows make browsing feel intentional."],
        ["Shipping", "Clear delivery and return reassurance."],
      ],
      metrics: ["Top products", "Free shipping", "Secure checkout"],
    },
    {
      match: ["cloud", "data", "ai", "tech", "app", "dev", "labs"],
      label: "Software Platform",
      kicker: "Product overview",
      headline: `${brandName} helps teams move faster online`,
      copy: `${brandName} reads like a lightweight SaaS homepage with a product summary, proof points, and feature blocks arranged like a real site capture.`,
      nav: ["Platform", "Solutions", "Pricing"],
      cards: [
        ["Automations", "Core workflows framed as feature modules."],
        ["Reporting", "A compact dashboard-style content block."],
        ["Security", "Trust messaging to ground the layout."],
      ],
      metrics: ["Live dashboard", "Team access", "Uptime focus"],
    },
  ];

  const fallbackProfile = {
    label: "Business Website",
    kicker: "Featured website",
    headline: `${brandName} brings a polished web presence together`,
    copy: `${brandName} is shown as a clean homepage concept with a top navigation, lead section, and supporting content that feels closer to a believable capture.`,
    nav: ["Product", "Solutions", "Pricing"],
    cards: [
      ["Overview", "Fast, polished sections for a credible first glance."],
      ["Highlights", "Reusable blocks arranged like a homepage."],
      ["Results", "Share-ready framing for concept review."],
    ],
    metrics: ["Modern layout", "Clear messaging", "Homepage flow"],
  };

  const matchedProfile =
    profileOptions.find((profile) =>
      profile.match.some((keyword) => seed.includes(keyword))
    ) || fallbackProfile;

  const accentThemes = [
    ["#1f2937", "#4f46e5", "#eef2ff"],
    ["#0f766e", "#14b8a6", "#ecfeff"],
    ["#9a3412", "#f97316", "#fff7ed"],
    ["#1d4ed8", "#60a5fa", "#eff6ff"],
  ];
  const accentIndex =
    seed.split("").reduce((total, character) => total + character.charCodeAt(0), 0) %
    accentThemes.length;
  const [accentStrong, accentSoft, accentSurface] = accentThemes[accentIndex];

  return {
    domain,
    brandName,
    initials: brandName.slice(0, 1).toUpperCase(),
    accentStrong,
    accentSoft,
    accentSurface,
    ...matchedProfile,
  };
}

function renderLoadingMarkup(profile) {
  return `
    <div class="canvas-frame">
      <div class="browser-chrome">
        <div class="browser-chrome-controls">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="browser-address-bar">${escapeHtml(profile.domain)}</div>
      </div>
      <div
        class="mock-visual is-loading"
        style="--mock-accent:${profile.accentStrong}; --mock-accent-soft:${profile.accentSoft}; --mock-accent-surface:${profile.accentSurface};"
      >
        <div class="mock-badge">${escapeHtml(state.device)}</div>
        <div class="mock-sitebar">
          <div class="mock-brand-lockup">
            <span class="mock-brand-mark">${escapeHtml(profile.initials)}</span>
            <div>
              <div class="mock-brand-name">${escapeHtml(profile.brandName)}</div>
              <div class="mock-url">${escapeHtml(profile.domain)}</div>
            </div>
          </div>
          <div class="mock-nav">
            <span>Loading</span>
            <span>Sections</span>
            <span>Preview</span>
          </div>
        </div>
        <section class="mock-hero">
          <div class="mock-hero-copy">
            <div class="mock-kicker">Generating preview</div>
            <div class="mock-headline">Building a believable page for ${escapeHtml(profile.brandName)}</div>
            <div class="mock-copy">
              Arranging navigation, hero content, and supporting blocks in a ${escapeHtml(state.style.toLowerCase())} layout.
            </div>
          </div>
          <div class="mock-hero-panel">
            <div class="mock-panel-chart"></div>
            <div class="mock-panel-row"></div>
            <div class="mock-panel-row is-short"></div>
            <div class="mock-panel-grid">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </section>
        <div class="mock-metrics">
          <div class="metric-card">
            <span class="metric-label">Status</span>
            <strong>Loading</strong>
          </div>
          <div class="metric-card">
            <span class="metric-label">Device</span>
            <strong>${escapeHtml(state.device)}</strong>
          </div>
          <div class="metric-card">
            <span class="metric-label">Style</span>
            <strong>${escapeHtml(state.style)}</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderGeneratedMarkup(profile) {
  const navMarkup = profile.nav
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
  const metricsMarkup = profile.metrics
    .map(
      (item, index) => `
        <div class="metric-card">
          <span class="metric-label">${index === 0 ? "Focus" : index === 1 ? "Signal" : "Benefit"}</span>
          <strong>${escapeHtml(item)}</strong>
        </div>
      `
    )
    .join("");
  const cardsMarkup = profile.cards
    .map(
      ([label, copy]) => `
        <article class="mock-content-card">
          <span class="mock-card-label">${escapeHtml(label)}</span>
          <strong>${escapeHtml(copy.split(".")[0])}</strong>
          <p>${escapeHtml(copy)}</p>
        </article>
      `
    )
    .join("");

  return `
    <div class="canvas-frame">
      <div class="browser-chrome">
        <div class="browser-chrome-controls">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="browser-address-bar">${escapeHtml(profile.domain)}</div>
      </div>
      <div
        class="mock-visual"
        style="--mock-accent:${profile.accentStrong}; --mock-accent-soft:${profile.accentSoft}; --mock-accent-surface:${profile.accentSurface};"
      >
        <div class="mock-badge">${escapeHtml(state.device)}</div>
        <div class="mock-sitebar">
          <div class="mock-brand-lockup">
            <span class="mock-brand-mark">${escapeHtml(profile.initials)}</span>
            <div>
              <div class="mock-brand-name">${escapeHtml(profile.brandName)}</div>
              <div class="mock-url">${escapeHtml(profile.domain)}</div>
            </div>
          </div>
          <div class="mock-nav">${navMarkup}</div>
        </div>
        <section class="mock-hero">
          <div class="mock-hero-copy">
            <div class="mock-kicker">${escapeHtml(profile.kicker)}</div>
            <div class="mock-headline">${escapeHtml(profile.headline)}</div>
            <div class="mock-copy">${escapeHtml(profile.copy)}</div>
            <div class="mock-hero-actions">
              <span class="mock-button-pill">Get started</span>
              <span class="mock-button-pill is-secondary">View details</span>
            </div>
          </div>
          <div class="mock-hero-panel">
            <div class="mock-panel-chart"></div>
            <div class="mock-panel-row"></div>
            <div class="mock-panel-row is-short"></div>
            <div class="mock-panel-grid">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </section>
        <div class="mock-metrics">${metricsMarkup}</div>
        <div class="mock-content-grid">${cardsMarkup}</div>
      </div>
    </div>
  `;
}

function updateGenerateButton() {
  generateButton.disabled = urlInput.value.trim() === "";
}

function updatePreviewStatus(message) {
  previewStatus.textContent = message;
}

function isPrelaunchState() {
  return pageShell.classList.contains("is-prelaunch");
}

function revealWorkspace() {
  pageShell.classList.remove("is-prelaunch");
}

function getPreviewMarkup() {
  const profile = getSiteProfile(urlInput.value);

  if (state.isLoading) {
    return renderLoadingMarkup(profile);
  }

  return renderGeneratedMarkup(profile);
}

function renderPreview() {
  previewStage.dataset.device = state.device;
  previewStage.dataset.style = state.style;
  previewStage.innerHTML = getPreviewMarkup();
}

function finishGeneration() {
  state.isLoading = false;
  state.hasGenerated = true;
  renderPreview();
  updatePreviewStatus(`Generated mockup for ${normalizeUrl(urlInput.value)}`);
}

function startGeneration() {
  if (generateButton.disabled) {
    return;
  }

  revealWorkspace();
  clearTimeout(state.loadingTimer);
  state.isLoading = true;
  renderPreview();
  updatePreviewStatus("Generating preview...");

  state.loadingTimer = window.setTimeout(() => {
    finishGeneration();
  }, 900);
}

function updateToggleGroup(group, activeButton) {
  group.querySelectorAll(".segment-button").forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

toggleGroups.forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest(".segment-button");

    if (!button) {
      return;
    }

    const groupName = group.dataset.toggleGroup;
    state[groupName] = button.dataset.value;

    updateToggleGroup(group, button);

    if (isPrelaunchState()) {
      return;
    }

    renderPreview();

    if (state.isLoading) {
      updatePreviewStatus("Generating preview...");
      return;
    }

    if (state.hasGenerated) {
      updatePreviewStatus(
        `Showing ${state.device.toLowerCase()} ${state.style.toLowerCase()} preview`
      );
      return;
    }

    updatePreviewStatus("Ready to generate");
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  startGeneration();
});

urlInput.addEventListener("input", () => {
  const hasUrl = urlInput.value.trim() !== "";

  updateGenerateButton();

  if (!state.isLoading && !isPrelaunchState()) {
    renderPreview();
  }

  if (!hasUrl) {
    state.hasGenerated = false;
    if (isPrelaunchState()) {
      return;
    }
    updatePreviewStatus("Enter a URL to generate a preview");
    return;
  }

  if (!state.hasGenerated) {
    if (isPrelaunchState()) {
      return;
    }
    updatePreviewStatus("Ready to generate");
  }
});

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "regenerate") {
      startGeneration();
      return;
    }

    if (action === "download") {
      updatePreviewStatus("Download is not wired up in this static prototype");
      return;
    }

    if (action === "copy") {
      updatePreviewStatus("Copy is not wired up in this static prototype");
    }
  });
});

updateGenerateButton();
renderPreview();
updatePreviewStatus("Enter a URL to generate a preview");
