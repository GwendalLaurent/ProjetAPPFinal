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
        res.render('Page1.html',{Date:getDate(), Disco:"Se connecter"});
    })
	
	app.get('/sign_in', function(req, res){
        var reqUsername = req.query.username;
        var reqPassword = req.query.password;
        dbo.collection("account").find({username:reqUsername}).toArray(function(err, result){
            if(err) throw err;
            if (result.length != 0){
                //accout already exist
                console.log("Try to create a new account with an username which is already taken:");
                console.log(reqUsername);
                console.log("-------------");
                res.render('Page2.html',{signError:"Ce nom d'utilisateur existe déja"})
            }else{
                console.log(result);
                if(reqUsername == "" || reqPassword == "" || req.query.full_name == "" || req.query.email == ""){
                    res.render('Page2.html', {signError: "Veuillez remplir tous les champs"});
                }
                else{
                    var userAcc = {username: reqUsername, password: reqPassword, fullName: req.query.full_name, email: req.query.email};
                    dbo.collection("account").insertOne(userAcc, function(err, res) {
                        if (err) throw err;
                        console.log("added new user");
                    });
                    res.render('Page2.html');
                }
            }
        });
    })
	
	app.get('/log', function(req, res){
        var reqUsername = req.query.username;
        var reqPassword = req.query.password;

        dbo.collection("account").find({username:reqUsername}).toArray(function(err, result){ //finding in the DB the data for the username
            if(err) throw err;
            var pass = result[0].password; //get the password from the DB
            console.log("Connection attempt with:")
            console.log(result[0].password);
            if(pass == reqPassword){ //test if the password given by the user is good
                req.session.username = reqUsername;
                console.log("User connected with:")
                console.log(req.session.username);
                console.log("-------------")
                res.redirect('/firstpage');
            }else{
                console.log("-------------")
                res.render('Page2.html',{tried:"Mot de passe ou/et nom d'utilisateur incorrects"})
            }
        });
    })
	
	app.get('/disconnect', function(req, res){
        req.session.username = "";
        res.redirect('/secpage');
    })
	
	app.get('/firstpage', function(req, res) {
		if(req.session.username){
			var query = {};
			if(req.query.search != null){
				query.description = req.query.search;
			}
			dbo.collection("annonces").find(query).toArray(function(err, result){
				var table = "";
				for(var i=0;i<result.length;i++){
					table += "<tr><td>" + result[i].description + "</td><td class='adresse'>" + result[i].Adresse + "</td><td class='username'>" + result[i].user + "</td><td class='date'>" + result[i].date + "</td></tr>"
				}
				res.render('Page1.html', {username:req.session.username, Date:getDate(), accidents:table, Disco:"Se déconnecter"});
			})
			
		}
		else{
			res.render('Page1.html',{Date:getDate(), accidents:table, Disco:"Se connecter"});
		}
	})

    app.get('/secpage', function(req, res) {
        res.render('Page2.html');
    })
	
	app.get('/thirdpage', function(req, res) {
        sesUsername = req.session.username;
        dbo.collection("account").find({username:sesUsername}).toArray(function(err, result){
            if(err) throw err;
            if (result.length != 0){
                res.render('Page3.html', {username:sesUsername});
            }
            else{
                res.render('Page2.html', {tried:"Veuillez vous connecter"});
            }
        })
    })
	
	app.get('/fourthpage', function(req, res) {
        sesUsername = req.session.username;
        dbo.collection("account").find({username:sesUsername}).toArray(function(err, result){
            if(err) throw err;
            if (result.length != 0){
                res.render('Page4.html', {username:sesUsername});
            }
            else{
                res.render('Page2.html', {tried:"Veuillez vous connecter"});
            }
        })
    })

    app.use(express.static("static"));
    app.listen(8080);
})