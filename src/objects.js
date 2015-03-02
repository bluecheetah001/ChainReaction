function Objects(constructor){
    this.ctor = constructor
    this.objects = [];
    this.count = 0;
    this.nextID = 0;
};

Objects.prototype = {
    add: function(){
        var args = Array.prototype.slice.call(arguments);
        var obj = new (this.ctor.bind.apply(this.ctor, [null].concat(args)))();
        obj.ID = this.nextID;
        this.objects[this.nextID] = obj;
        this.nextID += 1;
        this.count += 1;
        return obj;
    },
    
    remove: function(obj){
        delete this.objects[obj.ID];
        this.count -= 1;
        if(this.count == 0){
            this.nextID = 0;
        }
    },
    
    clear: function(){
        this.objects = [];
        this.count = 0;
        this.nextID = 0;
    },
    
    update: function(){
        for(var i in this.objects){
            this.objects[i].update();
        }
    },
    
    draw: function(){
        for(var i in this.objects){
            reactor.ctx.save();
            this.objects[i].draw();
            reactor.ctx.restore();
        }
    }
};

function Ball(){
    this.radius = (resources.get("size")+5)/5;
    this.x = randomInt(this.radius-reactor.width/2, reactor.width/2-this.radius);
    this.y = randomInt(this.radius-reactor.height/2, reactor.height/2-this.radius);
    this.ang = Math.random()*Math.PI*2;
    this.color = "hsl("+randomInt(0, 360)+",80%,60%)";
};

Ball.prototype = {
    explode: function(group){
        if(typeof group === "undefined"){
            group = [0];
        }
        reactor.balls.remove(this);
        reactor.explodes.add(this, group);
        var pts = group[0]*(1+resources.get("bonus"));
        reactor.points.add(reactor.transformed(this), pts);
        stats.add("exp", pts);
        stats.add("explodes", 1);
        stats.set("chain", group[0]+1);
    },
    
    update: function(){
        this.radius = (resources.get("size")+5)/5;
        this.x += Math.cos(this.ang)*((resources.get("speed")+5)/15)
        if(this.x - this.radius <= -reactor.width/2){
            this.ang = Math.PI-this.ang;
            this.x = 2*(this.radius - reactor.width/2) - this.x;
        }else if(this.x + this.radius >= reactor.width/2){
            this.ang = Math.PI-this.ang;
            this.x = 2*(reactor.width/2 - this.radius) - this.x;
        }
        this.y += Math.sin(this.ang)*((resources.get("speed")+5)/15);
        if(this.y - this.radius <= -reactor.height/2){
            this.ang = -this.ang;
            this.y = 2*(this.radius - reactor.height/2) - this.y;
        }else if(this.y + this.radius >= reactor.height/2){
            this.ang = -this.ang;
            this.y = 2*(reactor.height/2 - this.radius) - this.y;
        }
    },
    
    draw: function(){
        reactor.ctx.fillStyle = this.color;
        reactor.ctx.beginPath();
        reactor.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        reactor.ctx.fill();
    }
};

function Explosion(ball, group){
    this.x = ball.x;
    this.y = ball.y;
    this.color = ball.color;
    this.radius = ball.radius;
    this.dr = (resources.get("size")+5)/10
    this.inner = 0;
    this.timeLeft = (resources.get("time")+5)*12;
    this.group = group;
    this.group[0]+=1;
};

Explosion.prototype = {
    update: function(){
        this.radius += this.dr;
        this.dr /= 1.1;
            this.timeLeft -= 1;
        if(this.timeLeft <= 0){
            this.inner += (this.radius+5*this.inner)/50;
            if(this.inner >= this.radius){
                reactor.explodes.remove(this);
            }
        }
        for(var i in reactor.balls.objects){
            var ball = reactor.balls.objects[i];
            if(collided(this, ball)){
                ball.explode(this.group);
            }
        }
    },
    
    draw: function(){
        reactor.ctx.strokeStyle = this.color;
        reactor.ctx.lineWidth = (this.radius-this.inner);
        reactor.ctx.beginPath();
        reactor.ctx.arc(this.x, this.y, (this.radius+this.inner)/2, 0, Math.PI*2);
        reactor.ctx.stroke();
    }
};

