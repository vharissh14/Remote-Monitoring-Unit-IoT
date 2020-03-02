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
const config = require('./config/database');
const Iotdata = require('./models/iotdata');

var ioclient = require('socket.io-client');

// // Mongodb Config
mongoose.set('useCreateIndex', true);
//
// // Connect with the database
mongoose.connect(config.database, {
  useNewUrlParser: true
})
.then(() => {
  console.log('Databse connected successfully ' + config.database);
}).catch(err => {
  console.log(err);
});

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

app.use(session({
  secret: 'keyboard cat',
  store: new MongoStore({
    url: 'mongodb://172.31.29.170/test-app',
    // url: 'mongodb://localhost/test-app',
    touchAfter: 24 * 3600 // time period in seconds
  }),
  saveUninitialized: true,
  resave: true,
  cookie: {  httpOnly: true,  secure: false  }
}));


// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', exphbs({
  partialsDir: __dirname + "/views/Partials/"
}));
app.set("view engine", "handlebars");

app.get('/', (req, res) => {
  // res.redirect('/user/login');
  res.render('AdminLogin', {loginType: "User"});
});

// Bring in the user routes
// const users = require('./routes/users');
// app.use('/user', users);

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
  socket.on('subscribe', function(data){
    console.log(data)
    socket.room = data.data;
    socket.join(data.data);

    // if(data['type']!='tcp') {
    //   Iotdata.getLastData(data.data, function(err, result){
    //     if(result[0]['status'].toLowerCase()=='on'){
    //       io.to(socket.room).emit('news', result[0]);
    //     }
    //   })
    // }

  })
  socket.on('myevent', function(data) {
    io.to(data.deviceId).emit('news', data);
  });
  socket.on('pwron', function(data){
    io.to(socket.room).emit('pwron1', {data: 'on'});
  });
  socket.on('pwroff', function(data){
    // let rmuno = 'N/A';
    // let modemno = 'N/A';
    // let modemip = 'N/A';
    // let tele = 'N/A';
    // let readdate = 'N/A';
    // let rtcdate = 'N/A';
    // let mvol = 0;
    // let mcur = 0;
    // let mpow = 0;
    // let mfreq = 0;
    // let mrpm = 0;
    // let tdis = 0;
    // let totdis = 'N/A';
    // let tenergy = 0;
    // let totenergy = 'N/A';
    // let up = 'N/A';
    // let off = 'N/A';
    // let status = 'N/A';
    // let lat = 'N/A';
    // let lng = 'N/A';
    // let pvol = 0;
    // let pcurr = 0;
    // let ppow = 0;
    // let imei = 'N/A';
    // let fault = 1;
    // io.to(socket.room).emit('news',
    // {
    //   rmuno: rmuno, modemno: modemno, modemip: modemip, tele: tele,
    //   readdate: readdate, rtcdate: rtcdate, mvol: mvol, mcur: mcur, mpow: mpow,
    //   mfreq: mfreq, mrpm: mrpm, tdis: tdis, totdis: totdis, tenergy: tenergy, totenergy: totenergy,
    //   up: up, off: off, status: status, lat: lat, lng: lng,
    //   pvol: pvol, pcurr: pcurr, ppow: ppow, imei: imei, fault: fault
    // });
    io.to(socket.room).emit('pwroff1', {data: 'off'});
  });
  socket.on('motrev', function(data){
    io.to(socket.room).emit('motrev1', {data: 'motrev'});
  });
});

function onClientConnected(sock) {
  var socketclient = ioclient.connect('http://localhost:5000');
  sock.setEncoding("utf8");
  sock.on('data', function(data) {
    console.log(data);
    let iotdata = data.split('#');
    if(iotdata.length > 2) {
      let deviceId = iotdata[0];
      let imei = iotdata[1];
      let resistance = iotdata[2];
      let simNo = iotdata[3];
      let signalStrength = iotdata[4];
      let timestamp = iotdata[5];

      let findata = {
        deviceId: deviceId,
        imei: imei,
        resistance: resistance,
        simNo: simNo,
        signalStrength: signalStrength,
        timestamp: timestamp
      };
      socketclient.emit('myevent',findata);
      // addRow(findata);
      // Iotdata.insertData(findata, (err, user) => {
      //   if (err) {
      //     console.log("Error insert");
      //   }
      // });
    }
    else{
      let filterdata = data.split('\n')[0];
      socketclient.emit('subscribe', {data: filterdata, type: 'tcp'});
      console.log(data);
    }
  });
  socketclient.on('pwroff1', function(data){
    sock.write('MOTOROFF');
  });
  socketclient.on('pwron1', function(data){
    sock.write('MOTORON');
  })
  socketclient.on('motrev1', function(data){
    sock.write('MOTORREV');
  });
};
