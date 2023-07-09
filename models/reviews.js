const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    rating: Number,
    body: String,
    author: { type: Schema.Types.ObjectId, ref: 'user' }
});

const Review = mongoose.model('review', reviewSchema);

module.exports = Review;