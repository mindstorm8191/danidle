class twinemaker extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'twinemaker';
    this.onhand = [];     // array of anything this block is holding, usually for output
    this.counter = 0;     // how much progress has been made for the current operation
    this.knife = null;
    this.targetknife = '';
    this.drawgameblock('img/twinemaker.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    
    // This doesn't accept anything as input
    return 0;
  }
  
  //receiveitem(item) { }
    // activeblock function to receive an actual item (as an object) from another source.
    // This function shouldn't be called; we will rely on the activeblock function's error message to show if there is ever an issue
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    return ['twine'];
  }

  nextoutput() {
    // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    
    if(this.onhand.length!=0) {
      return this.onhand[0].name;
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
    // Returns a target output item, or null if it isn't available
    if(targetitem=='twine') {
      return this.outputitem();
    }
    return null;
  }
  
  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    if(this.knife==null) {  // No knife loaded.  Load one now (if possible)
      if(this.targetknife!='') {
        this.knife = blocklist.findinstorage(this.targetknife, 1);
      }
    }else{
      if(this.onhand.length<5) {
        if(workpoints>=1) {
          workpoints--;
          this.counter += this.knife.efficiency;
          this.knife.endurance--;
          if(this.knife.endurance<=0) {
            this.knife = blocklist.findinstorage(this.targetknife, 1);
          }
          if(this.counter>20) {
            this.counter-=20;
            this.onhand.push(new item('twine'));
          }
          $("#"+ this.id +"progress").css({"width":(this.counter*3)});  // aka counter * 60/20
    } } }
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Twine Maker</b></center><br /><br />'+
                         'Cuts bark from young trees, turning it into twine. This task also turns twine into rope so it can be used.<br /><br />'+
                         this.displaypriority() +'<br />'+
                         'Progress: <span id="sidepanelprogress">'+ (Math.floor((this.counter/20.0)*100)) +'</span>%<br />'+
                         'Twine on hand: <span id="sidepanelstock">'+ this.onhand.length +'</span><br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />'+
                         'Tool Selection:<br /><b>Knife</b><br />');
    if(this.knife==null) {
      $("#gamepanel").append('<span id="sidepanelactivetool">none loaded</span><br />');
    }else{
      $("#gamepanel").append('<span id="sidepanelactivetool">'+ this.knife.name +' ('+ (Math.floor((this.knife.endurance / this.knife.totalendurance)*100)) +'% health)</span><br />');
    }
    this.displaytoollist(this.targetknife, ['flintknife']); 
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    $("#sidepanelprogress").html(Math.floor((this.counter/20.0)*100));
    $("#sidepanelstock").html(this.onhand.length);
    if(this.knife==null) {
      $("#sidepanelactivetool").html('none loaded');
    }else{
      $("#sidepanelactivetool").html(this.knife.name +' ('+ (Math.floor((this.knife.endurance / this.knife.totalendurance)*100)) +'% health)');
    }
    this.updatetoollist(this.targetknife, ['flintknife']);
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    if(this.knife!=null) Object.setPrototypeOf(this.knife, item.prototype);
    for(var i=0; i<this.onhand.length; i++) {
      Object.setPrototypeOf(this.knife, item.prototype);
    }
    this.drawgameblock('img/twinemaker.png', 1);
    $("#"+ this.id +"progress").css({"width":(this.counter*3)});
  }
  
  picktool(newtool) {
    this.targetknife = newtool;
    $("#sidepaneltool"          ).css("background-color", this.choosetoolcolor(this.targetknife, ''));
    $("#sidepaneltoolflintknife").css("background-color", this.choosetoolcolor(this.targetknife, 'flintknife'));
  }
  
  deleteblock() {
    // Handles actions that are done before the block is deleted.
    if(this.knife!=null) {
      var prevstorage = blocklist.findbyid(this.knife.storagesource);
      if(prevstorage!=null) {
        if(prevstorage.acceptsinput(this.knife)) {
          prevstorage.receiveitem(this.knife);
    } } }
    super.deleteblock();
  }
}



