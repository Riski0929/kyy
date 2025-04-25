const { GoogleGenerativeAI } = require('@google/generative-ai');

// List apikeys disini
const apikeyList = [
  'AIzaSyDoyBsozIUfDGGvxMYkFQTsEzsob7a0pFQ',
  'AIzaSyDgzEssV7L2ZB6ybKmIr2XvN5ZV8Jyu8OQ',
  'AIzaSyC8eiu4jeYWSgW-mTZmnb1Ki6ieWT8YmrE'
];

// Fungsi buat random apikey
function randomApikey() {
  return apikeyList[Math.floor(Math.random() * apikeyList.length)];
}

// Fungsi buat generate dari Gemini
async function geminiAi(query, apikey, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!apikey) reject({ status: 401, error: 'Unauthorized' });
      const gemini = new GoogleGenerativeAI(apikey);
      const model = gemini.getGenerativeModel({
        ...(options.prompt ? { systemInstruction: options.prompt } : {}),
        model: 'gemini-2.0-flash-exp-image-generation',
        generationConfig: {
          responseModalities: ['Text', 'Image']
        }
      });

      const { response } = await model.generateContent([
        { text: query },
        ...(options.media ? [{
          inlineData: {
            mimeType: options.mime,
            data: Buffer.from(options.media).toString('base64')
          }
        }] : [])
      ]);

      const hasil = {};
      hasil.token = response.usageMetadata;

      if (response?.promptFeedback?.blockReason === 'OTHER' || response?.candidates?.[0]?.finishReason === 'IMAGE_SAFETY') {
        resolve(hasil);
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          hasil.text = part.text;
        }
        if (part.inlineData) {
          hasil.media = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      resolve(hasil);
    } catch (e) {
      reject(e);
    }
  });
}

// Main API export
module.exports = async (req, res) => {
  const { query, prompt } = req.query;
  const acceptHeader = req.headers.accept || '';

  if (!query) {
    return res
      .status(406)
      .setHeader('Content-Type', 'application/json')
      .send(JSON.stringify({
        status: false,
        creator: 'Kyy',
        code: 406,
        message: 'Masukkan parameter query'
      }, null, 2));
  }

  try {
    const apikey = randomApikey();
    const result = await geminiAi(query, apikey, {
      ...(prompt ? { prompt } : {})
    });

    if (!result.media) {
      return res
        .status(500)
        .setHeader('Content-Type', 'application/json')
        .send(JSON.stringify({
          status: false,
          creator: 'Kyy',
          code: 500,
          message: 'Gagal mendapatkan media'
        }, null, 2));
    }

    // Kalau bukan browser (axios, fetch, bot) => kirim JSON
    if (!acceptHeader.includes('text/html')) {
      return res
        .status(200)
        .setHeader('Content-Type', 'application/json')
        .send(JSON.stringify({
          status: true,
          creator: 'Kyy',
          result
        }, null, 2));
    }

    // Kalau browser => kirim HTML
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Generated Image</title>
      </head>
      <body style="text-align: center; margin-top: 50px;">
        <h1>Hasil Gambar</h1>
        <img src="${result.media}" alt="Generated Image" style="max-width: 90%; height: auto;"/>
        <br/><br/>
        <a id="downloadLink" href="${result.media}" download="gambar.png">
          <button style="padding: 10px 20px; font-size: 16px;">Download Gambar</button>
        </a>
      </body>
      </html>
    `;

    return res
      .status(200)
      .setHeader('Content-Type', 'text/html')
      .send(html);

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
