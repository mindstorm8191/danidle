class blocknamehere extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'BlockNameHere';
    this.onhand = [];     // array of anything this block is holding, usually for output
    this.counter = 0;     // how much progress has been made for the current operation
    this.drawgameblock('FullPathToImageHere', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
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

  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>block name here</b></center><br /><br />'+
                         'Description of your block goes here');
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array. 
  }  
}
