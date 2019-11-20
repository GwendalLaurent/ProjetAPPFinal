var express = require('express');
var consolidate = require('consolidate');
var session = require('express-session');
var app = express ()
//MangoDB connection
var MongoClient = require('mongodb').MongoClient
var Server = require('mongodb').Server;
var url = 'mongodb://localhost:27017'

function getDate(){
    var options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today = new Date();
    var date =  today.toLocaleDateString('en-US', options);
    return date;
}

MongoClient.connect(url, function(err, db){
    dbo = db.db("projetFinal");
    if(err) throw err;
    else console.log("Successfull connection to Database");

    app.engine('html', consolidate.hogan);
    app.set("views", "static");

    app.use(session({
        secret: "projetPrepa",
        resave: false,
        cookie: {
            path: "/",
            httpOnly: true,
            maxAge: 3600000
        }
    }));

    app.get('/', function(req, res){
        res.render("Page1.html");
    })

    app.use(express.static("static"));
    app.listen(8080);
})