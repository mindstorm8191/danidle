class woodshovel extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'woodshovel';
    this.onhand = [];
    this.sticks = [];
    this.counter = 0;
    this.drawgameblock('img/shovel_wood.png', 1);
  }
  
  acceptsinput(item) {
    // activeblock function to determine what items this block will accept
    // the wood shovel will only accept sticks, and only if it still has space for some
    if(item.name=='stick') {
      if(this.sticks.length<10) {
        return 1;
    } }
    return 0;
  }
  
  receiveitem(item) {
    // activeblock function to accept an item as input
    // this should only accept sticks
    if(item.name=='stick') {
      this.sticks.push(item);
    }else{
      console.log('Error in woodshovel.receiveitem() - item received is not a stick');
    }
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to list all possible outputs of 
    return ['woodshovel'];
  }

  nextoutput() {
    // activeblock function that returns a string of the next item to output
    if(this.onhand.length>0) {
      return 'woodshovel';
    }
    return '';
  }

  outputitem() {
    // activeblock function to output an item, if possible
    if(this.onhand.length>0) {
      var grab = this.onhand[0];
      this.onhand.splice(0,1);
      return grab;
    }else{
      return null;
    }
  }
  
  update() {
    // Activeblock function to allow this block to manage internal operations
    if(this.onhand.length<5) {
      if(this.sticks.length>=5) {
        if(workpoints>=1) {
          workpoints--;
          this.counter++;
          if(this.counter>=12) {
            this.counter=0;
            this.sticks.splice(0,5);  // deletes 5 sticks
            this.onhand.push(new item('woodshovel','shovel', 20, 1));
            findunlocks('woodshovel');
    } } } }
    $("#"+ this.id +"progress").css({"width":(this.counter*5)});
  }
  
  drawpanel() {
    // Activeblock function to write the side panel when this block is selected
    $("#gamepanel").html('<center><b>Wood Shovel Maker</b></center><br />'+
                         'Accepts 5 sticks and turns it into 1 wood shovel.  Shovels unlock new resources such as gravel and dirt.<br /><br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
                         'Currently has <span id="sidepanel_sticks">'+ this.sticks.length +'</span> sticks<br />'+
                         'Shovels on hand: <span id="sidepanel_shovels">'+ this.onhand.length +'</span><br />');
    if(this.counter==0) {
      if(this.onhand.length<5) {
        $("#gamepanel").append('<span id="sidepanel_status">Waiting for more sticks...</span>');
      }else{
        $("#gamepanel").append('<span id="sidepanel_status">Shovel inventory is full, cannot produce more</span>');
      } 
    }else{
      $("#gamepanel").append('<span id="sidepanel_status">Progress: '+ Math.floor((this.counter/12.0)*100) +'%</span>');
    }
    $("#gamepanel").append('<br /><br /><a href="#" onclick="selectedblock.deleteblock()">Delete Block</a>');
  }
  
  updatepanel() {
    // Activeblock function to update side panel when this block is selected
    $("#sidepanel_sticks").html(this.sticks.length);
    $("#sidepanel_shovels").html(this.onhand.length);
    if(this.counter==0) {
      if(this.onhand.length<5) {
        $("#sidepanel_status").html('Waiting for more sticks...');
      }else{
        $("#sidepanel_status").html('Shovel inventory is full, cannot produce more');
      } 
    }else{
      $("#sidepanel_status").html('Progress: '+ Math.floor((this.counter/12.0)*100) +'%');
    }
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    for(var i=0; i<this.sticks.length; i++) {
      Object.setPrototypeOf(this.sticks[i], item.prototype);
    }
    for(var i=0; i<this.onhand.length; i++) {
      Object.setPrototypeOf(this.onhand[i], item.prototype);
    }
    this.drawgameblock('img/shovel_wood.png', 1);
    $("#"+ this.id +"progress").css({"width":(this.counter*5)});
  }
}


