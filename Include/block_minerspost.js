class minerspost extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'Miners Post';
    this.woodpost = [];   // list of wood posts not yet used in the mine
    this.torch = [];      // list of torchest not yet used in the mine
    this.twine = [];      // list of twine not yet used.  Twine is used to haul the stones out of the mine
    this.onhand = [];     // array of anything this block is holding, usually for output
    this.counter = 0;     // how much progress has been made for the current operation
    this.depth = 0;       // how deep this mine is.  Different ores will need different depths to get to.  Ores availabile will be determined by map location; all players will start
                          // with only copper, which is at a depth of 20.
    this.levelprogress = 0; // how much time has been spent on this level.  After 20 increments of this, we can reach a new depth. Once we have reached an ore vein, each level can
                            // last for 50 cycles
    this.pickaxe = null;
    this.targetpickaxe = '';
    this.drawgameblock('img/minerspost.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    switch(item.name) {
      case 'woodpost':
        if(this.woodpost.length<20) return 1;
      break;
      case 'torch':
        if(this.torch.length<60) return 1;
      break;
      case 'twine':
        if(this.twine.length<20) return 1;
      break;
    }
    return 0;
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    switch(item.name) {
      case 'woodpost': this.woodpost.push(item); break;
      case 'torch': this.torch.push(item); break;
      case 'twine': this.twine.push(item); break;
    }
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    return ['rawstone', 'copperorestone']; // copperorestone will need to be crushed before copper can be extracted.  Copper density rates will be set by this block
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
      if(this.woodpost.length>=1) {
        if(this.torch.length>=1) {
          if(this.twine.length>=1) {
            if(workpoints>=1) {
              workpoints--;
              this.counter += this.pickaxe.efficiency;
              this.pickaxe.endurance--;
              if(this.pickaxe.endurance<=0) {  // This pickaxe is worn out
                this.pickaxe = blocklist.findinstorage(this.targetpickaxe, 1);
              }
              if(this.counter>=18) {
                this.woodpost.splice(0,1); // consume 1 post
                this.torch.splice(0,1); // consume 1 torch (for now. We may change the rate of torch consumption based on how deep the mine is)
                this.levelprogress++; // increase the progress of this level
                if(this.depth>20) { // determine if the player has reached the depth necessary to start collecting ores
                  this.onhand.push(new item('copperorestone'));
                  if(this.levelprogress>=50) {
                    this.depth++;
                    this.twine.splice(0,1);
                    this.levelprogress -= 20;
                  }
                }else{
                  this.onhand.push(new item('rawstone'));
                  if(this.levelprogress>=20) {
                    this.depth++;
                    this.twine.splice(0,1);
                    this.levelprogress -= 20;
              } } }
              $("#"+ this.id +"progress").css({"width":(this.counter*3.333333)}); // aka counter * 60/18
      } } } }
    }else{
      // no pickaxe loaded.  Let's grab one now (if one is selected)
      this.pickaxe = blocklist.findinstorage(this.targetpickaxe, 1);  // if target pickaxe is a null string, this will already return null
    }
  }
  
  drawpanel() {
    // activeblock function that generates the content
    $("#gamepanel").html('<center><b>Miner\'s Post</b></center><br /><br />'+
                         'Digs deep underground to locate ore viens, then begins collecting all the ore from those veins. Requires pickaxes as tools. Also requires wood posts, '+ 
                         'torches and twine as input. Torches determine how long any miner can be underground. The deeper your mine, the more torches they will need.<br /><br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
                         'Unused posts on hand: <span id="sidepanelposts">'+ this.woodpost.length +'</span><br />'+
                         'Torches on hand: <span id="sidepaneltorches">'+ this.torch.length +'</span><br />'+
                         'Unused twine on hand: <span id="sidepaneltwine">'+ this.twine.length +'</span><br />'+
                         'Current depth: <span id="sidepaneldepth">'+ this.depth +'</span><br />'+
                         'Progress at depth: <span id="sidepanellevelprogress">'+ this.levelprogress +'</span><br />'+
                         'Current block progress: <span id="sidepanelprogress">'+ this.counter +'</span>%<br /><br />'+
                         'Tool Selection:<br /><b>Pickaxe</b><br />');
    if(this.pickaxe==null) {
      $("#gamepanel").append('<span id="sidepanelactivetool">none loaded</span><br />');
    }else{
      $("#gamepanel").append('<span id="sidepanelactivetool">'+ this.pickaxe.name +' ('+ (Math.floor((this.pickaxe.endurance / this.pickaxe.totalendurance)*100)) +'% health)</span><br />');
    }
    this.displaytoollist(this.targetpickaxe, ['flintpickaxe']);
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    $("#sidepanelposts").html(this.woodpost.length);
    $("#sidepaneltorches").html(this.torch.length);
    $("#sidepaneltwince").html(this.twine.length);
    $("#sidepaneldepth").html(this.depth);
    $("#sidepanellevelprogress").html(this.levelprogress);
    $("#sidepanelprogress").html(this.counter);
    if(this.pickaxe==null) {
      $("#sidepanelactivetool").html('none loaded');
    }else{
      $("#sidepanelactivetool").html(this.pickaxe.name +' ('+ (Math.floor((this.pickaxe.endurance / this.pickaxe.totalendurance)*100)) +'% health)');
    }
    this.updatetoollist(this.targetpickaxe, ['flintpickaxe']);
  }
  
  picktool(newpickaxe) {
    this.targetpickaxe = newpickaxe;
    this.updatetoollist(this.targetpickaxe, ['flintpickaxe']);
  }
}


