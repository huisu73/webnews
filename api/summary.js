export default async function handler(req, res) {
  try {
    const { title, description } = req.body;

    const textToSummarize = `${title}\n${description}`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/heegyu/kobart-base-v1-summarization",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: textToSummarize,
          parameters: {
            max_length: 80,
            min_length: 30,
            do_sample: false
          }
        })
      }
    );

    const result = await response.json();

    const summary =
      result[0]?.summary_text || "요약 생성에 실패했습니다.";

    res.status(200).json({ text: summary });
  } catch (e) {
    res.status(500).json({ text: "요약 오류: " + e.message });
  }
}
