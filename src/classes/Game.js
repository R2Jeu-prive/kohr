const {Building,Core,Extractor,Workshop,Wall,Battery,LightArmory,HeavyArmory} = require('./Building.js')
const {Piece,Queen,Bishop,Knight,Rook,Enchanter,Pawn} = require('./Piece.js')

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
        this.lastTimestamp = 0;
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
        this.teamPlaying = (-1*this.teamPlaying)+1 //switch from 0 to 1 or 1 to 0

        //COUNTS TURN (1,-1,2,-2,3,-3,etc...)
        this.gameInfo.turn = -this.gameInfo.turn
        if(this.gameInfo.turn > 0){
            this.gameInfo.turn = this.gameInfo.turn + 1
        }

        //ENERGY
        var numberOfBatteries = this.countBuildings("Battery",this.teamPlaying)
        var numberOfWorkshops = this.countBuildings("Workshop",this.teamPlaying)
        var energyCapacity = 10 + 2*numberOfBatteries
        var energyGain = 5 + 1*numberOfWorkshops
        var maxEnergyGain = energyCapacity - this.stats[this.teamPlaying][0]
        energyGain = Math.min(energyGain,maxEnergyGain)
        this.stats[this.teamPlaying][0] = this.stats[this.teamPlaying][0] + energyGain

        //EXTRACTOR
        this.buildings.forEach(function(building){
            if(building.constructor.name == "Extractor"){
                var initialProduction = (2.5*building.level*building.level)-(2.5*building.level)+10 // 1 => 10 | 2 => 15 | 3 => 25
                var proximityBonus = building.countNeighbours(this.buildings)*5
                var maxProduction = building.inventory[1] - building.inventory[0]
                var production = initialProduction + proximityBonus
                production = Math.min(production, maxProduction)
                building.inventory[0] = building.inventory[0] + production
            }
        },this)

        this.players.forEach(function(player){
            if(player.team == this.teamPlaying){
                io.to(player.socket_id).emit("showGamePlay",{gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timestamp : this.lastTimestamp})
            }else{
                io.to(player.socket_id).emit("showGameWait",{gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timestamp : this.lastTimestamp})
            }
        },this)
        this.skipId = setTimeout(this.processTurn.bind(this), 30000, io); //in 30 secs will recall itself
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
        this.buildings.push(new Extractor("copper",3,3,false,0))
        this.gameInfo.turn = 1
        this.teamPlaying = Math.floor(Math.random() * 2) //choses random team to start (0 or 1)
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
    }
    playerLeave(user,io){
        if(this.players.find(player => player == user) != undefined){
            this.players.splice(this.players.findIndex(player => player == user),1);
            this.players.forEach(player =>
                io.to(player.socket_id).emit("showLobby",{gameInfo : this.gameInfo, players : this.players})
            )
        }
    }
}

module.exports = Game
