const axios = require('axios');

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

  try {
    const response = await axios({
      method: 'GET',
      url: `https://brat.caliphdev.com/api/brat`,
      params: { text: query },
      responseType: 'arraybuffer' // penting, biar bisa dapet binary image
    });

    res.setHeader('Content-Type', 'image/png');
    res.send(response.data);

  } catch (error) {
    res
      .status(500)
      .json({
        status: false,
        message: error.message || 'Terjadi kesalahan'
      });
  }
};
