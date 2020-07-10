module.exports = (Sequelize,sequelize)=>{
    const page = sequelize.define("page",{
        title:{
            type:Sequelize.STRING(100),
            unique:true
        },
        link:{
            type:Sequelize.STRING(10),
            unique:true

        },
        html:{
            type:Sequelize.TEXT
        }
    })
    return page
}
