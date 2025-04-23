const axios = require('axios');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ status: false, message: 'Missing url parameter' });

  try {
    function formatNumber(integer) {
      let numb = parseInt(integer)
      return Number(numb).toLocaleString().replace(/,/g, '.')
    }

    function formatDate(n, locale = 'en') {
      let d = new Date(n * 1000)
      return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
    }

    const domain = 'https://www.tikwm.com/api/';
    const response = await axios.post(domain, {}, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.tikwm.com/'
      },
      params: {
        url: url,
        hd: 1
      }
    });

    const resTik = response.data.data;

    return res.json({
      status: true,
      result: {
        id: resTik.id,
        title: resTik.title,
        region: resTik.region,
        taken_at: formatDate(resTik.create_time),
        duration: resTik.duration + ' Seconds',
        cover: resTik.cover,
        video: {
          watermark: resTik.wmplay || null,
          nowatermark: resTik.play || null,
          hd: resTik.hdplay || null
        },
        music: {
          id: resTik.music_info.id,
          title: resTik.music_info.title,
          author: resTik.music_info.author,
          album: resTik.music_info.album || null,
          url: resTik.music || resTik.music_info.play
        },
        stats: {
          views: formatNumber(resTik.play_count),
          likes: formatNumber(resTik.digg_count),
          comment: formatNumber(resTik.comment_count),
          share: formatNumber(resTik.share_count),
          download: formatNumber(resTik.download_count)
        },
        author: {
          id: resTik.author.id,
          fullname: resTik.author.unique_id,
          nickname: resTik.author.nickname,
          avatar: resTik.author.avatar
        }
      }
    });

  } catch (e) {
    return res.status(500).json({ status: false, message: e.message });
  }
      }
