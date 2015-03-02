function addResources(){
    var bonus = document.getElementById("bonus");
    resources.addResource("bonus", bonus, 2);
    
    var time = document.getElementById("time").children;
    resources.addResource("time", time[1], 0).cost(time[4], 10, 1.1).button(time[2], [1, 0]);
    var speed = document.getElementById("speed").children;
    resources.addResource("speed", speed[1], 0).cost(speed[4], 10, 1.1).button(speed[2], [1, 0]);
    var size = document.getElementById("size").children;
    resources.addResource("size", size[1], 0).cost(size[4], 10, 1.1).button(size[2], [1, 0]);
    var balls = document.getElementById("balls").children;
    resources.addResource("balls", balls[1], 0).cost(balls[4], 50, 1.1).button(balls[2], [1, 0]);
};

function Resource(elem, decimal){
    this.value = 0;
    this.exponent = decimal;
    this.decimal = Math.pow(10, decimal);
    this.valueElem = elem;
};

Resource.prototype = {
    cost: function(elem, factor, base){
        this.getCost = function(num){
            if(typeof num === "undefined"){
                num = 1;
            }
            return factor*(Math.pow(base,this.get())-Math.pow(base,this.get()+num))/(1-base)
        }
        this.getMaxBuy = function(money){
            return Math.floor(Math.log(Math.pow(base,this.get())-money*(1-base)/factor)/Math.log(base) - this.get());
        }
        this.costElem = elem;
        return this;
    },
    
    button: function(elem, counts){
        this.buttonElems = elem.children;
        for(var i in counts){
            this.buttonElems[i].addEventListener("click", this.buy.bind(this, counts[i]));
            this.buttonElems[i].className = "button inactive";
        }
        return this;
    },
    
    set: function(value){
        this.value = Math.round(value*this.decimal);
    },
    
    add: function(value){
        this.value += Math.round(value*this.decimal);
    },
    
    get: function(){
        return this.value/this.decimal;
    },
    
    hasCost: function(amount){
        if(amount<=0){
            amount = 1;
        }
        return stats.get("exp") >= this.getCost(amount);
    },
    
    buy: function(amount){
        if(amount <=0){
            var amount = this.getMaxBuy(stats.get("exp"))
        }
        var cost = this.getCost(amount)
        if(stats.get("exp") >= cost){
            stats.add("exp", -cost);
            this.add(amount);
        }
    },
    
    draw: function(){
        this.valueElem.innerHTML = ""+stringify(this.get());
        if(typeof this.getCost !== "undefined"){
            var cost = this.getCost();
            this.costElem.innerHTML = " "+stringify(cost);
            if(stats.get("exp") >= cost){
                this.buttonElems[0].className = "button active"
                this.buttonElems[1].className = "button active"
            }else{
                this.buttonElems[0].className = "button inactive"
                this.buttonElems[1].className = "button inactive"
            }
        }
    }
};

function Resources(){
    this.resources = {};
    this.newBonusElem = document.getElementById("bonusup");
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
    
    addResource: function(res, elem, decimal){
        this.resources[res] = new Resource(elem, decimal);
        return this.resources[res];
    },
    
    set: function(res, value){
        this.resources[res].set(value);
    },
    
    add: function(res, value){
        this.resources[res].add(value);
    },
    
    get: function(res){
        return this.resources[res].get();
    },
    
    update: function(){
        for(var key in this.resources){
            if(typeof this.resources[key].getCost !== "undefined" &&
                    this.resources[key].getCost()<=stats.get("exp")){
                screens.hasNew("resources");
            }
        }
    },
    
    draw: function(){
        for(var key in this.resources){
            this.resources[key].draw();
        }
        this.newBonusElem.innerHTML = ""+stringify(Math.floor(stats.get("explodes")/100)/100);
    }
}