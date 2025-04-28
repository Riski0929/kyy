const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(406).json({
      status: false,
      creator: 'Kyy',
      code: 406,
      message: 'Masukkan parameter url'
    });
  }

  try {
    // Request ke website downloader
    const { data } = await axios.get(`https://snapsave.app/id/facebook-downloader`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const $ = cheerio.load(data);

    // Cari thumbnail
    const thumbnail = $('meta[property="og:image"]').attr('content') || null;
    
    // Cari title
    const title = $('meta[property="og:title"]').attr('content') || 'Facebook Video';

    // Cari duration (kalau ada)
    const duration = $('meta[property="og:video:duration"]').attr('content');
    const durasi = duration ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : null;

    // Cari link download di tombol download
    const download = {};

    $('a.download-link-fb').each((_, el) => {
      const quality = $(el).closest('tr').find('td.video-quality').text().trim();
      const link = $(el).attr('href');
      if (quality.includes('720')) download['720p'] = link;
      if (quality.includes('360')) download['360p'] = link;
    });

    if (!download['360p'] && !download['720p']) {
      return res.status(404).json({
        status: false,
        creator: 'Kyy',
        code: 404,
        message: 'Link download tidak ditemukan'
      });
    }

    return res.status(200).json({
      status: true,
      creator: 'Kyy',
      code: 200,
      result: {
        title,
        duration: durasi || 'Unknown',
        thumbnail,
        download
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
