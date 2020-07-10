const showdown = require('showdown')
// const db = require('../models')
const db_conn = require('better-sqlite3');


const myext = function () {
    //Extension for detecting wikilinks in markdown string
    var myext1 = {
        type: 'lang',
        regex: "\\[\\[([^\\]\[\\r\\n]*)\\]\\]",
        replace: function (markdown, text) {
            let link = text.split(" ").join("_")
            let doneResult = false
            //Synchronously finds all links in database where this link is there
            const db = new db_conn('database.sqlite', {verbose: console.log, fileMustExist: true})
            let query = "SELECT `id`, `title`, `link`, `html`, `createdAt`, `updatedAt` FROM `main`.`pages` AS `page` WHERE `page`.`link` = ?;"
            const row = db.prepare(query).get(link)
            db.close()
            if (row) {
                return `<a href="/page/${link}">${text}</a>`
            } else {
                return `<a href="/page/${link}" style="color: red">${text}</a>`
            }
        }
    }
    return myext1
}
// "<a href='/page/$1'>$1</a>"

showdown.extension('myext', myext);

let showdown_converter = new showdown.Converter({extensions: ['myext']});

module.exports = showdown_converter
