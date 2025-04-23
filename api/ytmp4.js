const axios = require('axios');
const savetube = require('../lib/savetube'); // Pastikan path sudah sesuai

module.exports = async (req, res) => {
  const { url, format } = req.query;

  if (!url) {
    return res.status(406).json({
      status: false,
      creator: 'Kyy',
      code: 406,
      message: 'Masukan parameter url. Contoh: https://ky-zybotz.vercel.app/yt?url=https://youtube.com/watch?v=xxxxxxxxxxx&format=720'
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

      if (result.available_fmt) {
        response.available_formats = result.available_fmt;
        response.example_url = `https://ky-zybotz.vercel.app/yt?url=${encodeURIComponent(url)}&format=${result.available_fmt[0]}`;
      }

      return res.status(result.code || 400).json(response);
    }

    const {
      title,
      type,
      format: fmt,
      quality,
      duration,
      thumbnail,
      download,
      id,
      key,
      downloaded
    } = result.result;

    return res.status(200).json({
      status: true,
      creator: 'Kyy',
      result: {
        title,
        type,
        format: fmt,
        quality,
        duration,
        thumbnail,
        download_url: download,
        youtube_id: id,
        encryption_key: key,
        downloaded
      }
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
