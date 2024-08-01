const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const compression = require("compression");
const fs = require("fs");
const qs = require("querystring");
const topicRouter = require("./router/topic.js");
const indexRouter = require("./router/index.js");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use((req, res, next) => {
  fs.readdir("./data", function (error, filelist) {
    req.list = filelist;
    next();
  });
});

app.use("/", indexRouter);
app.use("/topic", topicRouter);

app.use(function (req, res, next) {
  res.status(404).send("Sorry cant find that!");
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
