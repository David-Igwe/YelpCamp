const mongoose = require('mongoose');
const Review = require('./reviews');
const User = require('./user')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_300');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema({
    name: String,
    price: Number,
    images: [ImageSchema],
    geometry: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number]
        }
      },
    description: String,
    location: String,
    author: { type: Schema.Types.ObjectId, ref: 'user'}, 
    reviews: [{ type: Schema.Types.ObjectId, ref: 'review' }]
}, opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `<a href='/campgrounds/${this._id}'>${this.name}</a>
          <p>${this.description.substring(0, 100)}...</p>`;
});

//The argument "doc" gives you access to the deleted document
//NB: if you use any method other than findByIdAndDelete this middleware won't be triggered

campgroundSchema.post('findOneAndDelete', async (doc) => {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    };
});

const Campground = mongoose.model('Campground', campgroundSchema);

module.exports = Campground;