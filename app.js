//jshint esversion:6
require('dotenv').config(); //used to hide our API keys, AWSkey secret keys in genral
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const request = require("request");
const https = require("https");

const app = express();

app.set('view engine', 'ejs'); // the view engine we are using is ejs. THis is the view engine we are using for templating. EJS is used for templating
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public")); //Inporder for ourserver to serve up static files from our local files in our system express.static("public"). public is the name of the folder I keep my CSS, and Images.

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

const fixturesSchema = new mongoose.Schema({
  season: String,
  footballLeague:[{
    week: String,
    team1:String,
    team2:String,
    dateAndTime: String
  }],
  basketballLeague:[{
    week: String,
    team1:String,
    team2:String,
    dateAndTime: String
  }]
});

const Fixture = new mongoose.model("fixtures",fixturesSchema);

const leagueStats = new mongoose.Schema({
  season: String,
  footballStats:[{
  week: String,
  topScorer: Number,
  topScorerName: String,
  topAssist: Number,
  topAssistName: String,
  topYellowCards: Number,
  topYellowCardsName: String,
  topRedCards: Number,
  topRedCardsName: String
}],
  basketballStats:[{
    week: String,
    topPoints: Number,
    topPointsName: String,
    topAssist: Number,
    topAssistName: String,
    topRebounds: Number,
    topReboundsName: String,
    topBlocks: Number,
    topBlocksName: String,
    topSteals: Number,
    topStealsName: String
  }]
});

const LeagueStats = new mongoose.model("leagueStat", leagueStats);

const player = new mongoose.Schema({
  season: String,
  footballPlayers: [{
    name: String,
    team: String,
    position: String,
    preferedFoot: String,
    playernumber: String,
    playerOverallRating: String
  }],
  basketballPlayers: [{
    name: String,
    team: String,
    position: String,
    height: String,
    playernumber: String,
    playerOverallRating: String
  }]
});

const Player = new mongoose.model("players", player);

const team = new mongoose.Schema({
  season: String,
  footballTeam: [{
    name: String,
    teamInformation: String,
    motto: String
  }],
  basketballTeam: [{
    name: String,
    teamInformation: String,
    motto: String
  }]
});

const Team = new mongoose.model("teams", team);

const matchStats = new mongoose.Schema({
  season: String,
  football:[{
    week: String,
    matchHighlight:String,
    team1Name: String,
    team2Name: String,
    team1Score: String,
    team2Score: String,
    team1Shots: String,
    team2Shots: String,
    team1ShotsOnTarget: String,
    team2ShotsOnTarget: String,
    team1Posession: String,
    team2Posession: String,
    team1Passes: String,
    team2Passes: String,
    team1PassesAccuracy: String,
    team2PassesAccuracy: String,
    team1Fouls: String,
    team2Fouls: String,
    team1YellowCards: String,
    team2YellowCards: String,
    team1RedCards: String,
    team2RedCards: String,
    team1Offsides: String,
    team2Offsides: String,
    team1Corners: String,
    team2Corners: String,
  }],
  basketball:[{
    week: String,
    matchHighlight:String,
    team1Name: String,
    team2Name: String,
    team1Score: String,
    team2Score: String,
    team1TotalRebounds: String,
    team2TotalRebounds: String,
    team1Offensive: String,
    team2Offensive: String,
    team1Assists: String,
    team2Assists: String,
    team1Blocks: String,
    team2Blocks: String,
    team1Steals: String,
    team2Steals: String,
    team1Turnovers: String,
    team2Turnovers: String,
    team1PointsInThePaints: String,
    team2PointsInThePaints: String,
    team1FoulsPersonal: String,
    team2FoulsPersonal: String,
  }]
});

const Match = new mongoose.model("matches", matchStats);
adminSchema.plugin(passportLocalMongoose);

//Schema for our admins that will edit the website.
const User = new mongoose.model("admins", adminSchema); //User in bracket is the name of our collection using userSchema




