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

addRoute("/","/index.html")
addRoute("/css/index","/web/css/index.css")

io.on('connection', function(socket){
    tempName = "#" + Math.floor(Math.random() * 1000)+1;
    users.push(new User(tempName,socket))
    console.log(users);
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
        game.playerJoin(user,io)
    });

    socket.on('disconnect', function() {
        leavingUser = users.find(user => user.socket_id === socket.id)

        //check games
        games.forEach(game => game.playerLeave(leavingUser,io))

        //remove user
        console.log(leavingUser.pseudo + " lost !");
        users.splice(users.findIndex(user => user.socket_id === socket.id),1);
        console.log(users);
    });
});

http.listen(3000, function(){
});
