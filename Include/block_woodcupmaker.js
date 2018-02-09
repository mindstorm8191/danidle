class woodcupmaker extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'Wooden Cup Maker';
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
    
    if(item.name=='log') {
      if(this.log.length<10) {
        return 1;
    } }
    return 0;
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    if(item.name=='log') {
      this.log.push(item);
    }else{
      console.log('Error in woodcupmaker->receiveitem: received '+ item.name +', this should only accept logs');
    }
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
    if(this.onhand.length>0) {
      return 'woodencup';
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

  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    if(this.axe!=null) {
      if(this.log.length>=1) {
        if(this.onhand.length<10) {
          if(workpoints>=1) {
            workpoints--;
            this.counter+=this.axe.efficiency;
            this.axe.endurance--;
            if(this.axe.endurance<=0) {
              if(this.targetaxe=='') {
                this.axe = null;
              }else{
                this.axe = blocklist.findinstorage(this.targetaxe, 1);
            } }
            if(this.counter>=10) {
              this.counter-=10;
              this.log.splice(0,1);  // delete 1 log
              this.onhand.push(new item('woodencup'));
              findunlocks('woodencup');
      } } } }
      $("#"+ this.id +"progress").css({"width":(this.counter*6)});  // aka 60/10
    }else{
      if(this.targetaxe!='') {
        this.axe = blocklist.findinstorage(this.targetaxe, 1);
    } }
  }
  
  drawpanel() {
    // activeblock function that generates the content
    $("#gamepanel").html('<center><b>Wooden Cup Maker</b></center><br /><br />'+
                         'Cuts a log into a wooden cup. Useful for holding liquids (like water)<br /><br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
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
  
  pickaxe(newaxename) {
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
    } } }
    
    super.deleteblock();
  }
}



