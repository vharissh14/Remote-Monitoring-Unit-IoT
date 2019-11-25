const express = require('express');
const router = express.Router();
const passport = require('passport') , LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Iotdata = require('../models/iotdata');
const config = require('../config/database');
var generator = require('generate-password');
const _ = require('lodash');

router.get('/login', (req, res) => {
    res.render('AdminLogin', {loginType: "Admin", layoutPartial: "admin"});
});

router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('Admin/AdminDashboard', {page: "dashboard", username: req.user.username})
});

// router.get('/addUser', isAuthenticated, (req, res) => {
//     res.render('Admin/AdminAddUser', {page: "addUser", username: req.user.username})
// });

router.get('/logout', isAuthenticated, (req, res) => {
    req.logout();
    res.redirect('/admin/login');
});

router.post('/downloadData', isAuthenticated, (req, res) => {
    // console.log("IN JHERE");
    Iotdata.downloadData(req.user.username, function(err, result){
        var arrayResult = [];
        if(result!=[]){
          for(var i=0; i<result.length; i++){
            let rmuno = result[i]['rmuno'];
            let modemno = result[i]['modemno'];
            let modemip = result[i]['modemip'];
            let tele = result[i]['tele'];
            let readdate = result[i]['readdate'];
            let rtcdate = result[i]['rtcdate'];
            let mvol = result[i]['mvol'];
            let mcur = result[i]['mcur'];
            let mpow = result[i]['mpow'];
            let mfreq = result[i]['mfreq'];
            let mrpm = result[i]['mrpm'];
            let tdis = result[i]['tdis'];
            let totdis = result[i]['totdis'];
            let tenergy = result[i]['tenergy'];
            let totenergy = result[i]['totenergy'];
            let up = result[i]['up'];
            let off = result[i]['off'];
            let status = result[i]['status'];
            let lat = result[i]['lat'];
            let lng = result[i]['lng'];
            let pvol = result[i]['pvol'];
            let pcurr = result[i]['pcurr'];
            let ppow = result[i]['ppow'];
            let imei = result[i]['imei'];
            let fault = result[i]['fault'];
            let findata = [   rmuno, modemno, modemip, tele,
              readdate, rtcdate, mvol, mcur, mpow,
              mfreq, mrpm, tdis, totdis, tenergy, totenergy,
              up, off, status, lat, lng,
              pvol, pcurr, ppow, imei, fault
            ];
            arrayResult.push(findata);
          }
        }
        res.json({data: arrayResult});
    })
});

// router.get('/listUser', isAuthenticated, (req, res) => {
//     User.getAllUser((err, data) => {
//         return res.json(data);
//     });
// });

// router.get('/manageUser', isAuthenticated, (req, res) => {
//     User.getAllUser((err, data) => {
//         res.render('Admin/AdminManageUser', {page: "manageUser", username: req.user.username, data: data})
//     });
// });

router.get('*', isAuthenticated, (req, res) => {
    res.redirect('/admin/dashboard');
});

// router.get('/home', isAuthenticated, (req, res) => {
//     res.render('Admin/AdminHome', {page: "home", username: req.user.username});
// });

router.post('/addUser', (req, res) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        password: generator.generate({
            length: 8,
            numbers: true
        }),
        address: req.body.address
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

router.post('/getUserDetails', (req, res) => {
    User.getUserById(req.body.id, function(err, user){
        if(err) {
            return res.json({status: 400, message: "Data not in DB."});
        }
        else{
            return res.json({
                user: user
            })
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

router.post('/login', passport.authenticate('local', { successRedirect:'/admin/dashboard',
                                                    failureRedirect: '/admin/login' }), (req, res) => {
    res.redirect('/admin/dashboard');
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        Admin.getAdminByUsername(username, (err, admin) => {
            if (err) {
                console.log(err);
            };
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
