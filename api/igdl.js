const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(406).json({
      status: false,
      creator: 'Kyy',
      code: 406,
      message: 'masukkan parameter url'
    });
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

    if (resultArray.length < 2) {
      return res.status(404).json({
        status: false,
        creator: 'Kyy',
        code: 404,
        message: 'Media tidak ditemukan atau url tidak valid'
      });
    }

    const mediaUrl = resultArray[1].url; // ambil hasil kedua
    const head = await axios.head(mediaUrl);

    let type = 'unknown';
    let result = {};

    const contentType = head.headers['content-type'] || '';
    if (contentType.includes('video')) {
      type = 'video';
      result.video = mediaUrl;
    } else if (contentType.includes('image')) {
      type = 'image';
      result.images = resultArray.slice(1).map(r => r.url); // ambil semua kecuali thumbnail
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      status: true,
      creator: 'Kyy',
      type,
      result
    });

  } catch (e) {
    return res.status(500).json({
      status: false,
      creator: 'Kyy',
      code: 500,
      message: `Terjadi kesalahan: ${e.message}`
    });
  }
};
