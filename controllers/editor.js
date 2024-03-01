const mongoose = require("mongoose");
const Document = require("../models/document");

module.exports.renderEditor = async (req, res) => {
    let data = { 
        _id: "readmeId", 
        name: "README", 
        markdown: ["# Welcome to In-browser markdown editor", "", "The easy to use, markdown editor available online."], 
        user: "admin" 
    };
    
    const readmeDocument = await Document.findById(process.env.README_DOCUMENT_ID);

    if(readmeDocument) {
        data = readmeDocument;
    }
    
    if (req.query.response_type === "json") {
        return res.json(data);
    } else {
        res.render("editor", {
            title: "Editor | In-browser markdown editor",
            data,
            email: req.user.email,
        });
    }
};

module.exports.createNewDocument = async (req, res) => {
    const { name, markdown } = req.body;
    const createdDocument = new Document({
        name,
        markdown,
        user: req.user,
    });
    await createdDocument.save();
    return res.json(createdDocument);
};

module.exports.getDocument = async (req, res) => {
    const id = req.params.id;
    const fetchedDocument = await Document.findById(id);

    if (req.query.response_type === "json") {
        return res.json(fetchedDocument);
    } else {
        res.render("editor", {
            title: "Editor | In-browser markdown editor",
            data: fetchedDocument,
            email: req.user.email,
        });
    }
};

module.exports.getAllDocument = async (req, res) => {
    const fetchedDocument = await Document.find({ user: req.user });
    if (req.query.response_type === "json") {
        return res.json(fetchedDocument);
    } else {
        res.redirect("/documents/readme");
    }
};

module.exports.deleteDocument = async (req, res) => {
    const id = req.params.id;
    const response = await Document.deleteOne({
        _id: new mongoose.Types.ObjectId(id.toString()),
    });
    return res.json(response);
};

module.exports.updateDocument = async (req, res) => {
    const id = req.params.id;
    const { name, markdown } = req.body;
    const fetchedDocument = await Document.findById(id);
    if (fetchedDocument) {
        const filter = { _id: new mongoose.Types.ObjectId(id.toString()) };
        const updateDoc = {
            $set: {
                name,
                markdown: markdown,
            },
        };
        await Document.updateOne(filter, updateDoc);
    }
    return res.json(fetchedDocument);
};
