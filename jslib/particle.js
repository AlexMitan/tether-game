var particle = {
	x: 0,
	y: 0,
	vx: 0,
	vy: 0,
	mass: 1,
	radius: 0,
	bounce: -1,
	friction: 1,
	gravity: 0,
	springs: null,
	gravitations: null,

	create: function(x, y, speed, direction, grav) {
		var obj = Object.create(this);
		obj.x = x;
		obj.y = y;
		obj.vx = Math.cos(direction) * speed;
		obj.vy = Math.sin(direction) * speed;
		obj.gravity = grav || 0;
		obj.springs = [];
		obj.gravitations = [];
		return obj;
	},

	addGravitation: function(p) {
		this.removeGravitation(p);
		this.gravitations.push(p);
	},

	removeGravitation: function(p) {
		for(var i = 0; i < this.gravitations.length; i += 1) {
			if(p === this.gravitations[i]) {
				this.gravitations.splice(i, 1);
				return;
			}
		}
	},

	addSpring: function(point, k, length) {
		this.removeSpring(point);
		this.springs.push({
			point: point,
			k: k,
			length: length || 0
		});
	},

	removeSpring: function(point) {
		for(var i = 0; i < this.springs.length; i += 1) {
			if(point === this.springs[i].point) {
				this.springs.splice(i, 1);
				return;
			}
		}
	},

	getSpeed: function() {
		return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
	},

	setSpeed: function(speed) {
		var heading = this.getHeading();
		this.vx = Math.cos(heading) * speed;
		this.vy = Math.sin(heading) * speed;
	},

	getHeading: function() {
		return Math.atan2(this.vy, this.vx);
	},

	setHeading: function(heading) {
		var speed = this.getSpeed();
		this.vx = Math.cos(heading) * speed;
		this.vy = Math.sin(heading) * speed;
	},

	accelerate: function(ax, ay) {
		this.vx += ax;
		this.vy += ay;
	},

	update: function() {
		this.handleSprings();
		this.handleGravitations();
		this.vx *= this.friction;
		this.vy *= this.friction;
		this.vy += this.gravity;
		this.x += this.vx;
		this.y += this.vy;
	},

	handleGravitations: function() {
		for(var i = 0; i < this.gravitations.length; i += 1) {
			this.gravitateTo(this.gravitations[i]);
		}
	},

	handleSprings: function() {
		for(var i = 0; i < this.springs.length; i += 1) {
			var spring = this.springs[i];
			this.springTo(spring.point, spring.k, spring.length);
		}
	}, 

	angleTo: function(p2) {
		return Math.atan2(p2.y - this.y, p2.x - this.x);
	},

	distTo: function(p2) {
		var dx = p2.x - this.x,
			dy = p2.y - this.y;

		return Math.sqrt(dx * dx + dy * dy);
	},

	gravitateTo: function(p2) {
		var dx = p2.x - this.x,
			dy = p2.y - this.y,
			distSQ = dx * dx + dy * dy,
			dist = Math.sqrt(distSQ),
			force = p2.mass / distSQ,
			ax = dx / dist * force,
			ay = dy / dist * force;

		this.vx += ax;
		this.vy += ay;
	},

	springTo: function(point, k, length) {
		var dx = point.x - this.x,
			dy = point.y - this.y,
			distance = Math.sqrt(dx * dx + dy * dy),
			springForce = (distance - length || 0) * k; 
		this.vx += dx / distance * springForce,
		this.vy += dy / distance * springForce;
	},

	forceTowards: function(point, f) {
		var dx = point.x - this.x,
			dy = point.y - this.y,
			dist = this.distTo(point);

		this.vx += dx / dist * f;
		this.vy += dy / dist * f;
	}
};
class Particle {
	constructor(x, y, speed, direction, grav) {
		this.x = x;
		this.y = y;
		this.vx = Math.cos(direction) * speed;
		this.vy = Math.sin(direction) * speed;
		this.mass = 1;
		this.radius = 0;
		this.bounce = -1;
		this.friction = 1;
		this.gravity = grav || 0;
		this.springs = [];
		this.gravitations = [];
	}

	addGravitation(p) {
		this.removeGravitation(p);
		this.gravitations.push(p);
	}

	removeGravitation(p) {
		for(var i = 0; i < this.gravitations.length; i += 1) {
			if(p === this.gravitations[i]) {
				this.gravitations.splice(i, 1);
				return;
			}
		}
	}

	addSpring(point, k, length) {
		this.removeSpring(point);
		this.springs.push({
			point: point,
			k: k,
			length: length || 0
		});
	}

	removeSpring(point) {
		for(var i = 0; i < this.springs.length; i += 1) {
			if(point === this.springs[i].point) {
				this.springs.splice(i, 1);
				return;
			}
		}
	}

	getSpeed() {
		return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
	}

	setSpeed(speed) {
		var heading = this.getHeading();
		this.vx = Math.cos(heading) * speed;
		this.vy = Math.sin(heading) * speed;
	}

	getHeading() {
		return Math.atan2(this.vy, this.vx);
	}

	setHeading(heading) {
		var speed = this.getSpeed();
		this.vx = Math.cos(heading) * speed;
		this.vy = Math.sin(heading) * speed;
	}

	accelerate(ax, ay) {
		this.vx += ax;
		this.vy += ay;
	}

	update() {
		this.handleSprings();
		this.handleGravitations();
		this.vx *= this.friction;
		this.vy *= this.friction;
		this.vy += this.gravity;
		this.x += this.vx;
		this.y += this.vy;
	}

	handleGravitations() {
		for(var i = 0; i < this.gravitations.length; i += 1) {
			this.gravitateTo(this.gravitations[i]);
		}
	}

	handleSprings() {
		for(var i = 0; i < this.springs.length; i += 1) {
			var spring = this.springs[i];
			this.springTo(spring.point, spring.k, spring.length);
		}
	} 

	angleTo(p2) {
		return Math.atan2(p2.y - this.y, p2.x - this.x);
	}

	distTo(p2) {
		var dx = p2.x - this.x,
			dy = p2.y - this.y;

		return Math.sqrt(dx * dx + dy * dy);
	}

	gravitateTo(p2) {
		var dx = p2.x - this.x,
			dy = p2.y - this.y,
			distSQ = dx * dx + dy * dy,
			dist = Math.sqrt(distSQ),
			force = p2.mass / distSQ,
			ax = dx / dist * force,
			ay = dy / dist * force;

		this.vx += ax;
		this.vy += ay;
	}

	springTo(point, k, length) {
		var dx = point.x - this.x,
			dy = point.y - this.y,
			distance = Math.sqrt(dx * dx + dy * dy),
			springForce = (distance - length || 0) * k; 
		this.vx += dx / distance * springForce,
		this.vy += dy / distance * springForce;
	}

	forceTowards(point, f) {
		var dx = point.x - this.x,
			dy = point.y - this.y,
			dist = this.distTo(point);

		this.vx += dx / dist * f;
		this.vy += dy / dist * f;
	}
}