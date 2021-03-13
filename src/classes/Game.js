const {buildingPrices,Building,Core,Extractor,Workshop,Wall,Battery,LightArmory,HeavyArmory} = require('./Building.js')
const {piecePrices,pieceMovePrices,piecePossibleMoves,piecePossibleAttacks,pieceAttacks,Piece,Queen,Bishop,Knight,Rook,Enchanter,Pawn} = require('./Piece.js')


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
        this.disconnectedPlayers = []
        this.stats = [[0,0,0,0,0],[0,0,0,0,0]]
        this.lastTimeStamp = 0;
        this.skipId = undefined
    }
    intMiddle(a,b,c){
        //returns true is a,b,c are in this order or inversed order (c,b,a)
        if(a>=b && b>=c){
            return true
        }else if(a<=b && b<=c){
            return true
        }else{
            return false
        }
    }
    countBuildings(buildingName,team,onlyAtMiddle){
        var onlyAtMiddle = onlyAtMiddle || false
        var count = 0
        this.buildings.forEach(function(building){
            if(building.constructor.name == buildingName && building.team == team && !(onlyAtMiddle && !building.atMiddle)){
                count = count + 1
            }
        },this)
        return count
    }
    countPieces(pieceName,team){
        var count = 0
        this.pieces.forEach(function(piece){
            if(piece.constructor.name == pieceName && piece.team == team){
                count = count + 1
            }
        },this)
        return count
    }
    getCapacity(type,team){
        var armoryName = type.toLowerCase() + "Armory"
        var armoryAtMiddleCount = this.countBuildings(armoryName, team, true)
        var allArmoryCount = this.countBuildings(armoryName, team)
        var armoryAtBaseCount = allArmoryCount - armoryAtMiddleCount
        if(type="LIGHT"){
            armoryAtBaseCount += 1
        }
        var capacity = armoryAtMiddleCount*2 + armoryAtBaseCount
        return capacity
    }
    collectIfExtractor(x,y,atMiddle,team,collectTeam){
        var building = this.buildings.find(building => (building.x == x && building.y == y && building.atMiddle == atMiddle && building.team == team))
        if(building == undefined){
            return //no building found
        }
        if(building.constructor.name == "Extractor"){
            this.stats[collectTeam][["energy","copper","titanium","gold","ruby"].indexOf(building.inventory[2])] += building.inventory[0]
            building.inventory[0] = 0
        }
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

        //CONTINUE PIECE BUILDING
        this.pieces.forEach(function(piece){
            if(piece.buildingTimeLeft > 0 && piece.team == this.gameInfo.teamPlaying){
                piece.buildingTimeLeft = piece.buildingTimeLeft - 1
            }
        },this)

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
        this.refreshAllGame(io,30)
        this.skipId = setTimeout(this.processTurn.bind(this), 10000, io); //in 30 secs will recall itself
    }
    refreshAllGame(io,newTurn = 0){
        this.players.forEach(function(player){
            if(player.team == this.gameInfo.teamPlaying){
                io.to(player.socket_id).emit("showGamePlay",{newTurn : newTurn, gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timeStamp : this.lastTimeStamp})
            }else{
                io.to(player.socket_id).emit("showGameWait",{newTurn : newTurn, gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timeStamp : this.lastTimeStamp})
            }
        },this)
    }
    refreshPlayerGame(player,io,newTurn = 0){
        if(player.team == this.gameInfo.teamPlaying){
            io.to(player.socket_id).emit("showGamePlay",{newTurn : newTurn, gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timeStamp : this.lastTimeStamp})
        }else{
            io.to(player.socket_id).emit("showGameWait",{newTurn : newTurn, gameInfo : this.gameInfo, players : this.players, pieces : this.pieces, buildings : this.buildings, stats : this.stats, timeStamp : this.lastTimeStamp})
        }
    }
    refreshAllLobby(io){
        for(var player of this.players){
            var asMaster = false
            if(player.pseudo == this.gameInfo.masterPseudo){
                asMaster = true
            }
            io.to(player.socket_id).emit("showLobby",{gameInfo : this.gameInfo, players : this.players, asMaster : asMaster})
        }
    }
    tryStartGame(io){
        var master = this.players.find(player => player.pseudo == this.gameInfo.masterPseudo)
        if(this.players.length != this.gameInfo.maxPlayers){
            io.to(master.socket_id).emit("showError",{text : "La partie n'est pas pleine !"})
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
            io.to(master.socket_id).emit("showError",{text : "Les équipes ne sont pas équilibrées !"})
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
        this.players.push(user)
        this.refreshAllLobby(io)
    }
    playerReconnect(user,io){
        this.disconnectedPlayers.splice(this.players.findIndex(oldPlayer => oldPlayer.pseudo == user.pseudo),1)
        this.players.push(user)
        var timeLeft = (this.skipId._idleStart + this.skipId._idleTimeout)/1000 - process.uptime()
        this.refreshAllGame(io,timeLeft)
    }
    playerLeave(user,disconnected,io){
        //returns true if game has to be deleted
        if(!this.isUserConnected(user)){
            return false
        }
        if(this.players.length <= 1){
            return true
        }
        if(user.pseudo == this.gameInfo.masterPseudo){
            this.gameInfo.masterPseudo = this.players.find(player => player.pseudo != this.gameInfo.masterPseudo).pseudo
        }
        if(this.players.find(player => player == user) != undefined){
            if(this.gameInfo.status == "game"){
                this.disconnectedPlayers.push(this.players.find(player => player == user))
                this.players.splice(this.players.findIndex(player => player == user),1);
                this.refreshAllGame(io)
            }else{
                this.players.splice(this.players.findIndex(player => player == user),1);
                this.refreshAllLobby(io)
            }
        }
        if(!disconnected){
            io.to(user.socket_id).emit("fatalError",{text : "Vous avez été expulsé par le chef de la partie !"});
        }
        return false
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

    // BUILDING BUILD
    canBuildingBuild(type,x,y,atMiddle,team){
        //INVALID DATA
        if(["Extractor","Wall","Workshop","Battery","LightArmory","HeavyArmory"].indexOf(type) == -1){
            console.log("1")
            return false //type invalid
        }
        if(!(Number.isInteger(x) && Number.isInteger(y))){
            console.log("2")
            return false //coords invalid
        }
        if(typeof atMiddle != "boolean" || atMiddle == undefined){
            console.log("3")
            return false //atMiddle not bool
        }
        if(!(team == 0 || team == 1)){
            console.log("4")
            return false //team has to 0 or 1
        }
        var maxBase = 4 + 1 
        var maxMiddle = 7 + 1
        if(this.gameInfo.maxPlayers == 4){
            maxBase = 5 + 1 
            maxMiddle = 9 + 1
        }
        if(!(atMiddle && x>0 && x<maxMiddle && y>0 && y<maxMiddle) && !(!atMiddle && x>0 && x<maxBase && y>0 && y<maxBase)){
            console.log("5")
            return false //out of range coords
        }

        //INVALID WORLD
        if(type == "Wall" && !atMiddle){
            console.log("6")
            return false //atMiddle needed
        }
        if(type == "Battery" && atMiddle){
            console.log("7")
            return false //atMiddle impossible
        }
        if(type == "Workshop" && atMiddle){
            console.log("7.5")
            return false //atMiddle impossible
        }

        //DOESN'T HAVE RESSOURCES
        if(this.countBuildings("Extractor",team) < 3 && type == "Extractor"){
            //It's FREE
        }else{
            if(!(buildingPrices[type][0] <= this.stats[team][1] && buildingPrices[type][1] <= this.stats[team][2] && buildingPrices[type][2] <= this.stats[team][3] && buildingPrices[type][3] <= this.stats[team][4])){
                console.log("8")
                return false //doesn't have ressources to build
            }
        }

        //ALLOWED BUILD
        if(atMiddle){
            var neighbours = 0
            this.buildings.forEach(function(building){
                if(Math.abs(building.x - x) + Math.abs(building.y - y) == 1 && building.atMiddle == atMiddle){
                    neighbours = neighbours + 1
                }
            },this)
            if(neighbours == 0){
                console.log("9")
                return false //can't place solo at middle
            }
        }

        //MAX COUNT
        if(type == "Workshop"){
            if(this.countBuildings(type,team) == 1){
                console.log("10")
                return false //on peut construire qu'un Atelier
            }
        }
        if(type == "Battery"){
            if(this.countBuildings(type,team) == 3){
                console.log("11")
                return false //on peut construire que 3 Batteries
            }
        }
        if(type == "LightArmory" || type == "HeavyArmory"){
            if(this.countBuildings(type,team) == 2){
                console.log("12")
                return false //on peut construire que 2 Armuries (de chaque)
            }
        }

        //OVERLAPPING
        if(atMiddle){
            if(this.buildings.find(building => building.x == x && building.y == y && building.atMiddle) != undefined){
                console.log("13")
                return false //un batiment éxiste déjà à cette position
            }
            if(this.pieces.find(piece => piece.x == x && piece.y == y) != undefined){
                console.log("14")
                return false //une pièce éxiste déjà à cette position
            }
        }else{
            if(this.buildings.find(building => building.x == x && building.y == y && building.team == team && !building.atMiddle) != undefined){
                console.log("15")
                return false //un batiment éxiste déjà à cette position
            }
        }

        //IF NOTHING WRONG
        return true
    }
    buildingBuild(type,x,y,atMiddle,team,timeStamp,io){
        if(type == "Workshop"){
            var building = new Workshop(x,y,team)
        }else if(type == "LightArmory"){
            var building = new LightArmory(x,y,atMiddle,team)
        }else if(type == "HeavyArmory"){
            var building = new HeavyArmory(x,y,atMiddle,team)
        }else if(type == "Battery"){
            var building = new Battery(x,y,team)
        }else if(type == "Wall"){
            var building = new Wall(x,y,team)
        }else if(type == "Extractor"){
            var building = new Extractor("copper", x, y, atMiddle, team)
        }
        if(this.countBuildings("Extractor",team) < 3 && type == "Extractor"){
            //It's FREE
        }else{
            this.stats[team][1] = this.stats[team][1] - buildingPrices[type][0]
            this.stats[team][2] = this.stats[team][2] - buildingPrices[type][1]
            this.stats[team][3] = this.stats[team][3] - buildingPrices[type][2]
            this.stats[team][4] = this.stats[team][4] - buildingPrices[type][3]
        }
        this.buildings.push(building)
        this.lastTimeStamp = timeStamp
        this.refreshAllGame(io)
    }

    // BUILDING EDIT
    canBuildingEdit(edit,x,y,atMiddle,team){
        //INVALID DATA
        if(["copper","titanium","gold","ruby","upgrade","empty"].indexOf(edit) == -1){
            console.log("16")
            return false //edit invalid
        }
        if(!(Number.isInteger(x) && Number.isInteger(y))){
            console.log("17")
            return false //coords invalid
        }
        if(typeof atMiddle != "boolean"){
            console.log("18")
            return false //atMiddle not bool
        }
        if(!(team == 0 || team == 1)){
            console.log("19")
            return false //team has to 0 or 1
        }
        var maxBase = 4 + 1 
        var maxMiddle = 7 + 1
        if(this.gameInfo.maxPlayers == 4){
            maxBase = 5 + 1 
            maxMiddle = 9 + 1
        }
        if(!(atMiddle && x>0 && x<maxMiddle && y>0 && y<maxMiddle) && !(!atMiddle && x>0 && x<maxBase && y>0 && y<maxBase)){
            console.log("20")
            return false //out of range coords
        }

        //NOT EDITABLE OR MISSING RESSOURCES
        var building = this.buildings.find(building => (building.x == x && building.y == y && building.team == team && building.atMiddle == atMiddle))
        if(building == undefined){
            console.log("21")
            return false //no building to edit 
        }
        else if(building.constructor.name == "Extractor" && edit == "upgrade"){
            if(building.level < 3){
                if(this.stats[team][4] < 50){
                    console.log("22")
                    return false //team doesn't have 50 ruby
                }
            }else{
                console.log("23")
                return false //extractor at max level
            }
        }else if(building.constructor.name == "Wall" && edit == "upgrade"){
            if(building.level < 2){
                if(this.stats[team][2] < 20){
                    console.log("24")
                    return false //team doesn't have 20 titanium
                }
            }else{
                console.log("25")
                return false //wall at max level
            }
        }else if(building.constructor.name == "Extractor" && ["copper","titanium","gold","ruby","empty"].indexOf(edit) != -1){
            //skip you can change ressource
        }else{
            console.log("26")
            return false //building not upgradeable
        }
        
        //IF NOTHING WRONG
        return true
    }
    buildingEdit(edit,x,y,atMiddle,team,timeStamp,io){
        var building = this.buildings.find(building => (building.x == x && building.y == y && building.atMiddle == atMiddle && building.team == team))
        if(["copper","titanium","gold","ruby","empty"].indexOf(edit) != -1){
            this.collectIfExtractor(x,y,atMiddle,team,team)
            if(["copper","titanium","gold","ruby"].indexOf(edit) != -1){
                building.inventory[2] = edit
            }
        }else{
            if(building.type == "Wall"){
                this.stats[team][2] -= 20 //remove 20 titanium
            }else{
                this.stats[team][4] -= 50 //remove 20 titanium
            }
            building.upgrade()
        }
        this.lastTimeStamp = timeStamp
        this.refreshAllGame(io)
    }

    // BUILDING DELETE
    canBuildingDelete(x,y,atMiddle,team){
        //INVALID DATA
        if(!(Number.isInteger(x) && Number.isInteger(y))){
            console.log("27")
            return false //coords invalid
        }
        if(typeof atMiddle != "boolean"){
            console.log("28")
            return false //atMiddle not bool
        }
        if(!(team == 0 || team == 1)){
            console.log("29")
            return false //team has to 0 or 1
        }
        var maxBase = 4 + 1 
        var maxMiddle = 7 + 1
        if(this.gameInfo.maxPlayers == 4){
            maxBase = 5 + 1 
            maxMiddle = 9 + 1
        }
        if(!(atMiddle && x>0 && x<maxMiddle && y>0 && y<maxMiddle) && !(!atMiddle && x>0 && x<maxBase && y>0 && y<maxBase)){
            console.log("30")
            return false //out of range coords
        }

        //NOT DELETABLE
        var building = this.buildings.find(building => (building.x == x && building.y == y && building.team == team && building.atMiddle == atMiddle))
        if(building == undefined){
            console.log("31")
            return false //no building to delete 
        }
        else{
            var numberOfBatteries = this.countBuildings("Battery",team)
            if(building.constructor.name == "Battery" && numberOfBatteries == 3){
                console.log("32")
                return false // batteries not deletable
            }
        }
        
        //IF NOTHING WRONG
        return true
    }
    buildingForceDelete(x,y,atMiddle,team,destroyingTeam){
        this.collectIfExtractor(x,y,atMiddle,team,destroyingTeam)
        var building = this.buildings.find(building => (building.x == x && building.y == y && building.atMiddle == atMiddle && building.team == team))
        if(building == undefined){
            return //no building found
        }
        this.buildings.splice(this.buildings.findIndex(building => (building.x == x && building.y == y && building.atMiddle == atMiddle && building.team == team)),1);
    }
    buildingDelete(x,y,atMiddle,team,destroyingTeam,timeStamp,io){
        this.buildingForceDelete(x,y,atMiddle,team,destroyingTeam)
        
        //if the building is at middle we check for "floating buildings" not retached to the team core 
        if(atMiddle){
            var core = this.building.find(building => (building.constructor.name == "Core", building.team == team))
            var validCoords = [{x : core.x, y : core.y}]
            var validCoordsNew = []
            var deltas = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]
            //gets all valid coords
            while(validCoordsNew.length != validCoordsNew.length){
                validCoords = validCoordsNew
                for (var coords of validCoords) {
                    for (var delta of deltas){
                        let x = coords.x + delta.x
                        let y = coords.y + delta.y
                        var buildingAtCoords = this.buildings.find(buildingAtCoords => (buildingAtCoords.x == x && buildingAtCoords.y == y && buildingAtCoords.atMiddle && buildingAtCoords.team == team))
                        if(buildingAtCoords){
                            validCoordsNew.push({x:x,y:y})
                        }
                    }
                }
            }
            //removes all building that don't have valid coords
            for (var buildingAtCoords of this.buildings){
                for(var coords of validCoords){
                    var deleteBuilding = true
                    if(coords.x == buildingAtCoords.x && coords.y == buildingAtCoords.y && buildingAtCoords.atMiddle && buildingAtCoords.team == team){
                        deleteBuilding = false
                    }else if(!buildingAtCoords.atMiddle){
                        deleteBuilding = false
                    }else if(buildingAtCoords.atMiddle && buildingAtCoords.team != team){
                        deleteBuilding = false
                    }
                }
                if(deleteBuilding){
                    this.buildingForceDelete(buildingAtCoords.x,buildingAtCoords.y,buildingAtCoords.atMiddle,team,destroyingTeam)
                }
            }
        }
        this.lastTimeStamp = timeStamp
        this.refreshAllGame(io)
    }

    // PIECE BUILD
    canPieceBuild(type,x,y,team){
        var maxBase = 4 + 1 
        var maxMiddle = 7 + 1
        if(this.gameInfo.maxPlayers == 4){
            maxBase = 5 + 1 
            maxMiddle = 9 + 1
        }
        //INVALID DATA
        if(["Queen","Bishop","Knight","Rook","Enchanter","Pawn"].indexOf(type) == -1){
            console.log("33")
            return false //type invalid
        }
        if(!(Number.isInteger(x) && Number.isInteger(y))){
            console.log("34")
            return false //coords invalid
        }
        if(!(team == 0 || team == 1)){
            console.log("35")
            return false //team has to 0 or 1
        }
        if(!(x>0 && x<maxMiddle && y>0 && y<maxMiddle)){
            console.log("36")
            return false //out of range coords
        }

        //DOESN'T HAVE RESSOURCES
        if(!(piecePrices[type][0] <= this.stats[team][1] && piecePrices[type][1] <= this.stats[team][2] && piecePrices[type][2] <= this.stats[team][3] && piecePrices[type][3] <= this.stats[team][4])){
            console.log("37")
            return false //doesn't have ressources to build
        }

        //ALLOWED BUILD
        var neighbours = 0
        this.buildings.forEach(function(building){
            if(Math.abs(building.x - x) + Math.abs(building.y - y) == 1 && building.atMiddle == atMiddle){
                neighbours = neighbours + 1
            }
        },this)
        if(neighbours == 0){
            console.log("38")
            return false //can't place solo at middle
        }

        //MAX COUNT
        if(["Bishop","Knight","Pawn"].indexOf(type) != -1){
            var lightPieces = 0
            lightPieces += this.countPieces("Pawn",team)
            lightPieces += this.countPieces("Knight",team)
            lightPieces += this.countPieces("Bishop",team)
            var lightCapacity = this.getCapacity("LIGHT",team)
            if(lightCapacity == lightPieces){
                console.log("39")
                return false //capacité max atteinte pour les pieces légères
            }
        }
        if(["Queen","Rook","Enchanter"].indexOf(type) != -1){
            var heavyPieces = 0
            heavyPieces += this.countPieces("Queen",team)
            heavyPieces += this.countPieces("Rook",team)
            heavyPieces += this.countPieces("Enchanter",team)
            var heavyCapacity = this.getCapacity("HEAVY",team)
            if(heavyCapacity == heavyPieces){
                console.log("40")
                return false //capacité max atteinte pour les pieces lourdes
            }
        }

        //OVERLAPPING
        if(this.buildings.find(building => building.x == x && building.y == y && building.atMiddle) != undefined){
            console.log("41")
            return false //un batiment éxiste déjà à cette position
        }
        if(this.pieces.find(piece => piece.x == x && piece.y == y) != undefined){
            console.log("42")
            return false //une pièce éxiste déjà à cette position
        }

        //IF NOTHING WRONG
        return true
    }
    pieceBuild(type,x,y,team,timeStamp,io){
        if(type == "Pawn"){
            var piece = new Pawn(x,y,team)
        }else if(type == "Enchanter"){
            var piece = new Enchanter(x,y,team)
        }else if(type == "Rook"){
            var piece = new Rook(x,y,team)
        }else if(type == "Knight"){
            var piece = new Knight(x,y,team)
        }else if(type == "Queen"){
            var piece = new Queen(x,y,team)
        }else if(type == "Bishop"){
            var piece = new Bishop(x,y,team)
        }
        this.pieces.push(piece)
        this.stats[team][1] = this.stats[team][1] - piecePrices[type][0]
        this.stats[team][2] = this.stats[team][2] - piecePrices[type][1]
        this.stats[team][3] = this.stats[team][3] - piecePrices[type][2]
        this.stats[team][4] = this.stats[team][4] - piecePrices[type][3]
        this.lastTimeStamp = timeStamp
        this.refreshAllGame(io)
    }

    // PIECE MOVE
    canPieceMove(startX,startY,endX,endY,team){
        var maxBase = 4 + 1 
        var maxMiddle = 7 + 1
        if(this.gameInfo.maxPlayers == 4){
            maxBase = 5 + 1 
            maxMiddle = 9 + 1
        }
        //INVALID DATA
        if(!(Number.isInteger(startX) && Number.isInteger(startY) && Number.isInteger(endX) && Number.isInteger(endY))){
            console.log("43")
            return false //coords invalid
        }
        if(!(team == 0 || team == 1)){
            console.log("44")
            return false //team has to 0 or 1
        }
        var maxMiddle = 7 + 1
        if(this.gameInfo.maxPlayers == 4){
            maxMiddle = 9 + 1
        }
        if(!(startX>0 && startX<maxMiddle && startY>0 && startY<maxMiddle && endX>0 && endX<maxMiddle && endY>0 && endY<maxMiddle)){
            console.log("45")
            return false //out of range coords
        }

        //GET PIECE
        var movingPiece = this.pieces.find(piece => piece.x == startX && piece.y == startY)

        //UNVALID PIECE
        if(movingPiece == undefined){
            console.log("46")
            return false //no piece at these chords
        }
        if(movingPiece.team != team){
            console.log("47")
            return false //piece not the team of the player
        }
        if(movingPiece.buildingTimeLeft > 0){
            console.log("48")
            return false //piece not finished building
        }

        //DOESN'T HAVE ENERGY
        if(this.stats[team][0] < pieceMovePrices[movingPiece.constructor.name]){
            console.log("49")
            return false //doesn't have energy to move
        }

        //UNVALID MOVE
        var deltaX = endX - startX
        var deltaY = endY - startY
        if(team == 1){
            deltaX = -deltaX
            deltaY = -deltaY
        }
        if(!piecePossibleMoves[movingPiece.constructor.name].some(deltaCouple => deltaCouple[0] == deltaX && deltaCouple[1] == deltaY)){
            console.log("50")
            return false //move is not possible for this piece
        }else{
            for(var index in this.buildings){
                var building = this.buildings[index]
                if(!building.atMiddle){
                    continue
                    //si le batiment n'est pas au milieu on le skip
                }
                var buildingDeltaX = building.x - startX
                var buildingDeltaY = building.y - startY
                if(piecePossibleMoves[movingPiece.constructor.name].some(deltaCouple => deltaCouple[0] == buildingDeltaX && deltaCouple[1] == buildingDeltaY)){
                    //le batiment pourrait se trouver sur le chemin de la pièce
                    if(this.intMiddle(startX,building.x,endX) && this.intMiddle(startY,building.y,endY)){
                        console.log("51")
                        return false // le batiment bloque le chemin !
                    }
                }
            }
            for(var index in this.pieces){
                var piece = this.pieces[index]
                var pieceDeltaX = piece.x - startX
                var pieceDeltaY = piece.y - startY
                if(piecePossibleMoves[movingPiece.constructor.name].some(deltaCouple => deltaCouple[0] == pieceDeltaX && deltaCouple[1] == pieceDeltaY)){
                    //la pièce pourrait se trouver sur le chemin de la pièce que l'on bouge
                    if(this.intMiddle(startX,piece.x,endX) && this.intMiddle(startY,piece.y,endY)){
                        console.log("52")
                        return false // une pièce bloque le chemin !
                    }
                }
            }
        }

        //IF NOTHING WRONG
        return true
    }
    pieceMove(startX,startY,endX,endY,team,timeStamp,io){
        var movingPiece = this.pieces.find(piece => (piece.x == startX && piece.y == startY))
        movingPiece.changeCoords(endX,endY)
        this.stats[team][0] = this.stats[team][0] - pieceMovePrices[movingPiece.constructor.name]
        this.lastTimeStamp = timeStamp
        this.refreshAllGame(io)
    }

    // PIECE ATTACK
    canPieceAttack(startX,startY,endX,endY,attackType,team){
        //INVALID DATA
        if(!(Number.isInteger(startX) && Number.isInteger(startY) && Number.isInteger(endX) && Number.isInteger(endY))){
            console.log("53")
            return false //coords invalid
        }
        if(!(team == 0 || team == 1)){
            console.log("54")
            return false //team has to 0 or 1
        }
        var maxMiddle = 7 + 1
        if(this.gameInfo.maxPlayers == 4){
            maxMiddle = 9 + 1
        }
        if(!(startX>0 && startX<maxMiddle && startY>0 && startY<maxMiddle && endX>0 && endX<maxMiddle && endY>0 && endY<maxMiddle)){
            console.log("55")
            return false //out of range coords
        }

        //GET ELEMENTS
        var attackingPiece = this.pieces.find(piece => piece.x == startX && piece.y == startY)
        var attackedPiece = this.pieces.find(piece => piece.x == endX && piece.y == endY)
        var attackedBuilding = this.buildings.find(building => building.x == endX && building.y == endY && building.atMiddle)

        //NOTHING TO ATTACK
        if(attackedPiece === attackedBuilding){
            console.log("55b")
            return false //no entity at attack coords
        }

        //UNVALID PIECE
        if(attackingPiece == undefined){
            console.log("56")
            return false //no piece at these chords
        }
        if(attackingPiece.team != team){
            console.log("57")
            return false //piece not the team of the player
        }
        if(attackingPiece.buildingTimeLeft > 0){
            console.log("58")
            return false //piece not finished building
        }

        //DOESN'T HAVE ENERGY
        if(this.stats[team][0] < pieceAttacks[attackType][1]){
            console.log("59")
            return false //doesn't have energy to attack
        }

        //ATTACK TYPE NOT AVAILABLE FOR PIECE
        if(!attackingPiece.attacks.includes(attackType)){
            console.log("60")
            return false //doesn't have access to this attack
        }

        //UNVALID ATTACK
        var deltaX = endX - startX
        var deltaY = endY - startY
        if(team == 1){
            deltaX = -deltaX
            deltaY = -deltaY
        }
        if(!piecePossibleAttacks[attackingPiece.constructor.name].some(deltaCouple => deltaCouple[0] == deltaX && deltaCouple[1] == deltaY)){
            console.log("61")
            return false //attack moving is not possible for this piece
        }else{
            for(var building in this.buildings){
                if(!building.atMiddle){
                    continue
                    //si le batiment n'est pas au milieu on le skip
                }
                var buildingDeltaX = building.x - startX
                var buildingDeltaY = building.y - startY
                if(piecePossibleAttacks[attackingPiece.constructor.name].some(deltaCouple => deltaCouple[0] == buildingDeltaX && deltaCouple[1] == buildingDeltaY)){
                    //le batiment pourrait se trouver sur le chemin de la pièce
                    if(this.intMiddle(startX,building.x,endX) && this.intMiddle(startY,building.y,endY) && (building.x != endX || building.y != endY)){
                        console.log("62")
                        return false // le batiment bloque le chemin !
                    }
                    if(building.x == endX && building.y == endY && building.team == team && attackType != "healing"){
                        console.log("63")
                        return false //no friendly fire
                    }
                }
            }
            for(var piece in this.pieces){
                var pieceDeltaX = piece.x - startX
                var pieceDeltaY = piece.y - startY
                if(piecePossibleAttacks[attackingPiece.constructor.name].some(deltaCouple => deltaCouple[0] == pieceDeltaX && deltaCouple[1] == pieceDeltaY)){
                    //la pièce pourrait se trouver sur le chemin de la pièce que l'on bouge
                    if(this.intMiddle(startX,piece.x,endX) && this.intMiddle(startY,piece.y,endY) && (piece.x != endX || piece.y != endY)){
                        console.log("64")
                        return false // une pièce bloque le chemin !
                    }
                    if(piece.x == endX && piece.y == endY && piece.team == team && attackType != "healing"){
                        console.log("65")
                        return false //no friendly fire
                    }
                }
            }
        }

        //ENCHANTER MAX PIECES
        if(attackType == "enchant"){
            if(attackedPiece == undefined){
                console.log("66")
                return false //can't enchant building
            }
            else if(["Bishop","Knight","Pawn"].indexOf(attackedPiece.constructor.name) != -1){
                var lightPieces = 0
                lightPieces += this.countPieces("Pawn",team)
                lightPieces += this.countPieces("Knight",team)
                lightPieces += this.countPieces("Bishop",team)
                var lightCapacity = this.getCapacity("LIGHT",team)
                if(lightCapacity == lightPieces){
                    console.log("67")
                    return false //capacité max atteinte pour les pieces légères
                }
            }
            else if(["Queen","Rook","Enchanter"].indexOf(attackedPiece.constructor.name) != -1){
                var heavyPieces = 0
                heavyPieces += this.countPieces("Queen",team)
                heavyPieces += this.countPieces("Rook",team)
                heavyPieces += this.countPieces("Enchanter",team)
                var heavyCapacity = this.getCapacity("HEAVY",team)
                if(heavyCapacity == heavyPieces){
                    console.log("68")
                    return false //capacité max atteinte pour les pieces lourdes
                }
            }
        }

        //IF NOTHING WRONG
        return true
    }
    pieceForceDelete(x,y){
        var piece = this.pieces.find(piece => (piece.x == x && piece.y == y))
        if(piece == undefined){
            return //no building found
        }
        this.pieces.splice(this.pieces.findIndex(piece => (piece.x == x && piece.y == y)),1);
    }
    pieceAttack(startX,startY,endX,endY,attackType,team,timeStamp,io){
        //GET REFS
        var attackingPiece = this.pieces.find(piece => (piece.x == startX && piece.y == startY))
        var attackedPiece = this.pieces.find(piece => (piece.x == endX && piece.y == endY))
        var attackedBuilding = this.buildings.find(building => (building.x == endX && building.y == endY))

        //GET ENTITY
        if(attackedPiece == undefined){
            var attackedEntity = attackedBuilding
        }else{
            var attackedEntity = attackedPiece
        }

        //HIT
        var entityDead = attackedEntity.hit(pieceAttacks[attackType][0])
        this.stats[team][0] = this.stats[team][0] - pieceAttacks[attackType][1]
        var attackingDead = false

        //SUICIDE
        if(attackType == "diagonalSuicide"){
            entityDead = attackedEntity.hit(attackingPiece.health)
            attackingDead = true
        }

        //ENCHANT
        if(attackType == "enchant"){
            attackedEntity.switchTeam()
        }

        //HEALING
        if(attackType == "healing"){
            for(var building of this.buildings){
                if(Math.abs(building.x - startX) <= 1 && Math.abs(building.y - startY) <= 1 && building.team == team){
                    building.hit(-50)
                }
            }
            for(var piece of this.pieces){
                if(piece.x == startX && piece.y == startY){
                    continue
                    //piece is rook doing the attack, skip so he doesn't heal himself
                }
                if(Math.abs(piece.x - startX) <= 1 && Math.abs(piece.y - startY) <= 1 && piece.team == team){
                    piece.hit(-50)
                }
            }
        }
        if(entityDead){
            this.pieceForceDelete(endX,endY)
            this.buildingForceDelete(endX,endY,true,attackedEntity.team,team)
            if(attackingDead){
                this.pieceForceDelete(startX,startY)
            }else{
                attackingPiece.changeCoords(endX,endY)
            }
        }
        this.lastTimeStamp = timeStamp
        this.refreshAllGame(io)
    }
}

module.exports = Game
