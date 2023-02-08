module.exports = app => {
    const user = require("../controllers/user.controller");
    const router = require("express").Router();
    const { auth } = require('../middleware/auth');

    // routes
    router.post("/create", user.registration);
    router.post("/login", user.login);
    router.post("/add/:userA/:userB", auth, user.sendRequest);
    router.get("friendRequests/:userA", auth, user.friendRequests);
    router.get("/friends/:userA", auth, user.friends);
    router.get("/suggestions/:userA", auth, user.suggestFriend);
    app.use(router);
};