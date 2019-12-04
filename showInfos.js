  
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
    console.log(queryRes);
    for(var i=0;i<queryRes.length;i++){
        toRet += "<tr onClick='document.location=\"/fifthpage?id="+ queryRes[i]._id +"\"'><td>" + queryRes[i].user + "</td><td>" + queryRes[i].ddepart + "</td><td>" + queryRes[i].ldepart + "</td><td>" + queryRes[i].larrivee + "</td><td>" + placeLeft(queryRes[i].reserved.length, queryRes[i].places) + "</td></tr>"
    }
    return toRet;
}

function annoncesprofilHtml(req, queryRes){
	sesUsername = req.session.username;
    let toRet = ""
    console.log(queryRes);
    for(var i=0;i<queryRes.length;i++){
		if (sesUsername == queryRes[i].user) {
			toRet += "<tr onClick='document.location=\"/fifthpage?id="+ queryRes[i]._id +"\"'><td>" + queryRes[i].ddepart + "</td><td>" + queryRes[i].ldepart + "</td><td>" + queryRes[i].larrivee + "</td><td>" + placeLeft(queryRes[i].reserved, queryRes[i].places) + "</td></tr>"
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
            connect = "Se Déconnecter";
        }else{
            user = "";
            connect = "Se Connecter";
        }
        var query = {};
        if(req.query.search != null){
            query.description = req.query.search;
        }
        dbo.collection("annonces").find(query).toArray(function(err, result){
            queryRes = result;
            res.render("Page1.html",{username:user, annonces: annoncesHtml(queryRes), Date:getDate(), Disco : connect});
        })
        
    });
}

exports.fourthPage = function(req, res){
    sesUsername = req.session.username;
    let queryRes, user, connect;
    // console.log(sesUsername)
    dbo.collection("account").find({username:sesUsername}).toArray(function(err, queryUsername){
        if(err) throw err;
        if(queryUsername.length != 0){
            // console.log(queryUsername);
            user = usernameHtml(sesUsername)
            connect = "Se Déconnecter";
        }else{
            res.render('Page2.html', {tried:"Veuillez vous connecter"})
        }
        var query = {};
        if(req.query.search != null){
            query.description = req.query.search;
        }
        dbo.collection("annonces").find(query).toArray(function(err, result){
            queryRes = result;
            res.render("Page4.html",{username:user, annonces: annoncesprofilHtml(req, queryRes), Date:getDate(), Disco : connect});
        })
        
    });
}