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
    return available - reserved.length + '/' + available;
}

function annoncesHtml(queryRes){
    let toRet = ""
    for(var i=0;i<queryRes;i++){
        toRet += "<tr><td>" + queryRes[i].conducteur + "</td><td>" + result[i].ddepart + "</td><td>" + result[i].ldepart + "</td><td>" + result[i].larrivee + "</td><td>" + placeLeft(result.reserved, result.places) + "</td></tr>"
    }
}

exports.firstPage = function(req, res){
    sesUsername = req.session.username;
    let queryRes, user, connect;
    console.log(sesUsername)
    dbo.collection("account").find({username:sesUsername}).toArray(function(err, queryUsername){
        if(err) throw err;
        if(queryUsername.length != 0){
            console.log(queryUsername);
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
        })
        res.render("Page1.html",{username:user, annonces: annoncesHtml(queryRes), Date:getDate(), Disco : connect})
    });
}