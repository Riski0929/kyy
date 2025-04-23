const axios = require('axios');
const savetube = require('../lib/savetube'); // Pastikan scraper disimpan di sini

module.exports = async (req, res) => {
  const { url, format } = req.query;

  if (!url) {
    return res
      .status(406)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: false,
        creator: 'Kyy',
        code: 406,
        message: 'masukan parameter url'
      }, null, 2));
  }

  try {
    const result = await savetube.download(url, format);

    if (!result.status) {
      return res
        .status(result.code || 400)
        .setHeader('Content-Type', 'application/json')
        .send(JSON.stringify({
          status: false,
          creator: 'Kyy',
          code: result.code || 400,
          message: result.error || 'Terjadi kesalahan saat mengambil video'
        }, null, 2));
    }

    return res
      .status(200)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .send(JSON.stringify({
        status: true,
        creator: 'Kyy',
        result: result.result
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
