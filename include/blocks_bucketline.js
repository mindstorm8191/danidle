class bucketline extends activeblock {  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'bucketline';
    this.item = '';
    this.refuselist = []; // list of all items that this unit won't accept from nearby units
    drawgameblock(this.id, this.xpos*66, this.ypos*66, "bucketline_empty.png", 0);
  }
  
  allowedequipment() {
    // Returns a list of all allowable equipment.
    // No equipment will be available for bucketline workers
    return null;
  }

  acceptsinput(itemtype) {
    // The bucketline mover doesn't accept items directly
    return 0;
  }
  
  outputitem() {
    // Returns an item, if it is holding anything.  outputitem() assumes that the item is already in the process of being taken
    if(this.item!='') {
      var temp = this.item;
      this.item = '';
      return temp
    }else{
      return '';
    }
  }
  
  possibleoutputs() {
    return [this.item];
  }
  
  nextoutput() {
    // Returns the next item that will be output by this block.
    return [this.item];
  }
  
  update() {
    var action = 'none';
    var triggered = 0;
    if(this.item=='') {  // Not holding anything. Check adjacent blocks to see if there is anything we can pick up
      var otherblock = this.getneighbors(this.xpos, this.ypos);
      for(var idx=0; idx<4; idx++) {
        if(otherblock[idx]!=null) {
          if(triggered==0) {
            var next = otherblock[idx].nextoutput();
            if(next!='') {
              if(this.refuselist.indexOf(next)==-1) { 
                this.item = otherblock[idx].outputitem();
                triggered = 1;
                switch(idx) {
                  case 0: $("#"+ this.id +"img").attr("src", "bucketline_up.png"); break;
                  case 1: $("#"+ this.id +"img").attr("src", "bucketline_right.png"); break;
                  case 2: $("#"+ this.id +"img").attr("src", "bucketline_down.png"); break;
                  case 3: $("#"+ this.id +"img").attr("src", "bucketline_left.png"); break;
                }
              }
            }
          }
        }
      }
      if(triggered==0) {
        $("#"+ this.id +"img").attr("src", "bucketline_empty.png");
      }
    }else{
      otherblock = this.getneighbors(this.xpos, this.ypos);
      for(var idx=0; idx<4; idx++) {
        if(triggered==0) {
          if(otherblock[idx]!=null) {
            if(otherblock[idx].acceptsinput(this.item)==1) {
              otherblock[idx].input = this.item;
              this.item = '';
              triggered = 1;
              switch(idx) {
                case 0: $("#"+ this.id +"img").attr("src", "bucketline_up.png"); break;
                case 1: $("#"+ this.id +"img").attr("src", "bucketline_right.png"); break;
                case 2: $("#"+ this.id +"img").attr("src", "bucketline_down.png"); break;
                case 3: $("#"+ this.id +"img").attr("src", "bucketline_left.png"); break;
              }
            }
          }
        }
      }
      if(triggered==0) {
        // Still nothing found to accept this.  To allow nearby bucketline units to accept this item, set this bucketline's output
        this.output = this.input;
      }
    }
  }
        
  drawpanel() {
    $("#gamepanel").html('<center><b>Bucket-line Item Mover</b><center><br />'+
                         'Moves items from one place to another.  Can be set to manage where items flow to & from.<br /><br />');
    if(this.item=='') {
      $("#gamepanel").append('Holding: <span id="itempanel">none</span>');
    }else{
      $("#gamepanel").append('Holding: <span id="itempanel">'+ this.item +'</span>');
    }
    $("#gamepanel").append('<br /><br /><b>Possible inputs</b> (click to disable)<br />');
          
    // Our refusal list starts empty.  We will check all nearby neighbors to determine all elements to show.  This 'available parts' list
    // won't be generated (or need to be) until this panel is displayed.  Any refused items that are later not possible to be received can be
    // ignored, but we will still show them in the list generated here.
          
    var fulllist = []; // this list prevents us from listing the same item multiple times
    var otherblock = this.getneighbors(this.xpos, this.ypos);
    for(var idx=0; idx < 4; idx++) {
      if(otherblock[idx]!=null) {
        var neighborslist = otherblock[idx].possibleoutputs();
        for(var i=0; i<neighborslist.length; i++) {
          if(fulllist.indexOf(neighborslist[i])==-1) {
            fulllist.push(neighborslist[i]);
            var blockcolor = "red";
             // Now, determine if this item type is already in our blocked list
            if(this.refuselist.indexOf(neighborslist[i])==-1) blockcolor = "green";
                    
            $("#gamepanel").append('<div id="blacklistpanel'+ neighborslist[i] +'" class="sidepanelbutton" style="background-color:'+ blockcolor +';" '+
                                   'onclick="blocklist['+ this.id +'].blacklist(\''+ neighborslist[i] +'\');">'+ neighborslist[i] +'</div><br />');
          }
        }
      }
    }
  }
   
  blacklist(itemtype) {
    // Start by determining if it is on the list.  If not, add it.  If it is, remove it.
    if(this.refuselist.indexOf(itemtype)==-1) {
      // item not found.  Add it
      //$("#gameholder").append('Blacklisting '+ itemtype);
      this.refuselist.push(itemtype);
      $("#blacklistpanel"+ itemtype).css("background-color", "red");
    }else{
      //$("#gameholder").append('Whitelisting '+ itemtype);
      var itempos = this.refuselist.indexOf(itemtype);
      if(itempos!=-1) {
        this.refuselist.splice(itempos, 1);
        $("#blacklistpanel"+ itemtype).css("background-color", "green");
      }else{
        $("#gameholder").append("Error - did not find item="+ itemtype +" in the blacklist");
      }
      $("#gameholder").append(',l='+ this.refuselist.length);
    }
  }
  
  updatepanel() {
    if(this.item=='') {
      $("#itempanel").html('none');
    }else{
      $("#itempanel").html(this.item);
    }
  }
}///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
