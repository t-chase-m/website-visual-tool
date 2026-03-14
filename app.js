const form = document.getElementById("visual-form");
const urlInput = document.getElementById("url-input");
const previewStage = document.getElementById("preview-stage");
const previewStatus = document.getElementById("preview-status");
const mockUrl = document.getElementById("mock-url");
const mockDeviceLabel = document.getElementById("mock-device-label");
const mockStyleLabel = document.getElementById("mock-style-label");
const toggleGroups = document.querySelectorAll("[data-toggle-group]");
const actionButtons = document.querySelectorAll("[data-action]");

const state = {
  device: "Desktop",
  style: "Clean",
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

function updatePreviewStatus(message) {
  previewStatus.textContent = message;
}

function renderPreview() {
  const domain = normalizeUrl(urlInput.value);

  previewStage.dataset.device = state.device;
  previewStage.dataset.style = state.style;
  mockUrl.textContent = domain;
  mockDeviceLabel.textContent = state.device;
  mockStyleLabel.textContent = state.style;
}

toggleGroups.forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest(".segment-button");

    if (!button) {
      return;
    }

    const nextValue = button.dataset.value;
    const groupName = group.dataset.toggleGroup;

    state[groupName] = nextValue;

    group.querySelectorAll(".segment-button").forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    renderPreview();
    updatePreviewStatus(`Showing ${state.device.toLowerCase()} ${state.style.toLowerCase()} concept`);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderPreview();
  updatePreviewStatus(`Generated mockup for ${normalizeUrl(urlInput.value)}`);
});

urlInput.addEventListener("input", () => {
  renderPreview();
});

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "regenerate") {
      renderPreview();
      updatePreviewStatus(`Refreshed preview for ${normalizeUrl(urlInput.value)}`);
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

renderPreview();
