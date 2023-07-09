const express = require('express');
const app = express();
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utilities/catchAsync');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../utilities/middleware');

const Review = require('../models/reviews');
const Campground = require('../models/campground');
const reviews = require('../controllers/reviews');


//ROUTES
router.post('/', isLoggedIn, validateReview, reviews.createReview);

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, reviews.destroyReview);


module.exports = router;