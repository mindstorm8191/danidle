class woodpointspear extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'woodpointspear';
    this.stick = [];
    this.onhand = [];     // array of anything this block is holding, usually for output
    this.counter = 0;     // how much progress has been made for the current operation
    this.drawgameblock('img/woodpointspear.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    if(this.stick.length<10) {
      if(item.name=='stick') {
        return 1;
    } }
    return 0;
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    if(this.stick.length<10 && item.name=='stick') {
      this.stick.push(item);
    }else{
      console.log("Error in woodpointspear->receiveitem: this block accepts sticks, item received is "+ item.name +", this item will be lost");
    }
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    return ['woodpointspear'];
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
    if(workpoints>=1) {
      if(this.stick.length>0) {
        if(this.onhand.length<10) {
          this.counter++;
          workpoints--;
          if(this.counter>10) {
            this.counter-=10;
            this.onhand.push(new item('woodpointspear', 'weapon', 30, 1));
            this.stick.splice(0,1); // delete the item from input
            findunlocks('woodpointspear');
          }
          $("#"+ this.id +"progress").css({"width":(this.counter*6)}); // aka 60/10
    } } }
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Wood-point spear maker</b></center><br /><br />'+
                         'Turns a stick into a spear, without any extra parts.  Good for hunting<br /><br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
                         'Sticks on hand: <span id="sidepanelstick">'+ this.stick.length +'</span><br />'+
                         'Progress: <span id="sidepanelprogress">'+ Math.floor((this.counter/10.0)*100) +'</span>%<br />'+
                         'Spears stocked: <span id="sidepanelspear">'+ this.onhand.length +'</span><br />'+
                         'This block does not require any tools<br /><br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a>');
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    $("#sidepanelstick").html(this.stick.length);
    $("#sidepanelprogress").html(Math.floor((this.counter/10.0)*100));
    $("#sidepanelspear").html(this.onhand.length);
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    for(var i=0; i<this.stick.length; i++) {
      Object.setPrototypeOf(this.stick[i], item.prototype);
    }
    for(var i=0; i<this.onhand.length; i++) {
      Object.setPrototypeOf(this.onhand[i], item.prototype);
    }
    this.drawgameblock('img/woodpointspear.png', 1);
    $("#"+ this.id +"progress").css({"width":(this.counter*6)});
  }
}


