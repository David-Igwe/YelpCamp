const express = require('express');
const passport = require('passport');
const router = express.Router();
const { checkReturnTo, isLoggedIn } = require('../utilities/middleware');
const users = require('../controllers/users')


router.route('/signup')
    .get(users.renderSignup)
    .post(users.signup)

router.route('/login')
    .get(users.renderLogin)
    .post(checkReturnTo,
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        users.login)

router.get('/logout', users.logout);

module.exports = router;