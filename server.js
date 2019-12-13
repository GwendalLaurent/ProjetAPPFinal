var express = require('express');
var consolidate = require('consolidate');
var session = require('express-session');
var app = express ()
//MangoDB connection
var MongoClient = require('mongodb').MongoClient
var mongo = require('mongodb');
var Server = require('mongodb').Server;
var url = 'mongodb://localhost:27017'
var showInfos = require("./showInfos");

function getDate(){
	var options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	var today = new Date();
	var date =  today.toLocaleDateString('en-US', options);
	return date;
}

function alreadyReserved(reservedUser, id){
	for (i = 0; i < reservedUser.length; i++){
		if (id == reservedUser[i]){
		  return true;
		}
	}
	return false;
}

function usernameHtml(username){
    return '<li class="pos"><a class="active" href="/fourthpage">'+ username + '</a></li>';
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
        res.redirect('/firstpage');
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
                    var userAcc = {username: reqUsername, password: reqPassword, Gsm: req.query.Gsm, email: req.query.email, inscription : [], avatar : ""};
					// j'ai ajouté inscription
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

	app.get('/modif', function(req, res){
		var user = req.session.username;
		var prenom = req.query.username;
		var mdp = req.query.password;
		var email = req.query.email;
		var avatar = req.query.avatar;
		if (user != ""){
			db.collection("account").update({username: user}, {username: prenom})
		}
		if (mdp != ""){
			db.collection("account").update({username: user}, {password : mdp})
		}
		if (email != ""){
			db.collection("account").update({username: user}, {email: email})
		}
		if (avatar != ""){
			db.collection("account").update({username: user}, {avatar: avatar})
		}
		if (user != ""){
			db.collection("account").update({username: user}, {username: prenom})
		}
	})
	app.get('/submit', function(req, res){
		var Vdepart = req.query.Vdepart;
		var Varrivee = req.query.Varrivee;
		var DateDepart = req.query.DateDepart;
		var nbrPlaces = req.query.nbrPlaces;
        var sesUsername = req.session.username;
        var requirements = (Array.isArray(req.query.requirements)) ? req.query.requirements : [req.query.requirements];
		if (Vdepart == "" || Varrivee == "" || DateDepart == "" || nbrPlaces == ""){
			res.render('Page3.html', {username: sesUsername, error1 : "ERROR : Veuilliez remplir tous les champs demandés", Disco:"Se déconnecter"});
		}
		else{
			dbo.collection("account").find({username:sesUsername}).toArray(function(err, result){
				var GSM = result[0].Gsm;
				console.log(result[0].Gsm);
				dbo.collection("annonces").insert({user : sesUsername, gsm:GSM, ddepart : DateDepart, ldepart : Vdepart,
				larrivee : Varrivee, reserved: [], places: nbrPlaces, requirements: requirements});
				console.log ("added new annonce.");
				res.render('Page3.html', {username: sesUsername, error1 : "Informations bien enregistrées !", Disco:"Se déconnecter"});
			})
		}
	})

	app.get('/submitReserv', function(req, res){
		if (err) throw err;
		var sesUsername = req.session.username;
		var id = new mongo.ObjectId(req.query.id); //id de l'annonce
		dbo.collection("annonces").find({_id : id}).toArray(function(err, result1){
			var driver = result1[0].user; // nom du posteur de l'annonce
			var gsm = result1[0].gsm;
			var ddepart = result1[0].ddepart;
			var ldepart = result1[0].ldepart;
			var larrivee = result1[0].larrivee;
			var places = result1[0].places;
			var reserved = result1[0].reserved;
			var requirements = result1[0].requirements;
			var nPlaces = (parseInt(result1[0].places) - result1[0].reserved.length);
			if (err) throw err;
			dbo.collection("account").find({username : sesUsername}).toArray(function(err, result){
				if (sesUsername == undefined) {
					res.render('Page2.html');
				}
			else if (alreadyReserved(result[0].inscription,req.query.id)){
				dbo.collection("annonces").update({_id : id}, {$pull:{reserved : sesUsername}});    // si la personne a déjà reservé --> se résile
				dbo.collection("account").update({username : sesUsername}, {$pull:{inscription : id}});
				res.render('Page5.html', {Date: getDate(), ddepart: ddepart, ldepart: ldepart, larrivee: larrivee,
				gsm: gsm, places: nPlaces+1, driver : driver, sesUsername : sesUsername, inscription : "réserver",
				id : req.query.id, exigence: requirements.toString()});
			}else{
				if (nPlaces == 0){     // cas ou il n'y a plus de place
					res.render('Page5.html', {Date: getDate(), ddepart: ddepart, ldepart: ldepart, larrivee: larrivee,
					gsm: gsm, places: 0, driver : driver, sesUsername : sesUsername, inscription : "réserver",
					id : req.query.id, exigence: requirements.toString()});
				}else{
					dbo.collection("annonces").update({_id : id}, {$push:{reserved : sesUsername}}); /// cas ou la personne reserve
					dbo.collection("account").update({username : sesUsername}, {$push:{inscription : id}});
					res.render('Page5.html', {Date: getDate(), ddepart: ddepart, ldepart: ldepart, larrivee: larrivee,
					gsm: gsm, places: nPlaces-1, driver : driver, sesUsername : sesUsername, inscription : "se résilier",
					id : req.query.id, exigence: requirements.toString()});
				}
			}
			})
		})
	})

	app.get('/firstpage', showInfos.firstPage);

    app.get('/secpage', function(req, res) {
		res.render('Page2.html');
    })

	app.get('/thirdpage', function(req, res) {
        sesUsername = req.session.username;
        dbo.collection("account").find({username:sesUsername}).toArray(function(err, result){
            if(err) throw err;
            if (result.length != 0){
				user = usernameHtml(sesUsername)
                res.render('Page3.html', {username:user, Disco:"Se déconnecter"});
            }
            else{
                res.render('Page2.html', {tried:"Veuillez vous connecter"});
            }
        })
    })

	app.get('/fourthpage', showInfos.fourthPage)

    app.get('/fifthpage', function(req, res) {
        var sesUsername = req.session.username;
        var id = new mongo.ObjectId(req.query.id);
        dbo.collection("annonces").find({_id :id}).toArray(function(err, result){
			if(err) throw err;
			var driver = result[0].user; // nom du posteur de l'annonce
			var gsm = result[0].gsm;
			var ddepart = result[0].ddepart;
			var ldepart = result[0].ldepart;
			var larrivee = result[0].larrivee;
			var places = result[0].places;
			var reserved = result[0].reserved;
			var requirements = result[0].requirements;
			var nPlaces = (parseInt(result[0].places) - result[0].reserved.length);
			var user = usernameHtml(sesUsername);
			dbo.collection("account").find({username : sesUsername}).toArray(function(err, result){
				if(err) throw err;
				if (sesUsername == undefined) {
					var inscription = "Connectez vous pour reserver"
					res.render('Page5.html', {Date: getDate(), ddepart: ddepart, ldepart: ldepart, larrivee: larrivee,
					gsm: gsm, places: nPlaces, driver : driver, inscription : inscription,
					id : req.query.id, exigence: requirements.toString(), Disco:"Se Connecter"});
				}
				if (!alreadyReserved(reserved, req.query.id)){
					console.log (reserved);
					if (parseInt(places) - reserved.length <= 0){
						console.log("ici1");
						var inscription = "plus de place";
						res.render('Page5.html', {Date: getDate(), ddepart: ddepart, ldepart: ldepart, larrivee: larrivee,
						gsm: gsm, places: nPlaces, driver : driver, username : user, inscription : inscription,
						id : req.query.id, exigence: requirements.toString(), Disco:"Se déconnecter"});
					}else {
						var inscription = "réserver";
						console.log(user);
						res.render('Page5.html', {Date: getDate(), ddepart: ddepart, ldepart: ldepart, larrivee: larrivee,
						gsm: gsm, places: nPlaces, driver : driver, username : user, inscription : inscription,
						id : req.query.id, exigence: requirements.toString(), Disco:"Se déconnecter"});
					}
				}else{
					var inscription = "se résilier";
					res.render('Page5.html', {Date: getDate(), ddepart: ddepart, ldepart: ldepart, larrivee: larrivee,
					gsm: gsm, places: nPlaces, driver : driver, username : user, inscription : inscription,
					id : req.query.id, exigence: requirements.toString(), Disco:"Se déconnecter"});
				}
			})
		})
        /*dbo.collection("account").find({username : driver}).toArray(function(err, result){
          if (err) throw err;
          //var avatar = result[0].avatar;
        })*/
    })
})

app.use(express.static("static"));
app.listen(8080);
