var express = require('express');
var router = express.Router();
var db = require('../models/index')
var converter = require("../services")
var multer = require('multer');
var fs = require('fs')
var jsdiff = require('diff')
var upload = multer({dest: __dirname + '/public/images'})
var moment = require('moment')


/* GET users listing. */
router.get('/:page', function (req, res, next) {
    let link = encodeURI(req.params.page)

    //finds a page asynchronously using link
    db.page.findOne({
        where: {
            link: link
        }
    }).then(page => {
        let html = "";
        let title = "";
        //If page is null then sends Page Does Not Exist Template
        if (page) {
            //Converts page using diff
            html = converter.makeHtml(page.html);
            title = page.title;
        } else {
            html = `<div class="container">
                        <div class="alert alert-info" role="alert">
                            This Page Does not Exist
                        </div>
                  </div>`
        }
        res.render('page', {html: html, link: "/page/" + link, title: title})
    }).catch(reason => console.log(reason))
});

router.get('/:page/editPage', function (req, res, next) {
    let link = encodeURI(req.params.page)
    // let title = link.split("_").join(" ")

    db.page.findOne({
        where: {
            link: link
        }
    }).then(page => {
        let markdown = "";
        let html = "";
        let title = "";
        if (page) {
            markdown = page.html;
            html = converter.makeHtml(page.html);
            title = page.title;
        } else {
            title = decodeURI(link).split("_").join(" ")
        }
        res.render('editPage', {markdown: markdown, html: html, title: title, link: link})
    })
});

router.post('/:page/savePage', function (req, res, next) {
    let data = req.body;
    let title = data["title"]
    let html = data["html"]
    let describe = data["describe"]
    db.page.findOrCreate({
        where: {
            link: encodeURI(req.params.page)
        }
    }).then(([page, created]) => {
        let prev_html = page.html;
        page.title = title
        page.html = html
        page.save().then(() => {
            if (!created) {
                //Saves Previous html in history for comparison only if row is not created
                let history_model = db.history
                history_model.create({
                    prevHtml: prev_html,
                    describe: describe,
                }).then(history => {
                    history.setPage(page)
                    return res.send("success")
                })
            } else {
                return res.send("success")
            }
        })
    })

})

router.post('/upload_image', upload.single("image"), function (req, res) {
    var file = "public/images/" + req.file.originalname;
    fs.readFile(req.file.path, function (err, data) {
        fs.writeFile(file, data, function (err) {
            if (err) {
                console.error(err);
                response = {
                    message: 'Sorry, file couldn\'t be uploaded.',
                    filename: req.file.originalname
                };
            } else {
                response = {
                    message: 'File uploaded successfully',
                    filename: req.file.originalname
                };
            }
            res.end(JSON.stringify(response));
        });
    });
})

router.get('/:page/history', function (req, res, next) {
    // Lists histories of a page
    let history_model = db.history;
    history_model.findAll({
        include: [{
            model: db.page,
            where: {link: req.params.page}
        }]
    }).then(histories => {
        console.log(histories)
        histories = histories.map(value => {
            value = value.toJSON()
            //Converts Datetime in human readable format
            value.createdAt = moment(value.createdAt).format('MMMM Do YYYY, h:mm:ss a')
            return value
        })
        res.render('history', {histories: histories})
    })
})

router.get('/:page/history/:id/diff', function (req, res, next) {
    let history_model = db.history;
    history_model.findByPk(req.params.id).then(history => {
        let page = db.page;
        page.findOne({
            where: {
                link: req.params.page
            }
        }).then(page => {
            if (page && history) {
                // Creates github format unified diff string by comparing history html with current one
                let html = page.html;
                let prev_html = history.prevHtml;
                let diff = jsdiff.createTwoFilesPatch(page.title, page.title, prev_html, html);
                let createdAt = moment(history.createdAt).format('MMMM Do YYYY, h:mm:ss a')
                return res.render('diff_viewer', {diff: diff, createdAt: createdAt})
            }
            else {
                res.status(404).render('404')
            }
        })
    })
})

module.exports = router;
