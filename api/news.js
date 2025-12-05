export default async function handler(req, res) {
  const { keyword } = req.body;

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keyword)}&display=5`,
      {
        headers: {
          "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
          "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET
        }
      }
    );

    const data = await response.json();
    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

