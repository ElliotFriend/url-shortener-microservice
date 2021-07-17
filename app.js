require('dotenv').config();
const dns = require('dns');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();


// Basic Configuration
const port = process.env.PORT || 3000;
const { Schema } = mongoose;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new Schema({
  originalURL: {
    type: String,
    required: true,
  },
  shortURL: {
    type: Number,
    required: true,
  },
  numberClicks: {
    type: Number,
    default: 0,
  }
});
const ShortenedURL = mongoose.model('ShortenedURL', urlSchema);

const createAndSaveURL = (validURL, done) => {
  let shortURL = new ShortenedURL({
    originalURL: validURL,
  })
}

const findURLById = (urlId, done) => {
  ShortenedURL.findById(urlId, (err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  let invalidResponse = { error: 'invalid url' };
  let re = /^https?\:\/\//;
  let inputURL = req.body.url;

  if (!re.test(req.body.url)) return res.json(invalidResponse);
  dns.lookup(inputURL.replace(re, ''), (err, address, family) => {
    if (err) {console.log(err); return res.json(invalidResponse);}
    res.json({ original_url: inputURL });
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
