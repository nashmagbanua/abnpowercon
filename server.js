const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static assets and files from the root directory
app.use(express.static(__dirname));

// Route fallback: send index.html if requested path is not found
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
