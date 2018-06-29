class Zone extends Particle {
    constructor(world, x, y, speed, direction, grav, radius) {
        super(x, y, speed, direction, grav)
        this.radius = radius;
        this.active = false;
        this.world = world;
    }
    update() {
        super.update();
        let player = this.world.player;
        if (this.distTo(player) <= this.radius) {
            this.onCollidePlayer();
            this.active = true;
        } else {
            this.active = false;
        }
    }
    onCollidePlayer() {
        console.log('collided with player');
    }
}

class Zoomie extends Zone {
    onCollidePlayer(){
        this.world.player.setSpeed(this.world.player.getSpeed() + 3);
    }
}
class Nullzone extends Zone {
    onCollidePlayer(){
        this.world.player.forceTowards(this, -0.5);
        this.world.player.energy -= 1;
    }
}
