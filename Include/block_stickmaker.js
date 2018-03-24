class stickmaker extends activeblock {
    constructor(gridx,gridy) {
        super(gridx, gridy);
        this.name = 'stickmaker';
        this.onhand = [];
        this.counter = 0; // this is used to determine when the next stick will be finished
        
        this.drawgameblock('img/stickmaker.png', 1); 
    }
    
    acceptsinput(item) {
        // Accepts input... only, the stickmaker doesn't accept anything
        return 0;
    }
    
    // receiveitem() isn't declared here, since it shouldn't be called anyway
    
    possibleoutputs(askedlist) {
        // Since this doesn't loop anyway, we're not going to worry about the asked list
        return ['stick'];
    }
    
    nextoutput() {
        // activeblock function to determine what the next output item is
        if(this.onhand.length<=0) {
            return '';
        }
        return this.onhand[0].name;  // this only outputs a name, not the actual item
    }
    
    outputitem() {
        // Outputs an item, if possible
        if(this.onhand.length<=0) {
            return null;
        }
        var grab = this.onhand[0];
        this.onhand.splice(0,1);
        return grab;
    }
    
    getoutput(target) {
        // Returns a specific item that is marked as output for this block, or null if no item of that type was available.
        
        if(target=='stick') return this.outputitem(); // why rewrite what works?
    }
    
    update() {
        if(this.onhand.length>=5) {
            return;
        }
        if(workpoints<1) {
            return;
        }
            // Make progress
        workpoints--;
        this.counter++;
        $("#"+ this.id +"progress").css({"width":(this.counter*10)});  // aka counter * (60/6)
        
        if(this.counter<6) {
            return;
        }
            // Make item & reset progress
        this.counter=0;
        this.onhand.push(new item('stick','', 0));
    }
    
    drawpanel() {
        $("#gamepanel").html('<center><b>Stick Maker</b></center><br />'+
            'Uses a worker to produce sticks from nearby trees.  The worker can be equipped with tools to produce sticks faster<br /><br />'+
            this.displaypriority() +'<br />'+
            'Progress: <span id="panelprogress">'+ Math.floor((this.counter/6.0)*100) +'</span>%<br />'+
            'Sticks stored: <span id="panelstock">'+ this.onhand.length +'</span><br /><br />'+
            '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a>');
    }
    
    updatepanel() {
        $("#panelprogress").html( Math.floor((this.counter/6.0)*100));
        $("#panelstock").html(this.onhand.length);
    }
    
    reload() {
        // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
        // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
        // (this is already done by here) and also any items this block contains.
        // In this function, we also need to add any editable items back into the foods list array.
        
        for(var i=0; i<this.onhand.length; i++) {
          Object.setPrototypeOf(this.onhand[i], item.prototype);
        }
        this.drawgameblock('img/stickmaker.png', 1);
        $("#"+ this.id +"progress").css({"width":(this.counter*10)});
    }
}



