export default async function handler(req, res) {
  try {
    const { title, description } = req.body;

    // 무료 한국어 모델 KORANI-O1-mini API 호출
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
            content: `다음 뉴스 내용을 한국어로 3~4줄 요약해줘.\n\n제목: ${title}\n\n내용: ${description}`
          }
        ]
      })
    });

    const data = await response.json();

    // 모델이 반환한 텍스트 추출
    const aiSummary = data.choices?.[0]?.message?.content || "";

    res.status(200).json({ summary: aiSummary }); // ★ 반드시 summary 키로 반환!

  } catch (error) {
    res.status(500).json({ summary: "" });
  }
}