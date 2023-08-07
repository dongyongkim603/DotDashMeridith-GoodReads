const { convertXmlToJson } = require('../dataFormater/index');
const axios = require('axios');

const goodreadsApiKey = process.env['goodreadsApiKey'];
const goodreadsDomain = 'https://www.goodreads.com';

async function searchBooks(req, res) {
  const {
    q,
    field,
    sort
  } = req.query;

  try {
    const apiUrl = `${goodreadsDomain}/search/index.xml`;
    const response = await axios.get(apiUrl, {
      params: {
        q,
        key: goodreadsApiKey,
        'search[field]': field,
      },
    });
    const responseJSON = convertXmlToJson(response.data);
    let results = responseJSON?.GoodreadsResponse?.search[0]?.results[0]?.work;

    for(let i = 0; i < results.length; i++) {
      results[i]['relevance'] = i;
    }

    return res.status(200)
      .send(results);
  } catch (error) {
    console.error('Error searching for books:', error.message);
    return res.status(500).json({ error: 'Could not find book' });
  }
}

module.exports = {
  searchBooks,
};