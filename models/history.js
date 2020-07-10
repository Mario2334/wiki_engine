module.exports = (Sequelize,sequelize)=>{
    let history =  sequelize.define("history",{
        describe:{
            type:Sequelize.TEXT
        },
        createdAt: {
            type:Sequelize.DATE
        },
        prevHtml:{
            type:Sequelize.TEXT
        }
    })
    return history
}
