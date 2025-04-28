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
        message: 'Masukkan parameter url'
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

    // Ambil semua tombol download
    const downloads = $('a.abutton.is-success.is-fullwidth.btn-premium')
      .map((_, el) => ({
        url: $(el).attr('href'),
        quality: $(el).attr('data-quality') || null,
        format: $(el).attr('data-format') || null
      }))
      .get();

    if (downloads.length === 0) {
      return res
        .status(404)
        .setHeader('Content-Type', 'application/json')
        .send(JSON.stringify({
          status: false,
          creator: 'Kyy',
          code: 404,
          message: 'Media tidak ditemukan atau URL tidak valid'
        }, null, 2));
    }

    let result = [];
    
    for (let file of downloads) {
      try {
        const head = await axios.head(file.url);
        const contentType = head.headers['content-type'] || '';

        result.push({
          url: file.url,
          quality: file.quality,
          format: file.format,
          type: contentType.includes('video') ? 'video' :
                contentType.includes('image') ? 'image' :
                contentType.includes('audio') ? 'audio' : 'unknown'
        });
      } catch (e) {
        console.warn(`Gagal ambil HEAD: ${file.url}`);
      }
    }

    if (result.length === 0) {
      return res
        .status(404)
        .setHeader('Content-Type', 'application/json')
        .send(JSON.stringify({
          status: false,
          creator: 'Kyy',
          code: 404,
          message: 'Tidak ada media valid ditemukan'
        }, null, 2));
    }

    return res
      .status(200)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: true,
        creator: 'Kyy',
        code: 200,
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
