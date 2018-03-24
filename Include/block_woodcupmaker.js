class woodcupmaker extends activeblock {
    constructor(gridx, gridy) {
        super(gridx, gridy);
        this.name = 'woodencupmaker';
        this.onhand = []; // array of anything this block is holding, usually for output
        this.log = [];  // number of logs on hand
        this.counter = 0;
        this.axe = null;
        this.targetaxe = '';
        this.drawgameblock('img/cup.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
    }
    
    acceptsinput(item) {
        //activeblock function to determine if a given item (name only) can be accepted by this block
        // returns 1 if accepted, 0 if not
        
        if(item.name!='log') {
            return 0;
        }
        if(this.log.length>=10) {
            return 0;
        }
        return 1;
    }
    
    receiveitem(item) {
        // activeblock function to receive an actual item (as an object) from another source.
        if(item.name!=='log') {
            console.log('Error in woodcupmaker->receiveitem: received '+ item.name +', this should only accept logs');
        }
        this.log.push(item);
    }
    
    possibleoutputs(askedlist) {
        // activeblock function to share what outputs this block can produce
        // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
        //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
        // return type is an array of item names
        
        return ['woodencup'];
    }
    
    nextoutput() {
        // activeblock function that returns the name of the next item to be output. if none is available, return ''.
        if(this.onhand.length<=0) {
            return '';
        }
        return 'woodencup';
    }
    
    outputitem() {
        // activeblock function that returns the actual item to be collected by the calling block.  Be sure to delete access to the item while doing this
        // This code below is generally all that's needed to manage this
        
        if(this.onhand.length<=0) {
            return null;
        }
        var grab = this.onhand[0];
        this.onhand.splice(0,1);
        return grab;
    }
    
    getoutput(targetitem) {
        // Returns a target output item, or null if it isn't available
    
        if(targetitem!=='woodencup') {
            return null;
        }
        return this.outputitem();
    }
    
    update() {
        // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
        if(this.axe==null) {
            if(this.targetaxe!='') {
                this.axe = blocklist.findinstorage(this.targetaxe, 1);
            }
            return;            
        }
        
        if(this.log.length<1) {
            // No logs on hand.  Search neighbors for an available log to collect
            for(var i=0; i<4; i++) {
                var neighbor = this.getneighbor(i);
                if(neighbor!=null) {
                    var pickup = neighbor.getoutput('log');
                    if(pickup!=null) {
                        this.log.push(pickup);
                        i=5;
            }   }   }
            return;
        }
        if(this.onhand.length>=10) {
            return;
        }
        if(workpoints<1) {
            return;
        }
        workpoints--;
        this.counter+=this.axe.efficiency;
        this.axe.endurance--;
        if(this.axe.endurance<=0) {
            // This axe has broke. Replace it with a new one... if wanted & avilable
            if(this.targetaxe=='') {
                this.axe = null;
            }else{
                this.axe = blocklist.findinstorage(this.targetaxe, 1);
        }   }
        $("#"+ this.id +"progress").css({"width":(this.counter*6)});  // aka 60/10
        if(this.counter<10) {
            return;
        }
        this.counter-=10;
        this.log.splice(0,1);  // delete 1 log
        this.onhand.push(new item('woodencup'));
        findunlocks('woodencup');
    }
    
    drawpanel() {
        // activeblock function that generates the content
        $("#gamepanel").html('<center><b>Wooden Cup Maker</b></center><br /><br />'+
            'Cuts a log into a wooden cup. Useful for holding liquids (like water)<br /><br />'+
            this.displaypriority() +'<br />'+
            'Logs stored: <span id="panellogs">'+ this.log.length +'</span><br />'+
            'Progress: <span id="panelprogress">'+ (Math.floor(this.counter/10.0)*100) +'</span><br />'+
            'Cups stored: <span id="panelstock">'+ this.onhand.length +'</span><br />'+
            '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />'+
            'Tool Selection:<br /><b>Axe</b><br />');
        if(this.axe==null) {
            $("#gamepanel").append('<span id="sidepanelactivetool">none loaded</span><br />');
        }else{
            $("#gamepanel").append('<span id="sidepanelactivetool">'+ this.axe.name +' ('+ (Math.floor((this.axe.endurance / this.axe.totalendurance)*100)) +'% health)</span><br />');
        }
        this.displaytoollist(this.targetaxe, ['flintaxe']);
    }
    
    updatepanel() {
        // activeblock function to update the panel once per tick
        $("#panellogs").html(this.log.length);
        $("#panelprogress").html(Math.floor((this.counter/8.0)*100));
        $("#panelstock").html(this.onhand.length);
        if(this.axe==null) {
            $("#sidepanelactivetool").html('none loaded');
        }else{
            $("#sidepanelactivetool").html(this.axe.name +' ('+ (Math.floor((this.axe.endurance / this.axe.totalendurance)*100)) +'% health)');
        }
        this.updatetoollist(this.targetaxe, ['flintaxe']);
    }
    
    reload() {
        // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
        // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
        // (this is already done by here) and also any items this block contains.
        // In this function, we also need to add any editable items back into the foods list array.
        
        if(this.axe!=null) Object.setPrototypeOf(this.axe, item.prototype);
        for(var i=0; i<this.log.length; i++) {
            Object.setPrototypeOf(this.log[i], item.prototype);
        }
        for(var i=0; i<this.onhand.length; i++) {
            Object.setPrototypeOf(this.onhand[i], item.prototype);
        }
        this.drawgameblock('img/cup.png', 1);
        $("#"+ this.id +"progress").css({"width":(this.counter*6)});
    }
    
    picktool(newaxename) {
        // Allows changing the name of the next axe to load
        this.targetaxe = newaxename;
    }
    
    deleteblock() {
        // Sets up the block to be deleted.  The base block class has a delete function, but we need to add additional actions when deleting
        // Return the tool to the storage it was in before being used
        if(this.axe!=null) {
            var prevstorage = blocklist.findbyid(this.axe.storagesource);
            if(prevstorage!=null) {
                if(prevstorage.acceptsinput(this.axe)) {  // be sure this storage will still accept the shovel back
                    prevstorage.receiveitem(this.axe);
                    // if the shovel isn't accepted, it will just be deleted when this block is destroyed
        }   }   }
        super.deleteblock();
    }
}



