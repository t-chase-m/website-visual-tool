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
  const domain = normalizeUrl(urlInput.value);

  if (state.isLoading) {
    return `
      <div class="canvas-frame">
        <div class="browser-chrome">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="mock-visual">
          <div class="mock-badge">${state.device}</div>
          <div class="mock-url">${domain}</div>
          <div class="mock-headline">Generating your visual...</div>
          <div class="mock-copy">
            Building a fake ${state.style.toLowerCase()} preview for sharing.
          </div>
          <div class="mock-metrics">
            <div class="metric-card">
              <span class="metric-label">Status</span>
              <strong>Loading</strong>
            </div>
            <div class="metric-card">
              <span class="metric-label">Device</span>
              <strong>${state.device}</strong>
            </div>
            <div class="metric-card">
              <span class="metric-label">Style</span>
              <strong>${state.style}</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="canvas-frame">
      <div class="browser-chrome">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="mock-visual">
        <div class="mock-badge">${state.device}</div>
        <div class="mock-url">${domain}</div>
        <div class="mock-headline">Modern website visual preview</div>
        <div class="mock-copy">
          A simple generated concept for ${domain} with a ${state.style.toLowerCase()}
          presentation and a share-ready frame.
        </div>
        <div class="mock-metrics">
          <div class="metric-card">
            <span class="metric-label">Format</span>
            <strong>${state.style}</strong>
          </div>
          <div class="metric-card">
            <span class="metric-label">Output</span>
            <strong>PNG mockup</strong>
          </div>
          <div class="metric-card">
            <span class="metric-label">State</span>
            <strong>Generated</strong>
          </div>
        </div>
      </div>
    </div>
  `;
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
