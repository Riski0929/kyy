const { createCanvas } = require('canvas');

module.exports = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res
      .status(406)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: false,
        creator: 'Kyy',
        code: 406,
        message: 'masukkan parameter query'
      }, null, 2));
  }

  try {
    const width = 500;
    const height = 500;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background putih
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Teks hitam
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px Arial'; // Bisa lu ganti font kalau mau
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = query.split(' '); // Misahin kata per spasi
    const lineHeight = 40; // Jarak antar baris

    // Mulai dari tengah
    const startY = (height / 2) - ((lines.length - 1) * lineHeight / 2);

    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + (index * lineHeight));
    });

    res.setHeader('Content-Type', 'image/png');
    res.status(200);
    canvas.pngStream().pipe(res);

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
