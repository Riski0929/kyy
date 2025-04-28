module.exports = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({
        status: false,
        message: 'Masukkan parameter query'
      });
  }

  const texts = query.split(' ');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
      <rect width="100%" height="100%" fill="white"/>
      <style>
        .text { 
          font: bold 40px sans-serif; 
          fill: black; 
          dominant-baseline: middle; 
          text-anchor: middle; 
        }
      </style>
      ${texts.map((text, i) => `
        <text x="50%" y="${150 + i * 50}" class="text">${text}</text>
      `).join('')}
    </svg>
  `;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
};
