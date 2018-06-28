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
    

    var anchors = [];
    for (let i=0; i<500; i++) {
        anchors.push(new Particle(Math.random() * 10000, Math.random() * 10000, // x y
                                     Math.random() * 3, // speed
                                     Math.random() * 2 * Math.PI, // angle
                                     0)); // gravity
    }
    var zoomies = [];
    for (let i=0; i<100; i++) {
        zoomies.push(new Particle(Math.random() * 10000, Math.random() * 10000, // x y
                                     Math.random() * 1, // speed
                                     Math.random() * 2 * Math.PI, // angle
                                     0)); // gravity
        zoomies[i].active = false;
    }

    var nullzones = [];
    for (let i=0; i<100; i++) {
        nullzones.push(new Particle(Math.random() * 10000, Math.random() * 10000, // x y
                                     Math.random() * 1, // speed
                                     Math.random() * 2 * Math.PI, // angle
                                     0)); // gravity
    }
    var powerups = [];
    for (let i=0; i<100; i++) {
        powerups.push(new Particle(Math.random() * 10000, Math.random() * 10000, // x y
                                     Math.random() * 2, // speed
                                     Math.random() * 2 * Math.PI, // angle
                                     0)); // gravity
    }

    var player = new Particle(w / 2, h / 2, 5, 0, 0.5);
    player.baseGravity = 0;
    player.baseGrappleForce = 2;
    player.baseGrappleRange = 450;
    player.attackTimer = 0;
    player.attackCooldown = 20;
    player.energy = 100;
    player.maxEnergy = 100;
    var grapplePoint = null;
    
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
            if (player.distTo(nullzone) < 200) {
                player.gravity = 0;
                player.vx *= 0.95;
                player.vy *= 0.95;
                // grappleForce = 20;
                // player.gravitateTo(nullzone);
                grappleRange = 900;
            }
        }
        // zoomie mechanic
        for (let zoomie of zoomies) {
            if (player.distTo(zoomie) < 100) {
                // player.vy = -Math.abs(player.vy);
                // player.vy = Math.min(-Math.abs(player.vy), -20);
                player.setSpeed(player.getSpeed() + 3);
                zoomie.active = true;
            }
        }

        // thrust mecanic
        if (player.energy >= 0){
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
        console.log(player.energy);
        player.energy = clamp(player.energy + 0.25, 0, player.maxEnergy);
        
        // grapple mechanic 
        // invalidate grapple if too far
        if (grapplePoint !== null && player.distTo(grapplePoint) > grappleRange) {
            grapplePoint = null;
        }
        if (leftMouseDown){
            var nearestDist = player.distTo(closestAnchor);
            if (grapplePoint === null && nearestDist < grappleRange) {
                grapplePoint = closestAnchor;
                var grappleDist = nearestDist;
            }
            if (grapplePoint !== null) {
                var grappleDist = player.distTo(grapplePoint);
            }
            if (grappleDist < grappleRange) {
                // towards
                if (grappleDist > 30){
                    player.forceTowards(grapplePoint, grappleDist > 30 ? grappleForce : -grappleForce);
                } else {
                    player.vx = (player.vx * 3 + grapplePoint.vx) / 4;
                    player.vy = (player.vy * 3 + grapplePoint.vy) / 4;
                }
                player.forceTowards(mouseP, clamp(grappleRange / grappleDist / 5, 0, 3));
                player.setSpeed(Math.min(player.getSpeed(), 20));
            }
        } else {
            // release on mouse down
            grapplePoint = null; 
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
        if (grapplePoint !== null){
            var cpX = player.x + player.vx * 4 + (grapplePoint.x - player.x) / 2;
            var cpY = player.y + player.vy * 4 + (grapplePoint.y - player.y) / 2;
            ctx.save();
            ctx.beginPath();
            // ctx.lineWidth = grappleForce / 3;
            ctx.moveTo(player.x, player.y);
            ctx.quadraticCurveTo(cpX, cpY, grapplePoint.x, grapplePoint.y);
            ctx.stroke();
            ctx.restore();
            // direct
            // bub.lineP(player, grapplePoint);
        }
        // player
        bub.markP(player, 'blue', 10);
        bub.markP(player, 'cyan', clamp(9 * player.energy / player.maxEnergy, 0.1, 9));
        for (let p of anchors) {
            bub.markP(p, 'green', 5);
        }
        for (let p of zoomies) {
            bub.markP(p, 'yellow', p.active ? 120 : 100);
            p.active = false; // hack
        }
        for (let p of nullzones) {
            bub.markP(p, 'purple', 200);
        }
        for (let p of powerups) {
            bub.diamond(p.x, p.y, 40);
        }

        frames++;
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
    $('#paper').keydown(function(event) {
        console.log('pressed code ' + event);
        leftMouseDown = true;
    });
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
        console.log(e.which);
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
        console.log(e.which);
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
