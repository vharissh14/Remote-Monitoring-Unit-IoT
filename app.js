const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// Bring in the database object
const config = require('./config/database');

// Mongodb Config
mongoose.set('useCreateIndex', true);

// Connect with the database
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
        url: 'mongodb://localhost/test-app',
        touchAfter: 24 * 3600 // time period in seconds
    }),
    saveUninitialized: true,
    resave: true,
    cookie: {  httpOnly: true,  secure: false  }
}));


// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', exphbs());
app.set("view engine", "handlebars");

app.get('/', (req, res) => {
    res.redirect('/user/login');
});

// Bring in the user routes
const users = require('./routes/users');
app.use('/user', users);

const admin = require('./routes/admin');
app.use('/admin', admin);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
