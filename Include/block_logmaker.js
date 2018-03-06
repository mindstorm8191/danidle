class logmaker extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'logmaker';
    this.onhand = []; // array of anything this block is holding, usually for output
    this.counter = 0;
    this.axe = null;  // This will need an axe to function
    this.targetaxe = ''; // name of the next axe to pick up
    this.drawgameblock('img/log.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    // This block won't accept any new input
    
    return 0;
  }
  
//  receiveitem(item) { }
    // activeblock function to receive an actual item (as an object) from another source.
    // We won't be needing this, as it won't be receiving any items
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    return ['log'];
  }

  nextoutput() {
    // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    
    if(this.onhand.length>0) {
      return 'log';
    }
    return '';
  }

  outputitem() {
    // activeblock function that returns the actual item to be collected by the calling block.  Be sure to delete access to the item while doing this
    // This code below is generally all that's needed to manage this
    
    if(this.onhand.length>0) {
      var grab = this.onhand[0];
      this.onhand.splice(0,1);
      return grab;
    }else{
      return null;
    }
  }
  
  getoutput(targetitem) {
    // Returns a specific target item from this block
    if(targetitem=='log') {
      return this.outputitem();
    }
  } 
  
  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    if(this.axe!=null) {
      if(this.onhand.length<5) {
        if(workpoints>=1) {
          workpoints--;
          this.counter+=this.axe.efficiency;
          this.axe.endurance--;
          if(this.axe.endurance<=0) {
            if(this.targetaxe=='') {
              this.axe = null;
            }else{
              this.axe = blocklist.findinstorage(this.targetaxe, 1);
            }
          }
          if(this.counter>=12) {
            this.counter-=12;
            this.onhand.push(new item('log'));
      } } }
      $("#"+ this.id +"progress").css({"width":(this.counter*5)});
    }else{
      if(this.targetaxe!='') {
        this.axe = blocklist.findinstorage(this.targetaxe, 1);
      }
    }  // oh - this was copied from gravelmaker.js, if you're looking for comments
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Log Maker</b></center><br /><br />'+
                         'Uses an axe to cut logs from nearby trees. Requires tools (at least a flint axe) to function<br /><br />'+
                         this.displaypriority() +'<br />'+
                         'Progress: <span id="panelprogress">'+ Math.floor((this.counter/12.0)*100) +'</span>%<br />'+
                         'Logs stored: <span id="panelstock">'+ this.onhand.length +'</span><br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />'+
                         'Tool selection:<br /><b>Axe</b><br />');
    if(this.axe==null) {
      $("#gamepanel").append('<span id="sidepanelactivetool">none loaded</span><br />');
    }else{
      $("#gamepanel").append('<span id="sidepanelactivetool">'+ this.axe.name +' ('+ (Math.floor((this.axe.endurance / this.axe.totalendurance)*100)) +'% health)</span><br />');
    }
    this.displaytoollist(this.targetaxe, ['flintaxe']);
  }
  
  updatepanel() {
    // activeblock function to update the side panel once per tick
    $("#panelprogress").html(Math.floor((this.counter/12.0)*100));
    $("#panelstock").html(this.onhand.length);
          // Update the status of any tools being used
    if(this.axe==null) {
      $("#sidepanelactivetool").html('none loaded');
    }else{
      $("#sidepanelactivetool").html(this.axe.name +' ('+ (Math.floor((this.axe.endurance / this.axe.totalendurance)*100)) +'% health)');
    }
    
    // Also update the color of the existing tool panels
    this.updatetoollist(this.targetaxe, ['flintaxe']);
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    if(this.axe!=null) Object.setPrototypeOf(this.axe, item.prototype);
    for(var i=0; i<this.onhand.length; i++) {
      Object.setPrototypeOf(this.onhand[i], item.prototype);
    }
    this.drawgameblock('img/log.png', 1);
    $("#"+ this.id +"progress").css({"width":(this.counter*5)});
  }
  
  picktool(newaxename) {
    // Changes the tool selected to what the user clicked on.
    // This tool won't be applied until the existing one breaks
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
    } } }
    
    super.deleteblock();
  }
}


