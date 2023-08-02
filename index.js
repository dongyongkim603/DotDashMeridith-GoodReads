const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
const goodreadsApiKey = process.env['goodreadsApiKey'];

app.use(cors());

app.use(express.static("."));
const YOUR_DOMAIN = "http://localhost:4242";

app.listen(4242, () => console.log("Running on port 4242"));

app.get('/books', async (req, res) => {
  const { 
    q,
    page
  } = req.query;

  try {
    const apiUrl = 'https://www.goodreads.com/search/index.xml';
    const response = await axios.get(apiUrl, {
      params: {
        q,
        key: goodreadsApiKey,
        'search[field]': 'all',
      },
    });

    return res.status(200).send(response.data);
  } catch (error) {
    console.error('Error searching for books:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
})