passport.use(User.createStrategy());
//This will serialize and deserialize our cookies
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/", function(req, res) {
//   //res.render("landingPage");
// function getNews(next){
//   News.find({}, function(err, foundlist){
//     res.locals.news = foundlist;
//     next();
//     console.log(news);
//   });
//
// }
//   res.render("landingPage");
//    // console.log(foundlist[1].footballNews[0].body);
//   //console.log(Object.keys(foundlist[1].footballNews).length);
//
//   // });
// });



app.get("/", [getNews, getLeagueTables, getFixtures, getLeagueStats, getMatches], renderForm);

function getNews(req, res, next) {
   // Code here
   News.find({}, function (err, categories) {
     if (err) next(err);
     res.locals.news = categories;
     next();
   });
}

function getLeagueTables(req, res, next) {
   // Code here
   LeagueTables.find({}, function (err, tables) {
     if (err) next(err);
     res.locals.leagueTable = tables;
     next();
   });

}

function getFixtures(req, res, next){
  Fixture.find({}, function(err, foundfixtures){
    if(err) next(err);
    res.locals.fixtures = foundfixtures;
    next();
  });
}

function getLeagueStats(req, res, next){
  LeagueStats.find({}, function(err, foundStats){
    if(err) next(err);
    res.locals.leagueStat = foundStats;
    next();
  });
}

function getMatches(req,res,next){
    Match.find({}, function(err, foundMatches){
      if(err) next(err);
      res.locals.matches = foundMatches;
      next();
    });
}

function renderForm(req, res) {
    res.render("landingPage");
}


app.post("/", function(req, res){

  res.render("/");
});
///////////////////////   landingPage ///////////
app.get("/index", function(req, res) {
  res.render("experiment");
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

app.get("/editfootballfixtures", function(req,res){
  res.render("editFootballFixtures");
});

app.get("/editbasketballfixtures", function(req,res){
  res.render("editBasketballFixtures");
});

app.get("/editfootballstats", function(req, res){
    res.render("editFootballStats");
});

app.get("/editbasketballstats", function(req, res){
    res.render("editBasketballStats");
});

app.post("/editfootballstats", function(req, res){
    const season = req.body.footballStatSeason;
    LeagueStats.findOne({season: season.toLowerCase()}, function(err, foundStats){
      if(foundStats){
        foundStats.footballStats.push({
          week: req.body.footballStatWeek,
          topScorer: req.body.goals,
          topScorerName: req.body.NameOfGoalScorer,
          topAssist: req.body.footballAssists,
          topAssistName: req.body.NameOfFootballerWithHighestAssists,
          topYellowCards: req.body.yellowcards,
          topYellowCardsName: req.body.NameOfPlayerWithHighestYellowCards,
          topRedCards: req.body.redcards,
          topRedCardsName: req.body.NameOfPlayerWithHighestRedCards
        });
        foundStats.save();
        res.redirect("/");
      }else{
        const newLeagueStats = new LeagueStats({
          season: req.body.footballStatSeason.toLowerCase(),
          footballStats:[{
            week: req.body.footballStatWeek,
            topScorer: req.body.goals,
            topScorerName: req.body.NameOfGoalScorer,
            topAssist: req.body.footballAssists,
            topAssistName: req.body.NameOfFootballerWithHighestAssists,
            topYellowCards: req.body.yellowcards,
            topYellowCardsName: req.body.NameOfPlayerWithHighestYellowCards,
            topRedCards: req.body.redcards,
            topRedCardsName: req.body.NameOfPlayerWithHighestRedCards
        }]
      });
      newLeagueStats.save();
      res.redirect("/");
      }
    });
});

app.post("/editBasketballstats", function(req, res){
  const season = req.body.basketballStatSeason;
  LeagueStats.findOne({season: season.toLowerCase()}, function(err, foundStats){
    if(foundStats){
      foundStats.basketballStats.push({
        week: req.body.basketballStatsWeek,
        topPoints: req.body.points,
        topPointsName: req.body.NameOfPlayerWithHighestPoints,
        topAssist: req.body.basketballAssists,
        topAssistName: req.body.nameOfbasketballPlayerWithHighestAssists,
        topRebounds: req.body.rebounds,
        topReboundsName: req.body.NameOfPlayerWithHighestRebounds,
        topBlocks: req.body.blocks,
        topBlocksName: req.body.nameOfPlayerWithHighestBlocks,
        topSteals: req.body.steals,
        topStealsName: req.body.nameOfPlayerWithHighestSteals
      });
      foundStats.save();
      res.redirect("/");
    }else{
      const newLeagueStats = new LeagueStats({
        season: req.body.basketballStatSeason.toLowerCase(),
        basketballStats:[{
          week: req.body.basketballStatsWeek,
          topPoints: req.body.points,
          topPointsName: req.body.NameOfPlayerWithHighestPoints,
          topAssist: req.body.basketballAssists,
          topAssistName: req.body.nameOfbasketballPlayerWithHighestAssists,
          topRebounds: req.body.rebounds,
          topReboundsName: req.body.NameOfPlayerWithHighestRebounds,
          topBlocks: req.body.blocks,
          topBlocksName: req.body.nameOfPlayerWithHighestBlocks,
          topSteals: req.body.steals,
          topStealsName: req.body.nameOfPlayerWithHighestSteals
      }]
    });
    newLeagueStats.save();
    res.redirect("/");
    }
  });
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
      res.redirect("/");
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
          week: req.body.footballSeasonWeek.toLowerCase(),
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
      res.redirect("/");
    } else {

      LeagueTables.create({
        season: req.body.footballSeason
      }, function(err, newFootballLeagueTable) {
        for (i = 0; i < Object.keys(req.body.FMP).length; i++) {
          newFootballLeagueTable.footballLeague.push({
            week: req.body.footballSeasonWeek.toLowerCase(),
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
        res.redirect("/");
      });
    }
  });
});

app.get("/editbasketballtable", function(req, res) {
  res.render("editBasketballtable");
});

app.post("/editbasketballtable", function(req, res) {
  const season = req.body.basketballSeason;
  //console.log("hello");
  //console.log(req.body.W);
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
      res.redirect("/");
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
        res.redirect("/");
      });
    }
  });
});

