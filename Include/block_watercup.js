class watercup extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'watercup';
    this.onhand = []; // array of anything this block is holding, usually for output
    this.cup = [];
    this.drawgameblock('img/watercup.png', 0); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    
    if(item.name=='woodencup') {
      if(this.cup.length<5) {
        return 1;
    } }
    return 0;
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    if(item.name=='woodencup') {
      this.cup.push(item);
    }else{
      console.log('Error in watercup->receive item: receive '+ item.name +', this only accepts woodencup');
    }
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    return ['woodenwatercup'];
  }

  nextoutput() {
    // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    
    if(this.onhand.length>0) {
      return 'woodenwatercup';
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
    if(targetitem=='woodenwatercup') {
      return this.outputitem();
    }
    return null;
  }
  
  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    if(this.cup.length>=1) {
      if(this.onhand.length<5) {
        if(workpoints>=1) {
          workpoints--;
          // We don't really need a counter here, as filling the cup takes only 1 tick
          this.onhand.push(new item('woodenwatercup'));
          this.cup.splice(0,1);
          findunlocks('woodenwatercup');
      } }
    }else{
      // No cups on hand.  Search nearby for one
      for(var i=0; i<4; i++) {
        var neighbor = this.getneighbor(i);
        if(neighbor!=null) {
          var pickup = neighbor.getoutput('woodencup');
          if(pickup !=null) {
            this.cup.push(pickup);
            i=5;
    } } } }
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Water Cup Filler</b></center><br /><br />'+
                         'Fills wooden cups with water for other uses.  This only takes 1 unit of time<br /><br />'+
                         this.displaypriority() +'<br />'+
                         'Cups on hand: <span id="sidepanelcup">'+ this.cup.length +'</span><br />'+
                         'Filled cups stored: <span id="sidepanelstock">'+ this.onhand.length +'</span><br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a>');
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    $("#sidepanelcup").html(this.cup.length);
    $("#sidepanelstock").html(this.onhand.length);
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    for(var i=0; i<this.cup.length; i++) {
      Object.setPrototypeOf(this.cup[i], item.prototype);
    }
    for(var i=0; i<this.onhand.length; i++) {
      Object.setPrototypeOf(this.onhand[i], item.prototype);
    }
    this.drawgameblock('img/watercup.png', 0);
  }
}



