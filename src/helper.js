var requestAnimFrame = 
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function(f){
        window.setTimeout(f, 1000/60);
    };

CanvasRenderingContext2D.prototype.setLineDash =
    CanvasRenderingContext2D.prototype.setLineDash ||
    function(){};

function distance(obj1, obj2){
    var x = obj1.x-obj2.x;
    var y = obj1.y-obj2.y;
    return Math.sqrt(x*x+y*y);
};

function collided(obj1, obj2){
    var dist = obj1.radius + obj2.radius;
    var x = obj1.x - obj2.x;
    var y = obj1.y - obj2.y;
    if(x > -dist && x < dist && y > -dist && y < dist){
        return x*x+y*y < dist*dist;
    }else{
        return false;
    }
};

function randomInt(a, b){
    return Math.floor(Math.random()*(a-b)+b);
};

prefixes = ['', 'K', 'M', 'G', 'T', 'P', 'E', '?'];
function stringify(val){
    place = 0;
    while(val>1000){
        val/=1000;
        place += 1
    }
    if(place > 7){
        place = 7;
    }
    return Math.floor(val*100)/100+prefixes[place];
};