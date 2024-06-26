//CONNECTING TO MONGOOSE
const mongoose = require('mongoose');
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl)
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database connected');
});

//REQUIRING MODULES
const Campground = require('../models/campground');
const Cities = require('./cities');
const images = require('./images');
const Name = require('./seedHelpers');
const { descriptors, places } = Name;

//RANDOM ARRAY ITEM FUNCTION
const randArr = (array) => Math.floor(Math.random() * array.length);



//NEW DOCUMENTS
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1001);
        const price = Math.floor(Math.random() * 101);
        const camp = new Campground({
            name: `${descriptors[randArr(descriptors)]} ${places[randArr(places)]}`,
            location: `${Cities[random1000].city}, ${Cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    Cities[random1000].longitude,
                    Cities[random1000].latitude
                ]
            },
            images: [
                images[randArr(images)], images[randArr(images)]
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit et obcaecati praesentium illo, accusantium temporibus iusto aperiam aliquam? Autem id tempora dignissimos optio omnis quos atque odio corrupti eos aliquid.',
            price: price,
            author: '64a9908c2e36822a7f2ef0b8'
        });
        await camp.save();
    }
    mongoose.connection.close();
};

seedDB();