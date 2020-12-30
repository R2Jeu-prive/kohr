const {buildingPrices,Building,Core,Extractor,Workshop,Wall,Battery,LightArmory,HeavyArmory} = require('./Building.js')
const {piecePrices,Piece,Queen,Bishop,Knight,Rook,Enchanter,Pawn} = require('./Piece.js')


class Game {
    constructor(masterPseudo,maxPlayers){
        this.gameInfo = {}
        this.gameInfo.name = "Partie de " + masterPseudo
        this.gameInfo.maxPlayers = maxPlayers
        this.gameInfo.status = "lobby"
        this.gameInfo.masterPseudo = masterPseudo
        this.gameInfo.teamNames = ["Equipe A", "Equipe B"]
        this.gameInfo.teamPlaying = -1
        this.gameInfo.turn = 0
        this.pieces = []
        this.buildings = []
        this.players = []
        this.stats = [[0,0,0,0,0],[0,0,0,0,0]]
        this.lastTimeStamp = 0;
        this.skipId = undefined
    }
    countBuildings(buildingName,team){
        var count = 0
        this.buildings.forEach(function(building){
            if(building.constructor.name == buildingName && building.team == team){
                count = count + 1
            }
        },this)
        return count
    }
    processTurn(io){
        this.gameInfo.teamPlaying = (-1*this.gameInfo.teamPlaying)+1 //switch from 0 to 1 or 1 to 0

        //COUNTS TURN (1,-1,2,-2,3,-3,etc...)
        this.gameInfo.turn = -this.gameInfo.turn
        if(this.gameInfo.turn >= 0){
            this.gameInfo.turn = this.gameInfo.turn + 1
        }

        //ENERGY
        var numberOfBatteries = this.countBuildings("Battery",this.gameInfo.teamPlaying)
        var numberOfWorkshops = this.countBuildings("Workshop",this.gameInfo.teamPlaying)
        var energyCapacity = 10 + 2*numberOfBatteries
        var energyGain = 5 + 1*numberOfWorkshops
        var maxEnergyGain = energyCapacity - this.stats[this.gameInfo.teamPlaying][0]
        energyGain = Math.min(energyGain,maxEnergyGain)
        this.stats[this.gameInfo.teamPlaying][0] = this.stats[this.gameInfo.teamPlaying][0] + energyGain

        //EXTRACTOR
        this.buildings.forEach(function(building){
            if(building.constructor.name == "Extractor" && building.team == this.gameInfo.teamPlaying){
                var initialProduction = (2.5*building.level*building.level)-(2.5*building.level)+10 // 1 => 10 | 2 => 15 | 3 => 25
                var proximityBonus = building.countNeighbours(this.buildings)*5
                var maxProduction = building.inventory[1] - building.inventory[0]
                var production = initialProduction + proximityBonus
                if(building.atMiddle){
                    production = production * 2
                }
                production = Math.min(production, maxProduction)
                building.inventory[0] = building.inventory[0] + production
            }
        },this)
        this.refreshAll(io)
        this.skipId = setTimeout(this.processTurn.bind(this), 30000, io); //in 30 secs will recall itself
    }
    refreshAll(io){
        this.players.forEach(function(player){
            if(player.team == this.gameInfo.teamPlaying){
                io.to(player.socket_id).emit("showGamePlay",{gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timeStamp : this.lastTimeStamp})
            }else{
                io.to(player.socket_id).emit("showGameWait",{gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timeStamp : this.lastTimeStamp})
            }
        },this)
    }
    refreshPlayer(player,io){
        if(player.team == this.gameInfo.teamPlaying){
            io.to(player.socket_id).emit("showGamePlay",{gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timeStamp : this.lastTimeStamp})
        }else{
            io.to(player.socket_id).emit("showGameWait",{gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timeStamp : this.lastTimeStamp})
        }
    }
    tryStartGame(io){
        if(this.players.length != this.gameInfo.maxPlayers){
            console.log("la partie n'es pas pleine")
            return
        }
        var countTeam0 = 0
        var countTeam1 = 0
        this.players.forEach(function(player){
            if(player.team == 0){
                countTeam0 = countTeam0 + 1
            }
            if(player.team == 1){
                countTeam1 = countTeam1 + 1
            }
        })
        if(countTeam0 != countTeam1){
            console.log("les deux équipes ne sont pas équilibrées")
            return
        }
        this.gameInfo.status = "game"
        this.buildings.push(new Core(this.gameInfo.maxPlayers,0))
        this.buildings.push(new Core(this.gameInfo.maxPlayers,1))
        this.gameInfo.turn = 0
        this.gameInfo.teamPlaying = Math.floor(Math.random() * 2) //choses random team to start (0 or 1)
        this.processTurn(io)
    }
    playerJoin(user,io){
        let self = this
        this.players.push(user)
        this.players.forEach(player =>
            io.to(player.socket_id).emit("showLobby",{gameInfo : this.gameInfo, players : this.players})
        )
        if(this.players.length == this.gameInfo.maxPlayers){
            console.log("game is full")
            setTimeout(function(){
                self.tryStartGame(io)
            }, 3000);
        }
        return user
    }
    playerLeave(user,io){
        if(this.players.find(player => player == user) != undefined){
            this.players.splice(this.players.findIndex(player => player == user),1);
            this.players.forEach(player =>
                io.to(player.socket_id).emit("showLobby",{gameInfo : this.gameInfo, players : this.players})
            )
        }
    }
    isUserConnected(user){
        if(this.players.find(player => player == user) != undefined){
            return true
        }else{
            return false
        }
    }
    getSmallestTeam(){
        var total = 0.36
        this.players.forEach(function(player){
            total = total + (player.team*2) - 1
        },this)
        if(total > 0){
            return 0
        }else{
            return 1
        }
    }
    canBuildingBuild(type,x,y,atMiddle,team){
        //INVALID DATA
        if(["Extractor","Wall","Workshop","Battery","LightArmory","HeavyArmory"].indexOf(type) == -1){
            return false //type invalid
        }
        if(!(Number.isInteger(x) && Number.isInteger(y))){
            return false //coords invalid
        }
        if(typeof atMiddle != "boolean" || atMiddle == undefined){
            return false //atMiddle not bool
        }
        if(!(team == 0 || team == 1)){
            return false //team has to 0 or 1
        }
        var maxBase = 4 + 1 
        var maxMiddle = 7 + 1
        if(this.gameInfo.maxPlayers == 4){
            maxBase = 5 + 1 
            maxMiddle = 9 + 1
        }
        if(!(atMiddle && x>0 && x<maxMiddle && y>0 && y<maxMiddle) && !(!atMiddle && x>0 && x<maxBase && y>0 && y<maxBase)){
            return false //out of range coords
        }

        //INVALID WORLD
        if(["Wall","Battery"].indexOf(type) != -1 && atMiddle != undefined){
            return false //atMiddle not needed
        }
        if(["Wall","Battery"].indexOf(type) == -1 && atMiddle == undefined){
            return false //atMiddle needed
        }

        //DOESN'T HAVE RESSOURCES
        if(this.countBuildings("Extractor",team) < 3 && type == "Extractor"){
            //It's FREE
        }else{
            if(!(buildingPrices[type][0] <= this.stats[team][1] && buildingPrices[type][1] <= this.stats[team][2] && buildingPrices[type][2] <= this.stats[team][3] && buildingPrices[type][3] <= this.stats[team][4])){
                return false //doesn't have ressources to build
            }
        }

        //MAX COUNT
        if(type == "Workshop"){
            if(this.countBuildings(type,team) == 1){
                return false //on peut construire qu'un Atelier
            }
        }
        if(type == "Battery"){
            if(this.countBuildings(type,team) == 3){
                return false //on peut construire que 3 Batteries
            }
        }
        if(type == "LightArmory" || type == "HeavyArmory"){
            if(this.countBuildings(type,team) == 2){
                return false //on peut construire que 2 Armuries (de chaque)
            }
        }

        //OVERLAPPING
        if(atMiddle){
            if(this.buildings.find(building => building.x == x && building.y == y && building.atMiddle) != undefined){
                return false //un batiment éxiste déjà à cette position
            }
        }else{
            if(this.buildings.find(building => building.x == x && building.y == y && building.team == team && !building.atMiddle) != undefined){
                return false //un batiment éxiste déjà à cette position
            }
        }

        //IF NOTHING WRONG
        return true
    }
    buildingBuild(type,x,y,atMiddle,team,timeStamp,io){
        if(["Workshop","LightArmory","HeavyArmory"].indexOf(type) != -1){
            building = new window[type](x,y,atMiddle,team)
        }
        else if(["Wall","Battery"].indexOf(type) != -1){
            building = new window[type](x,y,team)
        }
        else if(type == "Extractor"){
            building = new Extractor("copper", x, y, atMiddle, team)
        }
        this.stats[team][1] = this.stats[team][1] - buildingPrices[type][0]
        this.stats[team][2] = this.stats[team][2] - buildingPrices[type][1]
        this.stats[team][3] = this.stats[team][3] - buildingPrices[type][2]
        this.stats[team][4] = this.stats[team][4] - buildingPrices[type][3]
        this.lastTimeStamp = timeStamp
        this.refreshAll(io)
    }

