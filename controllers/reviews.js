const Review = require('../models/reviews');
const Campground = require('../models/campground');
const catchAsync = require('../utilities/catchAsync');

module.exports.createReview = catchAsync(async (request, response) => {
    const campground = await Campground.findById(request.params.id);
    const review = new Review(request.body.review);
    review.author = request.user._id;
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    request.flash('success', 'Successfully uploaded a new review');
    response.redirect(`/campgrounds/${campground._id}`);
});

module.exports.destroyReview = catchAsync(async(request, response) => {
    const { id, reviewId } = request.params;
    const campground = await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    request.flash('success', 'Successfully deleted the review');
    response.redirect(`/campgrounds/${id}`);
});