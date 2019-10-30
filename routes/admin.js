const express = require('express');
const router = express.Router();
const passport = require('passport') , LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/database');

router.get('/login', (req, res) => {
    res.render('AdminLogin');
});

router.get('/logout', isAuthenticated, (req, res) => {
    req.logout();
    res.redirect('/admin/login');
});

router.get('/home', isAuthenticated, (req, res) => {
    res.render('Admin/AdminHome', {username: req.user.username});
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

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.redirect('/admin/home');
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    Admin.getAdminByUsername(username, (err, admin) => {
        if (err) throw err;
        if (!admin) {
            return done(null, false, {message: "Admin Account Does Not Exit."})
        }

        Admin.comparePassword(password, admin.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
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

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.job_profile=="admin")
      return next();

  res.redirect('/');
}


module.exports = router;
