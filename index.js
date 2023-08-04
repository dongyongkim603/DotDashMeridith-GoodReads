const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
const xml2js = require('xml2js');

const goodreadsApiKey = process.env['goodreadsApiKey'];
const goodreadsApiSecret = process.env['goodreadsApiSecret'];

app.use(cors());

app.use(express.static('.'));
const YOUR_DOMAIN = 'http://localhost:4242';

app.listen(4242, () => console.log('Running on port 4242'));

const authorize = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authorization.split(' ')[1];

  if (token !== goodreadsApiSecret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
};

app.use(authorize);

app.get('/books-search', async (req, res) => {
  const {
    q,
    field,
    sort
  } = req.query;

  try {
    const apiUrl = 'https://www.goodreads.com/search/index.xml';
    const response = await axios.get(apiUrl, {
      params: {
        q,
        key: goodreadsApiKey,
        'search[field]': field,
      },
    });
    const responseJSON = convertXmlToJson(response.data);
    let results = responseJSON?.GoodreadsResponse?.search[0]?.results[0]?.work;


    return res.status(200)
      .send(results);
  } catch (error) {
    console.error('Error searching for books:', error.message);
    return res.status(500).json({ error: 'Could not find book' });
  }
});

function convertXmlToJson(xmlString) {
  let jsonObject = null;
  xml2js.parseString(xmlString, (err, result) => {
    if (err) {
      throw err;
    }
    jsonObject = result;
  });
  return jsonObject;
}