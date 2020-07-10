const Sequelize = require("sequelize")
const db_config = require("../config")

const sequelize = new Sequelize({
    storage:db_config.storage,
    dialect:db_config.dialect,
    pool:db_config.pool
});

const db ={}

db.Sequelize = Sequelize;
db.sequelize=sequelize;
db.page = require('./page')(Sequelize,sequelize)
db.history = require('./history')(Sequelize,sequelize)
db.history.belongsTo(db.page);

module.exports= db;
