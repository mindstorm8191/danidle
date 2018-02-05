class stonemaker extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'Stone Maker';
    this.onhand = [];     // array of anything this block is holding, usually for output
    this.counter = 0;     // how much progress has been made for the current operation
    this.pickaxe = null;  // current pickaxe in use
    this.targetpickaxe = ''; // next pickaxe type to pick up
    this.drawgameblock('img/stone.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    return 0;
  }
  
//  receiveitem(item) { } This shouldn't be called
    // activeblock function to receive an actual item (as an object) from another source.
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    return ['stone'];
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

  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    if(this.pickaxe!=null) {
      if(this.onhand.length<5) {
        if(workpoints>=1) {
          workpoints--;
          this.counter += this.pickaxe.efficiency;
          this.pickaxe.endurance--;
          if(this.pickaxe.endurance<=0) {  // This pickaxe is worn out
            this.pickaxe = blocklist.findinstorage(this.targetpickaxe, 1);
          }
          if(this.counter>=15) {  // it'll take a lot to get 1 stone with a flint pickaxe.  Not to worry, later tools will have much better efficiency
            this.counter -= 15;
            this.onhand.push(new item('stone'));
      } } }
      $("#"+ this.id +"progress").css({"width":(this.counter*4)}); // aka 60/15
    }else{
      if(this.targetpickaxe!='') {
        //console.log('gravelmaker->update: search for '+ this.targetshovel);
        this.pickaxe = blocklist.findinstorage(this.targetpickaxe, 1);
      }
    }
  }
  
  drawpanel() {
    // activeblock function that generates the content
    $("#gamepanel").html('<center><b>Stone Maker</b></center><br /><br />'+
                         'Collects stone from the ground. Requires a pickaxe (at least a flint pickaxe) to function.<br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
                         'Stone stored: <span id="sidepanelonhand">'+ this.onhand.length +'</span><br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />'+
                         'Tool selection:<br /><b>Pickaxe</b><br />');
    if(this.pickaxe==null) {
      $("#gamepanel").append('<span id="sidepanelactivetool">none loaded</span><br />');
    }else{
      $("#gamepanel").append('<span id="sidepanelactivetool">'+ this.pickaxe.name +' ('+ (Math.floor((this.pickaxe.endurance / this.pickaxe.totalendurance)*100)) +'% health)</span><br />');
    }
    $("#gamepanel").append('<span id="sidepaneltool" class="sidepanelbutton" style="background-color: '+ this.choosetoolcolor(this.targetpickaxe, '') +'" onclick="selectedblock.picktool(\'\');">None</span>'+
                           '<span id="sidepaneltoolflintpickaxe" class="sidepanelbutton" style="background-color: '+ this.choosetoolcolor(this.targetpickaxe, 'flintpickaxe') +'" onclick="selectedblock.picktool(\'flintpickaxe\');">Flint Pickaxe</span>');
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    $("#sidepanelonhand").html(this.onhand.length);
    if(this.pickaxe==null) {
      $("#sidepanelactivetool").html('none loaded');
    }else{
      $("#sidepanelactivetool").html(this.pickaxe.name +' ('+ (Math.floor((this.pickaxe.endurance / this.pickaxe.totalendurance)*100)) +'% health)');
    }
      // Also update the tool list, since the status of the tools can change at any time
    $("#sidepaneltool"            ).css("background-color", this.choosetoolcolor(this.targetpickaxe, ''            ));
    $("#sidepaneltoolflintpickaxe").css("background-color", this.choosetoolcolor(this.targetpickaxe, 'flintpickaxe'));
  }
  
  picktool(newtool) {
    // function called by the user when a new tool is clicked on
    this.targetpickaxe = newtool;
    $("#sidepaneltool"            ).css("background-color", this.choosetoolcolor(this.targetpickaxe, ''            ));
    $("#sidepaneltoolflintpickaxe").css("background-color", this.choosetoolcolor(this.targetpickaxe, 'flintpickaxe'));
  }

  deleteblock() {
    // Sets up the block to be deleted.  The base block class has a delete function, but we need to add additional actions when deleting
    // Return the tool to the storage it was in before being used
    if(this.pickaxe!=null) {
      var prevstorage = blocklist.findbyid(this.pickaxe.storagesource);
      if(prevstorage!=null) {
        if(prevstorage.acceptsinput(this.pickaxe)) {  // be sure this storage will still accept the shovel back
          prevstorage.receiveitem(this.pickaxe);
            // if the shovel isn't accepted, it will just be deleted when this block is destroyed
    } } }
    
    super.deleteblock();
  }
}


