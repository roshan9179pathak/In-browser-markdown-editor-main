const express = require("express");
const passport = require("passport");
const accountsController = require("../controllers/accounts");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const { isLoggedIn, validateUser, redirectToEditorIfAuthenticated } = require("../middlewares");

const router = express.Router();

router
    .route("/login")
    .get(redirectToEditorIfAuthenticated, accountsController.renderLogIn)
    .post(
        validateUser,
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/accounts/login",
            keepSessionInfo: true,
        }),
        accountsController.logIn
    );

router
    .route("/register")
    .get(redirectToEditorIfAuthenticated, accountsController.renderRegister)
    .post(validateUser, catchAsyncErrors(accountsController.register));

router.get(
    "/login-with-google",
    passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
    "/oauth2/redirect/google",
    passport.authenticate("google", {
        failureFlash: true,
        failureRedirect: "/accounts/login",
        keepSessionInfo: true,
    }),
    accountsController.logInWithGoogle
);

router.get("/logout", isLoggedIn, accountsController.logout);

router.get("/delete", isLoggedIn, catchAsyncErrors(accountsController.deleteAccount));

module.exports = router;
