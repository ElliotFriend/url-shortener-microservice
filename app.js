require('dotenv').config();
const dns = require('dns');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid')
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
    type: String,
    default: () => nanoid(10),
  },
  numberClicks: {
    type: Number,
    default: 0,
  }
});
const ShortenedURL = mongoose.model('ShortenedURL', urlSchema);

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

app.post('/api/shorturl', async function(req, res) {
  let invalidResponse = { error: 'invalid url' };
  let re = /^https?\:\/\//;
  let inputURL = req.body.url;

  if (!re.test(req.body.url)) return res.json(invalidResponse);
  dns.lookup(inputURL.replace(re, ''), (err, address, family) => {
    if (err) {console.log(err); return res.json(invalidResponse);}
  });

  let shortURL = new ShortenedURL({
    originalURL: inputURL,
  });
  let shortDoc = await shortURL.save();

  res.json({ original_url: inputURL, short_url: shortDoc.shortURL });
});

app.get('/api/shorturl/:shorturl', async function(req, res) {
  let nanoId = req.params.shorturl;
  let doc = await ShortenedURL.findOneAndUpdate({ shortURL: nanoId }, { $inc: { numberClicks: 1 } })
  
  res.redirect(doc.originalURL);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
