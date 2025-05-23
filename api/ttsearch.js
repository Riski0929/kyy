const axios = require('axios');

module.exports = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res
      .status(406)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: false,
        creator: 'Kyy',
        code: 406,
        message: 'Masukkan parameter query'
      }, null, 2));
  }

  try {
    const { data } = await axios("https://tikwm.com/api/feed/search", {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie: "current_language=en",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
      },
      data: {
        keywords: query,
        count: 12,
        cursor: 0,
        web: 1,
        hd: 1,
      },
      method: "POST",
    });

    if (!data || !data.data || data.data.videos.length === 0) {
      return res
        .status(404)
        .setHeader('Content-Type', 'application/json')
        .send(JSON.stringify({
          status: false,
          creator: 'Kyy',
          code: 404,
          message: 'Tidak ditemukan hasil untuk query tersebut'
        }, null, 2));
    }

    // Rapihin datanya
    const videos = data.data.videos.map(video => ({
      video_id: video.video_id,
      region: video.region,
      title: video.title,
      duration: video.duration,
      cover: `https://tikwm.com${video.cover}`,
      video_no_watermark: `https://tikwm.com${video.play}`,
      video_with_watermark: `https://tikwm.com${video.wmplay}`
    }));

    return res
      .status(200)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: true,
        creator: 'Kyy',
        result: {
          videos
        }
      }, null, 2));

  } catch (e) {
    return res
      .status(500)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: false,
        creator: 'Kyy',
        code: 500,
        message: `Terjadi kesalahan: ${e.message}`
      }, null, 2));
  }
};
