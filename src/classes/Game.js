const Core = require('./Building.js')

class Game {
    constructor(masterPseudo,maxPlayers){
        this.gameInfo = {}
        this.gameInfo.name = "Partie de " + masterPseudo
        this.gameInfo.maxPlayers = maxPlayers
        this.gameInfo.status = "lobby"
        this.gameInfo.masterPseudo = masterPseudo
        this.gameInfo.teamNames = ["Equipe A", "Equipe B"]
        this.pieces = []
        this.buildings = []
        this.players = []
        this.stats = [[0,0,0,0,0],[0,0,0,0,0]]
        this.last_timestamp = 0;
    }
    tryStartGame(){
        if(this.players.length == this.gameInfo.maxPlayers){
            this.buildings.push(new Core(this.maxPlayers,0))
            this.buildings.push(new Core(this.maxPlayers,1))
        }
    }
    playerJoin(user,io){
        let self = this
        this.players.push(user)
        this.players.forEach(player =>
            io.to(player.socket_id).emit("showLobby",{gameInfo : this.gameInfo, players : this.players})
        )
        if(this.players.length == this.gameInfo.maxPlayers){
            console.log("game is full")
            setTimeout(function(){
                self.tryStartGame()
            }, 3000);
        }
    }
    playerLeave(user,io){
        if(this.players.find(player => player == user) != undefined){
            this.players.splice(this.players.findIndex(player => player == user),1);
            this.players.forEach(player =>
                io.to(player.socket_id).emit("showLobby",{gameInfo : this.gameInfo, players : this.players})
            )
        }
    }
}

module.exports = Game
