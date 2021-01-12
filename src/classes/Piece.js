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
var piecePossibleAttacks = {}
piecePossibleAttacks["Queen"] = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[0,-7],[0,-8],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[-1,0],[-2,0],[-3,0],[-4,0],[-5,0],[-6,0],[-7,0],[-8,0],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[-1,1],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7],[-8,8],[-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7],[-8,-8],[1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7],[8,-8]]
piecePossibleAttacks["Rook"] = [[0,0]]
piecePossibleAttacks["Bishop"] = [[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[-1,1],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7],[-8,8],[-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7],[-8,-8],[1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7],[8,-8]]
piecePossibleAttacks["Enchanter"] = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[1,-1],[-1,-1],[-1,1]]
piecePossibleAttacks["Knight"] = [[-1,2],[1,2],[2,-1],[2,1],[-2,-1],[-2,1],[-1,-2],[1,-2]]
piecePossibleAttacks["Pawn"] = [[1,1],[-1,1]]
var pieceAttacks = {}
pieceAttacks["queenSoft"] = [50,1]
pieceAttacks["queenHard"] = [80,2]
pieceAttacks["diagonalSuicide"] = [30,2]
pieceAttacks["healing"] = [0,3]
pieceAttacks["jumping"] = [30,1]
pieceAttacks["simpleAttack"] = [25,1]
pieceAttacks["enchant"] = [0,2]

class Piece {
    constructor(x,y,team,health){
        this.x = x
        this.y = y
        this.team = team
        this.health = health
    }
    changeCoords(x,y){
        this.x = x
        this.y = y
    }
    hit(damage){
        this.health = this.health - damage
        return this.health <= 0 //piece is destroyed from attack
    }
}

class Queen extends Piece{
    constructor(x,y,team){
        super(x,y,team,150)
        this.buildingTimeLeft = 3
        this.attacks = ["queenSoft","queenHard"]
    }
}

class Bishop extends Piece{
    constructor(x,y,team){
        super(x,y,team,95)
        this.buildingTimeLeft = 5
        this.attacks = ["diagonalSuicide"]
    }
}

class Knight extends Piece{
    constructor(x,y,team){
        super(x,y,team,60)
        this.buildingTimeLeft = 1
        this.attacks = ["jumping"]
    }
}

class Rook extends Piece{
    constructor(x,y,team){
        super(x,y,team,200)
        this.buildingTimeLeft = 4
        this.attacks = ["healing"]
    }
}

class Enchanter extends Piece{
    constructor(x,y,team){
        super(x,y,team,25)
        this.buildingTimeLeft = 3
        this.attacks = ["enchant"]
    }
}

class Pawn extends Piece{
    constructor(x,y,team){
        super(x,y,team,50)
        this.buildingTimeLeft = 1
        this.attacks = ["simpleAttack"]
    }
}

exports.piecePrices = piecePrices
exports.pieceMovePrices = pieceMovePrices
exports.piecePossibleMoves = piecePossibleMoves
exports.piecePossibleAttacks = piecePossibleAttacks
exports.pieceAttacks = pieceAttacks
exports.Piece = Piece
exports.Queen = Queen
exports.Bishop = Bishop
exports.Knight = Knight
exports.Rook = Rook
exports.Enchanter = Enchanter
exports.Pawn = Pawn
