var express = require('express');
var router = express.Router();
var showdown_converter = require('../services')
const db_conn = require('better-sqlite3');

router.get('/', function (req, res, next) {
    res.redirect('/page/Main_Page')
})

router.post('/livePreview', function (req, res, next) {
    let md = req.body["text"];
    var html = showdown_converter.makeHtml(md);
    console.log(html);
    res.json(html)
});

router.get('/search', function (req, res, next) {
    // Search using fts_index
  const db = new db_conn('database.sqlite', {verbose: console.log, fileMustExist: true})
  let text = req.query.text;
  if(text) {
      //Performs a match on index
      let query = `SELECT * FROM pages_idx WHERE pages_idx = '${text}'`
      let rows = db.prepare(query).all();
      let res_data = rows.map(row => {
      return {
        title: row.title, link: row.link
      }
    })
    console.log(res_data)
    res.render("search_page", {result: res_data,search:text})
  }
  else {
    res.status(404).render('404')
  }
  db.close()
})


module.exports = router;