app.post("/editfootballfixtures", function(req,res){
   const season = req.body.footballSeason;
  Fixture.findOne({season: season.toLowerCase()}, function(err, foundlist){
    if(foundlist){
      foundlist.footballLeague.push({
        week: req.body.footballLeagueWeek,
        team1: req.body.footballTeam1,
        team2: req.body.footballTeam2,
        dateAndTime: req.body.footballMatchDate
      });
      foundlist.save();
      res.redirect("/");
    }else{
      const newFixture = new Fixture({
        season: season.toLowerCase(),
        footballLeague:[
          {
            week: req.body.footballLeagueWeek,
            team1: req.body.footballTeam1,
            team2: req.body.footballTeam2,
            dateAndTime: req.body.footballMatchDate
          }
        ]
      });
      newFixture.save();
      res.redirect("/");
    }
  });
});

app.post("/editbasketballfixtures", function(req, res){
  const season = req.body.basketballSeason;
  Fixture.findOne({season: season.toLowerCase()}, function(err, foundBballlist){
    if(foundBballlist){
      console.log(foundBballlist.basketballLeague);
      foundBballlist.basketballLeague.push({
        week: req.body.basketballLeagueWeek,
        team1: req.body.basketballTeam1,
        team2: req.body.basketballTeam2,
        dateAndTime: req.body.basketballMatchDate
      });
      foundBballlist.save();
      res.redirect("/");
    }else{
      const newBballFixture = new Fixture({
        season: season.toLowerCase(),
        basketballLeague:[
          {
            week: req.body.basketballLeagueWeek,
            team1: req.body.basketballTeam1,
            team2: req.body.basketballTeam2,
            dateAndTime: req.body.basketballMatchDate
          }
        ]
      });
      newBballFixture.save();
      res.redirect("/");
    }
  });
});

app.get("/athlethes", function(req, res){
  res.render("athlethes");
});

app.get("/footballnews/:newsName", function(req, res){
  const requestedTitle = req.params.newsName;

  News.find({},function(err,foundItem){
    foundItem.forEach(function(listOfnews){
      if(listOfnews.season === "fall 2021"){
       listOfnews.footballNews.forEach(function(detailedNews){
          const storedID = detailedNews._id;
          if (storedID ==requestedTitle) {
            res.render("readMoreNewsForFootball", {
              title: detailedNews.title,
              body: detailedNews.body
            });
          }
          });
       }
    });

  });
});

