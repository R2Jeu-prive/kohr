class Building {
    constructor(x,y,atMiddle,team,health,type){
        this.x = x
        this.y = y
        this.atMiddle = atMiddle
        this.team = team
        this.health = [health,health]
        this.type = type
    }
    hit(damage){
        this.health = this.health - damage
        return this.health <= 0 //building is destroyed from attack
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
        if(maxPlayers == 2){
            var coreHealth = 500
        }else if(maxPlayers == 4){
            var coreHealth = 1000
        }
        super(x,y,true,team,coreHealth,"Core")
    }
}

class Extractor extends Building {
    constructor(ressource,x,y,atMiddle,team){
        super(x,y,atMiddle,team,20,"Extractor")
        this.level = 1
        this.inventory = [0,10,ressource]
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
    upgrade(){
        this.level += 1
        this.inventory[1] = (75*this.level*this.level)-(205*this.level)+140
    }
}

class Workshop extends Building {
    constructor(x,y,atMiddle,team){
        super(x,y,atMiddle,team,10,"Worshop")
    }
}

class Wall extends Building {
    constructor(x,y,team){
        super(x,y,true,team,50,"Wall")
        this.level = 1
    }
    upgrade(){
        this.level += 1
        this.health[1] = (40*this.level) + 10
        this.health[0] = this.health[1]
    }
}

class Battery extends Building {
    constructor(x,y,team){
        super(x,y,false,team,10,"Battery")
    }
}

class LightArmory extends Building {
    constructor(x,y,atMiddle,team){
        super(x,y,atMiddle,team,40,"LightArmory")
    }
}

class HeavyArmory extends Building {
    constructor(x,y,atMiddle,team){
        super(x,y,atMiddle,team,50,"HeavyArmory")
    }
}

var buildingPrices = {}
buildingPrices["Extractor"] = [30,50,10,0]
buildingPrices["Wall"] = [0,20,0,0]
buildingPrices["Workshop"] = [0,120,0,30]
buildingPrices["Battery"] = [50,0,0,0]
buildingPrices["LightArmory"] = [70,0,30,0]
buildingPrices["HeavyArmory"] = [0,70,20,50]

exports.buildingPrices = buildingPrices
exports.Building = Building
exports.Core = Core
exports.Extractor = Extractor
exports.Workshop = Workshop
exports.Wall = Wall
exports.Battery = Battery
exports.LightArmory = LightArmory
exports.HeavyArmory = HeavyArmory
