const express = require("express");
const router = express.Router();
const sanitizeHtml = require("sanitize-html");
const template = require("../lib/template.js");
const path = require("path");
const fs = require("fs");

router.get("/:pageId", (req, res, next) => {
  var filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    if (err) {
      next(err);
    } else {
      var title = req.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ["h1"],
      });
      var list = template.list(req.list);
      var html = template.HTML(
        sanitizedTitle,
        list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/create">create</a>
                    <a href="/update/${sanitizedTitle}">update</a>
                    <form action="/delete_process" method="post">
                      <input type="hidden" name="id" value="${sanitizedTitle}">
                      <input type="submit" value="delete">
                    </form>`
      );
      res.send(html);
    }
  });
});
router.get("/create", (req, res) => {
  var title = "WEB - create";
  var list = template.list(req.list);
  var html = template.HTML(
    title,
    list,
    `
            <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `,
    ""
  );
  res.send(html);
});
router.post("/create_process", (req, res) => {
  // var body = "";
  // req.on("data", function (data) {
  //   body = body + data;
  // });
  // req.on("end", function () {
  //   var post = qs.parse(body);
  //   var title = post.title;
  //   var description = post.description;
  //   fs.writeFile(`data/${title}`, description, "utf8", function (err) {
  //     res.writeHead(302, { Location: `/?id=${title}` });
  //     res.end();
  //   });
  // });

  // body-parser 미들웨어 적용
  var post = req.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, "utf8", function (err) {
    res.writeHead(302, { Location: `/?id=${title}` });
    res.end();
  });
});
router.get("/update/:pageId", (req, res) => {
  var filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    var title = req.params.pageId;
    var list = template.list(req.list);
    var html = template.HTML(
      title,
      list,
      `
                <form action="/update_process" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                  <p>
                    <textarea name="description" placeholder="description">${description}</textarea>
                  </p>
                  <p>
                    <input type="submit">
                  </p>
                </form>
      `,
      `<a href="/create">create</a> <a href="/update/${title}">update</a>`
    );
    res.send(html);
  });
});
router.post("/update_process", (req, res) => {
  var post = req.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`data/${title}`, description, "utf8", function (err) {
      res.redirect(`/?id=${title}`);
    });
  });
});
router.post("/delete_process", (req, res) => {
  var post = req.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function (error) {
    res.redirect("/");
  });
});
module.exports = router;