app.get("/basketballnews/:newsName", function(req, res){
  const requestedTitle = req.params.newsName;
  News.find({},function(err,foundItem){
    foundItem.forEach(function(listOfnews){
      if(listOfnews.season === "fall 2021"){
       listOfnews.basketballNews.forEach(function(detailedNews){
          const storedID = detailedNews._id;
          if (storedID ==requestedTitle) {
            res.render("readMoreNewsForBasketball", {
              title: detailedNews.title,
              body: detailedNews.body
            });
          }
          });
       }
    });
  });
});

app.get("/footballtable", function(req, res){
  LeagueTables.find({}, function(err, foundItem){
    res.render("footballTable", {
      leagueTable: foundItem
    });
  });

});

app.get("/newsfootball", function(req, res){
  News.find({}, function (err, categories) {
   res.render("footballNews", {
     news: categories
   });
  });
});

app.get("/footballfixtures", function(req, res){
  Fixture.find({}, function(err, foundfixtures){
    res.render("footballFixtures", {
      fixtures: foundfixtures
    });
  });

});

app.get("/footballteams", function(req, res){
  Team.find({}, function(err, foundteams){
    res.render("footballTeams", {
      teams: foundteams
    });
  });
});

app.get("/addfootballPlayer", function(req, res){
  res.render("addfootballPlayer");
});

app.post("/addfootballplayer", function(req, res){
  const season = req.body.footballPlayerSeason;
  Player.findOne({season: season.toLowerCase()}, function(err, foundlist){
    if(foundlist){
      foundlist.footballPlayers.push({
        name: req.body.footballPlayerName,
        team: req.body.footballTeamName,
        position: req.body.footballPlayerPosition,
        preferedFoot: req.body.footballPlayerFoot,
        playernumber: req.body.footballPlayerNumber,
        playerOverallRating: req.body.footballPlayerRating
      });
      foundlist.save();
      res.redirect("/");
    }else{
      const newPlayer = new Player({
        season: season.toLowerCase(),
        footballPlayers: [{
          name: req.body.footballPlayerName,
          team: req.body.footballTeamName,
          position: req.body.footballPlayerPosition,
          preferedFoot: req.body.footballPlayerFoot,
          playernumber: req.body.footballPlayerNumber,
          playerOverallRating: req.body.footballPlayerRating
        }]
      });
      newPlayer.save();
      res.redirect("/");
    }
  });
});


app.get("/addfootballteam", function(req, res){
  res.render("addfootballteam");
});

app.post("/addfootballteam", function(req, res){
  const season = req.body.footballTeamSeason;
  Team.findOne({season: season.toLowerCase()}, function(err, foundItem){
    if(foundItem){
      foundItem.footballTeam.push({
        name: req.body.footballTeamName,
        teamInformation: req.body.footballTeamNameInformation,
        motto: req.body.footballTeamMotto
      });
      foundItem.save();
      res.redirect("/");
    }else{
      const newTeam = new Team({
        season: season.toLowerCase(),
          footballTeam: [{
            name: req.body.footballTeamName,
            teamInformation: req.body.footballTeamNameInformation,
            motto: req.body.footballTeamMotto
          }]
      });
      newTeam.save();
      res.redirect("/");
    }
  });
});

//////// Team Details page functions /////////////

function getTeamDetails(req, res, next){
  const teamName = req.params.teamname;
  Team.find({}, function(err, teams){
    teams.forEach(function(foundTeam){
      if(foundTeam.season == "fall 2021"){
        foundTeam.footballTeam.forEach(function(foundfootballteams){
          const storedName = foundfootballteams.name;
         if(foundfootballteams.name === teamName){
            if(err) next(err);
            res.locals.footballteam = foundfootballteams;
            next();
          }
        });
      }
    });
  });
}

function getPlayers(req, res, next){
  const teamName = req.params.teamname;
 Player.find({}, function(err, foundlist){
    let players = [];
    foundlist.forEach(function(player){

      if(player.season == "fall 2021"){
        player.footballPlayers.forEach(function(foundplayer){
          if(teamName == foundplayer.team){
            if(err) next(err);
            players.push(foundplayer);
          }
        });
        res.locals.players = players;
        next();
      }
    });
  });
}

