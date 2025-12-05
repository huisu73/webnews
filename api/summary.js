export default async function handler(req, res) {
  try {
    const { title, description, link } = req.body;

    if (!title || !description) {
      return res.status(400).json({ text: "요약을 생성할 데이터가 부족합니다." });
    }

    const prompt = `
다음 뉴스 기사 내용을 3~4줄로 요약해줘.

제목: ${title}
요약문: ${description}

출력: 핵심만 간단하고 명확하게 정리해줘.
    `;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: prompt,
        max_output_tokens: 180
      })
    });

    const data = await response.json();

    // OpenAI 최신 응답 구조: output_text는 배열임
    const summary =
      Array.isArray(data.output_text) && data.output_text.length > 0
        ? data.output_text[0]
        : "요약 생성에 실패했습니다.";

    return res.status(200).json({ text: summary });

  } catch (error) {
    return res.status(500).json({ text: "요약 중 오류가 발생했습니다." });
  }
}
