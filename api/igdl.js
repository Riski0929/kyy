const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res
      .status(406)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: false,
        creator: 'Kyy',
        code: 406,
        message: 'masukkan parameter url'
      }, null, 2));
  }

  try {
    const { data } = await axios.post('https://yt1s.io/api/ajaxSearch', new URLSearchParams({
      q: url,
      w: '',
      p: 'home',
      lang: 'en'
    }), {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://yt1s.io',
        'Referer': 'https://yt1s.io/',
        'User-Agent': 'Postify/1.0.0'
      }
    });

    const $ = cheerio.load(data.data);
    const resultArray = $('a.abutton.is-success.is-fullwidth.btn-premium').map((_, el) => ({
      url: $(el).attr('href')
    })).get();

    if (resultArray.length === 0) {
      return res
        .status(404)
        .setHeader('Content-Type', 'application/json')
        .send(JSON.stringify({
          status: false,
          creator: 'Kyy',
          code: 404,
          message: 'Media tidak ditemukan atau url tidak valid'
        }, null, 2));
    }

    let type = 'unknown';
    let result = {};

    // Ambil hasil kedua (index 1), bukan pertama (index 0)
    const secondResult = resultArray[1];

    if (secondResult && /\.mp4($|\?)/i.test(secondResult.url)) {
      type = 'video';
      result.video = secondResult.url;
    } else if (resultArray.length > 1 && /\.(jpe?g|png|webp)($|\?)/i.test(secondResult?.url || '')) {
      type = 'image';
      result.images = resultArray.map(r => r.url);
    }

    return res
      .status(200)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: true,
        creator: 'Kyy',
        type,
        result
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
