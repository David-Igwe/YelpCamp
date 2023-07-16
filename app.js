//ENVIRONMENT VARIABLES
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

///SETTING UP EXPRESS, MONGOOSE AND ROUTES 
const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/YelpCamp');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error'));
db.once('open', () => {
    console.log('Database connected');
});
const userRoutes = require('./router/user');
const campgroundRoutes = require('./router/campgrounds');
const reviewRoutes = require('./router/reviews');


//SETTING UP EJS AND EJS-MATE
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);

//SETTING UP METHOD-OVERRIDE
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

//FORM DATA MIDDLEWARE
app.use(express.urlencoded({ extended: true }));

//SERVING STATIC ASSETS
app.use(express.static(path.join(__dirname, 'assets')));

//EXPRESS-SESSION CONFIGURATION
const MongoStore = require('connect-mongo');
const session = require('express-session');
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { secret: 'thisShouldBeABetterSecret' },
    touchAfter: 24 * 60 * 60
});
store.on("error", function (e) {
    console.log("Session Store Error", e);
});
const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisShouldBeABetterSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

//CONFIGURING PASSPORT AUTHENTICATION
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//FLASH CONFIGURATION
const flash = require('connect-flash');
app.use(flash());
app.use((request, response, next) => {
    response.locals.success = request.flash('success');
    response.locals.info = request.flash('info');
    response.locals.error = request.flash('error');
    response.locals.currentUser = request.user;
    next();
});

//HELMET CONFIGURATION
const helmet = require('helmet');
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/"
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmgrue5xh/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
//SETTING UP EXPRESS-MONGO-SANITIZE
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize({
    replaceWith: '_'
}));

//ERROR OBJECT
const ExpressError = require('./utilities/ExpressError');


//ROUTES
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/review', reviewRoutes);

//HOME PAGE
app.get('/', (request, response) => {
    response.render('home');
})

//DEFAULT PAGE
app.all('*', (request, response, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

//ERROR HANDLING ROUTE
app.use((err, request, response, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong';
    response.status(status).render('errorTemplate', { err });
});

//STARTING THE SERVER
app.listen(3000, () => {
    console.log('Listening on Port 3000');
});