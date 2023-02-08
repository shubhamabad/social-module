const { Sequelize } = require('sequelize');
require("dotenv").config({ path: './.env' });
const sequelize = new Sequelize(process.env.DBNAME, process.env.DB_USER, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false,
    define: {
        freezeTableName: true
    }
});
try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}
sequelize.sync({
    // force: true 
});

module.exports = sequelize;