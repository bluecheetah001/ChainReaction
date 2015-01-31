var scheduler, resources, fps, mouse, canvas, ctx, balls, explodes, points;

function init(){
    document.getElementById("save").addEventListener("click", save);
    document.getElementById("reset").addEventListener("click", reset);
    
    resources = new Resources();
    loadResources();
    
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    
    balls = new Objects(Ball);
    explodes = new Objects(Explosion);
    points = new Objects(Point);
    
    mouse = new Mouse();
    fps = new FPS();
    scheduler = new Scheduler();
    scheduler.add(save, 3600);
    scheduler.add(clearScreen, 60);
    scheduler.add(fps.update.bind(fps), 10);
    
    requestAnimationFrame(update);
};
    
function update(){
    scheduler.update();
    
    balls.update();
    explodes.update();
    points.update();
    
    ctx.clearRect(0,0,canvas.width, canvas.height);
    mouse.draw();
    balls.draw();
    explodes.draw();
    points.draw();
    
    resources.draw();
    
    requestAnimationFrame(this.update.bind(this));
};

function clearScreen(){
    if(balls.count == 0){
        explodes.clear();
    }
    if(explodes.count == 0){
        var max = resources.get('balls')+5;
        while(balls.count < max){
            balls.add();
        }
    }
};

function save(){
    resources.save();
};

function reset(){
    resources.reset();
    balls.clear();
    explodes.clear();
    points.clear();
    scheduler.reset();
    save();
};

function Scheduler(){
    this.events = [];
};

Scheduler.prototype = {
    reset: function(){
        for(var i in this.events){
            this.events[i].time = 0;
        }
    },
    
    add: function(func, delay){
        this.events.push({
            func:func,
            time:0,
            delay:delay
        });
    },
    
    update: function(){
        for(var i in this.events){
            var event = this.events[i];
            event.time -= 1;
            if(event.time <= 0){
                event.time = event.delay;
                event.func();
            }
        }
    }
};

function FPS(){
    this.elem = document.getElementById("fps");
};

FPS.prototype = {
    update: function(){
        var now = Date.now();
        var time = (now-this.then)/1000;
        this.then = now;
        if(isFinite(time)){
            this.elem.innerHTML = Math.round(10/time);
        }
    }
};

function Mouse(){
    this.onCanvas = false;
    canvas.addEventListener("mousedown", this.click.bind(this));
    canvas.addEventListener("mousemove", this.move.bind(this));
    canvas.addEventListener("mouseout", this.move.bind(this));
};

Mouse.prototype = {
    nearest: function(){
        var minDist = 50;
        var minBall;
        for(var i in balls.objects){
            var ball = balls.objects[i];
            var dist = distance(this, ball);
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
        }
    },
    
    move: function(event){
        var rect = canvas.getBoundingClientRect();
        this.x = event.clientX - rect.left;
        this.y = event.clientY - rect.top;
        this.onCanvas = !(this.x<=0 || this.x>=canvas.width || this.y<=0 || this.y>=canvas.height);
    },
    
    draw: function(){
        if(this.onCanvas){
            var ball = this.nearest();
            if(typeof ball !== "undefined"){
                ctx.setLineDash([3,5]);
                ctx.beginPath();
                ctx.moveTo(Math.round(ball.x), Math.round(ball.y));
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
            }
        }
    }
};