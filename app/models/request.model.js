const connection = require("../config/db.js");
const { DataTypes } = require('sequelize');

const Request = connection.define('Request', {
    UserName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    RequestedUserName: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    Status: {
        type: DataTypes.BOOLEAN,
        defaultValue: "0",
        comment: "0=false, 1=true",
    }
})

module.exports = Request