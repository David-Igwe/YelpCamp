const Campground = require('../models/campground');
const catchAsync = require('../utilities/catchAsync');
const mbxGeocode = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocode({ accessToken: mbxToken});
const cloudinary = require('cloudinary');

module.exports.renderIndex = catchAsync(async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render('campgrounds/index', { campgrounds });
});

module.exports.renderNewForm = (request, response) => {
    response.render('campgrounds/new');
};

module.exports.createCampground = catchAsync(async (request, response) => {
    const geoData = await geocoder.forwardGeocode({
        query: request.body.campground.location,
        limit: 1
    }).send()
    const newCampground = new Campground(request.body.campground);
    newCampground.images = request.files.map(f => ({ url: f.path, filename: f.filename }));
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.author = request.user._id;
    await newCampground.save();
    request.flash('success', 'Successfully Created A New Campground');
    response.redirect(`/campgrounds/${newCampground._id}`);
});

module.exports.showCampground = catchAsync(async (request, response) => {
    const id = request.params.id;
    const campground = await Campground.findById(id).populate({
        path: "reviews", 
        populate: { path: "author"}})
            .populate("author");
            
    if(!campground){
        request.flash('error', 'Cannot find this campground');
        return response.redirect('/campgrounds');
    };
    response.render('campgrounds/show', { campground });
});

module.exports.renderEditForm = catchAsync(async (request, response) => {
    const id = request.params.id;
    campground = await Campground.findById(id);
    if(!campground){
        request.flash('error', 'Cannot find this campground');
        return response.redirect('/campgrounds');
    };
    response.render('campgrounds/edit', { campground });
});

module.exports.updateCampground = catchAsync(async (request, response) => {
    const id = request.params.id;
    const update = request.body.campground;
    const campground = await Campground.findByIdAndUpdate(id, update);
    const imgs = request.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if(request.body.deleteImages){
        for(let filename of request.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: {$in: request.body.deleteImages}}}});
    }
    request.flash('success', 'Campground Updated');
    response.redirect(`/campgrounds/${id}`);
});

module.exports.destroyCampground = catchAsync(async (request, response) => {
    const id = request.params.id;
    await Campground.findByIdAndDelete(id);
    request.flash('success', 'Campground Deleted');
    response.redirect('/campgrounds');
});