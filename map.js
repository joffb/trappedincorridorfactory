SWORD.terrains = {
	wall: {passable: false, symbol: "#", color: SWORD.midblue},
	floor: {passable: true, symbol: ".", color: "white"},
	altfloor: {passable: true, symbol: "·", color: "#64C"},
	
	cafetable: {passable: true, symbol: "=", color: "white"},
	
	doorclosed: {passable: true, symbol: "+"},
	doorlocked: {passable: false, symbol: "+", color: "white"},
	dooropen: {passable: true, symbol: "-"},
		
	upstairs: {passable: true, symbol: "<", color: "white"},
	downstairs: {passable: true, symbol: ">", color: "white"},
	
	corpse: {passable: true, symbol: "%", color: "#639"},
	
	sand: {passable: true, symbol: ",", color: "#cc4"},
};

SWORD.roomWidths = { entrance: 4, exit: 4, normal: 12, treasure: 4, cafe: 6 };
SWORD.maxDoors = { entrance: 1, exit: 1, normal: 4, treasure: 1, cafe: 2 };
SWORD.colors = ["red", "orange", "yellow", "green", "cyan", "chocolate", "violet", "turquoise", "lime"];
SWORD.lastcolor = 0;

SWORD.Map = function (dlevel) {

	this.dlevel = dlevel;
	this.wiggle = false;
	this.wiggleoffset = 0;
	
	var i, j,
		rnd,
		roomcount = 8,
		treasureroomcount = 1,
		rooms = [],
		
		a, b,
		color,
		connections = {},
		connectable = [],
		
		room,
		
		creature,
		monsterable = [],
		creaturecount = 6 + dlevel;
	
	rooms[0] = new SWORD.Room("entrance");
	rooms[roomcount - 1] = new SWORD.Room("exit");
	
	this.entrance = rooms[0];
	this.exit = rooms[roomcount - 1];
	
	// make the rooms + assign types
	for (i = 1; i < roomcount - 1; i++) {
		rnd = ROT.RNG.getUniform();
		
		if (rnd > 0.95) {
			rooms[i] = new SWORD.Room("cafe");
		}
		else if ((rnd > 0.85) && (treasureroomcount > 0)) {
			rooms[i] = new SWORD.Room("treasure");
			treasureroomcount--;
		}
		else {
			rooms[i] = new SWORD.Room("normal");
		}
	}

	connectRooms = function () {
		// entrances and exits can have 1-2 connections and they can't connect to eachother
		// normal rooms can have 1-3 connections to any room type
		// treasure rooms can have 1 connection and can't connect to entrances or exits
		for (i = 0; i < rooms.length; i++) {
		
			if (rooms[i].doors.length < SWORD.maxDoors[rooms[i].type]) {
				connectable.push(i);
			}
			
		}
		
		var failures = 0;
		
		while ((connectable.length > 1) && (failures < roomcount)) {
			rnd = Math.floor(ROT.RNG.getUniform() * connectable.length);
			a = connectable[rnd];
			connectable.splice(rnd, 1);
			
			rnd = Math.floor(ROT.RNG.getUniform() * connectable.length);
			b = connectable[rnd];
			connectable.splice(rnd, 1);
			
			// we want to put the room numbers in ascending order to normalise the connections hash
			if (b > a) {
				rnd = b;
				b = a;
				a = rnd;
			}

			// if that connection has already been made or it sucks, start again
			if (connections.hasOwnProperty(a + "," + b) ||
				(a === b) ||
				(rooms[a].type === "entrance" && rooms[b].type === "exit") ||
				(rooms[a].type === "exit" && rooms[b].type === "entrance") ||
				(rooms[a].type === "entrance" && rooms[b].type === "treasure") ||
				(rooms[a].type === "treasure" && rooms[b].type === "treasure") ||
				(rooms[a].type === "treasure" && rooms[b].type === "exit")) {
				connectable.push(a);
				connectable.push(b);
				
				failures++;
				continue;
			}
			
			// so now we have two connectable room numbers
			// we can make new doors and connect the rooms by them
			doora = rooms[a].doors.length;
			doorb = rooms[b].doors.length;
			
			color = SWORD.colors[(SWORD.lastcolor + 1) % SWORD.colors.length];
			SWORD.lastcolor++;
			
			rooms[a].doors.push({room: rooms[b], doorindex: doorb, x: 0, color: color});
			rooms[b].doors.push({room: rooms[a], doorindex: doora, x: 0, color: color});
			
			
			
			connections[a + "," + b] = { rooma: rooms[a], doora: doora, roomb: rooms[b], doorb: doorb };
		}
	}
	
	connectRooms();
	connectRooms();
	
	
	pathExists = function (a, b) {
		var i, j, c, room,
			tocheck = [a],
			checked = [];
			
		for (i = 0; i < rooms.length; i++) {
			checked[i] = false;
		}
		
		// start from the top
		while (tocheck.length > 0) {
		
			// get a new room to check
			c = tocheck.pop();
		
			room = rooms[c];
		
			// go through its doors
			for (i = 0; i < room.doors.length; i++) {
				
				if (checked[room.doors[i].room] === false) {
					tocheck.push(room.doors[i].room)
				}
				
			}
			
			checked[c] = true;
		}
		
		return checked[b];
	}
	
	if (pathExists(0, rooms.length - 1) === false) {
		connectRooms();
	}
	
	// make data for each room
	// place the doors within the rooms
	for (i = 0; i < rooms.length; i++) {
	
		room = rooms[i];
		
		// place floors
		for (j = 0; j < room.w; j++) {
			room.data[j] = SWORD.terrains.floor;
		}
		
		if (room.type === "entrance") {
			room.data[0] = SWORD.terrains.upstairs;
		}
		
		if (room.type === "exit") {
			room.data[room.w - 1] = SWORD.terrains.downstairs;
		}
		
		if (room.type === "cafe") {
			room.data[3] = SWORD.terrains.cafetable;
		}
		
		
		// place doors
		for (j = 0; j < room.doors.length; j++) {
		
			// need to check for door/stair collisions here at some point
			rnd = Math.floor(room.data.length * ROT.RNG.getUniform());
			
			while (room.data[rnd] !== SWORD.terrains.floor) {
				rnd = Math.floor(room.data.length * ROT.RNG.getUniform());
			}
			
			room.doors[j].x = rnd;
			room.data[rnd] = SWORD.terrains.doorclosed;
			
		}
		
	}
	
	for (i = 0; i < rooms.length; i++) {
		if ((rooms[i].type !== "entrance") && (rooms[i].type !== "treasure")) {
			monsterable.push(rooms[i]);
		}
	}
	
	// deposit monsters
	while (creaturecount > 0) {
		rnd = Math.floor(ROT.RNG.getUniform() * monsterable.length);
		room = monsterable[rnd];
		
		rnd = Math.floor(ROT.RNG.getUniform() * room.w);
		if (room.creatures.hasOwnProperty(rnd)) {
			continue;
		}
		
		creature = new SWORD.Creature(SWORD.randomMonster(dlevel));
		creature.room = room;
		creature.x = rnd;
		room.creatures[rnd] = creature;
		creaturecount--;
	}
	
	rooms[0].seen = true;
	
	this.rooms = rooms;
	this.connections = connections;
	
};

