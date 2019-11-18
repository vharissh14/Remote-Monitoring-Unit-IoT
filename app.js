const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var net = require('net');
// Bring in the database object
const config = require('./config/database');

var ioclient = require('socket.io-client');
var socketclient = ioclient.connect('http://localhost:5000');

// setTimeout(()=>{
//     console.log('ext');
//     socketclient.emit('myevent', {sasd:'sad'});
// },10000)

// // Mongodb Config
// mongoose.set('useCreateIndex', true);
//
// // Connect with the database
// mongoose.connect(config.database, {
//     useNewUrlParser: true
// })
// .then(() => {
//     console.log('Databse connected successfully ' + config.database);
// }).catch(err => {
//     console.log(err);
// });

// Initialize the app
const app = express();
// Defining the PORT
const PORT = process.env.PORT || 5000;

// Defining the Middlewares
app.use(cors());

// Set the static folder
app.use(express.static(path.join(__dirname, 'public')));

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(session({
//     secret: 'keyboard cat',
//     store: new MongoStore({
//         url: 'mongodb://localhost/test-app',
//         touchAfter: 24 * 3600 // time period in seconds
//     }),
//     saveUninitialized: true,
//     resave: true,
//     cookie: {  httpOnly: true,  secure: false  }
// }));


// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', exphbs({
    partialsDir: __dirname + "/views/Partials/"
}));
app.set("view engine", "handlebars");

app.get('/', (req, res) => {
    // res.redirect('/user/login');
    res.render('UserLogin', {loginType: "User"});
});

// Bring in the user routes
const users = require('./routes/users');
app.use('/user', users);

const admin = require('./routes/admin');
app.use('/admin', admin);

var server = net.createServer(onClientConnected);

var server1 = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

var io = require('socket.io')(server1);

server.listen(9000, ()=>{
    console.log("TCP Server on Port 9000")
});

io.on('connection', function (socket) {
    socket.join('mydevice');
    socket.on('myevent', function(data) {
        io.to('mydevice').emit('news', data);
    });
    socket.on('pwron', function(data){
        console.log(data);
    });
    socket.on('pwroff', function(data){
        let rmuno = 'N/A';
        let modemno = 'N/A';
        let modemip = 'N/A';
        let tele = 'N/A';
        let readdate = 'N/A';
        let rtcdate = 'N/A';
        let mvol = 0;
        let mcur = 0;
        let mpow = 0;
        let mfreq = 0;
        let mrpm = 0;
        let up = 'N/A';
        let off = 'N/A';
        let status = 'N/A';
        let lat = 'N/A';
        let lng = 'N/A';
        let pvol = 0;
        let pcurr = 0;
        let ppow = 0;
        let imei = 'N/A';
        io.to('mydevice').emit('news',
        {
            rmuno: rmuno, modemno: modemno, modemip: modemip, tele: tele,
            readdate: readdate, rtcdate: rtcdate, mvol: mvol, mcur: mcur, mpow: mpow,
            mfreq: mfreq, mrpm: mrpm, up: up, off: off, status: status, lat: lat, lng: lng,
            pvol: pvol, pcurr: pcurr, ppow: ppow, imei: imei
        });
    });
    socket.on('motrev', function(data){
        console.log(data);
    });
});

// setTimeout(()=>{
//     console.log('hello');
//     socketclient.on('connect', function(socket){
//         socket.emit('myevent', {a:1});
//     })
// }, 5000);

function onClientConnected(sock) {
    sock.setEncoding("utf8");
    sock.on('data', function(data) {
        let iotdata = data.split('#');
        let rmuno = iotdata[0];
        let modemno = iotdata[1];
        let modemip = iotdata[2];
        let tele = iotdata[3];
        let readdate = iotdata[4];
        let rtcdate = iotdata[5];
        let mvol = iotdata[6];
        let mcur = iotdata[7];
        let mpow = iotdata[8];
        let mfreq = iotdata[9];
        let mrpm = iotdata[10];
        let up = iotdata[15];
        let off = iotdata[16];
        let status = iotdata[17];
        let lat = iotdata[18];
        let lng = iotdata[19];
        let pvol = iotdata[20];
        let pcurr = iotdata[21];
        let ppow = iotdata[22];
        let imei = iotdata[23];
        socketclient.emit('myevent',
        { rmuno: rmuno, modemno: modemno, modemip: modemip, tele: tele,
            readdate: readdate, rtcdate: rtcdate, mvol: mvol, mcur: mcur, mpow: mpow,
            mfreq: mfreq, mrpm: mrpm, up: up, off: off, status: status, lat: lat, lng: lng,
            pvol: pvol, pcurr: pcurr, ppow: ppow, imei: imei
        });
    });

};
