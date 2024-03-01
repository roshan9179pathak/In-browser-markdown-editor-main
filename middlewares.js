const ObjectId = require("mongoose").Types.ObjectId;
const { userSchema } = require("./schemas");
const AppError = require("./utils/AppError");
const Document = require("./models/document");


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("danger", "Login required");
        return res.redirect("/accounts/login");
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const id = req.params.id;
    const response = await Document.findById(id);
    if (response) {
        if (response.user._id.toString() !== req.user._id.toString()) {
            return next(new AppError(401, "Not authorized!"));
        }
    } else {
        // handling async error in express
        return next(new AppError(404, "404 Not found!"));
    }
    next();
};

module.exports.validateUser = (req, res, next) => {
    const { email, password } = req.body;
    const { error } = userSchema.validate({ email, password });
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new AppError(400, msg);
    } else {
        next();
    }
};

module.exports.redirectToEditorIfAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return res.redirect("/documents/readme");
    }
    next();
};

module.exports.isIdValid = (req, res, next) => {
    const id = req.params.id;
    if(ObjectId.isValid(id)) {
        if((String)(new ObjectId(id)) === id) {
            return next();
        }
    }
    throw new AppError(404, "404 Not found!");
};