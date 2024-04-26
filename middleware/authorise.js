const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

function authorise(req, res, next) {
    const loginCookie = req.cookies.login;

    if(loginCookie) {
        jwt.verify(loginCookie, process.env.SECRET_KEY, async function(err, decodedToken) {
            if(err) {
                console.log(err.message);
                res.redirect("/api/login");
            } else {
                let user = await User.findById(decodedToken.payload);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.redirect("/api/login");
    }
}

module.exports = { authorise };