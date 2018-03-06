class claydryer extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'claydryer';
    this.stored = [];  // list of all stored items 
    //this.onhand = []; // we're not even using this in this function
    this.drawgameblock('img/claydryer.png', 0); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    
    if(this.stored.length<20) {
      switch(item.name) {
        case 'rawdirtbrick': return 1;
        default: return 0;
    } }
    return 0;
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    
    if(this.stored.length<20) {
      // We also need to add a drying timer to this item now.  We will use a count-down timer, so we can easily determine when a given item will be finished
      switch(item.name) {
        case 'rawdirtbrick': item.drytime = 200; item.name = 'dirtbrick'; break;
        default:
          item.drytime = 200;
          console.log('Error in claydryer->receiveitem: item "'+ item.name +'" not yet supported; default time of 200 will be used');
        break;
      }
      this.stored.push(item);
    }else{
      console.log('Error in claydryer->receiveitem: item ('+ item.name +') was received but theres no space to store it. This item will be lost');
    }
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    // With the long delay time, we can provide all actual outputs based on what we have stored.  Also, considering the way possibleoutputs() is used,
    // we can simply list the name of each item we are currently holding
    var chunk = [];
    for(var i=0; i<this.stored.length; i++) {
      switch(this.stored[i].name) {
        case 'dirtbrick': chunk.push('dirtbrick'); break;
        default: console.log('Error in claydryer->possibleoutputs: item type of "'+ this.stored[i].name +'" not yet supported - please add');
      }
    }
    return chunk;
  }

  nextoutput() {
    // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    
    // We will output the first item with a dry time of 0
    for(var i=0; i<this.stored.length; i++) {
      if(this.stored[i].drytime<=0) return this.stored[i].name
    }
    return '';
  }

  outputitem() {
    // activeblock function that returns the actual item to be collected by the calling block.  Be sure to delete access to the item while doing this
    // This code below is generally all that's needed to manage this
    
    // We're not actually using the onhand structure to manage outputs, so we will find the first item with a dry time of 0, and return it, splicing out it's slot
    for(var i=0; i<this.stored.length; i++) {
      if(this.stored[i].drytime<=0) {
        var outitem = this.stored[i];
        this.stored.splice(i,1);
        return outitem;
    } }
  }
  
  getoutput(targetitem) {
    switch(targetitem) {  // This block will likely have a lot of output options, but for now we only have 1
      case 'dirtbrick':
        // In the event we are trying more than one type of item, we need to search for a matching item.  We also need to ensure the item found has finished drying
        for(var i=0; i<this.stored.length; i++) {
          if(this.stored[i].name==targetitem) {
            if(this.stored[i].drytime<=0) {
              var grab = this.stored[i];
              this.stored.splice(i,1);
              return grab;
        } } }
      break;
    }
    return null;
  }
  
  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    
    // we should be able to just run through the list and decrement any drytime value that isn't already 0
    for(var i=0; i<this.stored.length; i++) {
      if(this.stored[i].drytime>0) {
        this.stored[i].drytime--;
    } }
    // Go ahead and search for additional items to load into this block - if there's room
    if(this.stored.length<20) {
      for(var i=0; i<4; i++) {
        var neighbor = this.getneighbor(i);
        if(neighbor!=null) {
          var pickup = neighbor.getoutput('rawdirtbrick');
          if(pickup!=null) {
            // go aheaad and convert this to a dirt brick, and add a timer
            pickup.name = 'dirtbrick'; pickup.drytime = 200;
            this.stored.push(pickup);
            i=5;
    } } } }
  }
  
  drawpanel() {
    // activeblock function that generates the content
    $("#gamepanel").html('<center><b>Clay Dryer</b></center><br /><br />'+
                         'Space for clay shapes to sit & dry so they can be fired. Works for dirt shapes too.<br /><br />'+
                         '(This block doesn\'t use a worker, therefore does not get a priority level)<br />'+
                         'Items on hand: <span id="sidepanelstock">'+ this.stored.length +'</span><br />'+
                         '<span id="sidepanelnextup"></span>');
                         
    // Now, show information about the item that will be finished next.  We will handle this in updatepanel(), as that already handles it
    this.updatepanel();
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    $("#sidepanelstock").html(this.stored.length);
    
    if(this.stored.length==0) {
      $("#sidepanelnextup").html('');
    }else{
      var found = null;
      var besttime = 100000;
      for(var i=0; i<this.stored.length; i++) {
        if(this.stored[i].drytime<besttime) {
          found = this.stored[i];
          besttime = this.stored[i].drytime;
      } }
      $("#sidepanelnextup").html('Next up: '+ found.name +', ready in '+ found.drytime +' ticks');
    }
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    for(var i=0;i<this.stored.length;i++) {
      Object.setPrototypeOf(this.stored[i], item.prototype);
    }
    this.drawgameblock('img/claydryer.png', 0);
  }
}


