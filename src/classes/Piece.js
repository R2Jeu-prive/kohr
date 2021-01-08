class Piece {
    constructor(x,y,team){
        this.x = x
        this.y = y
        this.team = team
    }
}

class Queen extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [150,150]
        this.buildingTimeLeft = 3
    }
}

class Bishop extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [95,95]
        this.buildingTimeLeft = 5
    }
}

class Knight extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [60,60]
        this.buildingTimeLeft = 1
    }
}

class Rook extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [200,200]
        this.buildingTimeLeft = 4
    }
}

class Enchanter extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [25,25]
        this.buildingTimeLeft = 3
    }
}

class Pawn extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [50,50]
        this.buildingTimeLeft = 1
    }
}

var piecePrices = {}
piecePrices["Queen"] = [20,0,100,20]
piecePrices["Rook"] = [0,60,0,30]
piecePrices["Bishop"] = [65,0,10,0]
piecePrices["Enchanter"] = [0,0,50,50]
piecePrices["Knight"] = [70,0,30,0]
piecePrices["Pawn"] = [0,20,0,0]

exports.piecePrices = piecePrices
exports.Piece = Piece
exports.Queen = Queen
exports.Bishop = Bishop
exports.Knight = Knight
exports.Rook = Rook
exports.Enchanter = Enchanter
exports.Pawn = Pawn
