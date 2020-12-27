export class Piece {
    constructor(x,y,team){
        this.position = [x,y]
        this.team = team
    }
}

export class Queen extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [150,150]
        this.buildingTimeLeft = 3
    }
}

export class Bishop extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [95,95]
        this.buildingTimeLeft = 5
    }
}

export class Knight extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [60,60]
        this.buildingTimeLeft = 1
    }
}

export class Rook extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [200,200]
        this.buildingTimeLeft = 4
    }
}

export class Enchanter extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [25,25]
        this.buildingTimeLeft = 3
    }
}

export class Pawn extends Piece{
    constructor(x,y,team){
        super(x,y,team)
        this.health = [50,50]
        this.buildingTimeLeft = 1
    }
}
