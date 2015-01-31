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
            this.objects[i].draw();
        }
    }
};

function Ball(){
    this.state = resources.getAll("size", "speed", "bonus", "time");
    this.radius = 5;
    this.x = randomInt(this.radius, canvas.width-this.radius);
    this.y = randomInt(this.radius, canvas.height-this.radius);
    var ang = Math.random()*Math.PI*2;
    var speed = this.state.speed/2+1;
    this.dx = Math.cos(ang)*speed;
    this.dy = Math.sin(ang)*speed;
    this.color = 'hsl('+randomInt(0,360)+',80%,60%)';
};

Ball.prototype = {
    explode: function(pts){
        if(typeof pts === "undefined"){
            pts = 1;
        }
        resources.add('exp', pts + this.state.bonus);
        balls.remove(this);
        explodes.add(this, pts+1);
        points.add(this.x, this.y, pts+this.state.bonus);
    },
    
    update: function(){
        this.x += this.dx;
        if(this.x <= this.radius){
            this.dx = -this.dx;
            this.x = 2*this.radius - this.x;
        }else if(this.x + this.radius >= canvas.width){
            this.dx = -this.dx;
            this.x = 2*(canvas.width - this.radius) - this.x
        }
        this.y += this.dy;
        if(this.y <= this.radius){
            this.dy = -this.dy;
            this.y = 2*this.radius - this.y;
        }else if(this.y + this.radius >= canvas.height){
            this.dy = -this.dy;
            this.y = 2*(canvas.height - this.radius) - this.y
        }
    },
    
    draw: function(){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
    }
};

function Explosion(ball, pts){
    this.state = ball.state;
    this.x = ball.x;
    this.y = ball.y;
    this.color = ball.color;
    this.radius = (this.state.size+8)*3;
    this.timeLeft = (this.state.time+2)*30;
    this.pts = pts;
};

Explosion.prototype = {
    update: function(){
        this.timeLeft -= 1;
        if(this.timeLeft <= 0){
            explodes.remove(this); 
        }else{
            for(var i in balls.objects){
                var ball = balls.objects[i];
                if(collided(this, ball)){
                    ball.explode(this.pts);
                }
            }
        }
    },
    
    draw: function(){
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
    }
};

function Point(x, y, pts){
    ctx.font = "14px Arial";
    this.text = "+"+pts;
    this.x = x - ctx.measureText(this.text).width/2;
    this.y = y+5;
    this.time = 50;
};

Point.prototype = {
    update: function(){
        this.y -= .2;
        this.x += this.time%25<12? .2: -.2
        this.time -= 1;
        if(this.time <= 0){
            points.remove(this);
        }
    },
    
    draw: function(){
        ctx.font = "14px Arial";
        ctx.fillStyle = "rgba(0,0,0,"+this.time/25+")";
        ctx.beginPath();
        ctx.fillText(this.text, this.x, this.y);
    }
};