//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs'); // the view engine we are using is ejs. THis is the view engine we are using for templating. EJS is used for templating
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req,res){
  res.render("home");
});

app.listen(3000, function(){
  console.log("Server has started at port 3000");
});
