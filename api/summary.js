import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const { title, description, link } = req.body;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
      아래 뉴스 제목과 내용을 3줄로 요약해줘.
      제목: ${title}
      설명: ${description}
      링크: ${link}
    `;

    const result = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    res.status(200).json({ text: result.choices[0].message.content });
  } catch (e) {
    console.error("요약 오류:", e);
    res.status(500).json({ error: "요약 생성 실패" });
  }
}
