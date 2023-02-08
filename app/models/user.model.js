const connection = require("../config/db.js");
const { DataTypes } = require('sequelize');

const User = connection.define('user', {
    UserName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    FirstName: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    LastName: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
        unique: {
            msg: 'Email is already registerd.'
        }
    },
    Password: {
        type: DataTypes.STRING,
        defaultValue: null
    },
})

module.exports = User