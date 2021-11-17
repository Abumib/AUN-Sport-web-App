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
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: 'keyboard cat', //remmeber to hide this key
  resave: false,
  saveUninitialized: false,

}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/AunSports", {
  useNewUrlParser: true
});

const adminSchema = new mongoose.Schema({
  email: String,
  password: String
});

// const footballSchema = new mongoose.Schema({
//     title: String,
//     body: String
// });
//
// const FootballNews = new mongoose.model("footballnews", footballSchema);
//
// const basketballSchema = new mongoose.Schema({
//     title: String,
//     body: String
// });
//
// const BasketballNews = new mongoose.model("basketballnews", basketballSchema);

const newsSchema = new mongoose.Schema({
  season: String,
  footballNews: [{
    title: String,
    body: String
  }],
  basketballNews: [{
    title: String,
    body: String
  }]
});
const News = new mongoose.model("news", newsSchema);

const leagueTablesSchema = new mongoose.Schema({
  season: String,
  footballLeague: [{
    week: String,
    position: String,
    teamName: String,
    mp: String,
    w: String,
    d: String,
    l: String,
    gf: String,
    ga: String,
    gd: String,
    pts: String
  }],
  basketballLeague: [{
    week: String,
    position: String,
    teamName: String,
    w: String,
    pct: String,
    gb: String,
    conf: String,
    home: String,
    away: String,
    l10: String,
    strk: String
  }]
});

const LeagueTables = new mongoose.model("leagueTables", leagueTablesSchema);
//LeagueTables.inspect();  //This test for a your model.
//console.log(LeagueTables);

adminSchema.plugin(passportLocalMongoose);

//Schema for our admins that will edit the website.
const User = new mongoose.model("admins", adminSchema); //User in bracket is the name of our collection using userSchema




passport.use(User.createStrategy());
//This will serialize and deserialize our cookies
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  //res.render("landingPage");

  News.find({}, function(err, foundlist) { //I can filter the database using seasons here.
      console.log(foundlist);
    res.render("landingPage", {
      news: foundlist
    });
  });

  // console.log(foundlist[1].footballNews[0].body);
  //console.log(Object.keys(foundlist[1].footballNews).length);

  // });
});

app.get("/index", function(req, res) {
  res.render("experiment");
});

app.get("/landingPage", function(req, res) {
  res.render("landingPage");
});


app.get("/basketball", function(req, res) {
  res.render("Basketball");
});

app.get("/football", function(req, res) {
  res.render("Football");
});

app.get("/login", function(req, res) {
  res.render("Login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() { //if the authentication was successful, then enter the callback function
        res.redirect("/edit"); //Now we need to create a secrets rout because ig out user is authenticated, he should be able to go to secrests page anytime.
      });
    }
  });
});

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/edit");
      });
    }
  });

});

app.get("/logout", function(req, res) {
  req.logout(); //this is a passport function you can find in ww.passportjs.org
  res.redirect("/");
});

app.get("/edit", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("edit");
  } else {
    res.redirect("/login");
  }
});

app.get("/editfootball", function(req, res) {
  res.render("editFootball");
});

app.get("/editfootball", function(req, res) {
  res.render("editFootball");
});

app.get("/editbasketball", function(req, res) {
  res.render("editBasketball");
});

app.get("/editfootballnews", function(req, res) {
  res.render("editFootballNews");
});

app.get("/editbasketballnews", function(req, res) {
  res.render("editbasketballnews");
});

app.post("/editfootballnews", function(req, res) {
  const season = req.body.footballSeason;
  News.findOne({
    season: season.toLowerCase()
  }, function(err, foundlist) { //Checks is there is season that is ongoing// CONVERTS EVERYTHING TO LOWERCASE TO prevent creating a new record due to caps
    if (foundlist) {
      foundlist.footballNews.push({
        title: req.body.footballNewsTitle,
        body: req.body.footballNewsBody
      }); //Pushes the news to the season it belongs
      foundlist.save();
      res.redirect("/editFootballNews");
    } else { // if no season was found e.g fall 2021, It creates a new reecord for that  season and pushes the data there.
      const newsList = new News({
        season: req.body.footballSeason,
        footballNews: [{
          title: req.body.footballNewsTitle,
          body: req.body.footballNewsBody
        }]
      });
      newsList.save();
      res.redirect("/editFootballNews");
    }
  });



});

app.post("/editbasketballnews", function(req, res) {
  const season = req.body.basketballSeason;
  News.findOne({
    season: season.toLowerCase()
  }, function(err, foundlist) {
    if (foundlist) {
      foundlist.basketballNews.push({
        title: req.body.basketballNewsTitle,
        body: req.body.basketballNewsBody
      });
      foundlist.save();
      res.redirect("/editbasketballnews");
    } else {
      const newsList = new News({
        season: season.toLowerCase(),
        basketballNews: [{
          title: req.body.basketballNewsTitle,
          body: req.body.basketballNewsBody
        }]
      });
      newsList.save();
      res.redirect("/editbasketballnews");
    }
  });
});

app.get("/editfootballtable", function(req, res) {
  res.render("editFootballTable");
});

