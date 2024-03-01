const mongoose = require("mongoose");
const { Schema } = mongoose;

const DocumentSchema = new Schema({
    name: {
        type: String,
    },
    markdown: [{ type: String }],
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

module.exports = mongoose.model("Document", DocumentSchema);