function Point(pos, pts){
    reactor.ctx.font = "14px Arial";
    this.text = "+"+stringify(pts);
    this.x = pos.x - reactor.ctx.measureText(this.text).width/2;
    this.y = pos.y+5;
    this.time = 50;
};

Point.prototype = {
    update: function(){
        this.y -= .2;
        this.x += this.time%25<12? .2: -.2
        this.time -= 1;
        if(this.time <= 0){
            reactor.points.remove(this);
        }
    },
    
    draw: function(){
        reactor.ctx.font = "14px Arial";
        reactor.ctx.fillStyle = "rgba(0,0,0,"+this.time/25+")";
        reactor.ctx.beginPath();
        reactor.ctx.fillText(this.text, this.x, this.y);
    }
};

function Mouse(canvas){
    this.onCanvas = false;
    canvas.addEventListener("mousedown", this.click.bind(this));
    canvas.addEventListener("mousemove", this.move.bind(this));
    canvas.addEventListener("mouseout", this.move.bind(this));
};

Mouse.prototype = {
    nearest: function(){
        var minDist = 75 + resources.get("speed");
        var minBall;
        for(var i in reactor.balls.objects){
            var ball = reactor.balls.objects[i];
            var dist = distance(this, reactor.transformed(ball));
            if(dist < minDist){
                minDist = dist;
                minBall = ball;
            }
        }
        return minBall;
    },
    
    click: function(event){
        this.move(event);
        var ball = this.nearest();
        if(typeof ball !== "undefined"){
            ball.explode();
            stats.add("clicks", 1);
        }
    },
    
    move: function(event){
        var rect = reactor.canvas.getBoundingClientRect();
        this.x = event.clientX - rect.left;
        this.y = event.clientY - rect.top;
        this.onCanvas = !(this.x<=0 || this.x>=reactor.canvas.width || this.y<=0 || this.y>=reactor.canvas.height);
    },
    
    draw: function(){
        if(this.onCanvas){
            var ball = this.nearest();
            if(typeof ball !== "undefined"){
                pos = reactor.transformed(ball);
                reactor.ctx.save();
                reactor.ctx.setLineDash([3, 5]);
                reactor.ctx.beginPath();
                reactor.ctx.moveTo(pos.x, pos.y);
                reactor.ctx.lineTo(this.x, this.y);
                reactor.ctx.stroke();
                reactor.ctx.restore();
            }
        }
    }
};

function Reactor(){
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    
    this.width = (this.canvas.width*(stats.get("explodes")-stats.get("clicks")+200))/1000;
    this.height = (this.canvas.height*(stats.get("explodes")-stats.get("clicks")+200))/1000;
    
    this.balls = new Objects(Ball);
    this.explodes = new Objects(Explosion);
    this.points = new Objects(Point);
    
    this.mouse = new Mouse(this.canvas);
    
    this.delay = 0;
};

Reactor.prototype = {
    update: function(){
        this.balls.update();
        this.explodes.update();
        this.points.update();
        
        var time = this.spawnDelay();
        if(isFinite(time)){
            this.delay += 1;
            if(this.delay > time){
                this.balls.add();
            }
        }else{
            this.delay = 0;
        }
        
        this.width = (this.canvas.width*(stats.get("explodes")-stats.get("clicks")+200))/1000;
        this.height = (this.canvas.height*(stats.get("explodes")-stats.get("clicks")+200))/1000;
    },
    
    draw: function(){
        this.ctx.clearRect(0, 0, reactor.canvas.width, reactor.canvas.height);
        this.mouse.draw();
        this.ctx.setTransform(this.canvas.width/this.width, 0,
            0,this.canvas.height/this.height,
            this.canvas.width/2, this.canvas.height/2);
        this.balls.draw();
        this.explodes.draw();
        this.ctx.setTransform(1,0,0,1,0,0);
        this.points.draw();
    },
    
    transformed: function(point) {
        return {
            x: point.x * this.canvas.width/this.width + this.canvas.width/2,
            y: point.y * this.canvas.height/this.height + this.canvas.height/2
        }
    },
    
    spawnDelay: function(){
        var count = resources.get("balls")+5-this.balls.count-this.explodes.count;
        return 30*(1+this.explodes.count)/count;
    },
    
    reset: function(){
        this.balls.clear();
        this.explodes.clear();
        this.points.clear();
    }
};