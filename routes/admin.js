const express = require('express');
const router = express.Router();
const passport = require('passport') , LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/database');

router.get('/login', (req, res) => {
    res.render('AdminLogin');
});

router.post('/register', (req, res) => {
    let newAdmin = new Admin({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        contact: req.body.contact,
        password: req.body.password,
        job_profile: req.body.job_profile
    });
    Admin.addAdmin(newAdmin, (err, user) => {
        if (err) {
            let message = "";
            if (err.errors.username) message = "Username is already taken. ";
            if (err.errors.email) message += "Email already exists.";
            return res.json({
                success: false,
                message
            });
        } else {
            return res.json({
                success: true,
                message: "Admin registration is successful."
            });
        }
    });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log("in here");
    Admin.getAdminByUsername(username, (err, admin) => {
        if (err) throw err;
        if (!admin) {
            return done(null, false, {message: "Admin Account Does Not Exit."})
        }

        Admin.comparePassword(password, admin.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                console.log("heree");
                return done(null, admin);
            } else {
                return done(null, false, {message: "Invalid Password."});
            }
        });
    });
  }
));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	Admin.getAdminById(id, function (err, user) {
		done(err, user);
	});
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.redirect('/admin/profile');
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/admin/login');
});

/**
 * Get Authenticated user profile
 */

router.get('/profile', isAuthenticated, (req, res) => {
    // console.log(req.user);
    res.render('Admin/AdminHome');
});

function isAuthenticated(req, res, next) {
  // do any checks you want to in here
  console.log(req.isAuthenticated());
  // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
  // you can do this however you want with whatever variables you set up
  if (req.isAuthenticated())
      return next();

  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
  res.redirect('/');
}


module.exports = router;
