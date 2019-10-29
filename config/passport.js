var LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');
const Admin = require('../models/Admin');
const config = require('../config/database');

// To authtenticate the User by JWT Startegy
module.exports = (userType, passport) => {
    passport.use(new LocalStrategy({ passReqToCallback: true },
      function(req, username, password, done) {
        if(userType == 'admin') {
          Admin.getAdminById(jwt_payload.data._id, (err, user) => {
              if (err) return done(err, false);
              if (user) return done(null, user);
              return done(null, false);
          });
        }
        if(userType == 'users') {
          User.getUserById(jwt_payload.data._id, (err, user) => {
              if (err) return done(err, false);
              if (user) return done(null, user);
              return done(null, false);
          });
        }
      }
    ));


}
