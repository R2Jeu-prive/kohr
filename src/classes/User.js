class User {
    constructor(pseudo,socket){
        this.pseudo = pseudo
        this.socket_id = socket.id
        this.team = -1
    }
    changePseudo(pseudo){
        this.pseudo = pseudo
    }
    setTeam(team){
        this.team = team
    }
}

module.exports = User