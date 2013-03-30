SWORD.newPlayer = function () {
	// setup player
	var player = new SWORD.Creature("player");

	player.hallucinating = 0;
	player.hallucinateResist = 0;
	
	player.obsessed = 0;
	
	player.scrollbeacon = 0;

	player.canCast = function () {
		var can = true;
		
		if (this.illiterate > 0) {
			can = false;
		}
		
		return can;
	}
	
	player.lastSpell = null;
	
	player.makeHallucinate = function (turns) {
		if (this.hallucinateResist === 0) {
			SWORD.game.message.newMessage({type: "hallucinating"});
			this.hallucinating = turns;
		}
		else {
			SWORD.game.message.newMessage({type: "resist"});
		}
	};
	
	player.makeObsessed = function (turns) {
		if ((this.obsessed < 5) && (player.lastSpell !== null)) {
			SWORD.game.message.newMessage({type: "obsessed", scroll: this.lastSpell.scroll, spell: this.lastSpell.spell});
			SWORD.animateFlash([SWORD.game.player.x + "," + SWORD.game.player.y], "OBS", "#f00", "#300");

			this.obsessed = turns;
		}
	};
	
	player.act = function () {
		var p = ROT.RNG.getUniform();
		
		SWORD.game.engine.lock();
		document.addEventListener("keydown", this);
		
		if ((SWORD.game.player.obsessed > 0) && (player.lastSpell !== null) && (p > 0.7)) {
			SWORD.castFromScroll(player, player.lastSpell.scroll, player.lastSpell.spell);
			return;
		}
		
		if ((this.hallucinating > 0) && (p > 0.8)) {
			this.randomWander();
			this.endTurn();
			return;
		}
	};

	player.endTurn = function () {
	
		if (this.hallucinateResist > 0) {
			this.hallucinateResist -= 1;
		}
	
		if (this.hallucinating > 0) {
			this.hallucinating -= 1;
			
			if (this.hallucinating === 0) {
				this.hallucinateResist = 10;
			}
		}
		
		if (this.obsessed > 0) {
			this.obsessed--;
		}
		
		if (this.illiterate > 0) {
			this.illiterate--;
			
			if (this.illiterate === 0) {
				SWORD.game.message.newMessage({type: "not illiterate"});
			}
		}
		
		document.removeEventListener("keydown", this);
		SWORD.game.engine.unlock();

		SWORD.draw();
	};

	player.eventHandlers = {};
	
	player.handleEvent = function (e) {
		if (typeof this.eventHandlers[SWORD.game.state] === "function") {
			this.eventHandlers[SWORD.game.state](e, this);
		}
	};

	player.eventHandlers["game"] = function (e, that) {
		var key = e.keyCode,
			end_turn = false,
			map = SWORD.game.map;
			player = SWORD.game.player;

		switch (key) {
		
		// left
		case ROT.VK_LEFT:
		case ROT.VK_NUMPAD4:
		case ROT.VK_H:
			end_turn = SWORD.game.map.tryMove(that, -1, 0);
			break;
		
		// right
		case ROT.VK_RIGHT:
		case ROT.VK_NUMPAD6:
		case ROT.VK_L:
			end_turn = SWORD.game.map.tryMove(that, 1, 0);
			break;
			
		// rest
		case ROT.VK_NUMPAD5: // numpad 5
		case ROT.VK_PERIOD: // period
			end_turn = true;
			break;
		
		// show message log: m
		case ROT.VK_M:
			SWORD.game.state = "messagelog";
			SWORD.draw();
			break;
			
		case ROT.VK_F:
			SWORD.game.player.room.expand2();
			end_turn = true;
			break;
		
		case ROT.VK_Q:
			player.room.addFloorAt(player.x);
			end_turn = true;
			break;
		
		case ROT.VK_E:
			player.room.addFloorAt(player.x + 1);
			end_turn = true;
			break;

		case ROT.VK_P:
			SWORD.game.player.room.permute();
			end_turn = true;
			break;
			
		// concat player room and room to left
		case ROT.VK_A:
			var i = map.roomIndex(player.room);
			
			if (i - 1 >= 0) {
				map.concat(map.rooms[i - 1], player.room);
				player.room.seen = true;
				end_turn = true;
			}
						
			break;
			
		// concat player room and room to right
		case ROT.VK_D:
			var i = map.roomIndex(player.room);
			
			if (i + 1 < map.rooms.length) {
				map.concat(player.room, map.rooms[i + 1]);
				player.room.seen = true;
				end_turn = true;
			}
			
			break;
			
		/*
		// inventory: i
		case ROT.VK_I:
			SWORD.game.state = "inventory";
			SWORD.draw();
			break;

		// hotkeys
		case ROT.VK_Q:
			SWORD.game.inventory.castHotkeySpell("q");
			break;
			
		case ROT.VK_W:
			SWORD.game.inventory.castHotkeySpell("w");
			break;
			
		case ROT.VK_E:
			SWORD.game.inventory.castHotkeySpell("e");
			break;
			
		case ROT.VK_SLASH:
			SWORD.game.state = "help";
			SWORD.draw();
			break;
			
		// hotkey cursor cycle
		case ROT.VK_R:
			SWORD.game.inventory.hotkeycursor = (SWORD.game.inventory.hotkeycursor + 1) % 4;
			SWORD.draw();
			break;
		*/

		case ROT.VK_W:
			SWORD.game.map.wiggle = ! SWORD.game.map.wiggle;
			SWORD.draw();
			break;
		
		case ROT.VK_S:
			SWORD.game.map.shuffle();
			SWORD.draw();
			break;
		
		// operate to go to next floor OR open door
		case ROT.VK_O:
			var i,
				opendoor,
				newroom,
				map = SWORD.game.map,
				player = SWORD.game.player;
	
			
			if (player.room.data[player.x] === SWORD.terrains.downstairs) {
				SWORD.game.changeToMap(map.dlevel);
				SWORD.game.message.newMessage({type: "stairs down"});
				SWORD.draw()
			}
			
			
			// DOORS
			opendoor = player.room.getDoorAt(player.x);
			
			if (opendoor !== null) {
					
				newroom = opendoor.room;
				
				// if there's a monster on the other side we can't get through
				if (newroom.creatures.hasOwnProperty(newroom.doors[opendoor.doorindex].x)) {
					SWORD.game.message.newMessage({type: "door blocked"});
					end_turn = true;
					break;
				}
				
				delete player.room.creatures[player.x];
				
				player.room = newroom;
				player.x = newroom.doors[opendoor.doorindex].x;
				player.room.creatures[player.x] = player;
				
				player.room.seen = true;
				
				end_turn = true;
				break;
				
			}
			
			break;
		
		default:
			break;
		}
	
		if (end_turn) {
			that.endTurn();
		}
	};
	
	player.eventHandlers["messagelog"] = function (e, that) {
		var key = e.keyCode;
		
		switch (key) {
		
		// esc or m cancels out of messagebox
		case ROT.VK_ESCAPE:
		case ROT.VK_M:
			SWORD.game.state = "game";
			SWORD.draw();
			break;
			
		default:
			break;
		}
	};
	
	player.eventHandlers["help"] = function (e, that) {
		var key = e.keyCode;
		
		switch (key) {
		
		// esc or m cancels out of messagebox
		case ROT.VK_ESCAPE:
		case ROT.VK_SLASH:
			SWORD.game.state = "game";
			SWORD.draw();
			break;
			
		default:
			break;
		}
	};
	
	player.eventHandlers["start"] = function (e, that) {
		var key = e.keyCode;
		
		switch (key) {
			
		default:
			SWORD.game.state = "game";
			SWORD.draw();
			break;
		}
	};	

	player.eventHandlers["swap"] = function (e, that) {
		var key = e.keyCode;
		
		switch (key) {
		
		// left
		case ROT.VK_LEFT:
		case ROT.VK_NUMPAD4:
		case ROT.VK_H:
			SWORD.game.swap.next();
			break;
			
		// right
		case ROT.VK_RIGHT:
		case ROT.VK_NUMPAD6:
		case ROT.VK_L:
			SWORD.game.swap.prev();
			break;
			
		case ROT.VK_RETURN:
			SWORD.game.swap.doIt();
			break;
		
		default:
			break;
		}
		
		SWORD.draw();
	};
	
	player.eventHandlers["inventory"] = function (e, that) {
		var key = e.keyCode;
		var end_turn = false;
		var update = false,
			menu = SWORD.game.inventory.menu;
		
		switch (key) {
		// up
		case ROT.VK_UP:
		case ROT.VK_NUMPAD8:
		case ROT.VK_K:
			menu.moveCursor(-1);
			update = true;
			break;
		
		// down
		case ROT.VK_DOWN:
		case ROT.VK_NUMPAD2:
		case ROT.VK_J:
			menu.moveCursor(1);
			update = true;
			break;

		// esc or i cancels out of inventory
		case ROT.VK_ESCAPE:
		case ROT.VK_I:
			SWORD.game.state = "game";
			update = true;
			break;
		
		// read: r
		case ROT.VK_R:
		case ROT.VK_RETURN:
			menu.makeSelection() === true;
			
			update = true;
			break;
		
		// hotkey assignment
		case ROT.VK_Q:
			SWORD.game.inventory.putSelectedInHotkey("q");
			update = true;
			break;
			
		case ROT.VK_W:
			SWORD.game.inventory.putSelectedInHotkey("w");
			update = true;
			break;
			
		case ROT.VK_E:
			SWORD.game.inventory.putSelectedInHotkey("e");
			update = true;
			break;
			
		default:
			break;
		}
		
		if (update) {
			SWORD.draw();
		}
	};
	
	player.tryAttack = function (defender, damage) {
		
		SWORD.game.message.newMessage({type: "attack", attacker: this, defender: defender, damage: damage});
		
		defender.changeHP(-damage);
	};
	
	player.die = function () {
		SWORD.game.message.newMessage({type: "death", creature: this});
		SWORD.game.state = "death";	
		SWORD.draw();
	};
	
	return player;
};