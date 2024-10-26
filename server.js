const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/chat', (req, res) => {
  const userMessage = req.body.message;

  const ollama = spawn('/usr/local/bin/ollama', ['run', 'llama3.2']);

  let responseText = '';

  ollama.stdout.on('data', (data) => {
    responseText += data.toString();
  });

  ollama.stderr.on('data', (data) => {
    console.error(`Ollama stderr: ${data}`);
  });

  ollama.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: 'Error running Ollama locally' });
    }
    res.json({ reply: responseText.trim() });
  });

  ollama.stdin.write(`${userMessage}\n`);
  ollama.stdin.end();
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
