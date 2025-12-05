export default async function handler(req, res) {
  try {
    const { title, description } = req.body;

    // 요약 대상 텍스트 구성 (기사 제목 + 설명)
    const textToSummarize = `${title}\n${description}`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/heegyu/kobart-summarization",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: textToSummarize,
          parameters: {
            max_length: 120,
            min_length: 40,
            do_sample: false
          }
        })
      }
    );

    const result = await response.json();

    // 모델 응답 추출
    const summary =
      result[0]?.summary_text || "요약 생성에 실패했습니다.";

    res.status(200).json({ text: summary });
  } catch (e) {
    res.status(500).json({ text: "요약 오류: " + e.message });
  }
}
