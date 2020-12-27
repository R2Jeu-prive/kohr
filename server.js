let express = require('express');
var app = require('express')();
var http = require('http').Server(app);
let io = require('socket.io')(http);

const User = require('./src/classes/User.js')
users = [];

const Game = require('./src/classes/Game.js')
games = [];
//users[socket.id] = pseudo;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    tempName = Math.floor(Math.random() * 1000)+1;
    users.push(new User(tempName,socket.id))
    console.log(users);
    socket.emit("setTempName",{tempName : tempName});
  
    socket.on('joinSession', function(data){
        user = users.find(user => user.pseudo == data.tempName)
        if(user == undefined){
            socket.emit("fatalError",{text : "Error #001 | Le tempName fournis ne correspond à aucun joueur connu !"});
        }else{
            user.changePseudo(data.pseudo)
            game = games.find(game => game.gameInfo.maxPlayers > game.players.length)
            if(game == undefined){
                //aucune game vide : on en créé une nouvelle
                //[TODO] ici on met deux joueurs mais ça doit pouvoir être modifié
                game = new Game(user.pseudo,2)
                games.push(game)
            }
            game.playerJoin(user.pseudo)
            socket.emit("showLobby",{gameInfo : game.gameInfo, players : game.players});
        }
    });

    socket.on('disconnect', function() {
        console.log(users.find(user => user.socket_id === socket.id).pseudo + " lost !");
        users.splice(users.findIndex(user => user.socket_id === socket.id),1);
        console.log(users);
    });
});

http.listen(3000, function(){
});
