SWORD.Room = function (type) {
	this.w = SWORD.roomWidths[type] + Math.floor(SWORD.roomWidths[type] * ROT.RNG.getUniform()) - Math.floor(SWORD.roomWidths[type] / 3) ;
	this.type = type;

	this.data = [];
	this.creatures = {};
	
	this.doors = [];
	
	this.seen = false;
}

SWORD.Room.prototype.hasDoorAt = function (x) {
	var i, has = false;
	
	for (i = 0; i < this.doors.length; i++) {
		if (this.doors[i].x === x) {
			has = true;
			break;
		}
	}
	
	return has;
}

SWORD.Room.prototype.getDoorAt = function (x) {
	var i, door = null;
	
	for (i = 0; i < this.doors.length; i++) {
		if (this.doors[i].x === x) {
			door = this.doors[i];
			break;
		}
	}
	
	return door;
}

SWORD.Room.prototype.extendLeft = function () {
	var i, creatures = [];
	
	this.data.unshift(SWORD.terrains.floor);
	this.w = this.data.length;
	
	// update creature positions
	for (i in this.creatures) {
		if (this.creatures.hasOwnProperty(i)) {
			creatures.push(this.creatures[i]);
		}
	}
	
	this.creatures = {};
	
	for (i = 0; i < creatures.length; i++) {
		creatures[i].x += 1;
		this.creatures[creatures[i].x] = creatures[i];
	}
	
	// update door positions
	for (i = 0; i < this.doors.length; i++) {
		this.doors[i].x += 1;
	}
};

SWORD.Room.prototype.extendRight = function () {
	this.data.push(SWORD.terrains.floor);
	this.w = this.data.length;
};

SWORD.Room.prototype.permute = function () {
	var i, len = this.data.length,
		indices = [], neworder = [],
		oldindex,
		newdata = [],
		newcreatures = {}, doors = [];
	
	// get index of each tile
	// [0, 1, 2, 3, 4]
	for (i = 0; i < len; i++) {
		indices.push(i);
	}
	
	// jumble up the indices into the order array
	// [4, 1, 0, 3, 2]
	while (indices.length > 0) {
		i = Math.floor(ROT.RNG.getUniform() * indices.length);
		
		neworder.push(indices[i]);
		indices.splice(i, 1);
	}
	
	// put everything in its new place, so:
	// [0, 1, 2, 3, 4] old
	// [4, 1, 0, 3, 4] new
	for (i = 0; i < len; i++) {
		oldindex = neworder[i];
		
		newdata[i] = this.data[oldindex];
		
		// make an array of doors and their new x positions
		if (this.hasDoorAt(oldindex) === true) {
			doors.push({door: this.getDoorAt(oldindex), newx: i});
		}
		
		// update creature locations
		if (this.creatures.hasOwnProperty(oldindex)) {
			newcreatures[i] = this.creatures[oldindex];
			newcreatures[i].x = i;
		}
		
	}
	
	// update door locations
	for (i = 0; i < doors.length; i++) {
		doors[i].door.x = doors[i].newx;
	}
	
	this.data = newdata;
	this.creatures = newcreatures;
	
};

SWORD.Room.prototype.concat = function (b) {
	var i, olddoors = this.doors.length, oldw = this.data.length;
	
	// concat the data
	this.data = this.data.concat(b.data);
	
	// add the creatures from b to this
	for (i in b.creatures) {
		if (b.creatures.hasOwnProperty(i)) {
			b.creatures[i].x += oldw;
			b.creatures[i].room = this;
			this.creatures[b.creatures[i].x] = b.creatures[i];
		}
	}
	
	// sort out the doors
	for (i = 0; i < b.doors.length; i++) {
		b.doors[i].x += oldw;
	}
	this.doors = this.doors.concat(b.doors);
	
	// update the width
	this.w = this.data.length;
}

SWORD.Room.prototype.expand2 = function () {
	var i, creatures = [];
	
	for (i = 0; i < this.w; i++) {
		this.data.splice((i * 2) + 1, 0, SWORD.terrains.floor);
	}
	
	this.w *= 2;
	
	// update creature positions
	for (i in this.creatures) {
		if (this.creatures.hasOwnProperty(i)) {
			creatures.push(this.creatures[i]);
		}
	}
	
	this.creatures = {};
	
	for (i = 0; i < creatures.length; i++) {
		creatures[i].x *= 2;
		this.creatures[creatures[i].x] = creatures[i];
	}
	
	// update door positions
	for (i = 0; i < this.doors.length; i++) {
		this.doors[i].x *= 2;
	}
};

SWORD.Room.prototype.addFloorAt = function (x) {
	var i, creatures = {};
	this.data.splice(x, 0, SWORD.terrains.floor);
	
	// build an updated this.creatures
	for (i in this.creatures) {
		if (this.creatures.hasOwnProperty(i)) {
		
			// if the monster's to the right of where we're adding a floor, update its position
			if (this.creatures[i].x >= x) {
				this.creatures[i].x += 1;
			}
			
			creatures[this.creatures[i].x] = this.creatures[i];
		}
	}
	
	for (i = 0; i < this.doors.length; i++) {
		if (this.doors[i].x >= x) {
			this.doors[i].x += 1;
		}
	}
	
	this.creatures = creatures;
	this.w = this.data.length;
};

SWORD.Room.prototype.adjacent = function (a, b) {
	var adj = false;
	
	if (this.creatures[a.x + 1] === b) {
		adj = true;
	}
	
	if (this.creatures[a.x - 1] === b) {
		adj = true;
	}

	return adj;
};