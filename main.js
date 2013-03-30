SWORD.nonsensecount = 30;

SWORD.nonsense = (function () {
	var i, j, size, str, ret = [];
	
	for (i = 0; i < SWORD.nonsensecount; i++) {
		
		str = "";
		size = 5 + Math.ceil(Math.random() * 3);
		
		for (j = 0; j < size; j++) {
			str += String.fromCharCode(48 + Math.ceil(Math.random() * 78));
		}
		
		ret.push(str);
	}
	
	return ret;
})();

SWORD.draw = function () {
	var i, j, y, player_in_room,
		room,
		door,
		msg,
		messages,
		map = SWORD.game.map,
		display = SWORD.display,
		player = SWORD.game.player,
		player_door,
		fg, bg;
	
	currentpos = 0;
	
	display.clear();
	display.drawRect(0, 0, display.w, 5, "#321");

	player_door = (player.room.hasDoorAt(player.x)) ? player.room.getDoorAt(player.x) : null;

	for (i = 0; i < map.rooms.length; i++) {
		
		room = map.rooms[i];
		
		// if we haven't seen the room, don't draw it
		if (room.seen === false) {
			currentpos += room.data.length + 2;
			continue;
		}
		
		currentpos++;
		
		player_in_room = (room === player.room);
				
		bg = player_in_room ? "#111" : "#210";
		fg = player_in_room ? "#A98" : "#432";
	
		for (j = 0; j < room.data.length; j++) {
			
			y = (player.hallucinating > 0) && player_in_room ? Math.round(Math.cos(currentpos + map.wiggleoffset)) + 2 : 2;
			
			// if it's a door, draw it with the correct color
			door = room.getDoorAt(j);
			
			if (door !== null) {
				display.draw(currentpos, y, room.data[j].symbol, door.color, bg);
				
				if ((door.room.seen === true) && (door === player_door)) {
					display.draw(currentpos, y + 1, "^", door.color, "#321");
				}
				
				if (door.room.doors[door.doorindex] === player_door) {
					display.draw(currentpos, y + 1, "^", door.color, "#321");
				}
			}
			else {
				display.draw(currentpos, y, room.data[j].symbol, fg, bg);
			}
			
			if (player_in_room) {
				if (room.creatures.hasOwnProperty(j)) {
					display.draw(currentpos, y, room.creatures[j].symbol, "white", bg);
				}
			}
			
			currentpos++;
		}
		
		currentpos += 1;
	}
	
	map.wiggleoffset += 2;
	
	display.drawText(1, 5, "@: " + player.hp + "/" + player.maxhp);
	
	display.drawText(12, 5, (player.hallucinating > 0) ? "%c{cyan}HALLUCINATING" : "");
	
	// display messages
	messages = SWORD.game.message.latestMessages();
	
	for (i = 0; i < messages.length; i++) {
		msg = messages[i].longText();
		display.drawText(1, 6 + i, msg[0]);
	}
	
};


SWORD.inventoryScrollAoE = function (scroll, spell) {
	var i,
		c,
		xy,
		fg,
		chr,
		inv = SWORD.game.inventory,
		coords = SWORD.getScrollAoE(SWORD.game.player, scroll, spell);
		
	for (i = 0; i < coords.length; i++) {
		c = coords[i];
		xy = c.split(",");
		fg = "#a33";
		
		chr = SWORD.game.map.data[c].symbol;
		
		// draw scroll
		if(SWORD.game.map.scrolls.hasOwnProperty(c)) {
			chr = "?";
		}
		
		// draw creature
		if(SWORD.game.map.creatures.hasOwnProperty(c)) {
			chr = SWORD.game.map.creatures[c].symbol;
			fg = "white";
		}
		
		this.display.draw(parseInt(xy[0]), parseInt(xy[1]), chr, fg , "#400");
	}
};

SWORD.animateFlash = function (coords, character, fg, bg) {
	var i, t, clist = [];
	
	for (i = 0; i < coords.length; i++) {
		t = coords[i].split(",");
		
		clist.push({x: parseInt(t[0]), y: parseInt(t[1])});
	}
	
	
	SWORD.animate = {coords: clist, character: character, fg: fg, bg: bg};
	
	SWORD.game.engine.lock()
	
	setTimeout(SWORD.clearFlash, 300);
};

SWORD.clearFlash = function () {
	SWORD.animate = null;
	SWORD.game.engine.unlock();
	SWORD.draw();
};

// MAIN
SWORD.main = function () {
	// init display
	this.display = new ROT.Display( {width: 120, height: 9} );
	this.display.w = 120;
	this.display.h = 8;
	this.display.drawRect = function (x1, y1, x2, y2, bg) {
		for (j = y1; j < y2; j++) {
			for (i = x1; i < x2; i++) {
				this.draw(i, j, " ", bg, bg);
			}
		}
	};
	
	//this.display.setOptions({fontFamily: "Palatino"});
	
	document.body.appendChild(this.display.getContainer());

	// setup game's state
	this.game = new SWORD.Game();
	this.game.engine.start();
	
	// add some starting scrolls
	//for (i = 0; i < 3; i++) {
	//	this.game.inventory.addScroll(SWORD.randomScroll(this.game.map.dlevel));
	//}
	
	//this.game.message.newMessage({type: "start"});
	
	this.draw();
};