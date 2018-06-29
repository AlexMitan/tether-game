window.onload = function() {
    var canvas = document.getElementById("paper"),
        ctx = canvas.getContext("2d"),
        w = canvas.width = window.innerWidth,
        h = canvas.height = window.innerHeight,
        fps = 30,
        frames = 1,
        mX, mY, mRX, mRY, leftMouseDown, rightMouseDown,
        keysDown = {};

    bub.ctx = ctx;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.lineWidth = 1;
    
    class Player extends Particle {
        constructor(world, x, y, grav) {
            super(x, y, 0, 0, grav);
            this.baseGravity = grav;
            this.baseGrappleForce = 2;
            this.baseGrappleRange = 450;
            this.attackTimer = 0;
            this.attackCooldown = 20;
            this.energy = 100;
            this.maxEnergy = 100;
            this.grapplePoint = null;
            this.world = world;
        }

        update() {
            super.update();
        }
    }
    var world = new World();
    var player = new Player(world, 5000, 5000, 0);
    world.player = player;
    
    var anchors = [];
    for (let i=0; i<500; i++) {
        anchors.push(new Zone(world, Math.random() * 10000, Math.random() * 10000, // x y
                                     Math.random() * 3, // speed
                                     Math.random() * 2 * Math.PI, // angle
                                     0)); // gravity
    }
    var zoomies = [];
    for (let i=0; i<100; i++) {
        zoomies.push(new Zoomie(world, Math.random() * 10000, Math.random() * 10000, // x y
                                     Math.random() * 1, // speed
                                     Math.random() * 2 * Math.PI, // angle
                                     0, randomInt(60, 150))); // gravity, radius
        zoomies[i].active = false;
    }

    var nullzones = [];
    for (let i=0; i<100; i++) {
        nullzones.push(new Nullzone(world, Math.random() * 10000, Math.random() * 10000, // x y
                                     Math.random() * 1, // speed
                                     Math.random() * 2 * Math.PI, // angle
                                     0, randomInt(200, 250))); // gravity, radius
    }
    var powerups = [];
    for (let i=0; i<100; i++) {
        powerups.push(new Zone(world, Math.random() * 10000, Math.random() * 10000, // x y
                                     Math.random() * 2, // speed
                                     Math.random() * 2 * Math.PI, // angle
                                     0)); // gravity
    }

    
    function update() {
        ctx.clearRect(0, 0, w, h);
        var mouseP = {x: mX + player.x - w/2, y: mY + player.y - h/2};
        
        ctx.save();
        ctx.translate(-player.x + w/2, -player.y + h/2);
        // find closest point
        var closestAnchor = anchors[0];
        var smallestDist = distP(mouseP, closestAnchor);
        for (let anchor of anchors){
            let dist = distP(mouseP, anchor);
            if (dist < smallestDist) {
                closestAnchor = anchor;
                smallestDist = dist;
            }
        }

        // set normal properties
        var grappleRange = player.baseGrappleRange;
        var grappleForce = player.baseGrappleForce;
        player.gravity = player.baseGravity;
        
       

        // powerup mechanic
        for (let powerup of powerups) {
            if (player.distTo(powerup) < 40) {
                player.gravity = 0;
                player.vx *= 1.5;
                player.vy *= 1.5;
                // player.baseGrappleForce += 5;
                player.baseGrappleRange += 50;
                powerups.splice(powerups.indexOf(powerup), 1);
                player.energy += 30;
                break;
            }
        }
        // nullzone mechanic
        for (let nullzone of nullzones) {
            nullzone.update();
        }
        // thrust mecanic
        if (player.energy >= 5){
            if (keysDown['w']) {
                player.vy -= 0.5;
                player.energy -= 1;
            }
            if (keysDown['s']) {
                player.vy += 0.5;
                player.energy -= 1;
            }
            if (keysDown['a']) {
                player.vx -= 0.5;
                player.energy -= 1;
            }
            if (keysDown['d']) {
                player.vx += 0.5;
                player.energy -= 1;
            }
        }
        player.energy = clamp(player.energy + 0.25, 0, player.maxEnergy);
        
        // grapple mechanic 
        // invalidate grapple if too far
        if (player.grapplePoint !== null && player.distTo(player.grapplePoint) > grappleRange) {
            player.grapplePoint = null;
        }
        if (leftMouseDown){
            var nearestDist = player.distTo(closestAnchor);
            if (player.grapplePoint === null && nearestDist < grappleRange) {
                player.grapplePoint = closestAnchor;
                var grappleDist = nearestDist;
            }
            if (player.grapplePoint !== null) {
                var grappleDist = player.distTo(player.grapplePoint);
            }
            if (grappleDist < grappleRange) {
                // towards
                if (grappleDist > 30){
                    player.forceTowards(player.grapplePoint, grappleDist > 30 ? grappleForce : -grappleForce);
                } else {
                    player.vx = (player.vx * 3 + player.grapplePoint.vx) / 4;
                    player.vy = (player.vy * 3 + player.grapplePoint.vy) / 4;
                }
                player.forceTowards(mouseP, clamp(grappleRange / grappleDist / 5, 0, 3));
                player.setSpeed(Math.min(player.getSpeed(), 20));
            }
        } else {
            // release on mouse down
            player.grapplePoint = null; 
        }

        // player.vy *= 0.9;
        // player.vx *= 0.9;
        // update
        player.setSpeed(Math.min(player.getSpeed(), 50));
        player.update();
        for (let i=0; i<anchors.length; i++) {
            anchors[i].update();
        }

        // render

        // grapple reticle
        bub.markP(mouseP, 'red', leftMouseDown ? 10 : 5);
        // nearest point
        if (distP(player, closestAnchor) < grappleRange) {
            bub.markP(closestAnchor, 'green', 15);
        }
        // range
        bub.markP(player, 'cyan', grappleRange);
        // grapple tether
        if (player.grapplePoint !== null){
            var cpX = player.x + player.vx * 4 + (player.grapplePoint.x - player.x) / 2;
            var cpY = player.y + player.vy * 4 + (player.grapplePoint.y - player.y) / 2;
            ctx.save();
            ctx.beginPath();
            // ctx.lineWidth = grappleForce / 3;
            ctx.moveTo(player.x, player.y);
            ctx.quadraticCurveTo(cpX, cpY, player.grapplePoint.x, player.grapplePoint.y);
            ctx.stroke();
            ctx.restore();
            // direct
            // bub.lineP(player, player.grapplePoint);
        }
        // player
        bub.markP(player, 'blue', 10);
        bub.markP(player, 'cyan', clamp(9 * player.energy / player.maxEnergy, 0.1, 9));
        for (let p of anchors) {
            bub.markP(p, 'green', 5);
        }
        for (let p of zoomies) {
            bub.markP(p, 'yellow', p.active ? p.radius + 20 : p.radius);
            // p.active = false; // hack
            p.update();
        }
        for (let p of nullzones) {
            bub.markP(p, 'purple', p.radius);
        }
        for (let p of powerups) {
            bub.diamond(p.x, p.y, 40);
        }

        frames++;
        if (frames < 150) {
            ctx.fillText("WASD to move (uses energy)", player.x - 50, player.y - 50); 
            ctx.fillText("Mouse click and move to tether", player.x - 50, player.y + 50); 
        }
        ctx.restore();
        setTimeout(update, 1000/30);
    }

    update();

    $('#paper').mousemove(function(event) {
        mX = event.pageX - $(this).offset().left;
        mY = event.pageY - $(this).offset().top;
        mRX = mX / w;
        mRY = mY / h;
    });
    // $('#paper').keydown(function(event) {
    //     console.log('pressed code ' + event);
    //     leftMouseDown = true;
    // });
    $('#paper').mousedown((event) => {
        switch (event.which) {
            case 1:
                // Left
                leftMouseDown = true;
                break;
            case 2:
                // Middle
                break;
            case 3:
                // Right
                rightMouseDown = true;
                break;
            default:
                break;
        }
    });
    // document.getElementById('paper').addEventListener('keydown', (e) => {
    //     console.log(e)
    // });
    $(document.body).keydown(function(e) {
        // console.log(e.which);
        // 87 w
        // 65 a
        // 83 s 
        // 68 d
        switch (e.which) {
            case 87: // w
                keysDown['w'] = true;
                break;
            case 83: // s
                keysDown['s'] = true;
                break;
            case 65: // a
                keysDown['a'] = true;
                break;
            case 68: // d
                keysDown['d'] = true;
                break;
        }
    });
    $(document.body).keyup(function(e) {
        // console.log(e.which);
        // 87 w
        // 65 a
        // 83 s 
        // 68 d
        switch (e.which) {
            case 87: // w
                keysDown['w'] = false;
                break;
            case 83: // s
                keysDown['s'] = false;
                break;
            case 65: // a
                keysDown['a'] = false;
                break;
            case 68: // d
                keysDown['d'] = false;
                break;
        }
    });
    $('#paper').mouseup((event) => {
        switch (event.which) {
            case 1:
                // Left
                leftMouseDown = false;
                break;
            case 2:
                // Middle
                break;
            case 3:
                // Right
                rightMouseDown = false;
                break;
            default:
                break;
        }
    });

}
