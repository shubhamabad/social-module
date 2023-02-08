const User = require("../models/user.model.js");
const RequestModel = require("../models/request.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { Sequelize } = require("sequelize");
const Op = Sequelize.Op;
const jwtKey = "my_secret_key"

// Create and Save a new user
exports.registration = async(req, res) => {
    try {
        const { UserName, FirstName, LastName, Email, Password } = req.body;
        const schema = Joi.object().keys({
            UserName: Joi.string().min(3).max(30).required(),
            FirstName: Joi.string().min(3).max(30).required(),
            LastName: Joi.string().min(3).max(30).required(),
            Email: Joi.string().email().required(),
            Password: Joi.string().min(3).max(30).required(),
        });
        const dataToValidate = {
            UserName: UserName,
            FirstName: FirstName,
            LastName: LastName,
            Email: Email,
            Password: Password,
        }
        const result = schema.validate(dataToValidate);
        if (result.error) {
            console.log("result.error", result.error.details)
            res.status(400).send({
                status: "failure",
                reason: result.error.details[0].message,
            });
        } else {
            const checkUser = await User.findOne({ where: { UserName: req.body.UserName } });
            if (checkUser) {
                res.status(409).send({
                    status: "This user name already taken.!!"
                });
            } else {
                const hash = await bcrypt.hash(Password, 10);
                dataToValidate.Password = hash
                const saveUser = await User.create(dataToValidate);
                if (saveUser) {
                    res.status(201).send({
                        data: saveUser,
                        status: "Success"
                    });
                } else {
                    res.status(400).send({
                        status: "failure"
                    });
                }
            }
        }

    } catch (err) {
        console.log(err);
        res.status(500).send({
            reason: "Something went wrong.!!"
        });
    }
};

//login user
exports.login = async(req, res) => {
    try {
        if (!req.body.UserName || !req.body.Password) {
            res.status(400).send({
                reason: "User name or Password field must required!"
            });
        } else {
            const checkUser = await User.findOne({ where: { UserName: req.body.UserName } });
            if (!checkUser || checkUser == "") {
                res.status(404).send({
                    reason: "User name not exist.!!"
                });
            } else {
                const checkPass = await bcrypt.compare(req.body.Password, checkUser.Password);
                if (!checkPass == true) {
                    res.status(400).send({
                        reason: "Invalid password"
                    });
                } else {
                    const payload = {
                        id: checkUser.id,
                        UserName: checkUser.UserName,
                        FirstName: checkUser.FirstName,
                        LastName: checkUser.LastName,
                        Email: checkUser.Email,
                    }
                    const token = jwt.sign(payload, jwtKey, {
                        algorithm: "HS256",
                        expiresIn: "12h",
                    })
                    payload.token = token
                    res.status(200).send({
                        data: payload,
                        reason: "Login Successfully."
                    });
                }
            }
        }

    } catch (err) {
        console.log(err);
        res.status(500).send({
            reason: "Someting went wrong."
        });
    }
};

//send request
exports.sendRequest = async(req, res) => {
    try {
        const data = req.params;
        //check request is already send or not
        const checkRequest = await RequestModel.findOne({
            where: {
                [Op.and]: [{
                        UserName: data.userB
                    },
                    {
                        Status: 0
                    },
                    {
                        RequestedUserName: data.userA
                    }
                ],
            }
        });
        if (checkRequest) {
            res.status(400).send({
                reason: "You have already send friend request to this user."
            });
        } else {
            //check request is already send by userB to userA
            const checkUser = await RequestModel.findOne({
                where: {
                    [Op.and]: [{
                            UserName: data.userA
                        },
                        {
                            Status: 0
                        },
                        {
                            RequestedUserName: data.userB
                        }
                    ],
                }
            });
            if (checkUser) {
                const addFried = await RequestModel.update({ Status: 1 }, {
                    where: { id: checkUser.id },
                });
                if (addFried) {
                    res.status(202).send({
                        status: "success"
                    });
                } else {
                    res.status(400).send({
                        status: "failure",
                        reason: "Bad request"
                    });
                }
            } else {
                //add new request of user
                const reqData = {
                    UserName: data.userB,
                    RequestedUserName: data.userA
                }
                const requestFriend = await RequestModel.create(reqData);
                if (requestFriend) {
                    res.status(202).send({
                        status: "success"
                    });
                } else {
                    res.status(400).send({
                        status: "failure",
                        reason: "Bad request"
                    });
                }
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            reason: "Something went wrong.!!"
        });
    }
};

//list of pending friend request
exports.friendRequests = async(req, res) => {
    try {
        const requestList = await RequestModel.findAll({
            where: {
                Status: 0,
                UserName: req.params.userA
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        });
        if (!requestList && requestList == "") {
            res.status(404).send({
                status: "failure",
                reason: "You dose not have any panding request."
            });
        } else {
            res.status(200).send({
                status: "Success",
                friends: requestList
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            reason: "Someting went wrong."
        });
    }
}

//list of friends
exports.friends = async(req, res) => {
    try {
        const friendsList = await RequestModel.findAll({
            where: {
                Status: 1,
                [Op.or]: [{
                        UserName: req.params.userA
                    },
                    {
                        RequestedUserName: req.params.userA
                    },
                ],
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        });
        if (!friendsList && friendsList == "") {
            res.status(404).send({
                status: "failure",
                reason: "You dose not have any friends."
            });
        } else {
            res.status(200).send({
                status: "Success",
                friends: friendsList
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            reason: "Someting went wrong."
        });
    }
};

exports.suggestFriend = async(req, res) => {
    try {
        const friendsList = await RequestModel.findAll({
            where: {
                [Op.or]: [{
                        UserName: req.params.userA
                    },
                    {
                        RequestedUserName: req.params.userA
                    },
                ],
            },
        });
        const userList = await User.findAll({
            where: {
                [Op.not]: [
                    { UserName: req.params.userA },
                ]
            }
        })
        const ResultArray = await userList.filter(({ UserName: UserName }) => !friendsList.some(({ UserName: UserName, RequestedUserName: RequestedUserName }) => UserName == UserName || RequestedUserName == RequestedUserName));
        res.status(200).send({
            status: "Success",
            friends: ResultArray
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            reason: "Someting went wrong."
        });
    }
}