function renderteamdetails(req, res){
  res.render("teamDetails");
}
app.get("/teamdetails/:teamname",[getTeamDetails,getPlayers,renderteamdetails]);

app.get("/basketballtable", function(req, res){
  LeagueTables.find({}, function(err, foundItem){
    res.render("basketballTable", {
      leagueTable: foundItem
    });
  });

});

app.get("/newsbasketball", function(req, res){
  News.find({}, function (err, categories) {
   res.render("basketballNews", {
     news: categories
   });
  });
});

app.get("/basketballfixtures", function(req, res){
  Fixture.find({}, function(err, foundfixtures){
    res.render("basketballFixtures", {
      fixtures: foundfixtures
    });
  });

});

app.get("/basketballteams", function(req, res){
  Team.find({}, function(err, foundteams){
    res.render("basketballTeams", {
      teams: foundteams
    });
  });
});

app.get("/addbasketballteam", function(req, res){
  res.render("addBasketballTeam");
});

app.post("/addbasketballteam", function(req, res){
  const season = req.body.basketballTeamSeason;
  Team.findOne({season: season.toLowerCase()}, function(err, foundItem){
    if(foundItem){
      foundItem.basketballTeam.push({
        name: req.body.basketballTeamName,
        teamInformation: req.body.basketballTeamNameInformation,
        motto: req.body.basketballTeamMotto
      });
      foundItem.save();
      res.redirect("/");
    }else{
      const newTeam = new Team({
        season: season.toLowerCase(),
          basketballTeam: [{
            name: req.body.basketballTeamName,
            teamInformation: req.body.basketballTeamNameInformation,
            motto: req.body.basketballTeamMotto
          }]
      });
      newTeam.save();
      res.redirect("/");
    }
  });
});

app.get("/addbasketballplayer", function(req, res){
  res.render("addBasketballPlayer");
});

app.post("/addbasketballPlayer", function(req, res){
  const season = req.body.basketballPlayerSeason;
  Player.findOne({season: season.toLowerCase()}, function(err, foundlist){
    if(foundlist){
      foundlist.basketballPlayers.push({
        name: req.body.basketballPlayerName,
        team: req.body.basketballTeamName,
        position: req.body.basketballPlayerPosition,
        height: req.body.basketballPlayerHeight,
        playernumber: req.body.basketballPlayerNumber,
        playerOverallRating: req.body.basketballPlayerRating
      });
      foundlist.save();
      res.redirect("/");
    }else{
      const newPlayer = new Player({
        season: season.toLowerCase(),
        basketballPlayers: [{
          name: req.body.basketballPlayerName,
          team: req.body.basketballTeamName,
          position: req.body.basketballPlayerPosition,
          height: req.body.basketballPlayerHeight,
          playernumber: req.body.basketballPlayerNumber,
          playerOverallRating: req.body.basketballPlayerRating
        }]
      });
      newPlayer.save();
      res.redirect("/");
    }
  });
});






function getBasketballTeamDetails(req, res, next){
  const teamName = req.params.basketballteamname;
//console.log(req.params);
  Team.find({}, function(err, teams){
    teams.forEach(function(foundTeam){
      if(foundTeam.season == "fall 2021"){
        foundTeam.basketballTeam.forEach(function(foundbasketballteams){
         if(foundbasketballteams.name === teamName){
            if(err) next(err);
            res.locals.basketballteams = foundbasketballteams;
            next();
          }

        });
      }
    });
  });
}

function getBasketballPlayers(req, res, next){
  const teamName = req.params.basketballteamname;
 Player.find({}, function(err, foundlist){
    let players = [];
    foundlist.forEach(function(player){

      if(player.season == "fall 2021"){
        player.basketballPlayers.forEach(function(foundplayer){
          if(teamName == foundplayer.team){
            if(err) next(err);
            players.push(foundplayer);
          }
        });
        res.locals.players = players;
        next();
      }
    });
  });
}

