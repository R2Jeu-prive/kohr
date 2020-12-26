class Game {
    constructor(masterPseudo,duo){
        this.gameinfo = {}
        this.gameinfo.name = "Partie des Anonymous"
        this.gameinfo.duo = duo
        this.gameinfo.status = "lobby"
        this.gameinfo.masterPseudo = masterPseudo
        this.pieces = []
        this.buildings = []
        this.players = []
        this.stats = [[0,0,0,0,0],[0,0,0,0,0]]
        this.last_timestamp = 0;
    }
}

module.exports = User