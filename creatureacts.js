SWORD.creatureActs = {};

SWORD.creatureActs.scientist = function () {
	var player = SWORD.game.player;
	
	if (this.room === player.room) {
	
		// if the player is next to the scientist and isn't hallucinating
		if ((this.room.adjacent(this, player)) && (player.hallucinating === 0)) {
			SWORD.game.message.newMessage({type: "spray", attacker: this});
			player.makeHallucinate(7);
		}
		
		// move towards player
		else {
			SWORD.game.map.tryMove(this, (player.x - this.x) > 0 ? 1 : -1);
		}
	}
	else {
		this.randomWander();
	}
};

// scarab runs towards the player + attacks when adjacent
SWORD.scarabAct = function () {
/*
	var i, coords, moved = false, map = SWORD.game.map;

	if (map.a_adjacent_b(SWORD.game.player, this)) {
	
		SWORD.animateFlash([SWORD.game.player.x + "," + SWORD.game.player.y], "@", "#f00", "#300");
		this.tryAttack(SWORD.game.player, 5);
		
		this.path = [];
	}
	else if (this.path.length === 0) {
		
		coords = map.getCoordsInFov(this, 10);
		
		for (i = 0; i < coords.length; i++) {
			if (map.creatures[coords[i]] === SWORD.game.player) {
				this.dijkstraToCreature(SWORD.game.player);
				this.followPath();
				moved = true;
			}
		}
		
		if (moved === false) {
			this.randomWander();
		}
	}
	else if (this.path.length > 0) {
		this.followPath();
	}
*/
}

// pharisee runs towards the player + attacks or makes obsessed
SWORD.phariseeAct = function () {
/*
	var i, coords, moved = false, map = SWORD.game.map;

	if (map.a_adjacent_b(SWORD.game.player, this)) {
	
		if ((SWORD.game.player.obsessed === 0) && (SWORD.game.player.lastSpell !== null)) {
			SWORD.game.player.makeObsessed(5);
		}
		else {
			SWORD.animateFlash([SWORD.game.player.x + "," + SWORD.game.player.y], "@", "#f00", "#300");
			this.tryAttack(SWORD.game.player, 10);
		}
		
		this.path = [];
	}
	else if (this.path.length === 0) {
		
		coords = map.getCoordsInFov(this, 10);
		
		for (i = 0; i < coords.length; i++) {
			if (map.creatures[coords[i]] === SWORD.game.player) {
				this.dijkstraToCreature(SWORD.game.player);
				this.followPath();
				moved = true;
			}
		}
		
		if (moved === false) {
			this.randomWander();
		}
	}
	else if (this.path.length > 0) {
		this.followPath();
	}
*/
}

SWORD.librarianAct = function () {
/*
	var i, coords, map = SWORD.game.map;
	
	coords = map.getCoordsInFov(this, 2);
	
	if (coords.length > 0) {
		for (i = 0; i < coords.length; i++) {
			if (map.creatures[coords[i]] === SWORD.game.player) {
				SWORD.game.inventory.curseRandomScroll(this);
				SWORD.animateFlash([SWORD.game.player.x + "," + SWORD.game.player.y], "CURSE", "#f00", "#300");
				break;
			}
		}
	}
*/
}

SWORD.legionaryAct = function () {
/*
	var i, coords, map = SWORD.game.map;

	if (map.a_adjacent_b(SWORD.game.player, this)) {
	
		SWORD.animateFlash([SWORD.game.player.x + "," + SWORD.game.player.y], "@", "#f00", "#300");
		this.tryAttack(SWORD.game.player, 5);
		
	}
	else if (this.path.length === 0) {
		coords = map.getCoordsInFov(this, 10);
		
		for (i = 0; i < coords.length; i++) {
			if (map.creatures[coords[i]] === SWORD.game.player) {
				this.path = SWORD.bresenhamUntil(this.x, this.y, SWORD.game.player.x, SWORD.game.player.y, map.passable.bind(map));
				this.followPath();
				break;
			}
		}
	}
	else if (this.path.length > 0) {
		this.followPath();
	}
*/
}