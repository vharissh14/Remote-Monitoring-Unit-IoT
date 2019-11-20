const mongoose = require('mongoose');

const IotSchema = mongoose.Schema({
    rmuno: {
        type: String,
        required: true
    },
    modemno: {
        type: String
    },
    modemip: {
        type: String
    },
    tele: {
        type: String
    },
    readdate: {
        type: String
    },
    rtcdate: {
        type: String
    },
    mvol: {
        type: String
    },
    mcur: {
        type: String
    },
    mpow: {
        type: String
    },
    mfreq: {
        type: String
    },
    mrpm: {
        type: String
    },
    up: {
        type: String
    },
    off: {
        type: String
    },
    status: {
        type: String
    },
    lat: {
        type: String
    },
    lng: {
        type: String
    },
    pvol: {
        type: String
    },
    pcurr: {
        type: String
    },
    ppow: {
        type: String
    },
    imei: {
        type: String
    },
    fault: {
        type: String
    },
    timestamp: {
        type: Date
    }
});


const Iotdata = module.exports = mongoose.model('Iotdata', IotSchema);

// to Register the user
module.exports.insertData = function (data, callback) {
    Iotdata.create(data, callback);
}
