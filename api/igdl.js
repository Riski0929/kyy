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
      title: $(el).attr('title') || null,
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

    const isVideo = resultArray.length === 1 && /\.mp4($|\?)/i.test(resultArray[0].url);
    const isImage = resultArray.length > 1 || resultArray.some(r => /\.(jpe?g|png|webp)($|\?)/i.test(r.url));

    if (isVideo) {
      type = 'video';
      result.video = resultArray[0].url;
      result.thumbnail = resultArray[0].title || null;
    } else if (isImage) {
      type = 'image';
      result.images = resultArray.map(r => r.url);
      result.thumbnail = resultArray[0]?.url || null;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(JSON.stringify({
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
