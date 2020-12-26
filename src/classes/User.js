class User {
    constructor(pseudo,socket_id){
        this.pseudo = pseudo
        this.socket_id = socket_id
    }
    changePseudo(pseudo){
        this.pseudo = pseudo
    }
}

module.exports = User