let express = require('express');
var app = require('express')();
var http = require('http').Server(app);
let io = require('socket.io')(http);

const User = require('./src/classes/User.js')
users = [];

const Game = require('./src/classes/Game.js')
games = [];

function addRoute(search,path){
    app.get(search , function(req, res){
        res.sendFile(__dirname + path);
    });
}

function getUserBySocket(socket){
    return users.find(user => user.socket_id == socket.id)
}
function getUserByPseudo(pseudo){
    return users.find(user => user.pseudo == pseudo)
}
function deleteGame(gameToDelete,deleteConfirm){
    if(deleteConfirm){
        games.splice(games.findIndex(game => game == gameToDelete),1)
    }
}

addRoute("/","/index.html")

addRoute("/css/utility","/web/css/utility.css")
addRoute("/css/login","/web/css/login.css")
addRoute("/css/lobby","/web/css/lobby.css")
addRoute("/css/game","/web/css/game.css")

addRoute("/js/landscape","/web/js/landscape.js")

addRoute("/img/energybar_under","/web/img/energy_bar_under.png")
addRoute("/img/energybar_above","/web/img/energy_bar_upper.png")

addRoute("/piece/blue_pawn", "/web/img/piece/blue_pawn.png")
addRoute("/piece/blue_enchanter", "/web/img/piece/blue_enchanter.png")
addRoute("/piece/blue_knight", "/web/img/piece/blue_knight.png")
addRoute("/piece/blue_rook", "/web/img/piece/blue_rook.png")
addRoute("/piece/blue_bishop", "/web/img/piece/blue_bishop.png")
addRoute("/piece/blue_queen", "/web/img/piece/blue_queen.png")

addRoute("/piece/red_pawn", "/web/img/piece/red_pawn.png")
addRoute("/piece/red_enchanter", "/web/img/piece/red_enchanter.png")
addRoute("/piece/red_knight", "/web/img/piece/red_knight.png")
addRoute("/piece/red_rook", "/web/img/piece/red_rook.png")
addRoute("/piece/red_bishop", "/web/img/piece/red_bishop.png")
addRoute("/piece/red_queen", "/web/img/piece/red_queen.png")

addRoute("/building/blue_extractor", "/web/img/building/blue_extractor.png")
addRoute("/building/blue_wall", "/web/img/building/blue_wall.png")
addRoute("/building/blue_workshop", "/web/img/building/blue_workshop.png")
addRoute("/building/blue_battery", "/web/img/building/blue_battery.png")
addRoute("/building/blue_heavy", "/web/img/building/blue_heavy.png")
addRoute("/building/blue_light", "/web/img/building/blue_light.png")
addRoute("/building/blue_core", "/web/img/building/blue_core.png")

addRoute("/building/red_extractor", "/web/img/building/red_extractor.png")
addRoute("/building/red_wall", "/web/img/building/red_wall.png")
addRoute("/building/red_heavy", "/web/img/building/red_heavy.png")
addRoute("/building/red_light", "/web/img/building/red_light.png")
addRoute("/building/red_core", "/web/img/building/red_core.png")

addRoute("/icon/energy_prod", "/web/img/icons/energy_prod.png")
addRoute("/icon/energy", "/web/img/icons/energy.png")
addRoute("/icon/copper", "/web/img/icons/copper.png")
addRoute("/icon/titanium", "/web/img/icons/titanium.png")
addRoute("/icon/gold", "/web/img/icons/gold.png")
addRoute("/icon/ruby", "/web/img/icons/ruby.png")

