
SWORD.angleToDir = function (angle) {
	var dirs = ROT.DIRS[8];
	return dirs[Math.round((angle / (Math.PI/4)) - 0.5).mod(8)];
};

SWORD.angleBetweenPoints = function (x1, y1, x2, y2) {
	return Math.atan2(x2 - x1, y1 -  y2);
};


// stole this bresenham off the internet + rewhitespaced it trying to figure it out
SWORD.bresenham = function (x0, y0, x1, y1) {
	
	var ret = [],
		i, j;
	
	dx = Math.abs(x1 - x0);
	dy = Math.abs(y1 - y0);
	
	xdir = (x0 < x1) ? 1 : -1;
	ydir = (y0 < y1) ? 1 : -1;
	
	if (dx > dy) {
		j = 0;
		add = dy/dx;
		
		for (i = x0; i !== x1; i += xdir) {
			j += add * ydir;
			
			
		}
	}
	else {
	}
	
	
	return ret;
}

// bresenham which goes from (x0, y0) to (x1, y1) but keeps going until f(x, y) returns false

SWORD.bresenhamUntil = function (x0, y0, x1, y1, f) {
	
	var ret = [],
		dx = Math.abs(x1 - x0),
		sx = x0 < x1 ? 1 : -1,
		
		dy = Math.abs(y1 - y0),
		sy = y0 < y1 ? 1 : -1,
		
		err = (dx > dy ? dx : -dy)/2,
		e2;
 
	while (true) {
	
		if (f(x0, y0) === false) {
			break;
		}
	
		ret.push([x0, y0]);
		
		e2 = err;
		
		if (e2 > -dx) {
			err -= dy; x0 += sx;
		}
		
		if (e2 < dy) {
			err += dx; y0 += sy;
		}
	}
	
	return ret;
	
}