const axios = require('axios');
const cheerio = require('cheerio');

async function FacebookDl(url) {
  try {
    const { data } = await axios.post(
      'https://yt1s.io/api/ajaxSearch',
      new URLSearchParams({ q: url, w: '', p: 'home', lang: 'en' }),
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
    const result = {
      download: []
    };

    $('a.button.is-success.is-small.download-link-fb').each((index, el) => {
      const quality = $(el).attr('title') || `quality${index + 1}`;
      const url = $(el).attr('href') || null;

      if (url) {
        result.download.push({ quality, url });
      }
    });

    return result;
  } catch (e) {
    throw e;
  }
}

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
        message: 'Masukkan parameter url'
      }, null, 2));
  }

  try {
    const result = await FacebookDl(url);

    if (result.download.length === 0) {
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

    return res
      .status(200)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: true,
        creator: 'Kyy',
        code: 200,
        result: result
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