SWORD.Map.prototype.roomIndex = function (room) {
	var i, len = this.rooms.length, ret = null;

	for (i = 0; i < len; i++) {
		if (this.rooms[i] === room) {
			ret = i;
			break;
		}
	}
	
	return ret;
};

SWORD.Map.prototype.concat = function(a, b) {
	var i, j, olddoors = a.doors.length, room, door;
	
	a.concat(b);
	
	i = this.roomIndex(b);
	if (i !== null) {
		this.rooms.splice(i, 1);
	}
	
	// update all references to b to a
	for (i = 0; i < this.rooms.length; i++) {
		room = this.rooms[i];
		
		for (j = 0; j < room.doors.length; j++) {
			door = room.doors[j];
			
			if (door.room === b) {
				door.room = a;
				door.doorindex += olddoors;
			}
		}
	}
};

SWORD.Map.prototype.getDoors = function (room) {
	var i, j,
		doors = [],
		x1 = room.getLeft() - 1,
		x2 = room.getRight() + 1,
		y1 = room.getTop() - 1,
		y2 = room.getBottom() + 1;
	
	// check left hand wall
	for (j = y1; j < y2; j++) {
		if (this.data[x1 + "," + j] !== SWORD.terrains.wall) {
			doors.push({x: x1, y: j});
		}
	}

	// check right hand wall
	for (j = y1; j < y2; j++) {
		if (this.data[x2 + "," + j] !== SWORD.terrains.wall) {
			doors.push({x: x2, y: j});
		}
	}
	
	// check top wall
	for (i = x1; i < x2; i++) {
		if (this.data[i + "," + y1] !== SWORD.terrains.wall) {
			doors.push({x: i, y: y1});
		}
	}

	// check bottom wall
	for (i = x1; i < x2; i++) {
		if (this.data[i + "," + y2] !== SWORD.terrains.wall) {
			doors.push({x: i, y: y2});
		}
	}
	
	return doors;
};

SWORD.Map.prototype.shuffle = function () {
	var i, rnd, unplaced = [], rooms = [];
	
	for (i = 0; i < this.rooms.length; i++) {
		unplaced.push(this.rooms[i]);
	}
	
	while (unplaced.length > 0) {
		rnd = Math.floor(ROT.RNG.getUniform() * unplaced.length);
		
		rooms.push(unplaced[rnd]);
		unplaced.splice(rnd, 1);
	}
	
	this.rooms = rooms;
};

