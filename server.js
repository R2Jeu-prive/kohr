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
  
    socket.on('lolilool', function(data){

    });

    socket.on('disconnect', function() {
        console.log(users.find(user => user.socket_id === socket.id).pseudo + " lost !");
        users.splice(users.findIndex(user => user.socket_id === socket.id),1);
        console.log(users);
    });
});

http.listen(3000, function(){
});
