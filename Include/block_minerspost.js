class minerspost extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'minerspost';
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
  
  getoutput(targetitem) {
    // Returns a specific output item, if it is available
    switch(targetitem) {
      case 'rawstone': case 'copperorestone':
        for(var i=0; i<this.onhand.length; i++) {
          if(this.onhand[i].name == targetitem) {
            var grab = this.onhand[i];
            this.onhand.splice(i,1);
            return grab;
        } }
      break;
    }
    return null;
  }
  
  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    if(this.pickaxe!=null) {
      var itemsneeded = [];
      if(this.onhand.length<20) {
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
                  this.counter -= 18;  // reduce the currently level progress to zero
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
              }
            }else{
              itemsneeded.push('twine');
            }
          }else{
            itemsneeded.push('torch');
            if(this.twine.length<1) itemsneeded.push('twine');
          }
        }else{
          itemsneeded.push('woodpost');
          if(this.torch.length<1) itemsneeded.push('torch');
          if(this.twine.length<1) itemsneeded.push('twine');
        }
          // Now take our itemsneeded list and see if we can grab any items from nearby sources
        if(itemsneeded.length>0) {
          for(var i=0; i<4; i++) {
            var neighbor = this.getneighbor(i);
            if(neighbor!=null) {
              for(var j=0; j<itemsneeded.length; j++) {
                var pickup = neighbor.getoutput(itemsneeded[j]);
                if(pickup !=null) {
                  switch(itemsneeded[j]) {  // now that we have something... what is it? Figure out what it is so we can put it in the right list
                    case 'woodpost': this.woodpost.push(pickup); break;
                    case 'torch':    this.torch.push(pickup);    break;
                    case 'twine':    this.twine.push(pickup);    break;
                  }
                  i=5;
                  j=itemsneeded.length;  // now exit the loops early
        } } } } }
      }
    }else{
      // no pickaxe loaded.  Let's grab one now (if one is selected)
      this.pickaxe = blocklist.findinstorage(this.targetpickaxe, 1);  // if target pickaxe is a null string, this will already return null
    }
  }
  
  drawpanel() {
    // activeblock function that generates the content
    $("#gamepanel").html('<center><b>Miner\'s Post</b></center><br /><br />'+
                         'So, you want to get metal ores? But you cannot get through the rocks to reach the ores. And you have no pickaxe, or metal to even make one. Such a '+
                         'predicament! But there is a way; heat the rocks with fire, then pour cold water over it. The temperature shift will crumble even the toughest of '+
                         'rocks!<br /><br />'+
                         'Digs deep underground to locate ore viens, then begins collecting all the ore from those veins. Requires pickaxes as tools. Also requires wood posts, '+ 
                         'torches and twine as input. Torches determine how long any miner can be underground. The deeper your mine, the more torches they will need.<br /><br />'+
                         this.displaypriority() +'<br />'+
                         'Unused posts on hand: <span id="sidepanelposts">'+ this.woodpost.length +'</span><br />'+
                         'Torches on hand: <span id="sidepaneltorches">'+ this.torch.length +'</span><br />'+
                         'Unused twine on hand: <span id="sidepaneltwine">'+ this.twine.length +'</span><br />'+
                         'Current depth: <span id="sidepaneldepth">'+ this.depth +'</span><br />'+
                         'Progress at depth: <span id="sidepanellevelprogress">'+ this.levelprogress +'</span><br />'+
                         'Current block progress: <span id="sidepanelprogress">'+ Math.floor((this.counter/18.0)*100) +'</span>%<br /><br />'+
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
    $("#sidepaneltwine").html(this.twine.length);
    $("#sidepaneldepth").html(this.depth);
    $("#sidepanellevelprogress").html(this.levelprogress);
    $("#sidepanelprogress").html(Math.floor((this.counter/18.0)*100));
    if(this.pickaxe==null) {
      $("#sidepanelactivetool").html('none loaded');
    }else{
      $("#sidepanelactivetool").html(this.pickaxe.name +' ('+ (Math.floor((this.pickaxe.endurance / this.pickaxe.totalendurance)*100)) +'% health)');
    }
    this.updatetoollist(this.targetpickaxe, ['flintpickaxe']);
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    if(this.pickaxe!=null) Object.setPrototypeOf(this.pickaxe, item.prototype);
    for(var i=0; i<this.woodpost.length; i++) {
      Object.setPrototypeOf(this.woodpost[i], item.prototype);
    }
    for(var i=0; i<this.torch.length; i++) {
      Object.setPrototypeOf(this.torch[i], item.prototype);
    }
    for(var i=0; i<this.twine.length; i++) {
      Object.setPrototypeOf(this.twine[i], item.prototype);
    }
    for(var i=0; i<this.onhand.length; i++) {
      Object.setPrototypeOf(this.onhand[i], item.prototype);
    }
    this.drawgameblock('img/minerspost.png', 1);
    $("#"+ this.id +"progress").css({"width":(this.counter*3.333333)});
  }
  
  picktool(newpickaxe) {
    this.targetpickaxe = newpickaxe;
    this.updatetoollist(this.targetpickaxe, ['flintpickaxe']);
  }
}


