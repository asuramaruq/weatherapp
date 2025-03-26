const mongoose = require('mongoose');


let weatherSchema = new mongoose.Schema({
    userId: {type: String, require: true},
    city: {type: String, require: true},
    lat: String,
    lon: String,
    temperature: Number,
    description: String,
}, {timestamps: true}
);

const Weather = mongoose.model("Weathers", weatherSchema, 'weatherdata');

module.exports = Weather;