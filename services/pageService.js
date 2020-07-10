let db = require('../models')
let fs = require('fs')
let db_conn = require('better-sqlite3')

let cleanup_fts = () => {
    //Cleanup Table if database is reset
    const db = new db_conn('database.sqlite', {verbose: console.log, fileMustExist: true})

    db.exec("DROP TRIGGER IF EXISTS pages_ai")
    db.exec("DROP TRIGGER IF EXISTS pages_au")
    db.exec("DROP TRIGGER IF EXISTS pages_ad")
    db.exec("DROP TABLE IF EXISTS pages_idx")
    db.close()

}
let setup_fts = () => {
    //Create a virtual Table for fts along with crud triggers for synchronising virtual table and content table
    const db = new db_conn('database.sqlite', {verbose: console.log, fileMustExist: true})
    let create_vt_query = "CREATE VIRTUAL TABLE pages_idx USING fts5(title,link,html, content='pages', content_rowid='id');"

    let create_insert_trigger = "CREATE TRIGGER pages_ai AFTER INSERT ON pages BEGIN INSERT INTO pages_idx(rowid,title,link,html) VALUES (new.id,new.title, new.link, new.html);END;"

    let create_update_trigger = `CREATE TRIGGER pages_au AFTER UPDATE ON pages BEGIN
  INSERT INTO pages_idx(pages_idx, rowid,title,link,html) VALUES('delete', old.id, old.title,old.link, old.html);
  INSERT INTO pages_idx(rowid,title,link,html) VALUES (new.id,new.title, new.link, new.html); END;`

    let create_delete_trigger = `CREATE TRIGGER pages_ad AFTER DELETE ON pages BEGIN
  INSERT INTO pages_idx(pages_idx, rowid,title,link,html) VALUES('delete', old.id, old.title,old.link, old.html);
END;`

    db.exec(create_vt_query)
    db.exec(create_insert_trigger)
    db.exec(create_delete_trigger)
    db.exec(create_update_trigger)

    db.close()

}

let inject_data = async () => {
    //Prepopulate Database with Main Page and Markdown Demo Page
    let data = await fs.promises.readFile('services/fixture_data/Main_Page.md', 'utf-8');
    let main_page = await db.page.create({
        title: "Main Page",
        link: "Main_Page",
        html: data
    });

    data = await fs.promises.readFile('services/fixture_data/See_The_Demo.md', 'utf-8');

    let demo_page = await db.page.create({
        title: "MarkDown Demo",
        link: "See_The_Demo",
        html: data
    })
}


module.exports.inject_data = inject_data
module.exports.setup_fts = setup_fts
module.exports.cleanup_fts = cleanup_fts;
