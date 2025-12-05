import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { title, link } = req.body;

    if (!link) {
      return res.status(400).json({ summary: "링크 없음" });
    }

    // 1) 원문 페이지 가져오기
    const html = await fetch(link).then(r => r.text());

    // 2) cheerio로 본문 텍스트 추출
    const $ = cheerio.load(html);

    // 네이버 뉴스 본문 선택자
    let content =
      $("#dic_area").text().trim() ||           // 새로운 네이버 뉴스(2023 이후)
      $("#newsct_article").text().trim() ||     // 네이버 새버전
      $("#articeBody").text().trim() ||         // 구버전
      $("article").text().trim();               // 최종 fallback

    if (!content || content.length < 50) {
      content = "기사 본문을 추출하지 못했습니다.";
    }

    // 3) AI 요약 요청 (Upstage 무료 모델)
    const response = await fetch("https://api.upstage.ai/v1/solar/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.UPSTAGE_API_KEY}`
      },
      body: JSON.stringify({
        model: "solar-KORANI-O1-mini",
        messages: [
          {
            role: "user",
            content: `다음 뉴스 내용을 3~4줄로 한국어 핵심 요약해줘.\n\n제목: ${title}\n\n내용: ${content}`
          }
        ]
      })
    });

    const data = await response.json();
    const aiSummary = data.choices?.[0]?.message?.content || "";

    res.status(200).json({ summary: aiSummary });

  } catch (error) {
    console.error("요약 실패:", error);
    res.status(500).json({ summary: "" });
  }
}