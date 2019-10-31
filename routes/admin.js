const express = require('express');
const router = express.Router();
const passport = require('passport') , LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const config = require('../config/database');

router.get('/login', (req, res) => {
    res.render('AdminLogin', {loginType: "Admin", layoutPartial: "admin"});
});

router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('Admin/AdminDashboard', {page: "dashboard", username: req.user.username})
});

router.get('/addUser', isAuthenticated, (req, res) => {
  res.render('Admin/AdminAddUser', {page: "addUser", username: req.user.username})
});

router.get('/logout', isAuthenticated, (req, res) => {
    req.logout();
    res.redirect('/admin/login');
});

router.get('/listUser', isAuthenticated, (req, res) => {
    User.getAllUser((err, data) => {
        return res.json(data);
    });
});

router.get('/manageUser', isAuthenticated, (req, res) => {
    User.getAllUser((err, data) => {
        res.render('Admin/AdminManageUser', {page: "manageUser", username: req.user.username, data: data})
    });
});

router.get('*', isAuthenticated, (req, res) => {
    res.redirect('/admin/dashboard');
});

// router.get('/home', isAuthenticated, (req, res) => {
//     res.render('Admin/AdminHome', {page: "home", username: req.user.username});
// });

router.post('/userRegister', (req, res) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        password: req.body.password
    });
    User.addUser(newUser, (err, user) => {
        if (err) {
            let message = "";
            if (err.errors.username) message = "Username is already taken. ";
            if (err.errors.email) message += "Email already exists.";
            return res.json({
                success: false,
                message: "User registration Failed."
            });
        } else {
            res.render('Admin/AdminAddUser', {page: "addUser", username: req.user.username, message: "User Added"})
        }
    });
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
    res.redirect('/admin/dashboard');
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
