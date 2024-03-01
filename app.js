if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth2");
const session = require("express-session");
const mongoose = require("mongoose");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoStore = require('connect-mongo');
const indexRouter = require("./routes/index");
const accountsRouter = require("./routes/accounts");
const editorRouter = require("./routes/editor");
const User = require("./models/user");
const app = express();

const port = process.env.PORT || 3000;

const dbUrl = process.env.DB_URL;
main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(dbUrl);
}

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser(process.env.SECRET_KEY));
app.use(
    express.json({
        type: ["application/json", "text/plain"],
    })
);
app.use(
    session({
        name: "ibme",
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            // secure: true,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
        store: MongoStore.create({ mongoUrl: dbUrl, secret: process.env.SECRET_KEY, touchAfter: 24 * 3600 })
    })
);
app.use(flash());
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = ["https://cdnjs.cloudflare.com/"];
const styleSrcUrls = ["https://fonts.googleapis.com"];
const fontSrcUrls = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: ["'self'", "blob:", "data:"],
        fontSrc: ["'self'", ...fontSrcUrls],
    }
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
        },
        User.authenticate()
    )
);
passport.use(
    "google",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
      "https://in-browser-markdown-editor-main.onrender.com/accounts/oauth2/redirect/google",
      
            passReqToCallback: true,
        },
        async (request, accessToken, refreshToken, profile, cb) => {
            try {
                const user = await User.findOne({
                    "google.id": profile.id,
                });
                if (user) {
                    return cb(null, user);
                }

                // Creating new user...
                const storedUser = await User.findOne({
                    email: profile.emails[0].value,
                });

                if (storedUser) {
                    const filter = { email: profile.emails[0].value };
                    const updateDoc = {
                        $set: {
                            "google.id": profile.id,
                            "google.name": profile.displayName,
                        },
                    };
                    await User.updateOne(filter, updateDoc);
                    return cb(null, storedUser);
                }

                const newUser = new User({
                    google: {
                        id: profile.id,
                        name: profile.displayName,
                    },
                    email: profile.emails[0].value,
                });
                await newUser.save();
                return cb(null, newUser);
            } catch (err) {
                return cb(err, false);
            }
        }
    )
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash setup is pending on ui
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.danger = req.flash("danger");
    next();
});

// routes
app.use("/", indexRouter);
app.use("/accounts", accountsRouter);
app.use("/documents", editorRouter);

app.all("*", (req, res) => {
    res.status(404).send("404 Not found!");
});

// errorHandler
app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!" } = err;
    res.status(status).send(message);
});

app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});
