class storage extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'storage';
    this.onhand = [];
    this.targetitem = ''; // What item the user wants to fill this storage with
    this.outputstatus = 0;  // user can determine if a given item can be output or not.
    this.drawgameblock('img/storage.png', 1);  // we will use the scrollbar to represent the unit's remaining capacity
  }
  
  acceptsinput(item) {
    //activeblock function to determine what items this block will accept
    // a storage unit will only accept any items it already has, and only if there is enough space
    if(this.onhand.length==0) {
      return 1;
    }
    if(this.onhand[0].name==item.name) {
      if(this.onhand.length<10) {
        return 1;
    } }
    return 0;
  }
  
  receiveitem(item) {
    //activeblock function to accept a given item as input
    
    if(this.onhand.length==0) {
      this.onhand.push(item);
    }else{
      if(this.onhand[0].name==item.name) {
        this.onhand.push(item);
      }else{
        console.log('Error in Storage->receiveitem() - received incorrect item type (holding '+ this.onhand[0].name +', received '+ item.name +')');
    } }
  }
  
  possibleoutputs(askedlist) {
    //activeblock function to list all possible outputs
    if(this.onhand.length==0) {
      // we're not holding anything here yet; unable to determine what a possible output could be
      return '';
    }else{
      return [this.onhand[0].name];  // return value must be in an array format
    }
  }
  
  nextoutput() {
    // activeblock function that returns the name of the next item to be output
    if(this.outputstatus==0) return '';
    if(this.onhand.length==0) return '';
    return this.onhand[0].name;
  }
  
  outputitem(bypassstatus=0) {
    //activeblock function to output an item, if possible
    if(bypassstatus==0) {
      if(this.outputstatus==0) {
        return null;
      }else{
        if(this.onhand.length>0) {
          var grab = this.onhand[0];
          this.onhand.splice(0,1);
          return grab;
        }else{
          return null;
        }
      }
    }else{
      if(this.onhand.length>0) {
        var grab = this.onhand[0];
        this.onhand.splice(0,1);
        grab.storagesource = this.id; // this allows the returned tool to be returned to this storage place, if the block it is in has been removed
        return grab;
      }else{
        return null;
      }
    }
  }
  
  getoutput(target) {
    if(this.outputstatus==1) {
      if(this.onhand.length>0) {
        if(this.onhand[0].name==target) {
          var grab = this.onhand[0];
          this.onhand.splice(0,1);
          return grab;
    } } }
    return null;
  }
  
  update() {
    // activeblock function to allow this block to manage internal operations
    // this block will continuously look for new items to collect (that meet its criteria)
    
    if(this.onhand.length<10) {
      if(this.targetitem!='') {
        for(var i=0; i<4; i++) {
          var neighbor = this.getneighbor(i);
          if(neighbor!=null) {
            var pickup = neighbor.getoutput(this.targetitem);
            if(pickup!=null) {
              this.onhand.push(pickup);
              i=5;
    } } } } }
  }
  
  drawpanel() {
    // activeblock function to write the side panel when this block is selected
    $("#gamepanel").html('<center><b>Storage</b></center><br />'+
                         'Stores items for later use.  Only holds 1 type at a time.  Capacity can be increased by equiping storage items.<br /><br />'+
                         'Capacity: 10 items<br />');
    if(this.onhand.length==0) {
      $("#gamepanel").append('Holding: <span id="storagecontent">empty</span><br /><br />');
    }else{
      $("#gamepanel").append('Holding: <span id="storagecontent">'+ this.onhand[0].name +' x'+ this.onhand.length +'</span><br /><br />');
    }
    
    // Now list all the possible inputs this block can accept, and let the user pick one of them
    $("#gamepanel").append('<b>Input selection:</b><br />');
    var displaycolor = 'red';
    if(this.targetitem=='') displaycolor = 'green';
    $("#gamepanel").append('<span class="sidepanelbutton" id="sidepaneltarget" style="background-color:'+ displaycolor +'" onclick="selectedblock.settarget(\'\')">None</span>');
    var fulllist = [];  // this is to prevent the same item from being listed twice
    for(var i=0; i<4; i++) {
      var neighbor = this.getneighbor(i);
      if(neighbor!=null) {
        var itemslist = neighbor.possibleoutputs([]);
        for(var j=0; j<itemslist.length; j++) {
          if(fulllist.indexOf(itemslist[j])==-1) {
            // This is not yet on the list.
            fulllist.push(itemslist[j]);
            if(this.targetitem==itemslist[j]) {
              displaycolor = 'green';
            }else{
              displaycolor = 'red';
            }
            $("#gamepanel").append('<span class="sidepanelbutton" id="sidepaneltarget'+ itemslist[j] +'" style="background-color:'+ displaycolor +'" onclick="selectedblock.settarget(\''+ itemslist[j] +'\')">'+ itemslist[j] +'</span>');
          }
        }
      }
    }
    
    var status = 'Off';
    var color = 'red';
    if(this.outputstatus==1) {
      status = 'On';
      color = 'green'; 
    }
    $("#gamepanel").append('<br /><br />Output status: <span class="sidepanelbutton" id="sidepaneloutput" style="background-color:'+ color +'" onclick="selectedblock.togglestatus()">'+ status +'</span><br />'); 
    $("#gamepanel").append('Equipment options not yet available<br />'+
                           '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a>');
  }
  
  updatepanel() {
    // activeblock function to update the displayed panel
    if(this.onhand.length==0) {
      $("#storagecontent").html('empty');
    }else{
      $("#storagecontent").html(this.onhand[0].name +' x'+ this.onhand.length);
    }
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    for(var i=0; i<this.onhand.length; i++) {
      Object.setPrototypeOf(this.onhand[i], item.prototype);
      switch(this.onhand[i].name) { // Also account for any foods that might be here
       case 'apple': case 'berry': case 'treenut': case 'mushroom': case 'deermeat': case 'wolfmeat': case 'chickenmeat': // we don't have much food yet...
         foodlist.push(this.onhand[i]);
    } }
    this.drawgameblock('img/storage.png', 1);
      // We're not yet using the progress bar; I think we'll use it for denoting the used capacity though
  }
  
  settarget(newtarget) {
    $("#sidepaneltarget"+ this.targetitem).css("background-color", "red");
    this.targetitem = newtarget;
    $("#sidepaneltarget"+ this.targetitem).css("background-color", "green");
  }
  
  togglestatus() {
    // Allows the user to change the output status of this block
    this.outputstatus = 1 - this.outputstatus;
    // Go ahead and change the status of this button
    if(this.outputstatus==0) {
      $("#sidepaneloutput").css('background-color', 'red');
      $("#sidepaneloutput").html('Off');
    }else{
      $("#sidepaneloutput").css('background-color', 'green');
      $("#sidepaneloutput").html('On');
    }
  }
}



