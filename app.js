const express = require('express');
const fs      = require('fs');

const app = express();
const port = process.env.PORT || 6969;

app.use(express.static('public'));

app.get('/', async (req, res, next) => {
  return res.sendFile('./index.html', { root: __dirname });
});

app.get('/registry', async (req, res, next) => {
  const data = fs
    .readdirSync('./labs')
    .map(lab => lab.replace('.html', ''))
    .sort();

  return res.send(data);
});

app.get('/:labName', async (req, res, next) => {
  const { labName } = req.params;
  const fileName = `${labName}.html`;
  const files = fs.readdirSync('./labs');
  if (!files.includes(fileName)) return res.redirect('/');

  return res.sendFile(`./labs/${fileName}`, { root: __dirname });
});

app.get('*', async (req, res) => res.sendStatus(404));

app.listen(port, '0.0.0.0', () => {
  console.log(`\nlistening on 0.0.0.0:${port}\n`);
});