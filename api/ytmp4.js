const axios = require('axios');
const savetube = require('../lib/savetube'); // Pastikan scraper disimpan di sini

module.exports = async (req, res) => {
  const { url, format } = req.query;

  if (!url) {
    return res.status(406).json({
      status: false,
      creator: 'Kyy',
      code: 406,
      message: 'masukan parameter url'
    });
  }

  try {
    const result = await savetube.download(url, format);

    if (!result.status) {
      return res.status(result.code || 400).json({
        status: false,
        creator: 'Kyy',
        code: result.code,
        message: result.error || 'Terjadi kesalahan saat mengambil video'
      });
    }

    return res.status(200).json({
      status: true,
      creator: 'Kyy',
      result: result.result
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
