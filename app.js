//jshint esversion:6
require('dotenv').config() //used to hide our API keys, AWSkey secret keys in genral
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")

const app = express();

app.set('view engine', 'ejs'); // the view engine we are using is ejs. THis is the view engine we are using for templating. EJS is used for templating
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
secret: 'keyboard cat',
resave: false,
saveUninitialized: false,

}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/AunSports", {useNewUrlParser: true});

const adminSchema = new mongoose.Schema({
    email: String,
    password: String
});

adminSchema.plugin(passportLocalMongoose);

//Schema for our admins that will edit the website.
const User = new mongoose.model("admins", adminSchema); //User in bracket is the name of our collection using userSchema

passport.use(User.createStrategy());
//This will serialize and deserialize our cookies
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
  res.render("home");
});

app.get("/basketball", function(req,res){
  res.render("Basketball");
});

app.get("/football", function(req,res){
  res.render("Football");
});

app.get("/login", function(req, res){
  res.render("Login");
});

app.get("/register", function(req,res){
 res.render("register");
});

app.post("/register", function(req,res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/register");
      }else{
        passport.authenticate("local")(req, res, function(){ //if the authentication was successful, then enter the callback function
          res.redirect("/edit"); //Now we need to create a secrets rout because ig out user is authenticated, he should be able to go to secrests page anytime.
        });
      }
    });
  });

app.post("/login", function(req,res){
  const user = new User({
    username: req.body.username,
    password:req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/edit");
      });
    }
  });

});

app.get("/logout", function(req,res){
  req.logout();//this is a passport function you can find in ww.passportjs.org
  res.redirect("/");
});

app.get("/edit", function(req,res){
    if(req.isAuthenticated()){
      res.render("edit");
    }else{
      res.redirect("/login");
    }
});

app.listen(3000, function(){
  console.log("Server has started at port 3000");
});
