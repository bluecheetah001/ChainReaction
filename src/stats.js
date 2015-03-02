function addStats(){
    stats.addStat("exp", 2);
    stats.addStat("explodes", 0);
    stats.addStat("chain", 0);
    stats.addStat("clicks", 0);
};

function Stat(name, decimal){
    this.elems = [document.getElementById(name),
        document.getElementById(name+"Total"),
        document.getElementById(name+"Max")];
    this.values = [0,0,0]; //value, max, total
    this.exponent = decimal;
    this.decimal = Math.pow(10, decimal);
};

Stat.prototype = {
    set: function(value){
        var value = Math.round(value*this.decimal)
        this.values[0] = value;
        if(this.values[0] > this.values[2]){
            this.values[2] = this.values[0];
        }
    },
    
    setAll: function(values){
        for(var i in values){
            this.values[i] = Math.round(values[i]*this.decimal);
        }
    },
    
    add: function(value){
        var value = Math.round(value*this.decimal)
        this.values[0] += value;
        if(value>0){
            this.values[1] += value;
        }
        if(this.values[0] > this.values[2]){
            this.values[2] = this.values[0];
        }
    },
    
    get: function(i){
        return this.values[i]/this.decimal;
    },
    
    getAll: function(i){
        return [this.get(0), this.get(1), this.get(2)];
    },
    
    draw: function(){
        for(var i in this.values){
            if(this.elems[i]){ //not null
                this.elems[i].innerHTML = ""+stringify(this.get(i));
            }
        }
    }
};

function Stats(){
    this.stats = {};
};

Stats.prototype = {
    load: function(){
        var saved = JSON.parse(localStorage.getItem("stats"));
        for(var stat in saved){
            this.setAll(stat, saved[stat]);
        }
    },
    
    save: function(){
        var toSave = {};
        for(var stat in this.stats){
            toSave[stat] = this.getAll(stat);
        }
        localStorage.setItem("stats", JSON.stringify(toSave));
    },
    
    reset: function(hardReset){
        if(hardReset){
            for(var stat in this.stats){
                this.setAll(stat, [0, 0, 0]);
            }
        }else{
            for(var stat in this.stats){
                this.set(stat, 0)
            }
        }
    },
    
    addStat: function(stat, decimal){
        this.stats[stat] = new Stat(stat, decimal);
    },
    
    set: function(stat, value){
        this.stats[stat].set(value);
    },
    
    setAll: function(stat, values){
        this.stats[stat].setAll(values);
    },
    
    add: function(stat, value){
        this.stats[stat].add(value);
    },
    
    get: function(stat){
        return this.stats[stat].get(0);
    },
    
    getAll: function(stat){
        return this.stats[stat].getAll();
    },
    
    update: function(){
        this.stats["exp"].draw();
    },
    
    draw: function(){
        for(var key in this.stats){
            this.stats[key].draw();
        }
    }
}