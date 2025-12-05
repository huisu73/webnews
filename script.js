document.getElementById("searchBtn").addEventListener("click", searchNews);
document.getElementById("keyword").addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchNews();
});

async function searchNews() {
  const query = document.getElementById("keyword").value.trim();
  const resultArea = document.getElementById("news-results");
  resultArea.innerHTML = "";

  if (!query) {
    resultArea.innerHTML = "<p>검색어를 입력하세요.</p>";
    return;
  }

  try {
    // 네이버 뉴스 RSS API 호출
    const url =
      "https://news.google.com/rss/search?q=" +
      encodeURIComponent(query) +
      "&hl=ko&gl=KR&ceid=KR:ko";

    const rssData = await fetch(url);
    const rssText = await rssData.text();
    const items = [...rssText.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    if (items.length === 0) {
      resultArea.innerHTML = "<p>검색 결과가 없습니다.</p>";
      return;
    }

    for (const item of items) {
      const block = item[1];

      const titleMatch = block.match(/<title>(<!\[CDATA\[)?([\s\S]*?)(\]\]>)?<\/title>/);
      const linkMatch = block.match(/<link>(.*?)<\/link>/);
      const descMatch = block.match(/<description>(<!\[CDATA\[)?([\s\S]*?)(\]\]>)?<\/description>/);

      const rawTitle = titleMatch?.[2] || "제목 없음";
      const rawDesc = descMatch?.[2] || "";
      const link = linkMatch?.[1] || "";

      // HTML 태그 제거
      const cleanTitle = rawTitle.replace(/<[^>]*>/g, "");
      const cleanDesc = rawDesc.replace(/<[^>]*>/g, "");

      // 요약 생성 API 호출
      const summary = await summarize(cleanTitle, cleanDesc, link);

      // 카드 생성
      const card = document.createElement("div");
      card.className = "news-card";
      card.innerHTML = `
        <div class="card-title">${cleanTitle}</div>
        <div class="card-summary">${summary.summary || "요약 없음"}</div>
        <a href="${link}" target="_blank" class="card-link">원문 보기</a>
      `;

      resultArea.appendChild(card);
    }
  } catch (error) {
    console.error("검색 오류:", error);
    resultArea.innerHTML = "<p>뉴스 검색 중 오류가 발생했습니다.</p>";
  }
}

// 🚀 요약 API 호출 함수 (여기서 링크 포함)
async function summarize(title, description, link) {
  try {
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, link }),
    });

    return await res.json();
  } catch (e) {
    console.error("요약 API 오류:", e);
    return { summary: "" };
  }
}