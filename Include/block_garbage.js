class garbage extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'garbage';
    this.onhand = null;  // item this garbage is currently holding.  The garbage block can only destroy 1 item at a time
    this.collectlist = []; // list of strings of the items that this garbage block will collect from
    this.drawgameblock('img/garbage.png', 0); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    // This block accepts anything, so long as it isn't holding anything currently
    if(this.onhand==null) {
      return 1;
    }
    return 0;
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    if(this.onhand==null) {
      this.onhand = item;
    }else{
      console.log("Error in garbage->receiveitem: this block is already holding an item, cannot accept another. The item pass will be lost - wait... isn't that the point of this block?");
    }
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    // This doesn't output anything
    return [];
  }

  nextoutput() {
    // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    return '';
  }

  outputitem() {
    // activeblock function that returns the actual item to be collected by the calling block.  Be sure to delete access to the item while doing this
    // This code below is generally all that's needed to manage this

    // This block doesn't output anything (which is reported in nextoutput, above).  Unfortunately, bucketline workers only use nextoutput() to determine if something output
    // is on the blacklist, so it'll ask for an item from this block anyway.   
    return null;
  }
  
  getoutput(targetitem) {
    return null;  // This block doesn't output anything
  }
  
  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    
    if(this.onhand!=null && workpoints>=1) {
      workpoints--;  // This block will use a worker to dispose of the item (what they do with the item... who knows?! we don't care)
      this.onhand = null;
    }else{
        // Like the storage block, this block will get more complicated with the new item flow setup.  If we had nothing to destroy this go-around, search for
        // anything valid to pick up
      for(var i=0; i<4; i++) {
        var neighbor = this.getneighbor(i);
        if(neighbor!=null) {
          for(var j=0; j<this.collectlist.length; j++) {
            this.onhand = neighbor.getoutput(this.collectlist[j]);
            if(this.onhand!=null) {   // we have already stored the target in 'onhand', but still need to exit our loops
              i=5;
              j=this.collectlist.length;
    } } } } }
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Garbage Bin</b></center><br /><br />'+
                         'Accepts any item and destroys it; Useful for clearing space for more important things.  Requires 1 worker to dispose of the object. What '+
                         'they do with the object, nobody knows!<br /><br/>'+
                         this.displaypriority() +'<br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />'+
                         '<b>Accepted inputs</b><br />');
    var fulllist = [];
    var blockcolor;
    for(var i=0; i<4; i++) {
      var neighbor = this.getneighbor(i);
      if(neighbor!=null) {
        var itemslist = neighbor.possibleoutputs([]);
        for(var j=0; j<itemslist.length; j++) {
          if(fulllist.indexOf(itemslist[j])==-1) { // aka this hasn't been added to the 'already seen' list
            fulllist.push(itemslist[j]);
            blockcolor = 'green';
            if(this.collectlist.indexOf(itemslist[j])==-1) blockcolor = 'red'; // item is not in the list
            $("#gamepanel").append('<div id="sidepanelwhitelist'+ itemslist[j] +'" class="sidepanelbutton" style="background-color:'+ blockcolor +';" '+
                                   'onclick="selectedblock.toggleinput(\''+ itemslist[j] +'\');">'+ itemslist[j] +'</div>');
    } } } } 
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    if(this.onhand!=null) Object.setPrototypeOf(this.onhand, item.prototype);
    this.drawgameblock('img/garbage.png', 0);
  }
  
  toggleinput(itemname) {
    // User-called function to change the status of any items accessible by this block
    
    // First, determine if the target item is in the list
    var x = this.collectlist.indexOf(itemname);
    if(x==-1) {  // item was not found. Push it to the list & set its color to green
      this.collectlist.push(itemname);
      $("#sidepanelwhitelist"+ itemname).css("background-color", "green");
    }else{
      this.collectlist.splice(x,1);  // since we have the index of the item from earlier
      $("#sidepanelwhitelist"+ itemname).css("background-color", "red");
    }
  }
}



