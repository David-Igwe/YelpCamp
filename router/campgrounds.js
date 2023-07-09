const express = require('express');
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require('../utilities/middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


//ROUTES
router.route('/')
    .get(campgrounds.renderIndex)
    .post(isLoggedIn, upload.array('images'), validateCampground, campgrounds.createCampground);

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(campgrounds.showCampground)
    .put(isLoggedIn, isAuthor, upload.array('images'), validateCampground, campgrounds.updateCampground)
    .delete(isLoggedIn, isAuthor, campgrounds.destroyCampground)

router.get('/:id/edit', isLoggedIn, isAuthor, campgrounds.renderEditForm);

module.exports = router;