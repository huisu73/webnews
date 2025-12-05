export default async function handler(req, res) {
  const { title, description } = req.body;

  try {
    const text = `${title}. ${description}`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/psyche/hufs-kobart-summarization",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
      }
    );

    const data = await response.json();

    let summary = "요약 없음";
    if (Array.isArray(data) && data[0]?.summary_text) {
      summary = data[0].summary_text;
    }

    res.status(200).json({ text: summary });
  } catch (err) {
    res.status(500).json({ text: "요약 실패" });
  }
}
