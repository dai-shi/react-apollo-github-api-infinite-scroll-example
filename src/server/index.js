const express = require('express');
const querystring = require('querystring');
const request = require('request');

const app = express();

app.get('/auth/github', (req, res) => {
  const query = querystring.stringify({
    client_id: process.env.GITHUB_CLIENT_ID,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${query}`);
});

app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  request({
    uri: 'https://github.com/login/oauth/access_token',
    qs: {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
  }, (error, response, body) => {
    if (error) {
      res.status(500).send();
    } else {
      res.redirect(`/#${body}`);
    }
  });
});

app.use(require('express-react-redux')());

app.listen(process.env.PORT || 3000);
