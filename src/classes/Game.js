class Game {
    constructor(masterPseudo,maxPlayers){
        this.gameinfo = {}
        this.gameinfo.name = "Partie des Anonymous"
        this.gameinfo.maxPlayers = maxPlayers
        this.gameinfo.status = "lobby"
        this.gameinfo.masterPseudo = masterPseudo
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