io.on('connection', function(socket){
    tempName = "#" + Math.floor(Math.random() * 1000)+1;
    users.push(new User(tempName,socket))
    socket.emit("setTempName",{tempName : tempName});
  
    socket.on('joinSession', function(data){
        if(!/^[a-z0-9àäâéèëêïîôûùç\-_]*/i.test(data.pseudo)){
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
        game = games.find(game => game.disconnectedPlayers.find(player => player.pseudo == user.pseudo) != undefined)
        if(game == undefined){
            game = games.find(game => game.gameInfo.maxPlayers > game.players.length && game.gameInfo.status == "lobby")
        }else{
            user.setTeam(game.disconnectedPlayers.find(player => player.pseudo == user.pseudo).team)
            game.playerReconnect(user,io)
            return
        }
        if(game == undefined){
            //aucune game vide : on en créé une nouvelle
            //[TODO] ici on met deux joueurs mais ça doit pouvoir être modifié
            game = new Game(user.pseudo,2)
            games.push(game)
        }
        user.setTeam(game.getSmallestTeam())
        game.playerJoin(user,io)
    });

    socket.on('playerKick',function(data){
        user = getUserBySocket(socket)
        if(user == undefined){
            return //user WTF
        }
        games.forEach(function(game){
            if(game.isUserConnected(user)){
                if(user.pseudo == data.pseudoToKick){
                    deleteGame(game,game.playerLeave(user, true, io))
                    socket.emit("leaveSession");
                    //refresh is sent from playerLeave function
                }else if(user.pseudo == game.gameInfo.masterPseudo && game.gameInfo.status == "lobby"){
                    deleteGame(game,game.playerLeave(getUserByPseudo(data.pseudoToKick), false, io))
                }else{
                    socket.emit("fatalError",{text : "Error #002 | Vous ne pouvez pas kick ce joueur !"});
                }
            }
        })
    })
    socket.on('playerSwitchTeam',function(data){
        user = getUserBySocket(socket)
        if(user == undefined){
            return //user WTF
        }
        games.forEach(function(game){
            if(game.isUserConnected(user) && game.gameInfo.status == "lobby"){
                if(user.pseudo == data.pseudoToSwitch){
                    user.setTeam(Math.abs(user.team - 1))
                    game.refreshAllLobby(io)
                }else if(user.pseudo == game.gameInfo.masterPseudo){
                    getUserByPseudo(data.pseudoToSwitch).setTeam(Math.abs(getUserByPseudo(data.pseudoToSwitch).team - 1))
                    game.refreshAllLobby(io)
                }else{
                    socket.emit("fatalError",{text : "Error #003 | Vous ne pouvez pas faire changer d'équipe ce joueur !"});
                }
            }
        })
    })
    socket.on('gameStart',function(){
        user = getUserBySocket(socket)
        if(user == undefined){
            return //user WTF
        }
        games.forEach(function(game){
            if(game.isUserConnected(user) && game.gameInfo.status == "lobby"){
                if(user.pseudo == game.gameInfo.masterPseudo){
                    game.tryStartGame(io)
                    game.pieceBuild("Pawn",2,5,0,456456,io)
                    game.pieceBuild("Pawn",7,7,0,456456,io)
                    game.pieceBuild("Pawn",1,1,0,456456,io)
                    game.pieceBuild("Pawn",1,7,0,456456,io)
                    game.pieceBuild("Pawn",7,1,0,456456,io)
                    game.pieceBuild("Pawn",2,3,0,456456,io)
                }else{
                    socket.emit("fatalError",{text : "Error #004 | Vous ne pouvez pas lancer cette partie !"});
                }
            }
        })
    })
    socket.on('gameChangeMode',function(){
        user = getUserBySocket(socket)
        if(user == undefined){
            return //user WTF
        }
        games.forEach(function(game){
            if(game.isUserConnected(user) && game.gameInfo.status == "lobby"){
                if(user.pseudo == game.gameInfo.masterPseudo){
                    game.gameInfo.maxPlayers = -1 * game.gameInfo.maxPlayers + 6 // 2->4 and 4->2
                    if(game.players.length > game.gameInfo.maxPlayers){
                        game.gameInfo.maxPlayers = -1 * game.gameInfo.maxPlayers + 6 // 2->4 and 4->2
                        socket.emit("showError",{text : "Il y a trop de joueurs dans la partie pour passer en 1vs1"})
                    }else{
                        game.refreshAllLobby(io)
                    }
                }else{
                    socket.emit("fatalError",{text : "Error #005 | Vous ne pouvez pas changer le mode de cette partie !"});
                }
            }
        })
    })

    socket.on('buildingBuild',function(data){
        user = getUserBySocket(socket)
        if(user == undefined){
            return //user WTF
        }
        games.forEach(function(game){
            if(game.isUserConnected(user) && game.gameInfo.status == "game"){
                if(data.lastTimeStamp == game.lastTimeStamp && user.team == game.gameInfo.teamPlaying){
                    if(game.canBuildingBuild(data.type, data.x, data.y, data.atMiddle, user.team)){
                        var newTimeStamp =  Date.now() //returns miliseconds since 1970
                        game.buildingBuild(data.type, data.x, data.y, data.atMiddle, user.team, newTimeStamp, io)
                    }
                }else{
                    game.refreshPlayerGame(user, io)
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
            if(game.isUserConnected(user) && game.gameInfo.status == "game"){
                if(data.lastTimeStamp == game.lastTimeStamp && user.team == game.gameInfo.teamPlaying){
                    if(game.canBuildingEdit(data.edit, data.x, data.y, data.atMiddle, user.team)){
                        var newTimeStamp =  Date.now() //returns miliseconds since 1970
                        game.buildingEdit(data.edit, data.x, data.y, data.atMiddle, user.team, newTimeStamp, io)
                    }
                }else{
                    game.refreshPlayerGame(user, io)
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
            if(game.isUserConnected(user) && game.gameInfo.status == "game"){
                if(data.lastTimeStamp == game.lastTimeStamp && user.team == game.gameInfo.teamPlaying){
                    if(game.canBuildingDelete(data.x, data.y, data.atMiddle, user.team)){
                        var newTimeStamp =  Date.now() //returns miliseconds since 1970
                        game.buildingDelete(data.x, data.y, data.atMiddle, user.team, user.team, newTimeStamp, io)
                    }
                }else{
                    game.refreshPlayerGame(user, io)
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
            if(game.isUserConnected(user) && game.gameInfo.status == "game"){
                if(data.lastTimeStamp == game.lastTimeStamp && user.team == game.gameInfo.teamPlaying){
                    if(game.canPieceBuild(data.type, data.x, data.y, user.team)){
                        var newTimeStamp =  Date.now() //returns miliseconds since 1970
                        game.pieceBuild(data.type, data.x, data.y, user.team, newTimeStamp, io)
                    }
                }else{
                    game.refreshPlayerGame(user, io)
                }
            }
        })
    })
    socket.on('pieceMove',function(data){
        user = getUserBySocket(socket)
        if(user == undefined){
            return //user WTF
        }
        games.forEach(function(game){
            if(game.isUserConnected(user) && game.gameInfo.status == "game"){
                if(data.lastTimeStamp == game.lastTimeStamp && user.team == game.gameInfo.teamPlaying){
                    if(game.canPieceMove(data.startX, data.startY, data.endX, data.endY, user.team)){
                        var newTimeStamp =  Date.now() //returns miliseconds since 1970
                        game.pieceMove(data.startX, data.startY, data.endX, data.endY, newTimeStamp, io)
                    }
                }else{
                    game.refreshPlayerGame(user, io)
                }
            }
        })
    })
    socket.on('pieceAttack',function(data){
        user = getUserBySocket(socket)
        if(user == undefined){
            return //user WTF
        }
        games.forEach(function(game){
            if(game.isUserConnected(user) && game.gameInfo.status == "game"){
                if(data.lastTimeStamp == game.lastTimeStamp && user.team == game.gameInfo.teamPlaying){
                    if(game.canPieceAttack(data.startX, data.startY, data.endX, data.endY, data.attackType, user.team)){
                        var newTimeStamp =  Date.now() //returns miliseconds since 1970
                        game.pieceAttack(data.startX, data.startY, data.endX, data.endY, data.attackType, user.team, newTimeStamp, io)
                    }
                }else{
                    game.refreshPlayerGame(user, io)
                }
            }
        })
    })

    socket.on('disconnect', function() {
        leavingUser = users.find(user => user.socket_id === socket.id)

        //check games
        games.forEach(game => deleteGame(game,game.playerLeave(leavingUser, true, io)))

        //remove user
        console.log(leavingUser.pseudo + " lost !");
        users.splice(users.findIndex(user => user.socket_id === socket.id),1);
    });
});

http.listen(3000, function(){
});
