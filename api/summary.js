export default async function handler(req, res) {
  try {
    const { title, description, link } = req.body;

    const textToSummarize = `${title}\n${description}`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: textToSummarize })
      }
    );

    const result = await response.json();

    // 모델 응답 형태가 ["summary_text": "..."] 이런 구조라서 추출
    const summary =
      result[0]?.summary_text || "요약 생성에 실패했습니다.";

    res.status(200).json({ text: summary });
  } catch (e) {
    res.status(500).json({ text: "요약 생성 오류: " + e.message });
  }
}
