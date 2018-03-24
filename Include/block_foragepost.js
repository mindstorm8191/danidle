class foragepost extends activeblock {
    constructor(gridx, gridy) {
        super(gridx, gridy);
        this.name = 'foragepost';
        this.onhand = [];     // array of anything this block is holding, usually for output
        this.counter = 0;     // how much progress has been made for the current operation
        this.drawgameblock('img/foragepost.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
    }
    
    acceptsinput(item) {
        //activeblock function to determine if a given item (name only) can be accepted by this block
        // returns 1 if accepted, 0 if not
        return 0;
    }
    
//  receiveitem(item) { }
    // activeblock function to receive an actual item (as an object) from another source.
    // This block should not receive any items
  
    possibleoutputs(askedlist) {
        // activeblock function to share what outputs this block can produce
        // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
        //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
        // return type is an array of item names
        
        return [];
    }
    
    nextoutput() {
        // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    
        return '';
    }
    
//  outputitem() {
    // activeblock function that returns the actual item to be collected by the calling block.  Be sure to delete access to the item while doing this
    // This code below is generally all that's needed to manage this
    
//    if(this.onhand.length>0) {
//      var grab = this.onhand[0];
//      this.onhand.splice(0,1);
//      return grab;
//    }else{
//      return null;
//    }
//  }
    
    getoutput(targetitem) {
        return null;  // This block doesnt accept anything or output anything (yet... we can change this later)
    }
    
    update() {
        // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
        
        // This block will use 1 worker and generate 1 food (of a random type) every 30 seconds.  Colonists will each 1 food (each person) every 2 minutes... So, 1 person can
        // provide food for themselves and 3 others... this is a poor ratio, but something that players can improve on with advancing technology.  Also, the player will be unable
        // to build more than 1 foraging post at a time (for any given location), so that is a limiting factor as well.
        
        // All foods will have a decay time, and each food type will have a different decay rate.  Foraged items will last a fairly long time, while grown plants or prepared meals
        // will not last too long
        
        // manage item decay here
        for(var i=0; i<this.onhand.length; i++) {
            this.onhand[i].lifetime--;
            if(this.onhand[i].lifetime<=0) {
                this.onhand.splice(i,1);  // go ahead and throw away the rotten food
        }   }
        
        if(this.onhand.length>=20) {
            // Not enough room onhand to collect more food
            return;
        }
        if(workpoints<1) {
            // Not enough workpoints left to work here
            return;
        }
        workpoints--;
        this.counter++;  // there won't be any tools for this block to change the collection speed
        $("#"+ this.id +"progress").css({"width":(this.counter*2)});  // aka counter * (60/2)
        
        if(this.counter<30) {
            // Not enough work completed to produce food.
            return;
        }  
        this.counter=0;
        var food = null;
        switch(Math.floor(Math.random()*4)) {
            case 0: food = new item('apple'); food.lifetime = 1500; break; // aka 25 minutes
            case 1: food = new item('treenut'); food.lifetime = 12000; break; // aka 200 minutes
            case 2: food = new item('berry'); food.lifetime = 6000; break; // aka 100 minutes
            case 3: food = new item('mushroom'); food.lifetime = 7500; break; // aka 125 minutes
        }
        food.location = this.id
        foodlist.push(food);
        this.onhand.push(food);
    }
    
    drawpanel() {
        // activeblock functino that generates the content
        $("#gamepanel").html('<center><b>Foraging Post</b></center><br /><br />'+
            'Collects food from the surrounding lands. Colonists will be able to find apples, berries, tree nuts, and mushrooms.  Only supports up to 4 '+
            'colonists - there isnt enough wild plants here to support more.<br />'+
            this.displaypriority() +'<br />'+
            'Progress: <span id="sidepanelprogress">'+ Math.floor((this.counter/30.0)*100) +'</span>%<br />'+
            'Food on hand: <span id="sidepanelstock">'+ this.onhand.length +'</span>');
    }
    
    updatepanel() {
        // activeblock function to update the panel once per tick. This gets called automatically
        $("#sidepanelprogress").html(Math.floor((this.counter/30.0)*100));
        $("#sidepanelstock").html(this.onhand.length);
    }
    
    reload() {
        // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
        // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
        // (this is already done by here) and also any items this block contains.
        // In this function, we also need to add any editable items back into the foods list array.
        
        for(var i=0; i<this.onhand.length; i++) {
            Object.setPrototypeOf(this.onhand[i], item.prototype);
            switch(this.onhand[i].name) {  // Also push all this food to the foods list. Since this block won't always output edible items, check the type first.
                case 'apple': case 'treenut': case 'berry': case 'mushroom':
                    foodlist.push(this.onhand[i]);
                    break;
        }   }
        this.drawgameblock('img/foragepost.png', 1);
        $("#"+ this.id +"progress").css({"width":(this.counter*2)});
    }
}



