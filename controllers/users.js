const User = require('../models/user');
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');

module.exports.renderSignup = (req, res) => {
    res.render('users/signup');
};

module.exports.signup = catchAsync(async (req, res, next) => {
    try {
        const { username, password, email, rePassword } = req.body;
        if (rePassword === password) {
            const newUser = await User.register({ username, email }, password);
            req.login(newUser, err => {
                if(err) return next();
                req.flash('info', `Welcome to YelpCamp, ${username}`);
                res.redirect('/campgrounds');
            });
        } else {
            req.flash('error', 'Passwords do not match');
            res.redirect('/signup');
        }
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
});

module.exports.renderLogin = (req, res) => {
    if(req.query.returnTo){
        req.flash('error', 'You have to be logged in first!');
        res.locals.info = req.flash('info');
        req.session.returnTo = req.query.returnTo;
    };
    res.render('users/login');
};

module.exports.login = (req, res) => {
    const url = res.locals.returnTo || '/campgrounds';
    req.flash('info', `Welcome Back, ${req.body.username}`); 
    res.redirect(url);
};

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
    });
    res.redirect('/');
};