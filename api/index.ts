const express = require("express");
const server = require('../server/app.js');
const app = express();

app.get("/", (req, res) => res.send("Express on Vercel"));

server.listen(3000, () => {
  console.log('server is listening on http://localhost:3000');
})

module.exports = app;