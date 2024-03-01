module.exports.renderLandingPage = (req, res) => {
    res.render("index", { title: "In-browser markdown editor" });
};
