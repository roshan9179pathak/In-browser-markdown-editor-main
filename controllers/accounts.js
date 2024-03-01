const mongoose = require("mongoose");
const User = require("../models/user");
const Document = require("../models/document");

module.exports.renderLogIn = (req, res) => {
    res.render("login", { title: "Log in | In-browser markdown editor" });
};

module.exports.logIn = (req, res) => {
    const { redirectUrl } = req.session;
    res.redirect(redirectUrl || "/documents/readme");
};

module.exports.logInWithGoogle = (req, res) => {
    const { redirectUrl } = req.session;
    res.redirect(redirectUrl || "/documents/readme");
};

module.exports.renderRegister = (req, res) => {
    res.render("register", { title: "Register | In-browser markdown editor" });
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const newUser = new User({ email });
        const registeredUser = await User.register(newUser, password);
        req.logIn(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Successfully registered");
            res.redirect("/documents/readme");
        });
    } catch (err) {
        req.flash("danger", err.message);
        res.redirect("/accounts/register");
    }
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
};

module.exports.deleteAccount = async (req, res, next) => {
    const fetchedDocuments = await Document.find({ user: req.user });

    fetchedDocuments.forEach(async (doc) => {
        await Document.deleteOne({
            _id: new mongoose.Types.ObjectId(doc._id.toString()),
        });
    });

    await User.deleteOne({
        _id: new mongoose.Types.ObjectId(req.user._id.toString()),
    });

    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Hope to see you again");
        res.redirect("/");
    });
};