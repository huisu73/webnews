export default async function handler(req, res) {
  const { title, description } = req.body;

  try {
    const text = `${title}\n${description}`;

    // 무료 한국어 모델 API 엔드포인트 사용
    const response = await fetch("https://estsoft-openai-api.jejucodingcamp.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "다음 내용을 3~4줄로 한국어 요약해줘." },
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();

    res.status(200).json({
      summary: data.choices?.[0]?.message?.content || ""
    });

  } catch (e) {
    res.status(500).json({ summary: "" });
  }
}
