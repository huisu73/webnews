import cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { link, title } = req.body;

    if (!link) {
      return res.status(400).json({ summary: "기사 링크가 없습니다." });
    }

    // 1) 원문 HTML 가져오기
    const response = await fetch(link, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // 2) 본문 텍스트 추출 (네이버 기사 구조 모두 대응)
    let articleText =
      $("#dic_area").text().trim() ||                   // 네이버 뉴스 PC
      $(".newsct_article").text().trim() ||             // 네이버 뉴스 개편 버전
      $("#newsct_article").text().trim() ||             // 또 다른 본문 구조
      $("article").text().trim() ||                     // 일반 뉴스 사이트
      $("body").text().trim();                           // 최후 fallback

    // 텍스트 너무 짧으면 요약 불가
    if (!articleText || articleText.length < 50) {
      return res.status(200).json({
        summary: "원문 크롤링 실패 — 요약 불가",
      });
    }

    // 3) Upstage 요약 호출
    const summaryRes = await fetch(
      "https://api.upstage.ai/v1/solar/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.UPSTAGE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "solar-KORANI-O1-mini",
          messages: [
            {
              role: "user",
              content: `다음 기사를 한국어로 3~4줄로 간단하게 요약해줘.

제목: ${title}

본문:
${articleText}`,
            },
          ],
        }),
      }
    );

    const data = await summaryRes.json();
    const aiSummary = data.choices?.[0]?.message?.content || "";

    return res.status(200).json({ summary: aiSummary });
  } catch (error) {
    return res.status(500).json({
      summary: "요약 생성 중 오류 발생",
    });
  }
}
