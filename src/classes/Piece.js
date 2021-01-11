var piecePrices = {}
piecePrices["Queen"] = [20,0,100,20]
piecePrices["Rook"] = [0,60,0,30]
piecePrices["Bishop"] = [65,0,10,0]
piecePrices["Enchanter"] = [0,0,50,50]
piecePrices["Knight"] = [70,0,30,0]
piecePrices["Pawn"] = [0,20,0,0]
var pieceMovePrices = {}
piecePrices["Queen"] = 4
piecePrices["Rook"] = 8
piecePrices["Bishop"] = 3
piecePrices["Enchanter"] = 3
piecePrices["Knight"] = 1
piecePrices["Pawn"] = 1
var piecePossibleMoves = {}
piecePossibleMoves["Queen"] = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[0,-7],[0,-8],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[-1,0],[-2,0],[-3,0],[-4,0],[-5,0],[-6,0],[-7,0],[-8,0],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[-1,1],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7],[-8,8],[-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7],[-8,-8],[1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7],[8,-8]]
piecePossibleMoves["Rook"] = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[0,-7],[0,-8],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[-1,0],[-2,0],[-3,0],[-4,0],[-5,0],[-6,0],[-7,0],[-8,0]]
piecePossibleMoves["Bishop"] = [[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[-1,1],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7],[-8,8],[-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7],[-8,-8],[1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7],[8,-8]]
piecePossibleMoves["Enchanter"] = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,-1],[-1,1],[2,0],[0,2],[-2,0],[0,-2]]
piecePossibleMoves["Knight"] = [[-1,2],[1,2],[2,-1],[2,1],[-2,-1],[-2,1],[-1,-2],[1,-2]]
piecePossibleMoves["Pawn"] = [[0,1]]

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

exports.piecePrices = piecePrices
exports.pieceMovePrices = pieceMovePrices
exports.piecePossibleMoves = piecePossibleMoves
exports.Piece = Piece
exports.Queen = Queen
exports.Bishop = Bishop
exports.Knight = Knight
exports.Rook = Rook
exports.Enchanter = Enchanter
exports.Pawn = Pawn
