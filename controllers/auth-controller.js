const User = require("../models/user.js");
const jwt = require("jsonwebtoken");

// GET requests
// renders sign up page
module.exports.getSignUp = function(req, res) { res.render("sign-up") };
module.exports.getLogin = function(req, res) { res.render("login") };

// POST requests
// submits content on sign up page
module.exports.postSignUp = async function(req, res) {
    let { email, password } = req.body;

    try {
        const user = await User.create({ email, password });

        console.log(`successfully created user ${ email }`);
        res.status(201).json({ user: user._id });
    } catch(err) {
        let errorMessages = signUpErrors(err);
        console.log(errorMessages);
        res.json({ errorMessages });
    }
}

// submits content on login page
module.exports.postLogin = async function(req, res) {
    let { email, password } = req.body;

    email = email.toLowerCase();

    try {
        const user = await User.login(email, password);
        let token = createToken(user._id);
        res.cookie("login", token, { httpOnly: true, maxAge: maxAge * 1000 });
        console.log(`logged in user ${ email }`);
        res.json({ user: user._id });
    } catch(err) {
        console.log(err)
        let errorMessages = loginErrors(err);
        console.log(errorMessages);
        res.json({ errorMessages });
    }
}


// jwt and cookie configuration
const maxAge = 600;

function createToken(payload) {
    return jwt.sign({ payload }, process.env.SECRET_KEY, { expiresIn: maxAge });
}


// hanlds errors for postSignUp
function signUpErrors(err) {
    let errorMessages = { email: "", password: "" };

    // duplicate email error
    if(err.code === 11000) {
        errorMessages.email = "This email is already registered";
        return errorMessages;
    }

    // validation errors
    if(err.message.includes("User validation failed")) {
        Object.values(err.errors).forEach(function({ properties }) {
            errorMessages[properties.path] = properties.message;
        });
        return errorMessages;
    }
}

// handles errors for loginPost
function loginErrors(err) {
    let errorMessages = { email: "", password: "" };

    // incorrect email error
    if(err.message === "Incorrect email") {
        errorMessages.email = "Incorrect, Please enter valid email";
        return errorMessages;
    }

    // incorrect password error
    if(err.message === "Incorrect password") {
        errorMessages.password = "Incorrect, Please enter valid password";
        return errorMessages;
    }
}
