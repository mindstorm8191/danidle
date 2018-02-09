class gravelmaker extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'Gravel maker';
    this.onhand = [];
    this.counter = 0;
    this.shovel = null;  // this device needs a shovel to function.  Using the shovel consumes endurance on it.  When it breaks, a new one of the same type will be
                         // pulled from another
    this.targetshovel = ''; // name of the next shovel the user wants to load in
    this.drawgameblock('img/gravel.png', 1);
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // this block does not accept any input
    return 0;
  }
  
  // receiveitem(item) { }  // this shouldn't be called for gravelmaker
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    return ['rawgravel'];
  }

  nextoutput() {
    // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    if(this.onhand.length>0) {
      return 'rawgravel';
    }
    return '';
  }

  outputitem() {
    // activeblock function that returns the actual item to be collected by the calling block.  Be sure to delete access to the item while doing this
    if(this.onhand.length>0) {
      var grab = this.onhand[0];
      this.onhand.splice(0,1);
      return grab;
    }else{
      return null;
    }
  }

  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    if(this.shovel!=null) {  // this does not load a shovel right when the block starts.  The user will have to select the block and load one in
      //console.log('using '+ this.shovel.name +' for work!');
      if(this.onhand.length<5) {
        if(workpoints>=1) {
          workpoints--;
          this.counter+= this.shovel.efficiency;
          this.shovel.endurance--;
          if(this.shovel.endurance<=0) {
            // This shovel has been worn down to nothing.  We need to find another to continue.  We will use the name that the user has requested 
            this.shovel = blocklist.findinstorage(this.targetshovel, 1); // This could return null, in which case collection of raw gravel will stop
          }
          if(this.counter>=12) {
            this.counter-=12;
            this.onhand.push(new item('rawgravel'));
      } } }
      $("#"+ this.id +"progress").css({"width":(this.counter*5)});  // aka counter * (60/12)
    }else{
      if(this.targetshovel!='') {
        //console.log('gravelmaker->update: search for '+ this.targetshovel);
        this.shovel = blocklist.findinstorage(this.targetshovel, 1);
      }
    }
  }
  
  drawpanel() {
    // activeblock function that generates the content 
    $("#gamepanel").html('<center><b>Gravel Maker</b></center><br /><br />'+
                         'Collects gravel from the surrounding environment.  Gravel can be filtered to obtain flint.  Requires tools (at least a wooden shovel) to function.<br /><br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
                         'Progress: <span id="panelprogress">'+ Math.floor((this.counter/12.0)*100) +'</span>%<br />'+
                         'Gravel stored: <span id="panelstock">'+ this.onhand.length +'</span><br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />'+
                         'Tool selection:<br /><b>Shovel</b><br />');
    if(this.shovel==null) {
      $("#gamepanel").append('<span id="sidepanelactivetool">none loaded</span><br />');
    }else{
      $("#gamepanel").append('<span id="sidepanelactivetool">'+ this.shovel.name +' ('+ (Math.floor((this.shovel.endurance / this.shovel.totalendurance)*100)) +'% health)</span><br />');
    }
    // These spans will be colored based on the status of the tools available
    this.displaytoollist(this.targetshovel, ['woodshovel', 'flintshovel']);
  }
  
  
  updatepanel() {
    // activeblock function to update the side panel once per tick
    $("#panelprogress").html( Math.floor((this.counter/12.0)*100));
    $("#panelstock").html(this.onhand.length);
    
      // Update the status of any tools being used
    if(this.shovel==null) {
      $("#sidepanelactivetool").html('none loaded');
    }else{
      $("#sidepanelactivetool").html(this.shovel.name +' ('+ (Math.floor((this.shovel.endurance / this.shovel.totalendurance)*100)) +'% health)');
    }
    
      // We also need to update the colors of the existing panels, as the status of these can change at any point
    this.updatetoollist(this.targetshovel, ['woodshovel', 'flintshovel']);
  }
  
  picktool(newshovelname) {
    // (not an activeblock function) Changes the tool that is selected to what the user picked.
    
    this.targetshovel = newshovelname;
  }
  
  deleteblock() {
    // Sets up the block to be deleted.  The base block class has a delete function, but we need to add additional actions when deleting
    // Return the tool to the storage it was in before being used
    if(this.shovel!=null) {
      var prevstorage = blocklist.findbyid(this.shovel.storagesource);
      if(prevstorage!=null) {
        if(prevstorage.acceptsinput(this.shovel)) {  // be sure this storage will still accept the shovel back
          prevstorage.receiveitem(this.shovel);
            // if the shovel isn't accepted, it will just be deleted when this block is destroyed
    } } }
    
    super.deleteblock();
  }
}


