const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultCard = document.getElementById("resultCard");
const errorMsg = document.getElementById("errorMsg");

function showLoading() {
  resultCard.innerHTML = `
    <div class="loading">⏳ 요약 생성 중입니다...</div>
  `;
}

async function getNews(keyword) {
  try {
    showLoading();

    const res = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword })
    });

    const data = await res.json();
    renderNews(data.items);
  } catch (e) {
    errorMsg.textContent = "오류 발생: " + e.message;
  }
}

async function summarize(title, link) {
  const res = await fetch("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, link })
  });

  return await res.json();
}

async function renderNews(items) {
  resultCard.innerHTML = "";

  for (const item of items) {
    const cleanTitle = item.title.replace(/<[^>]+>/g, "");

    // description 필요 없음 → 삭제
    const summary = await summarize(cleanTitle, item.link);

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="card-title">${cleanTitle}</div>
      <div class="card-summary">${summary.summary || "요약 없음"}</div>
      <a href="${item.link}" target="_blank" class="card-link">원문 보기</a>
    `;

    resultCard.appendChild(card);
  }
}

searchBtn.addEventListener("click", () => {
  const keyword = searchInput.value.trim();
  if (keyword) getNews(keyword);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});