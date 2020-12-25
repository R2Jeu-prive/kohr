let express = require('express');
var app = require('express')();
var http = require('http').Server(app);
let io = require('socket.io')(http);
users = {};
//users[socket.id] = pseudo;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    tempName = Math.floor(Math.random() * 1000)+1;
    users[socket.id] = tempName;
    console.log(users);
    socket.emit("setTempName",{tempName : tempName});
  
    socket.on('lolilool', function(data){

    });

    socket.on('disconnect', function() {
        pseudo = users[socket.id];
        console.log(pseudo + " lost !")
        delete users[socket.id];
    });
});

http.listen(3000, function(){
});
