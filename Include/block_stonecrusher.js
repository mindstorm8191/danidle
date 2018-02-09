class stonecrusher extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'Stone Crusher';
    this.input = [];      // stone received from neighboring blocks
    this.onhand = [];     // crushed stone waiting to be removed
    this.counter = 0;     // how much progress has been made for the current operation
    this.hammer = null;   // hammer currently in use
    this.targethammer = '';  // next hammer to pick up when current one breaks
    this.drawgameblock('img/stonecrusher.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    
    if(item.name=='stone') {
      if(this.input.length<8) {
        return 1;
    } }
    return 0;
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    
    if(item.name=='stone') {
      this.input.push(item);
    }else{
      console.log('Error in flinttoolmaker->receiveitem: item received ('+ item.name +') is not allowed here. this item has been lost');
    }
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    return ['crushedstone'];
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
    if(this.hammer==null) {
      if(this.targethammer!='') {
        this.hammer = blocklist.findinstorage(this.targethammer, 1);
      }
    }else{
      if(this.onhand.length<5) {
        if(this.input.length>0) {
          if(workpoints>=1) {
            workpoints--;
            this.counter += this.hammer.efficiency;
            this.hammer.endurance--;
            if(this.hammer.endurance<=0) {
              this.hammer = blocklist.findinstorage(this.targethammer, 1);
            }
            if(this.counter>12) {
              this.counter-=12;
              this.input.splice(0,1); // delete one of the stones
              this.onhand.push(new item('crushedstone'));
            }
            $("#"+ this.id +"progress").css({"width":(this.counter*5)}); // aka 60/12
    } } } }
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Stone crusher</b></center><br /><br />'+
                         'Crushes whole stone into small pieces, where ores can be extracted. Requires a hammer (flint at least) to function.<br /><br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
                         'Stone on hand: <span id=sidepanelstone">'+ this.input.length +'</span><br />'+
                         'Crushed stone stock: <span id="sidepanelonhand">'+ this.onhand.length +'</span><br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />'+
                         'Tool Selection:<br /><b>Hammer</b><br />');
    if(this.hammer==null) {
      $("#gamepanel").append('<span id="sidepanelactivetool">none loaded</span><br />');
    }else{
      $("#gamepanel").append('<span id="sidepanelactivetool">'+ this.hammer.name +' ('+ (Math.floor((this.hammer.endurance / this.hammer.totalendurance)*100)) +'% health)</span><br />');
    }
    this.displaytoollist(this.targethammer, ['flinthammer']);
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    $("#sidepanelstone").html(this.input.length);
    $("#sidepanelonhand").html(this.onhand.length);
    if(this.hammer==null) {
      $("#sidepanelactivetool").html('none loaded');
    }else{
      $("#sidepanelactivetool").html(this.hammer.name +' ('+ (Math.floor((this.hammer.endurance / this.hammer.totalendurance)*100)) +'% health)');
    }
    this.updatetoollist(this.targethammer, ['flinthammer']);
  }
  
  picktool(newtool) {
    this.targethammer = newtool;
    $("#sidepaneltool"           ).css("background-color", this.choosetoolcolor(this.targethammer, ''           ));
    $("#sidepaneltoolflinthammer").css("background-color", this.choosetoolcolor(this.targethammer, 'flinthammer'));
  }
  
  deleteblock() {
    // Sets up the block to be deleted.  The base block class has a delete function, but we need to add additional actions when deleting
    // Return the tool to the storage it was in before being used
    if(this.hammer!=null) {
      var prevstorage = blocklist.findbyid(this.hammer.storagesource);
      if(prevstorage!=null) {
        if(prevstorage.acceptsinput(this.hammer)) {  // be sure this storage will still accept the shovel back
          prevstorage.receiveitem(this.hammer);
            // if the shovel isn't accepted, it will just be deleted when this block is destroyed
    } } }
    
    super.deleteblock();
  }
}


