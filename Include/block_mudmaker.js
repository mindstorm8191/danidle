class mudmaker extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'mudmaker';
    this.counter = 0;
    this.watercup = [];
    this.dirt = [];
    this.onhand = []; // array of anything this block is holding, usually for output
    this.emptycup = [];
    this.drawgameblock('img/mudmaker.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    if(item.name=='woodenwatercup') {
      if(this.watercup.length<5) {
        return 1;
    } }
    if(item.name=='dirt') {
      if(this.dirt.length<5) {
        return 1;
    } }
    return 0;
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    if(item.name=='woodenwatercup') {
      this.watercup.push(item);
      return;
    }
    if(item.name=='dirt') {
      this.dirt.push(item);
      return;
    }
    console.log('Error in mudmaker->receiveitem: received item ('+ item.name +') not accepted. This will be lost');
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    return ['mud', 'woodencup'];
  }

  nextoutput() {
    // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    if(this.onhand.length>0) {
      return 'mud';
    }else{
      if(this.emptycup.length>0) {
        return 'woodencup';
      }else{
        return '';
    } }
  }

  outputitem() {
    // activeblock function that returns the actual item to be collected by the calling block.  Be sure to delete access to the item while doing this
    // This code below is generally all that's needed to manage this
    
    if(this.onhand.length>0) {
      var grab = this.onhand[0];
      this.onhand.splice(0,1);
      return grab;
    }else{
      if(this.emptycup.length>0) {
        var grab = this.emptycup[0];
        this.emptycup.splice(0,1);
        return grab;
    } }
    return null;
  }
  
  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    if(this.watercup.length>0) {
      if(this.dirt.length>0) {
        if(this.onhand.length<5) {
          if(this.emptycup.length<5) {
            if(workpoints>=1) {
              workpoints--;
              this.counter++;
              if(this.counter>=5) {
                this.counter-=5;
                this.dirt.splice(0,1);
                this.watercup.splice(0,1);
                this.onhand.push(new item('mud'));
                this.emptycup.push(new item('woodencup'));
              }
              $("#"+ this.id +"progress").css({"width":(this.counter*12)});  // aka counter * (60/5)
    } } } } }
  }
  
  drawpanel() {
    // activeblock function that generates the content
    $("#gamepanel").html('<center><b>Mud Maker</b></center><br /><br />'+
                         'Mixes water into dirt to make mud. Good for early ceramics<br /><br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
                         'Water cups stored: <span id"sidepanelcup">'+ this.watercup.length +'</span><br />'+
                         'Dirt stored: <span id="sidepaneldirt">'+ this.dirt.length +'</span><br />'+
                         'Progress: <span id="sidepanelprogress">'+ Math.floor((this.counter/5.0)*100) +'</span>%<br />'+
                         'Mud on hand: <span id="sidepanelstock">'+ this.onhand.length +'</span><br />'+
                         'Empty cups: <span id="sidepanelemptycup">'+ this.emptycup.length +'</span><br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br />');
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    $("#sidepanelcup").html(this.watercup.length);
    $("#sidepaneldirt").html(this.dirt.length);
    $("#sidepanelprogress").html(Math.floor((this.counter/5.0)*100));
    $("#sidepanelstock").html(this.onhand.length);
    $("#sidepanelemptycup").html(this.emptycup.length);
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    for(var i=0; i<this.watercup.length; i++) {
      Object.setPrototypeOf(this.watercup[i], item.prototype);
    }
    for(var i=0; i<this.dirt.length; i++) {
      Object.setPrototypeOf(this.dirt[i], item.prototype);
    }
    for(var i=0; i<this.onhand.length; i++) {
      Object.setPrototypeOf(this.onhand[i], item.prototype);
    }
    for(var i=0; i<this.emptycup.length; i++) {
      Object.setPrototypeOf(this.emptycup[i], item.prototype);
    }
    this.drawgameblock('img/mudmaker.png', 1);
    $("#"+ this.id +"progress").css({"width":(this.counter*12)});
  }
}




