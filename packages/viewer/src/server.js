#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');
const meow = require('meow');

const cli = meow();

const models = cli.input.map(fName => [
  path.basename(fName),
  path.join(process.cwd(), fName),
]);

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/models/:modelId', (req, res) => {
  const model = models.find(([modelId]) => modelId === req.params.modelId);

  if (!model) {
    res.status(404).send('Model not found');
    return;
  }

  const [modelId, modelPath] = model;

  res.sendFile(modelPath);
});

app.get('/info/models/:modelId', (req, res) => {
  const model = models.find(([modelId]) => modelId === req.params.modelId);

  if (!model) {
    res.status(404).send('Model not found');
    return;
  }

  const [modelId, modelPath] = model;

  fs.stat(modelPath, (err, stats) => {
    if (err) {
      res.status(500).send();
    } else {
      res.send({ lastModified: stats.mtimeMs });
    }
  });
});

app.get('/models', (req, res) => {
  res.send(models);
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
