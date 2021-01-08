let express = require('express');
var app = require('express')();
var http = require('http').Server(app);
let io = require('socket.io')(http);

const User = require('./src/classes/User.js')
users = [];

const Game = require('./src/classes/Game.js')
games = [];
//users[socket.id] = pseudo;

function addRoute(search,path){
    app.get(search , function(req, res){
        res.sendFile(__dirname + path);
    });
}

function getUserBySocket(socket){
    return users.find(user => user.socket_id == socket.id)
}

addRoute("/","/index.html")
addRoute("/css/index","/web/css/index.css")

io.on('connection', function(socket){
    tempName = "#" + Math.floor(Math.random() * 1000)+1;
    users.push(new User(tempName,socket))
    socket.emit("setTempName",{tempName : tempName});
  
    socket.on('joinSession', function(data){
        if(!/^[a-z0-9]*$/.test(data.pseudo)){
            socket.emit("showError",{text : "Pseudo Invalid"})
            return
        }
        user = users.find(user => user.socket_id == socket.id)
        if(user == undefined){
            socket.emit("fatalError",{text : "Error #001 | Le socket ne colle pas !"});
            return
        }
        if(users.find(user => user.pseudo == data.pseudo) != undefined){
            socket.emit("showError",{text : "Un joueur existe déjà avec ce pseudo"})
            return
        }
        user.changePseudo(data.pseudo)
        game = games.find(game => game.gameInfo.maxPlayers > game.players.length)
        if(game == undefined){
            //aucune game vide : on en créé une nouvelle
            //[TODO] ici on met deux joueurs mais ça doit pouvoir être modifié
            game = new Game(user.pseudo,2)
            games.push(game)
        }
        user.setTeam(game.getSmallestTeam())
        game.playerJoin(user,io)
    });

    socket.on('buildingBuild',function(data){
        user = getUserBySocket(socket)
        if(user == undefined){
            return //user WTF
        }
        games.forEach(function(game){
            if(game.isUserConnected(user)){
                if(data.lastTimeStamp == game.lastTimeStamp && user.team == game.gameInfo.teamPlaying){
                    if(game.canBuildingBuild(data.type, data.x, data.y, data.atMiddle, user.team)){
                        date = new Date()
                        newTimeStamp = date.getDate() //returns miliseconds since 1970
                        game.buildingBuild(data.type, data.x, data.y, data.atMiddle, user.team, newTimeStamp, io)
                    }
                }else{
                    game.refreshPlayer(user, io)
                }
            }
        })
    })

    socket.on('buildingEdit',function(data){
        user = getUserBySocket(socket)
        if(user == undefined){
            return //user WTF
        }
        games.forEach(function(game){
            if(game.isUserConnected(user)){
                if(data.lastTimeStamp == game.lastTimeStamp && user.team == game.gameInfo.teamPlaying){
                    if(game.canBuildingEdit(data.edit, data.x, data.y, data.atMiddle, user.team)){
                        date = new Date()
                        newTimeStamp = date.getDate() //returns miliseconds since 1970
                        game.buildingEdit(data.edit, data.x, data.y, data.atMiddle, user.team, newTimeStamp, io)
                    }
                }else{
                    game.refreshPlayer(user, io)
                }
            }
        })
    })

    socket.on('buildingDelete',function(data){
        user = getUserBySocket(socket)
        if(user == undefined){
            return //user WTF
        }
        games.forEach(function(game){
            if(game.isUserConnected(user)){
                if(data.lastTimeStamp == game.lastTimeStamp && user.team == game.gameInfo.teamPlaying){
                    if(game.canBuildingDelete(data.x, data.y, data.atMiddle, user.team)){
                        date = new Date()
                        newTimeStamp = date.getDate() //returns miliseconds since 1970
                        game.buildingDelete(data.x, data.y, data.atMiddle, user.team, newTimeStamp, io)
                    }
                }else{
                    game.refreshPlayer(user, io)
                }
            }
        })
    })

    socket.on('pieceBuild',function(data){
        user = getUserBySocket(socket)
        if(user == undefined){
            return //user WTF
        }
        games.forEach(function(game){
            if(game.isUserConnected(user)){
                if(data.lastTimeStamp == game.lastTimeStamp && user.team == game.gameInfo.teamPlaying){
                    if(game.canPieceBuild(data.type, data.x, data.y, user.team)){
                        date = new Date()
                        newTimeStamp = date.getDate() //returns miliseconds since 1970
                        game.pieceBuild(data.type, data.x, data.y, user.team, newTimeStamp, io)
                    }
                }else{
                    game.refreshPlayer(user, io)
                }
            }
        })
    })

    socket.on('disconnect', function() {
        leavingUser = users.find(user => user.socket_id === socket.id)

        //check games
        games.forEach(game => game.playerLeave(leavingUser,io))

        //remove user
        console.log(leavingUser.pseudo + " lost !");
        users.splice(users.findIndex(user => user.socket_id === socket.id),1);
    });
});

http.listen(3000, function(){
});
