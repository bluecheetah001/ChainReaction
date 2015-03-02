var scheduler, screens, fps;
var reactor, resources, stats;

function init(){
    document.getElementById("save").addEventListener("click", save);
    document.getElementById("reset").addEventListener("click", reset);
    document.getElementById("prestige").addEventListener("click", prestige);
    
    resources = new Resources();
    addResources();
    
    stats = new Stats();
    addStats();
    
    reactor = new Reactor();
    
    screens = new Screens();
    screens.addScreen("reactor", reactor);
    screens.addScreen("resources", resources);
    screens.addScreen("stats", stats);
    
    fps = new FPS();
    scheduler = new Scheduler();
    scheduler.add(save, 3600);
    scheduler.add(fps.update.bind(fps), 10);
    
    load();
    
    requestAnimFrame(update);
};
    
function update(){
    scheduler.update();
    screens.update();
    screens.draw();
    requestAnimFrame(update);
};

function save(){
    localStorage.setItem("ver", "Alpha 2");
    resources.save();
    stats.save();
};

function load(){
    var version = localStorage.getItem("ver");
    if(typeof version === "null"){
        localStorage.clear();
    }
    resources.load();
    stats.load();
};

function reset(){
    if(confirm("This will reset everything including any bonus score.")){
        ga('send', 'event', 'reset', 'click');
        stats.reset(true);
        resources.reset();
        reactor.reset();
        localStorage.clear();
        save();
    }
};

function prestige(){
    var bonus = Math.floor(stats.get("explodes")/100)/100+resources.get("bonus");
    ga('send', 'event', 'prestige', 'click', 'newBonus', bonus-resources.get("bonus"));
    ga('send', 'event', 'prestige', 'click', 'bonus', bonus);
    ga('send', 'event', 'prestige', 'click', 'clicks', stats.get("clicks"));
    stats.reset(false);
    resources.reset();
    resources.set("bonus", bonus);
    reactor.reset();
    save();
};

function Scheduler(){
    this.events = [];
};

Scheduler.prototype = {    
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
            event.time += 1;
            if(event.time >= event.delay){
                event.time = 0;
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