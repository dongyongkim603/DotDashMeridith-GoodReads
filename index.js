const { searchBooks } = require('./goodreads/index.js');
const express = require('express');
const cors = require('cors');
const app = express();

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
  return await searchBooks(req, res);
});