function renderBasketballTeamdetails(req, res){
  res.render("basketballTeamDetails");
}
app.get("/basketballteamdetails/:basketballteamname",[getBasketballTeamDetails,getBasketballPlayers,renderBasketballTeamdetails]);

app.get("/footballmatchesresult/:matchId", function(req, res){
  Match.find({},function(err, foundMatch){
    foundMatch.forEach(function(match){
      if(match.season == "fall 2021"){
        match.football.forEach(function(matches){
          if(matches._id == req.params.matchId){
             res.render("footballMatchResultPage",{
               match:matches
             });
          }
        });
      }
    });
  });
});

app.get("/addfootballmatch", function(req, res){
  res.render("addFootballMatch");
});

app.post("/addfootballmatch", function(req,res){
  const season = req.body.footballMatchSeason;
   Match.findOne({season: season.toLowerCase()}, function(err,foundMatches){
     if(foundMatches){
       foundMatches.football.push({
         week: req.body.footballMatchWeek,
         matchHighlight: req.body.footballMatchHighlight,
         team1Name: req.body.team1Name,
         team2Name: req.body.team2Name,
         team1Score:req.body.team1Score,
         team2Score:req.body.team2Score,
         team1Shots:req.body.team1Shots,
         team2Shots:req.body.team2Shots,
         team1ShotsOnTarget: req.body.team1ShotsOnTarget,
         team2ShotsOnTarget: req.body.team2ShotsOnTarget,
         team1Posession: req.body.team1Possession,
         team2Posession: req.body.team2Possession,
         team1Passes: req.body.team1Passes,
         team2Passes: req.body.team2Passes,
         team1PassesAccuracy: req.body.team1PassAccuracy,
         team2PassesAccuracy: req.body.team2PassAccuracy,
         team1Fouls: req.body.team1Fouls,
         team2Fouls: req.body.team2Fouls,
         team1YellowCards: req.body.team1YellowCards,
         team2YellowCards: req.body.team2YellowCards,
         team1RedCards: req.body.team1RedCards,
         team2RedCards: req.body.team2RedCards,
         team1Offsides: req.body.team1Offsides,
         team2Offsides: req.body.team2Offsides,
         team1Corners: req.body.team1Corners,
         team2Corners: req.body.team2Corners,
       });
       foundMatches.save();
       res.redirect("/addfootballmatch");
     }else{
       const newMatch = new Match({
         season: season.toLowerCase(),
         football:[{
           week: req.body.footballMatchWeek,
           matchHighlight: req.body.footballMatchHighlight,
           team1Name: req.body.team1Name,
           team2Name: req.body.team2Name,
           team1Score:req.body.team1Score,
           team2Score:req.body.team2Score,
           team1Shots:req.body.team1Shots,
           team2Shots:req.body.team2Shots,
           team1ShotsOnTarget: req.body.team1ShotsOnTarget,
           team2ShotsOnTarget: req.body.team2ShotsOnTarget,
           team1Posession: req.body.team1Possession,
           team2Posession: req.body.team2Possession,
           team1Passes: req.body.team1Passes,
           team2Passes: req.body.team2Passes,
           team1PassesAccuracy: req.body.team1PassAccuracy,
           team2PassesAccuracy: req.body.team2PassAccuracy,
           team1Fouls: req.body.team1Fouls,
           team2Fouls: req.body.team2Fouls,
           team1YellowCards: req.body.team1YellowCards,
           team2YellowCards: req.body.team2YellowCards,
           team1RedCards: req.body.team1RedCards,
           team2RedCards: req.body.team2RedCards,
           team1Offsides: req.body.team1Offsides,
           team2Offsides: req.body.team2Offsides,
           team1Corners: req.body.team1Corners,
           team2Corners: req.body.team2Corners
       }]
     });
     newMatch.save();
     res.redirect("/addfootballmatch");
     }
   });
});

app.get("/addbasketballmatch", function(req,res){
  res.render("addBasketballMatch");
});

