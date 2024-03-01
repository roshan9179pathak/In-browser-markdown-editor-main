const express = require("express");
const { isLoggedIn, isOwner, isIdValid } = require("../middlewares");
const editorController = require("../controllers/editor");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const router = express.Router();

router.get("/", isLoggedIn, editorController.getAllDocument);

router.get("/readme", isLoggedIn, editorController.renderEditor);

router
    .route("/:id")
    .get(isLoggedIn, isIdValid, isOwner, catchAsyncErrors(editorController.getDocument))
    .put(isLoggedIn, isIdValid, isOwner, catchAsyncErrors(editorController.updateDocument))
    .delete(
        isLoggedIn,
        isIdValid,
        isOwner,
        catchAsyncErrors(editorController.deleteDocument)
    );

router.post(
    "/new",
    isLoggedIn,
    catchAsyncErrors(editorController.createNewDocument)
);

module.exports = router;