    canBuildingEdit(edit,x,y,atMiddle,team){
        //INVALID DATA
        if(["copper","titanium","gold","ruby","upgrade","empty"].indexOf(edit) == -1){
            return false //edit invalid
        }
        if(!(Number.isInteger(x) && Number.isInteger(y))){
            return false //coords invalid
        }
        if(typeof atMiddle != "boolean"){
            return false //atMiddle not bool
        }
        if(!(team == 0 || team == 1)){
            return false //team has to 0 or 1
        }
        var maxBase = 4 + 1 
        var maxMiddle = 7 + 1
        if(this.gameInfo.maxPlayers == 4){
            maxBase = 5 + 1 
            maxMiddle = 9 + 1
        }
        if(!(atMiddle && x>0 && x<maxMiddle && y>0 && y<maxMiddle) && !(!atMiddle && x>0 && x<maxBase && y>0 && y<maxBase)){
            return false //out of range coords
        }

        //NOT EDITABLE OR MISSING RESSOURCES
        building = this.buildings.find(building => (building.x == x && building.y == y && building.team == team && building.atMiddle == atMiddle))
        if(building == undefined){
            return false //no building to edit 
        }
        else if(building.constructor.name == "Extractor" && edit == "upgrade"){
            if(building.level < 3){
                if(this.stats[team][4] < 50){
                    return false //team doesn't have 50 ruby
                }
            }else{
                return false //extractor at max level
            }
        }else if(building.constructor.name == "Wall" && edit == "upgrade"){
            if(building.level < 2){
                if(this.stats[team][2] < 20){
                    return false //team doesn't have 20 titanium
                }
            }else{
                return false //wall at max level
            }
        }else if(building.constructor.name == "Extractor" && ["copper","titanium","gold","ruby","empty"].indexOf(edit) != -1){
            //skip you can change ressource
        }else{
            return false //building not upgradeable
        }
        
        //IF NOTHING WRONG
        return true
    }
    buildingEdit(edit,x,y,atMiddle,team,timeStamp,io){
        building = this.buildings.find(building => (building.x == x && building.y == y && building.atMiddle == atMiddle && building.team == team))
        if(["copper","titanium","gold","ruby","empty"].indexOf(edit) != -1){
            this.stats[team][["energy","copper","titanium","gold","ruby"].indexOf(building.inventory[2])] += building.inventory[0]
            building.inventory[0] = 0
            if(["copper","titanium","gold","ruby"].indexOf(edit) != -1){
                building.inventory[2] = edit
            }
        }else{
            building.upgrade()
        }
        this.lastTimeStamp = timeStamp
        this.refreshAll(io)
    }
}

module.exports = Game
