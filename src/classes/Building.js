class Building {
    constructor(x,y,atMiddle,team){
        this.position = [x,y,atMiddle]
        this.team = team
    }
}

class Core extends Building {
    constructor(maxPlayers,team){
        if(maxPlayers == 2 && team == 0){
            position = [4,1]
        }else if(maxPlayers == 2 && team == 1){
            position = [4,7]
        }else if(maxPlayers == 4 && team == 0){
            position = [5,1]
        }else if(maxPlayers == 4 && team == 1){
            position = [5,9]
        }
        x = position[0]
        y = position[1]
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
        this.inventory = [0,10,ressource]
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

module.exports = {Building,Core,Extractor,Workshop,Wall,Battery,LightArmory,HeavyArmory}
