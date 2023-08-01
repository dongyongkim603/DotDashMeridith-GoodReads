const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.use(express.static("."));
const YOUR_DOMAIN = "http://localhost:4242";

app.listen(4242, () => console.log("Running on port 4242"));

app.get('/test', (req, res) => {
  console.log("hello world")
  return res.status(200).json({ status: 200 })
})