SWORD.Map.prototype.eachFloorTile = function (room, f) {
	var i, j, func = f.bind(this);
	
	for (i = room.getLeft(); i < room.getRight() + 1; i++) {
		for (j = room.getTop(); j < room.getBottom() + 1; j++) {
			func(i, j);
		}
	}
};

SWORD.Map.prototype.getRandomRoomCoord = function (room) {
	var x = room.getLeft() + Math.floor((room.getRight() - room.getLeft() + 1) * ROT.RNG.getUniform()),
		y = room.getTop() +  Math.floor((room.getBottom() - room.getTop() + 1) * ROT.RNG.getUniform());
	
	return x + "," + y;
};

SWORD.Map.prototype.placeFeatureRandom = function (feature) {
	var room = this.getRandomRoom();
	
	this.data[this.getRandomRoomCoord(room)] = feature;
};

SWORD.Map.prototype.addCreature = function (creature, coord) {
	var loc = SWORD.splitCoord(coord);
	
	this.creatures[coord] = creature;
	creature.x = loc.x;
	creature.y = loc.y;
};

SWORD.Map.prototype.deleteCreature = function (creature) {
	delete this.creatures[creature.x + "," + creature.y];
};

// function to randomly place the given scroll on the map
SWORD.Map.prototype.placeScrollRandom = function(scroll) {
	var x, y, offset, attempts = 0, done = false;
	
	while(!done) {
		
		x = Math.floor(this.w * ROT.RNG.getUniform());
		y = Math.floor(this.h * ROT.RNG.getUniform());

		offset = x + "," + y;
		
		if ((this.scrolls.hasOwnProperty(offset) === false) && (this.passable(offset))) {
			this.scrolls[offset] = scroll;
			done = true;
		}
		
		// make sure there's no infinite looping
		attempts++;
		if (attempts > this.data.length * this.h) {
			done = true;
		}
	}
	
	return scroll;
};

SWORD.Map.prototype.swapCreatures = function (a, b) {
	var temp_x = a.x,
		creatures = this.creatures;
	
	delete creatures[a.x];
	delete creatures[b.x];
	
	a.x = b.x;	
	b.x = temp_x;
	
	creatures[a.x] = a;
	creatures[b.x] = b;
};

SWORD.Map.prototype.tryMove = function (creature, x) {
	var room,
		destination,
		creatures,
		scroll;
	
	destination = creature.x + x;
	
	room = creature.room;
	creatures = room.creatures;
	
	// check for a wall
	if ((destination >= room.data.length) ||
		(destination < 0)) {
		
		return false;
	}
	
	if (room.data[destination].passable === false) {
		return false;
	}

	// check for another creature
	if (creatures.hasOwnProperty(destination)) {
		
		if (creatures[destination].team !== creature.team) {
			creature.tryAttack(creatures[destination], 5);
			
			return true;
		}
		
		return false;
	}
	
	/*
	// if you're the player, pick up the scroll here
	scroll = this.scrolls[destination];
	if (scroll && (creature === SWORD.game.player)) {
		SWORD.game.inventory.addScroll(scroll);
		delete this.scrolls[destination];
	}
	*/
	
	// if there's nothing in the way, move to the destination
	delete creatures[creature.x];
	creatures[destination] = creature;
	creature.x = destination;
	
	return true;
};


SWORD.Map.prototype.getCoordsInFov = function (creature, range) {
	var coords = [];
	
	this.fov.compute(creature.x, creature.y, range, function(x, y, r) {
		coords.push(x + "," + y);
	});
	
	return coords;
};

// Checks whether the two creatures are adjacent to eachother
SWORD.Map.prototype.a_adjacent_b = function (a, b) {
	var i, j, found = false;
	
	for (i = b.x - 1; i < b.x + 2; i++) {
		for (j = b.y - 1; j < b.y + 2; j++) {
			if (this.creatures[i+","+j] === a) {
				found = true;
			}
		}
	}
	
	return found;
};

// returns an array of all the creatures adjacent to the given point
SWORD.Map.prototype.getCreaturesAdjacentTo = function () {
	var x, y, i, j, offset, found = [];
	
	if (arguments.length === 1) {
		offset = arguments[0].split(",");
		x = parseInt(offset[0]);
		y = parseInt(offset[1]);
	}
	else if (arguments.length === 2) {
		x = arguments[0];
		y = arguments[1];
	}
	else {
		return found;
	}
	
	
	for (i = x - 1; i < x + 2; i++) {
		for (j = y - 1; j < y + 2; j++) {
		
			offset = i + "," + j;
			
			if (this.creatures.hasOwnProperty(offset)) {
				found.push(this.creatures[offset]);
			}
		}
	}
	
	return found;
};