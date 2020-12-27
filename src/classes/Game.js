class Game {
    constructor(masterPseudo,maxPlayers){
        this.gameInfo = {}
        this.gameInfo.name = "Partie des Anonymous"
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
    playerJoin(pseudo){
        this.players.push(pseudo)
    }
}

module.exports = Game