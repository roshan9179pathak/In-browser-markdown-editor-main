const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    google: {
        id: {
            type: String,
        },
        name: {
            type: String,
        },
    },
    email: {
        type: String,
    },
});

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", UserSchema);
