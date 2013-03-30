// SWORD.newgame
SWORD.Game = function () {
	var i;
	
	//this.state = "start";
	this.state = "game";
	
	this.engine = new ROT.Engine();
	this.message = new SWORD.MessageSystem();
	
	this.player = SWORD.newPlayer();
	this.inventory = new SWORD.Inventory();
	this.swap = null;
	
	this.dlevel = 1;
	this.changeToMap(this.dlevel);
};

SWORD.Game.prototype.changeToMap = function (dlevel) {
	var i, j, creatures;

	this.engine.clear();
	
	// create map
	this.map = new SWORD.Map(dlevel);

	this.engine.addActor(this.player);
	
	// add the creatures from the map to the engine
	rooms = this.map.rooms;
	for (i = 0; i < rooms.length; i++) {
		for (j in rooms[i].creatures) {
			if (rooms[i].creatures.hasOwnProperty(j)) {
				this.engine.addActor(rooms[i].creatures[j]);
			}
		}
	}
	
	/*
	// place player on upstairs to begin with
	for (i in this.map.data) {
		if (this.map.data.hasOwnProperty(i)) {
			if (this.map.data[i] === SWORD.terrains.upstairs) {
				xy = i.split(",");
				
				this.map.creatures[i] = this.player;
				this.player.x = parseInt(xy[0]);
				this.player.y = parseInt(xy[1]);
			}
		}
	}
	*/
	
	this.player.room = this.map.entrance;
	this.player.x = 0;
	this.player.room.creatures[0] = this.player;
	this.player.room.seen = true;

}