class User {
    constructor(pseudo,socket){
        this.pseudo = pseudo
        this.socket_id = socket.id
    }
    changePseudo(pseudo){
        this.pseudo = pseudo
    }
}

module.exports = User