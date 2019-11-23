const mongoose = require('mongoose');

const IotSchema = mongoose.Schema({
  rmuno: {
    type: String,
    index: true
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

module.exports.getLastData = function(deviceId, callback) {
  // Iotdata.find({rmuno: deviceId}).sort({'_id':-1}).limit(1).toArray(callback);

  Iotdata.find({rmuno: deviceId}).sort({'_id':-1}).limit(1).exec(callback);
}

module.exports.downloadData = function(deviceId, callback) {
    Iotdata.find({rmuno: deviceId}).sort({'_id':-1}).exec(callback);
}
