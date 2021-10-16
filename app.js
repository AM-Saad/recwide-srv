const express = require("express");
const mongoose = require('mongoose');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./models/User');
const cors = require('cors')
const bodyParser = require('body-parser');

const path = require("path");
const app = express();

const http = require("http").Server(app);



const MONGODBURI = `mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/recwide`;

const store = new MongoDBStore({
  uri: MONGODBURI,
  collection: 'sessions'
});



app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join(__dirname, 'images')));
const server = app.listen(process.env.PORT || 5000);

app.use(cors()) // Use this after the variable declaration



app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
app.use('/auth', authRoutes);
app.use('/user', userRoutes);




mongoose
  .connect(MONGODBURI)
  .then(result => {
    app.listen(3000);
    console.log(`Working On Port ${3000}`);
  })
  .catch(err => {
    console.log(`error is ${err}`);
  });
