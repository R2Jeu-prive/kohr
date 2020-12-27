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
    playerJoin(user){
        this.players.push(user)
        this.players.forEach(player =>
            player.socket.emit("showLobby",{gameInfo : this.gameInfo, players : this.players})
        )
    }
}

module.exports = Game