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
        this.teamPlaying = -1*this.teamPlaying+1 //switch from 0 to 1 or 1 to 0

        //ENERGY
        numberOfBatteries = this.countBuildings("Battery",this.teamPlaying)
        numberOfWorkshops = this.countBuildings("Workshop",this.teamPlaying)
        energyCapacity = 10 + 2*numberOfBatteries
        energyGain = 5 + 1*numberOfWorkshops
        maxEnergyGain = energyCapacity - this.stats[this.teamPlaying][0]
        console.log("testing",maxEnergyGain)
        energyGain = min(energyGain,maxEnergyGain)
        this.stats[this.teamPlaying][0] = this.stats[this.teamPlaying][0] + energyGain

        this.players.forEach(function(player){
            if(player.team == this.teamPlaying){
                io.to(player.socket_id).emit("showGamePlay",{gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timestamp : this.lastTimestamp})
            }else{
                io.to(player.socket_id).emit("showGameWait",{gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timestamp : this.lastTimestamp})
            }
        },this)
        this.skipId = setTimeout(this.processTurn, 30000, io); //in 30 secs will recall itself
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
                self.tryStartGame()
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
