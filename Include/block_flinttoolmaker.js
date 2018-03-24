class flinttoolmaker extends activeblock {
    constructor(gridx, gridy) {
        super(gridx, gridy);
        this.name = 'flinttoolmaker';
        this.flint = [];      // Flints on hand
        this.stick = [];      // Sticks on hand
        this.twine = [];      // Twine on hand
        this.onhand = [];     // Output list
        this.counter = 0;     // how much progress has been made for the current operation
        this.currentoutput = '';  // what the block is currently working on
        this.targetoutput = '';   // what the user last selected.  currentoutput gets set to this every time an item is finished
        this.drawgameblock('img/flinttoolset.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
    }
    
    acceptsinput(item) {
        //activeblock function to determine if a given item (name only) can be accepted by this block
        // returns 1 if accepted, 0 if not
        switch(item.name) {
            case 'stick':
                if(this.stick.length<10) {
                    return 1;
                }
                break;
            case 'flint':
                if(this.flint.length<10) {
                    return 1;
                }
                break;
            case 'twine':
                if(this.twine.length<10) {
                    return 1;
                }
                break;
        }
        return 0;
    }
    
    receiveitem(item) {
        // activeblock function to receive an actual item (as an object) from another source.
        
        switch(item.name) {
            case 'stick': this.stick.push(item); break;
            case 'flint': this.flint.push(item); break;
            case 'twine': this.twine.push(item); break;
            default: console.log('Error in flinttoolmaker->receiveitem: item received ('+ item.name +') is not allowed here. this item has been lost');
        }
    }
    
    possibleoutputs(askedlist) {
        // activeblock function to share what outputs this block can produce
        // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
        //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
        // return type is an array of item names
        
        return ['flintknife', 'flintshovel', 'flintaxe', 'flintpickaxe', 'flinthammer', 'flintpointspear', 'torch'];
    }
    
    nextoutput() {
        // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    
        if(this.onhand.length<=0) {
            return '';
        }
        return this.onhand[0].name;
    }
    
    outputitem() {
        // activeblock function that returns the actual item to be collected by the calling block.  Be sure to delete access to the item while doing this
        // This code below is generally all that's needed to manage this
        
        if(this.onhand.length<=0) {
            // There is nothing on hand to return
            return null;
        }
        var grab = this.onhand[0];
        this.onhand.splice(0,1);
        return grab;
    }
    
    getoutput(targetitem) {
        switch(targetitem) { // determine which item type of our list of options the other block wants
            case 'flintknife': case 'flintshovel': case 'flintaxe': case 'flintpickaxe': case 'flinthammer': case 'torch': case 'flintpointspear':
                for(var i=0; i<this.onhand.length; i++) { // Now determine if we have any matches
                    if(this.onhand[i].name==targetitem) {
                        var grab = this.onhand[i];
                        this.onhand.splice(i,1);
                        return grab;
               }    }
               break;
        }
        return null;
    }
    
    update() {
        // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
        if(this.onhand.length>=10) {
            // Doesn't matter what type of tool is being made, there's no room to hold any more items anyway
            return;
        }
        var searchlist = [];  // Use this to determine what we should search for, after everything else is done. We would search for items with a private function,
                              // but with an increasing number of blocks, getneighbor() will get increasingly slower. This way will limit the number of calls on that
        switch(this.currentoutput) {
            case '':  // no output selected.  Switch to a new task as soon as something else is selected
                this.currentoutput = this.targetoutput;
                return;
            
            case 'flintknife':   // Knife.  Only requires 2 flint to make
                if(this.flint.length>=2) {
                    // Not enough flint on hand. Mark flint for something we need to search for
                    this.searchitems(2,0,0);
                    this.currentoutput = this.targetoutput;  // if we aren't producing anything, allow the user to change tool types.  Do this for all available tools
                    return;
                }
                if(workpoints<1) {
                    // No workpoints available to do work here
                    return;
                }
                
                workpoints--;
                this.counter++;
                $("#"+ this.id +"progress").css({"width":(this.counter*6)});  // aka counter * 60/10
                if(this.counter<10) {
                    // Not enough progress to finish anything
                    return;
                }
                this.counter-=10;
                this.onhand.push(new item('flintknife', 'knife', 300, 1.0)); // flint knives have a pretty good lifespan
                this.flint.splice(0,2);
                findunlocks('flintknife');
                this.currentoutput = this.targetoutput;
                return;
                
            case 'flintshovel':  // Shovel. needs 3 flint & 3 sticks
                if(this.flint.length<3) {
                    // Not enough flint on hand. Mark flint for somethign we need to search for. While we're at it, search for other things if we don't have enough
                    this.searchitems(3,3,3);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(this.stick.length<3) {
                    // Not enough sticks on hand. Mark sticks for something to search for. Search for other things too (but flint had already been marked as accepted
                    this.searchitems(3,3,3);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(this.twine.length<3) {
                    // Not enough twine on hand. Mark it for something to search for. The other items have already been cleared
                    this.searchitems(3,3,3);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(workpoints<1) {
                    // Not enough workers on hand to work
                    return;
                }
                workpoints--;
                this.counter++;
                $("#"+ this.id +"progress").css({"width":(this.counter*5)}); // aka counter * 60/12
                if(this.counter<12) {
                    // Not enough progress to complete an item
                    return;
                }
                this.counter-=12;
                this.onhand.push(new item('flintshovel', 'shovel', 100, 1.25)); // efficiency levels will be relative to the type of job of the tool
                this.stick.splice(0,3);
                this.flint.splice(0,3);
                this.twine.splice(0,3);
                findunlocks('flintshovel');  // each different tool is capable of having its own items unlocked
                this.currentoutput = this.targetoutput;
                return;
            
            case 'flintaxe':  // Axe.  Needs 4 flint & 3 sticks
                if(this.flint.length<4) {
                    this.searchitems(4,3,3);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(this.stick.length<3) {
                    this.searchitems(4,3,3);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(this.twine.length<3) {
                    this.searchitems(4,3,3);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(workpoints<1) {
                    // Not enough workpoints to run this block
                    return;
                }
                workpoints--;
                this.counter++;
                $("#"+ this.id +"progress").css({"width":(this.counter*5)}); // aka counter * 60/12
                if(this.counter<12) {
                    return;
                }
                this.counter-=12;
                this.onhand.push(new item('flintaxe', 'axe', 200, 1)); // efficiency levels will be relative to the type of job of the tool
                this.flint.splice(0,4);
                this.stick.splice(0,3);
                this.twine.splice(0,3);
                findunlocks('flintaxe');
                this.currentoutput = this.targetoutput;  // Change the output, if not the same as before
                return;
            
            case 'flintpickaxe':  // Pickaxe.  Needs 6 flint & 3 sticks
                if(this.flint.length<6) {
                    this.searchitems(6,3,3);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(this.stick.length<3) {
                    this.searchitems(6,3,3);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(this.twine.length<3) {
                    this.searchitems(6,3,3);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(workpoints<1) {
                    // Not enough workpoints to run this block
                    return;
                }
                workpoints--;
                this.counter++;
                $("#"+ this.id +"progress").css({"width":(this.counter*5)}); // aka counter * 60/12
                if(this.counter<12) {
                    // Not enough progress to complete an item
                    return;
                }
                this.counter-=12;
                this.onhand.push(new item('flintpickaxe', 'pick', 35, 1)); // efficiency levels will be relative to the type of job of the tool
                this.stick.splice(0,3);
                this.flint.splice(0,6);
                findunlocks('flintpickaxe');
                this.currentoutput = this.targetoutput;
                return;
                
            case 'flinthammer':  // Hammer. Needs 9 flint & 3 sticks
                if(this.flint.length<9) {
                    this.searchitems(9,3,4);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(this.stick.length<3) {
                    this.searchitems(9,3,4);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(this.twine.length<4) {
                    this.searchitems(9,3,4);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(workpoints<1) {
                    // Not enough workpoints to run this block
                    return;
                }
                workpoints--;
                this.counter++;
                $("#"+ this.id +"progress").css({"width":(this.counter*5)}); // aka counter * 60/12
                if(this.counter<12) {
                    // Not enough work completed to make another part
                    return;
                }
                this.counter-=12;
                this.onhand.push(new item('flinthammer', 'hammer', 50, 1));
                this.stick.splice(0,3);
                this.flint.splice(0,9);
                findunlocks('flinthammer');
                this.currentoutput = this.targetoutput;
                return;
                
            case 'torch': // Torch. Only needs 1 stick and 2 twine
                if(this.stick.length<1) {
                    this.searchitems(0,1,2);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(this.twine.length<2) {
                    this.searchitems(0,1,2);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(workpoints<1) {
                    // Not enough workpoints to run this block
                    return;
                }
                workpoints--;
                this.counter++;
                $("#"+ this.id +"progress").css({"width":(this.counter*7.5)}); // aka counter * 60/8
                if(this.counter<8) {
                    // Not enough progress made to make another item
                    return;
                }
                this.counter-=8;
                this.onhand.push(new item('torch'));
                this.stick.splice(0,1);
                this.twine.splice(0,2);
                findunlocks('torch');
                this.currentoutput = this.targetoutput;
                return;
            
            case 'flintpointspear':  // Flint spear. Lasts longer than a wood spear, but isn't any more effective at killing animals. Needs 1 stick, 2 flint and 2 twine
                if(this.flint.length<2) {
                    this.searchitems(2,2,2);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(this.stick.length<2) {
                    this.searchitems(2,2,2);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(this.twine.length<2) {
                    this.searchitems(2,2,2);
                    this.currentoutput = this.targetoutput;
                    return;
                }
                if(workpoints<1) {
                    // Not enough workpoints to run this block
                    return;
                }
                workpoints--;
                this.counter++;
                $("#"+ this.id +"progress").css({"width":(this.counter*6)}); // aka counter * 60/10
                if(this.counter<10) {
                    // Not enough progress made to complete an item
                    return;
                }
                this.counter-=10;
                this.onhand.push(new item('flintpointspear', 'weapon', 90, 1)); // flint spears aren't much sharper than wood, but will last longer
                this.stick.splice(0,2);
                this.flint.splice(0,2);
                this.twine.splice(0,2);
                findunlocks('flintpointspear');
                this.currentoutput = this.targetoutput;
                return;
        }
    }
    
    drawpanel() {
        // activeblock function that generates the content
        $("#gamepanel").html('<center><b>Flint Tools Maker</b></center><br /><br />'+
            'Creates 1 of multiple types of flint tools. Select one below to get started. All tools require at least flint<br />'+
            this.displaypriority() +'<br />'+
            'Flint on hand: <span id="sidepanelflint">'+ this.flint.length +'</span><br />'+
            'Sticks on hand: <span id="sidepanelsticks">'+ this.stick.length +'</span><br />'+
            'Twine on hand: <span id="sidepaneltwine">'+ this.twine.length +'</span><br />'+
            'Current progress: <span id="sidepanelprogress">'+ (Math.floor((this.counter/this.timetocomplete())*100)) +'</span>%<br />'+
            'Output items stored: <span id="sidepanelonhand">'+ this.onhand.length +'</span><br />'+
            '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />'+
        // Now, draw the 8 output options, selecting color based on which one is selected.  Also, include no output as an option
            '<b>Output tools</b><br />'+
            '<span id="sidepaneltool"                class="sidepanelbutton" style="background-color:'+ this.getblockcolor('')                +';"                                          onclick="selectedblock.pickoutput(\'\');">none</span>'+
            '<span id="sidepaneltoolflintknife"      class="sidepanelbutton" style="background-color:'+ this.getblockcolor('flintknife')      +';" title="Needs 2 flint"                    onclick="selectedblock.pickoutput(\'flintknife\');">Flint Knife</span>'+
            '<span id="sidepaneltoolflintshovel"     class="sidepanelbutton" style="background-color:'+ this.getblockcolor('flintshovel')     +';" title="Needs 3 flint, 3 sticks, 3 twine" onclick="selectedblock.pickoutput(\'flintshovel\');">Flint Shovel</span>'+
            '<span id="sidepaneltoolflintaxe"        class="sidepanelbutton" style="background-color:'+ this.getblockcolor('flintaxe')        +';" title="Needs 4 flint, 3 sticks, 3 twine" onclick="selectedblock.pickoutput(\'flintaxe\');">Flint Axe</span>'+
            '<span id="sidepaneltoolflintpickaxe"    class="sidepanelbutton" style="background-color:'+ this.getblockcolor('flintpickaxe')    +';" title="Needs 6 flint, 3 sticks, 4 twine" onclick="selectedblock.pickoutput(\'flintpickaxe\');">Flint Pickaxe</span>'+
            '<span id="sidepaneltoolflinthammer"     class="sidepanelbutton" style="background-color:'+ this.getblockcolor('flinthammer')     +';" title="Needs 9 flint, 3 sticks, 4 twine" onclick="selectedblock.pickoutput(\'flinthammer\');">Flint Hammer</span>'+
            '<span id="sidepaneltoolflintpointspear" class="sidepanelbutton" style="background-color:'+ this.getblockcolor('flintpointspear') +';" title="Needs 2 flint, 2 sticks, 2 twine" onclick="selectedblock.pickoutput(\'flintpointspear\');">Flint-point Spear</span>'+
            '<span id="sidepaneltooltorch"           class="sidepanelbutton" style="background-color:'+ this.getblockcolor('torch')           +';" title="Needs 1 stick, 2 twine, no flint" onclick="selectedblock.pickoutput(\'torch\');">Torch</span>');
    }
    
    updatepanel() {
        // activeblock function to update the panel once per tick
        // Since the tool selection is really managed by user input, we don't need to worry about managing that here
        $("#sidepanelflint").html(this.flint.length);
        $("#sidepanelsticks").html(this.stick.length);
        $("#sidepaneltwine").html(this.twine.length);
        $("#sidepanelprogress").html(Math.floor((this.counter/this.timetocomplete())*100));
        $("#sidepanelonhand").html(this.onhand.length);
    }
    
    reload() {
        // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
        // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
        // (this is already done by here) and also any items this block contains.
        // In this function, we also need to add any editable items back into the foods list array.
        
        for(var i=0; i<this.flint.length; i++) {
            Object.setPrototypeOf(this.flint[i], item.prototype);
        }
        for(var i=0; i<this.stick.length; i++) {
            Object.setPrototypeOf(this.stick[i], item.prototype);
        }
        for(var i=0; i<this.twine.length; i++) {
            Object.setPrototypeOf(this.twine[i], item.prototype);
        }
        for(var i=0; i<this.onhand.length; i++) {
            Object.setPrototypeOf(this.onhand[i], item.prototype);
        }
        this.drawgameblock('img/flinttoolset.png', 1);
        $("#"+ this.id +"progress").css({"width":(this.counter*6)});
    }
    
    getblockcolor(itemtype) {
        // returns what color a specific item type should be, based on what is currently selected
        if(this.targetoutput==itemtype) {
            return 'green';
        }else{
            return 'red';
        }
    }
    
    searchitems(targetflint, targetstick, targettwine) {
        // Manages searching neighboring blocks for items this needs, based on what is being produced
        
        // Start by determining what items we need to search for
        var searchlist = [];
        if(this.flint.length<targetflint) {
            searchlist.push('flint');
        }
        if(this.stick.length<targetstick) {
            searchlist.push('stick');
        }
        if(this.twine.length<targettwine) {
            searchlist.push('twine');
        }
        for(var i=0; i<4; i++) {
            var neighbor = this.getneighbor(i);
            if(neighbor!=null) {
                for(var j=0; j<searchlist.length; j++) {
                    var pickup = neighbor.getoutput(searchlist[j]);
                    if(pickup!=null) {
                        switch(searchlist[j]) {  // now that we have something, figure out what to put it in
                            case 'flint': this.flint.push(pickup); break;
                            case 'twine': this.twine.push(pickup); break;
                            case 'stick': this.stick.push(pickup); break;
                        }
                        return;
        }   }   }   }
    }
    
    timetocomplete() {
        // returns the time needed to complete the current task.  May return 0 if nothing has been selected
        switch(this.currentoutput) {
            case 'flintknife': return 10;
            case 'flintshovel': return 12;
            case 'flintaxe': return 12;
            case 'flintpickaxe': return 12;
            case 'flinthammer': return 12;
            case 'torch': return 8;
            case 'flintpointspear': return 10;
        }
    }
    
    pickoutput(newtool) {
        // Selects the new tool to work on making
        $("#sidepaneltool"+ this.targetoutput).css("background-color", "red");
        $("#sidepaneltool"+ newtool).css("background-color", "green");
        this.targetoutput = newtool;
    }
}


