document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const experienceCards = document.querySelectorAll(".experience-card");
  const discoveryForm = document.querySelector("#discovery-form");
  const discoveryInput = document.querySelector("#discovery-input");
  const quickButtons = document.querySelectorAll(".quick-btn");
  const apiResult = document.querySelector("#api-result");
  const inquiryForm = document.querySelector("#inquiry-form");
  const formMessage = document.querySelector("#form-message");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      experienceCards.forEach((card) => {
        const showCard = selectedCategory === "all" || card.dataset.category === selectedCategory;
        card.classList.toggle("hidden", !showCard);
      });
    });
  });

  discoveryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = discoveryInput.value.trim();

    if (!query) {
      showApiMessage("ENTER A TOPIC", "Type a Detroit subject before searching.", "error");
      return;
    }

    getDetroitStory(query);
  });

  quickButtons.forEach((button) => {
    button.addEventListener("click", () => {
      discoveryInput.value = button.dataset.query;
      getDetroitStory(button.dataset.query);
    });
  });

  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const message = document.querySelector("#message").value.trim();

    if (!name || !email || !message) {
      formMessage.textContent = "Please complete your name, email, and message.";
      return;
    }

    formMessage.textContent = `Thanks, ${name}. Your request has been recorded for this demo.`;
    inquiryForm.reset();
  });

  async function getDetroitStory(searchTerm) {
    apiResult.className = "api-result loading";
    apiResult.innerHTML = `
      <p class="result-label">SEARCHING DETROIT</p>
      <h3>Loading story...</h3>
      <p>Requesting live information from Wikipedia.</p>
    `;

    const fullSearch = `${searchTerm} Detroit`;
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: fullSearch,
      gsrlimit: "1",
      prop: "extracts|pageimages|info",
      exintro: "1",
      explaintext: "1",
      piprop: "thumbnail",
      pithumbsize: "700",
      inprop: "url",
      redirects: "1",
      format: "json",
      origin: "*"
    });

    const apiUrl = `https://en.wikipedia.org/w/api.php?${params.toString()}`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const pages = data.query?.pages ? Object.values(data.query.pages) : [];

      if (pages.length === 0) {
        showApiMessage("NO RESULT", "We could not find a matching Detroit story. Try another subject.", "error");
        return;
      }

      const page = pages[0];
      const description = page.extract || "Wikipedia returned this topic without a short introductory summary.";
      const imageMarkup = page.thumbnail?.source
        ? `<img src="${page.thumbnail.source}" alt="Related image for ${escapeHtml(page.title)}">`
        : "";
      const articleUrl = page.fullurl || `https://en.wikipedia.org/?curid=${page.pageid}`;

      apiResult.className = "api-result";
      apiResult.innerHTML = `
        <p class="result-label">LIVE DETROIT DISCOVERY</p>
        <h3>${escapeHtml(page.title)}</h3>
        ${imageMarkup}
        <p>${escapeHtml(description)}</p>
        <a class="result-link" href="${articleUrl}" target="_blank" rel="noopener noreferrer">Read more on Wikipedia →</a>
      `;
    } catch (error) {
      console.error("Detroit discovery request failed:", error);
      showApiMessage(
        "REQUEST ERROR",
        "We could not reach the Detroit discovery service. Please check your connection and try again.",
        "error"
      );
    }
  }

  function showApiMessage(label, message, type = "") {
    apiResult.className = `api-result ${type}`.trim();
    apiResult.innerHTML = `
      <p class="result-label">${escapeHtml(label)}</p>
      <h3>${escapeHtml(message)}</h3>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
