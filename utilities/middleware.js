const Campground = require('../models/campground');
const Review = require('../models/reviews')
const { campgroundSchema } = require('../joiSchemas');
const { reviewSchema } = require('../joiSchemas');
const ExpressError = require('../utilities/ExpressError');

//CAMPGROUND JOI VALIDATION FUNCTION
module.exports.validateCampground = (request, response, next) => {
    const { error } = campgroundSchema.validate(request.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

//REVIEWS JOI VALIDATION FUNCTION
module.exports.validateReview = (request, response, next) => {
    const { error } = reviewSchema.validate(request.body);
    if(error){
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(400, msg);
    } else {
        next();
    };
};

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You have to be logged in first!');
        return res.redirect('/login');
    };
    next();
};

module.exports.checkReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    };
    next();
};

module.exports.isAuthor = async (request, response, next) => {
    const id = request.params.id;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(request.user._id)){
        request.flash('error', 'You are not authorized to do that!');
        return response.redirect(`/campgrounds/${id}`);
    };
    next();
};

module.exports.isReviewAuthor = async (request, response, next) => {
    const {id, reviewId} = request.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(request.user._id)){
        request.flash('error', 'You are not authorized to do that!');
        return response.redirect(`/campgrounds/${id}`);
    };
    next();
};