class Building {
    constructor(x,y,atMiddle,team){
        this.x = x
        this.y = y
        this.atMiddle = atMiddle
        this.team = team
    }
}

class Core extends Building {
    constructor(maxPlayers,team){
        if(maxPlayers == 2 && team == 0){
            var x = 4
            var y = 1
        }else if(maxPlayers == 2 && team == 1){
            var x = 4
            var y = 7
        }else if(maxPlayers == 4 && team == 0){
            var x = 5
            var y = 1
        }else if(maxPlayers == 4 && team == 1){
            var x = 5
            var y = 9
        }
        super(x,y,true,team)
        if(maxPlayers == 2){
            this.health = [500,500]
        }else if(maxPlayers == 4){
            this.health = [1000,1000]
        }
    }
}

class Extractor extends Building {
    constructor(ressource,x,y,atMiddle,team){
        super(x,y,atMiddle,team)
        this.health = [20,20]
        this.level = 1
        this.inventory = [0,250,ressource]
    }
    countNeighbours(gameBuildings){
        var neighbours = 0
        gameBuildings.forEach(function(building){
            if(Math.abs(building.x - this.x) + Math.abs(building.y - this.y) == 1 && building.atMiddle == this.atMiddle && building.inventory[2] == this.inventory[2]){
                neighbours = neighbours + 1
            }
        },this)
        return neighbours
    }
}

class Workshop extends Building {
    constructor(x,y,atMiddle,team){
        super(x,y,atMiddle,team)
        this.health = [10,10]
    }
}

class Wall extends Building {
    constructor(x,y,team){
        super(x,y,true,team)
        this.health = [50,50]
        this.level = 1
    }
}

class Battery extends Building {
    constructor(x,y,team){
        super(x,y,false,team)
        this.health = [10,10]
    }
}

class LightArmory extends Building {
    constructor(x,y,atMiddle,team){
        super(x,y,atMiddle,team)
        this.health = [40,40]
    }
}

class HeavyArmory extends Building {
    constructor(x,y,atMiddle,team){
        super(x,y,atMiddle,team)
        this.health = [50,50]
    }
}

exports.Building = Building
exports.Core = Core
exports.Extractor = Extractor
exports.Workshop = Workshop
exports.Wall = Wall
exports.Battery = Battery
exports.LightArmory = LightArmory
exports.HeavyArmory = HeavyArmory
