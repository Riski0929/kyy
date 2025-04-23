const axios = require('axios');
const savetube = require('../lib/savetube'); // Pastikan path sudah sesuai

module.exports = async (req, res) => {
  const { url, format } = req.query;

  if (!url) {
    const errorResponse = {
      status: false,
      creator: 'Kyy',
      code: 406,
      message: 'Masukkan parameter url.\nContoh: https://ky-zybotz.vercel.app/yt?url=https://youtube.com/watch?v=xxxxxxxxxxx&format=720'
    };
    return res
      .setHeader('Content-Type', 'application/json')
      .status(406)
      .send(JSON.stringify(errorResponse, null, 2));
  }

  try {
    const result = await savetube.download(url, format);

    if (!result.status) {
      const errorResponse = {
        status: false,
        creator: 'Kyy',
        code: result.code || 400,
        message: result.error || 'Terjadi kesalahan saat mengambil video'
      };

      if (result.available_fmt) {
        errorResponse.available_formats = result.available_fmt;
        errorResponse.example_url = `https://ky-zybotz.vercel.app/yt?url=${encodeURIComponent(url)}&format=${result.available_fmt[0]}`;
      }

      return res
        .setHeader('Content-Type', 'application/json')
        .status(result.code || 400)
        .send(JSON.stringify(errorResponse, null, 2));
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

    const successResponse = {
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
    };

    return res
      .setHeader('Content-Type', 'application/json')
      .status(200)
      .send(JSON.stringify(successResponse, null, 2));
  } catch (e) {
    const errorResponse = {
      status: false,
      creator: 'Kyy',
      code: 500,
      message: `Terjadi kesalahan: ${e.message}`
    };

    return res
      .setHeader('Content-Type', 'application/json')
      .status(500)
      .send(JSON.stringify(errorResponse, null, 2));
  }
};
