const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultCard = document.getElementById("resultCard");
const errorMsg = document.getElementById("errorMsg");

// 로딩 표시
function showLoading() {
  resultCard.innerHTML = `
    <div class="loading">⏳ 요약 생성 중입니다...</div>
  `;
}

// 뉴스 검색 API 요청 함수
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

// 요약 요청 함수
async function summarize(title, description) {
  try {
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    });

    return await res.json();
  } catch (err) {
    return { summary: "" };
  }
}

// 뉴스 카드 렌더링
async function renderNews(items) {
  resultCard.innerHTML = "";

  for (const item of items) {
    // HTML 태그 제거
    const cleanTitle = item.title.replace(/<[^>]+>/g, "");
    const cleanDesc = item.description.replace(/<[^>]+>/g, "");

    // 요약 요청
    const summary = await summarize(cleanTitle, cleanDesc);

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

// 검색 버튼 클릭
searchBtn.addEventListener("click", () => {
  const keyword = searchInput.value.trim();
  if (keyword) getNews(keyword);
});

// 엔터키로 검색
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});