app.post("/editfootballtable", function(req, res) {
  ////I am trying to make sure that all the data in the table is entered at initial stage.
  const season = req.body.footballSeason;
  //console.log(req.body.FMP[0]);
  //console.log(req.body.teamName[0]);

  LeagueTables.findOne({
    season: season.toLowerCase()
  }, function(err, foundlist) {
    if (foundlist) {
      console.log("PRINTING: " + req.body.FMP);
      for (i = 0; i < Object.keys(req.body.FMP).length; i++) {
        console.log(i);
        foundlist.footballLeague.push({
          week: req.body.footballSeasonWeek,
          position: req.body.position[i],
          teamName: req.body.teamName[i],
          mp: req.body.FMP[i],
          w: req.body.FW[i],
          d: req.body.FD[i],
          l: req.body.FL[i],
          gf: req.body.FGF[i],
          ga: req.body.FGA[i],
          gd: req.body.FGD[i],
          pts: req.body.FPts[i]
        });
      }
      foundlist.save();
      res.redirect("/landingPage");
      // res.redirect("/");
    } else {

      LeagueTables.create({
        season: req.body.footballSeason
      }, function(err, newFootballLeagueTable) {
        for (i = 0; i < Object.keys(req.body.FMP).length; i++) {
          newFootballLeagueTable.footballLeague.push({
            week: req.body.footballSeasonWeek,
            position: req.body.position[i],
            teamName: req.body.teamName[i],
            mp: req.body.FMP[i],
            w: req.body.FW[i],
            d: req.body.FD[i],
            l: req.body.FL[i],
            gf: req.body.FGF[i],
            ga: req.body.FGA[i],
            gd: req.body.FGD[i],
            pts: req.body.FPts[i]
          });
        }
        newFootballLeagueTable.save();
        res.redirect("/landingPage");

        console.log(newFootballLeagueTable);
      });


      //   for(i=0; i< Object.keys(req.body.FMP).length;i++){
      //   LeagueTables.insertMany({season:req.body.footballSeason, footballLeague:[{
      //     position: req.body.position[0],
      //     teamName: req.body.teamName[0],
      //     mp: req.body.FMP[0],
      //     w: req.body.FW[0],
      //     d: req.body.FD[0],
      //     l: req.body.FL[0],
      //     gf: req.body.FGF[0],
      //     ga: req.body.FGA[0],
      //     gd: req.body.FGD[0],
      //     pts: req.body.FPts[0]
      //   }]});
      // }

      //   const newFootballLeagueTable = new LeagueTables({
      //     season: req.body.footballSeason,
      //     footballLeague:[{
      //       position: req.body.position[0]  ,
      //       teamName: req.body.teamName[0],
      //       mp: req.body.FMP[0],
      //       w: req.body.FW[0],
      //       d: req.body.FD[0],
      //       l: req.body.FL[0],
      //       gf: req.body.FGF[0],
      //       ga: req.body.FGA[0],
      //       gd: req.body.FGD[0],
      //       pts: req.body.FPts[0]
      //     }]
      //   });
      // newFootballLeagueTable.save();

      // res.redirect("/");
    }
  });


});

app.get("/editbasketballtable", function(req, res) {
  res.render("editBasketballtable");
});

app.post("/editbasketballtable", function(req, res) {
  const season = req.body.basketballSeason;
  console.log("hello");
  console.log(req.body.W)
  LeagueTables.findOne({
    season: season.toLowerCase()
  }, function(err, foundlist) {
    if (foundlist) {
      console.log("This is the found list: " + foundlist);
      for (i = 0; i < Object.keys(req.body.W).length; i++) {
        foundlist.basketballLeague.push({
          week: req.body.basketballSeasonWeek,
          position: req.body.position[i],
          teamName: req.body.teamName[i],
          w: req.body.W[i],
          pct: req.body.PCT[i],
          gb: req.body.GB[i],
          conf: req.body.CONF[i],
          home: req.body.HOME[i],
          away: req.body.AWAY[i],
          l10: req.body.L10[i],
          strk: req.body.STRK[i]
        });
      }
      foundlist.save();
      res.redirect("/landingPage");
    } else {

      LeagueTables.create({
        season: season.toLowerCase()
      }, function(err, newbasketballLeagueTable) {
        console.log("haaaaa: " + newbasketballLeagueTable);
        for (i = 0; i < Object.keys(req.body.W).length; i++) {
          newbasketballLeagueTable.basketballLeague.push({
            week: req.body.basketballSeasonWeek,
            position: req.body.position[i],
            teamName: req.body.teamName[i],
            w: req.body.W[i],
            pct: req.body.PCT[i],
            gb: req.body.GB[i],
            conf: req.body.CONF[i],
            home: req.body.HOME[i],
            away: req.body.AWAY[i],
            l10: req.body.L10[i],
            strk: req.body.STRK[i]
          });
        }
        newbasketballLeagueTable.save();
        res.redirect("/landingPage");
      });
    }
  });
});

app.listen(3000, function() {
  console.log("Server has started at port 3000");
});