app.post("/addbasketballmatch", function(req,res){
  const season = req.body.basketballMatchSeason;
   Match.findOne({season: season.toLowerCase()}, function(err,foundMatches){
     if(foundMatches){
       foundMatches.basketball.push({
           week: req.body.basketballMatchWeek,
           matchHighlight: req.body.basketballMatchHighlight,
           team1Name: req.body.team1Name,
           team2Name: req.body.team2Name,
           team1Score: req.body.team1Score,
           team2Score: req.body.team2Score,
           team1TotalRebounds: req.body.team1Rebounds,
           team2TotalRebounds: req.body.team2Rebounds,
           team1Offensive: req.body.team1Offensive,
           team2Offensive: req.body.team2Offensive,
           team1Assists: req.body.team1Assists,
           team2Assists: req.body.team2Assists,
           team1Blocks: req.body.team1Blocks,
           team2Blocks: req.body.team2Blocks,
           team1Steals: req.body.team1Steals,
           team2Steals: req.body.team2Steals,
           team1Turnovers: req.body.team1Turnovers,
           team2Turnovers: req.body.team2Turnovers,
           team1PointsInThePaints: req.body.team1PointsInThePaints,
           team2PointsInThePaints: req.body.team2PointsInThePaints,
           team1FoulsPersonal: req.body.team1FoulsPersonal,
           team2FoulsPersonal: req.body.team2FoulsPersonal
       });
       foundMatches.save();
       res.redirect("/addbasketballmatch");
     }else{
       const newMatch = new Match({
         season: season.toLowerCase(),
         basketball:[{
           week: req.body.basketballMatchWeek,
           matchHighlight: req.body.basketballMatchHighlight,
           team1Name: req.body.team1Name,
           team2Name: req.body.team2Name,
           team1Score: req.body.team1Score,
           team2Score: req.body.team2Score,
           team1TotalRebounds: req.body.team1Rebounds,
           team2TotalRebounds: req.body.team2Rebounds,
           team1Offensive: req.body.team1Offensive,
           team2Offensive: req.body.team2Offensive,
           team1Assists: req.body.team1Assists,
           team2Assists: req.body.team2Assists,
           team1Blocks: req.body.team1Blocks,
           team2Blocks: req.body.team2Blocks,
           team1Steals: req.body.team1Steals,
           team2Steals: req.body.team2Steals,
           team1Turnovers: req.body.team1Turnovers,
           team2Turnovers: req.body.team2Turnovers,
           team1PointsInThePaints: req.body.team1PointsInThePaints,
           team2PointsInThePaints: req.body.team2PointsInThePaints,
           team1FoulsPersonal: req.body.team1FoulsPersonal,
           team2FoulsPersonal: req.body.team2FoulsPersonal
       }]
     });
     newMatch.save();
     res.redirect("/addbasketballmatch");
     }
   });
});

app.get("/basketballmatchesresult/:matchId", function(req, res){
  Match.find({},function(err, foundMatch){
    foundMatch.forEach(function(match){
      if(match.season == "fall 2021"){
        match.basketball.forEach(function(matches){
          if(matches._id == req.params.matchId){
             res.render("basketballMatchResult",{
               match:matches
             });
          }
        });
      }
    });
  });
});

app.post("/newsletter", function(req,res){
  const email = req.body.emailAddress;
  const firstName = req.body.firstName;
  const data = {
    members: [
      {
      email_address: email,
      status: "subscribed",
      merge_fields:{
        FNAME: firstName
      }
    }
  ],

};
const jsonData = JSON.stringify(data);

const url = "https://us18.api.mailchimp.com/3.0/lists/50cffd4b0e"; //us18 is the server region and the numbersString at the end of the URL is my API KEY

const options = {
  method: "POST",
  auth: "sportTrend:2318424fb2033b7bf1a9614567fcf589-us18"
};
//options is going to send  post request and authenticate using sportTrend as the username and API key as the password. according to nodejs an

const request = https.request(url, options, function(response){
  if(response.statusCode === 200){
    res.render("successful");
  }else{
    res.render("failure");
  }
  response.on("data", function(data){
    console.log(JSON.parse(data));
  });
});
  //console.log(req.body.emailAddress);

request.write(jsonData);
request.end();
});

app.listen(3000, function() {
  console.log("Server has started at port 3000");
});
//Mail Chimp API key
//2318424fb2033b7bf1a9614567fcf589-us18

//mailChimp listID
//50cffd4b0e
