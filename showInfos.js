var mongo = require('mongodb');

function getDate(){
    var options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var today = new Date();
    var date =  today.toLocaleDateString('en-US', options);
    return date;
}


function usernameHtml(username){
    return '<li class="pos"><a class="active" href="/fourthpage">'+ username + '</a></li>';
}

function placeLeft(reserved, available){
    return available - reserved + '/' + available; // TODO reserved.length when reserved will be a list 
}

function annoncesHtml(queryRes){
    let toRet = ""
    //console.log(queryRes);
    for(var i=0;i<queryRes.length;i++){
        toRet += "<tr onClick='document.location=\"/fifthpage?id="+ queryRes[i]._id +"\"'><td>" + queryRes[i].user + "</td><td>" + queryRes[i].ddepart + "</td><td>" + queryRes[i].ldepart + "</td><td>" + queryRes[i].larrivee + "</td><td>" + placeLeft(queryRes[i].reserved.length, queryRes[i].places) + "</td></tr>"
    }
    return toRet;
}

function formatQuery(query, searchParam){ //carefull inputs need to be in a list format and they have to have the same length
    //console.log(query);
    if(query.length != searchParam.length){
        console.log("formatQuery input format not respected");
        return {};
    }
    let format = {};
    for(var i=0;i<query.length;i++){
        if(query[i] != ""){
            format[searchParam[i]] = query[i];
        }
    }
    //console.log(format);
    return format;
}

function getIds(ids){
    var output= [];
    for(id in ids){
        output.push(mongo.ObjectID(id));
    }
    console.log(output);
    return output;
}

function annoncesprofilHtml(req, queryRes, testUsername=true){
	sesUsername = req.session.username;
    let toRet = ""
    // console.log(queryRes);
    for(var i=0;i<queryRes.length;i++){
		if (sesUsername == queryRes[i].user || !testUsername) {
			toRet += "<tr onClick='document.location=\"/fifthpage?id="+ queryRes[i]._id +"\"'><td>" + queryRes[i].ddepart + "</td><td>" + queryRes[i].ldepart + "</td><td>" + queryRes[i].larrivee + "</td><td>" + placeLeft(queryRes[i].reserved.length, queryRes[i].places) + "</td></tr>"
		}
    }
    return toRet;
}

exports.firstPage = function(req, res){
    sesUsername = req.session.username;
    let queryRes, user, connect;
    // console.log(sesUsername)
    dbo.collection("account").find({username:sesUsername}).toArray(function(err, queryUsername){
        if(err) throw err;
        if(queryUsername.length != 0){
            // console.log(queryUsername);
            user = usernameHtml(sesUsername)
            connect = "Se déconnecter";
        }else{
            user = "";
            connect = "Se connecter";
        }
        var query = {};
        if(req.query.search != null){
            query = formatQuery(req.query.search,['ldepart', 'larrivee']);
        }
        dbo.collection("annonces").find(query).toArray(function(err, result){
            queryRes = result;
            if(result.length == 0){
                var noResults = "<tr><td colspan='5' class='noResult'>Pas d'annonce trouvée</td></tr>";
                res.render("Page1.html",{username:user, annonces: noResults, Date:getDate(), Disco : connect});
            }
            res.render("Page1.html",{username:user, annonces: annoncesHtml(queryRes), Date:getDate(), Disco : connect});
        })
        
    });
}

exports.fourthPage = function(req, res){
    sesUsername = req.session.username;
    var error = (req.query.error)? "Nom d'utilisateur déja utilisé" : "";
    if(sesUsername == null){
        res.redirect('/secpage');
        return;
    }
    let queryRes, user, connect;
    // console.log(sesUsername)
    dbo.collection("account").find({username:sesUsername}).toArray(function(err, queryUsername){
        if(err) throw err;
        if(queryUsername.length != 0){
            // console.log(queryUsername);
            user = usernameHtml(sesUsername)
            connect = "Se déconnecter";
        }else{
            res.render('Page2.html', {tried:"Veuillez vous connecter"})
        }
        var query = {};
        if(req.query.search != null){
            query.description = req.query.search;
        }
        dbo.collection("annonces").find({user: sesUsername}).toArray(function(err, result){
            var annoncePost = (result.length == 0)? "<tr><td colspan='5' class='noResult'>Pas d'annonce trouvée</td></tr>" : annoncesprofilHtml(req, result);
            // console.log(queryUsername[0].inscription);
            dbo.collection("annonces").find({_id: {$in: queryUsername[0].inscription}}).toArray(function(err, annonceInscrit){
                console.log(annonceInscrit);
                console.log(queryUsername[0].inscription);
                var annonceRegister = (annonceInscrit.length == 0)? "<tr><td colspan='5' class='noResult'>Pas d'annonce trouvée</td></tr>" : annoncesprofilHtml(req, annonceInscrit, false);
                res.render("Page4.html",{username:user, annonces: annoncePost, annoncesInsc: annonceRegister, Date:getDate(), Disco : connect, signError: error});
            })
        })
        
    });
}