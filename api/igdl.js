const axios = require('axios');

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
        message: 'masukkan parameter url'
      }, null, 2));
  }

  try {
    const { data } = await axios.get('https://api.fabdl.com/spotify/get?url=' + url, {
      headers: {
        'content-type': 'application/json'
      }
    });

    const { data: res2 } = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${data.result.gid}/${data.result.id}`);

    return res
      .status(200)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: true,
        creator: 'Kyy',
        type: 'audio',
        result: {
          title: data.result.name,
          duration: data.result.duration_ms,
          cover: data.result.image,
          download: "https://api.fabdl.com" + res2.result.download_url
        }
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
