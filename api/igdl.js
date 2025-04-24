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
    const { data } = await axios.post(
      'https://yt1s.io/api/ajaxSearch',
      new URLSearchParams({
        q: url,
        w: '',
        p: 'home',
        lang: 'en'
      }),
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': 'https://yt1s.io',
          'Referer': 'https://yt1s.io/',
          'User-Agent': 'Postify/1.0.0'
        }
      }
    );

    const $ = cheerio.load(data.data);

    const resultArray = $('a.abutton.is-success.is-fullwidth.btn-premium')
      .map((_, el) => ({
        url: $(el).attr('href')
      }))
      .get();

    if (resultArray.length < 2) {
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

    const mediaUrl = resultArray[1].url;
    const head = await axios.head(mediaUrl);
    const contentType = head.headers['content-type'] || '';

    let type = 'unknown';
    let result = {};

    if (contentType.includes('video')) {
      type = 'video';
      result.video = mediaUrl;
    } else if (contentType.includes('image')) {
      type = 'image';
      result.images = resultArray.slice(1).map(r => r.url);
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
