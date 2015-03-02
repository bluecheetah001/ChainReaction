function Screens(){
    this.tabElem = document.getElementById("tabs");
    this.scroll = document.getElementById("scroll");
    this.screens = {};
    this.numScreens = 0;
};

Screens.prototype = {
    addScreen: function(name, obj){
        this.screens[name]=new Screen(name, this.numScreens, obj);
        this.numScreens+=1;
        if(typeof this.current === "undefined"){
            this.current = this.screens[name];
            this.screens[name].click();
        }
    },
    
    hasNew: function(name){
        if(this.current != this.screens[name]){
            this.screens[name].setNew();
        }
    },
    
    show: function(screen){
        this.current.unclick();
        this.scroll.style.left = (-screen.index*801)+"px";
        this.current = screen;
    },
    
    update: function(){
        for(var i in this.screens){
            this.screens[i].obj.update();
        }
    },
    
    draw: function(){
        this.current.obj.draw();
    }
};

function Screen(name, index, obj){
    this.tab = document.getElementById(name+"Tab");
    this.tab.addEventListener("click", this.click.bind(this));
    this.index = index;
    this.obj = obj;
};

Screen.prototype = {
    setNew: function(){
        this.tab.className = "button new"
    },
    
    click: function(){
        screens.show(this);
        this.tab.className = "button pressed"
    },
    
    unclick: function(){
        this.tab.className = "button active"
    }
};