const axios = require('axios');
const savetube = require('../lib/savetube'); // Pastikan path sudah sesuai

module.exports = async (req, res) => {
  const { url, format } = req.query;

  if (!url) {
    return res.status(406).json({
      status: false,
      creator: 'Kyy',
      code: 406,
      message: 'Masukan parameter url'
    });
  }

  try {
    const result = await savetube.download(url, format);

    if (!result.status) {
      const response = {
        status: false,
        creator: 'Kyy',
        code: result.code,
        message: result.error || 'Terjadi kesalahan saat mengambil video'
      };

      // Tampilkan daftar format jika ada
      if (result.available_fmt) {
        response.available_formats = result.available_fmt;
      }

      return res.status(result.code || 400).json(response);
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
