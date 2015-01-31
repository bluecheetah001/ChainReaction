function loadResources(){
    resources.addResource("exp", "Explosion Points", 0);
    resources.addResource("time", "Longer Explosions", 0, 20);
    resources.addResource("speed", "Faster Balls", 0, 20);
    resources.addResource("size", "Larger Explosions", 0, 20);
    resources.addResource("bonus", "Bonus Score", 0, 100);
    resources.addResource("balls", "Extra Balls", 0, 100);
    resources.load();
};

function Resource(name, value, cost){
    this.value = value;
    this.buttons = false;
    this.elem = document.createElement("tr");
    this.elem.class = "res";
    var inner = "<td>"+name+":</td><td> "+value+"</td>";
    if(typeof cost !== "undefined"){
        this.buttons = true;
        this.baseCost = cost;
        inner += "<td><span class=' group button'>1</span><span class='group button'>max</span></td><td>cost:</td><td> "+this.getCost(1)+"</td>";
    }
    this.elem.innerHTML = inner;
    this.elems = {};
    this.elems.value = this.elem.children[1];
    if(this.buttons){
        this.elems.button1 = this.elem.children[2].children[0];
        this.elems.buttonMax = this.elem.children[2].children[1];
        this.elems.cost = this.elem.children[4];
        this.elems.button1.addEventListener("click", this.buy.bind(this, 1));
        this.elems.buttonMax.addEventListener("click", this.buy.bind(this, -1));
    }
    resources.elem.appendChild(this.elem);
};

Resource.prototype = {
    set: function(value){
        this.value = value;
    },
    
    add: function(value){
        this.value += value;
    },
    
    getCost: function(amount){
        var total = 0;
        for(var i = 0; i < amount; i++){
            total += trunc(this.baseCost*Math.pow(1.2, i + this.value));
        }
        return total;
    },
    
    buy: function(amount){
        if(amount > 0){
            var cost = this.getCost(amount);
            if(resources.get('exp') >= cost){
                resources.add('exp', -cost);
                this.add(amount);
            }
        }else{
            var cost = this.getCost(1);
            while(cost <= resources.get('exp')){
                resources.add('exp', -cost);
                this.add(1);
                cost = this.getCost(1);
            }
        }
    },
    
    draw: function(){
        this.elems.value.innerHTML = " "+this.value;
        if(this.buttons){
            var cost = this.getCost(1);
            this.elems.cost.innerHTML = " "+cost;
            if(resources.get('exp') >= cost){
                this.elems.button1.className = "group button active";
                this.elems.buttonMax.className = "group button active";
            }else{
                this.elems.button1.className = "group button";
                this.elems.buttonMax.className = "group button";
            }
        }
    }
};

function Resources(){
    this.elem = document.getElementById("resources");
    this.resources = {};
};

Resources.prototype = {
    load: function(){
        var saved = JSON.parse(localStorage.getItem("res"));
        for(var res in saved){
            this.set(res, saved[res]);
        }
    },
    
    save: function(){
        var toSave = {};
        for(var res in this.resources){
            toSave[res] = this.get(res);
        }
        localStorage.setItem("res", JSON.stringify(toSave));
    },
    
    reset: function(){
        for(var res in this.resources){
            this.set(res, 0);
        }
    },
    
    addResource: function(res, name, val, cost){
        this.resources[res] = new Resource(name, val, cost);
    },
    
    set: function(res, value){
        this.resources[res].set(value);
    },
    
    add: function(res, value){
        this.resources[res].add(value);
    },
    
    get: function(res){
        return this.resources[res].value;
    },
    
    getAll: function(){
        var values = {};
        for(var i in arguments){
            var res = arguments[i];
            values[res] = this.get(res);
        }
        return values;
    },
    
    draw: function(){
        for(var key in this.resources){
            this.resources[key].draw();
        }
    }
}