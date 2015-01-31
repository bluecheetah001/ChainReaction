var requestAnimationFrame = 
    requestAnimationFrame ||
    webkitRequestAnimationFrame ||
    mozRequestAnimationFrame ||
    msRequestAnimationFrame ||
    oRequestAnimationFrame ||
    function(f) {
        window.setTimeout(f,1000/60);
    };

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
    return trunc(Math.random()*(a-b)+b);
};

function trunc(a){
    return a|0;
};