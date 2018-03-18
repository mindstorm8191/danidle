class hauler extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'hauler';
    this.onhand = null;     // this block will hold only 1 item at a time
    this.targets = [];      // list of all items with targets for this block
    this.waitingtofill = ''; // This is used when we are waiting for the user to click a place on the map to add a target to
    this.progress = 0;     // how much progress has been made for the current operation
    this.status = 0;         // status of this block.  0 = waiting for items to move, 1 = moving items to target, 2 = returning to start point
    this.targetx = 0;
    this.targety = 0;
    this.distancetogo = 0;  // how far this hauler has to go to deliver the current item
    this.drawgameblock('img/bucketline_right.png', 0); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    return 0;  // This block doesn't accept any items directly
  }
  
  //receiveitem(item) { }  // This function should never be called. We'll feed the default error message if it receives an item
    // activeblock function to receive an actual item (as an object) from another source.
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    return []; // Based on how this block works, it doesn't output anything directly. 
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
    
    return null;  // This block doesn't directly output items
  }
  
  getoutput(targetitem) {
    // Returns an item of the type specified, if this block has one to output.  If not, it returns null
    return null;  // This block doesn't directly output items
  }
  
  update() {
      // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    if(workpoints>=1) {
      if(this.status==0) {
        // Start by checking any of the destination blocks to see if they can accept an item we can pick up
        var fastexit = 0;
        for(var i=0; i<this.targets.length; i++) {
          for(var j=0; j<4; j++) {
            var neighbor = this.getneighbor(j);
            if(neighbor!=null) {
              if(neighbor.nextoutput() == this.targets[i].name) {
                console.log('Targets for '+ this.targets[i].name +' = '+ this.targets[i].goingto[0]);
                console.log('Block coords are ['+ this.targets[i].goingto[0].x +','+ this.targets[i].goingto[0].y +']');
                console.log('We have '+ this.targets[i].goingto.length +' to work through');
                  // At this point, we know we can pick up a given item.  Now, determine if we can drop it at one of our destinations
                for(var k=0; k < this.targets[i].goingto.length; k++) {
                  var target = blocklist.findongrid(this.targets[i].goingto[k].x, this.targets[i].goingto[k].y);
                  if(target==null) {
                      // oops, this target doesn't exist anymore.  Delete it from our list
                    this.targets[i].goingto.splice(k,1);
                    k--;
                    if(this.targets[i].goingto.length==0) {  // also delete the base record if it is empty
                      this.targets.splice(i,1);
                      i--; k=99;
                  } }else{
                    if(target.acceptsinput({name: this.targets[i].name})==1) {
                        // At this point, we know the item can be accepted by the target block.  Pick up the item now - then exit all the loops
                        // We will eventually create an A* path to the target, but we barely have a map yet, so instead we'll use manhattan distance
                      workpoints--;
                      this.onhand = neighbor.outputitem();
                      this.status = 1;
                      this.targetx = target.xpos;
                      this.targety = target.ypos;
                      this.distancetogo = Math.abs(this.xpos-target.xpos) + Math.abs(this.ypos-target.ypos);
                      k = this.targets[i].goingto.length;
                      j = 5;
                      //i = this.targets.length-1;
                      fastexit = 1;
                        // Now, render the mover image on the game map.
                      $("#game").append('<div id="haulerimage'+ this.id +'" style="top:'+ (this.ypos*66) +'px; left:'+ (this.xpos*66) +'px; z-index:5; position:absolute; pointer-events:none;">'+
                                        '<img src="img/movingitem.png" /></div>');
                  } }
                }
                if(fastexit==1) i=this.targets.length;
        } } } }
      }else if(this.status==1) {
        // We have an item and are moving it to the target.  Start by seeing if we have actually reached the target.
        this.progress++;
        workpoints--;
        if(this.progress>=this.distancetogo) {
          // Go ahead and drop this item off at the target location.
          var target = blocklist.findongrid(this.targetx, this.targety);
          if(target!=null) {
            target.receiveitem(this.onhand);
            this.onhand = null;
            this.status = 2;
            this.progress--; // Reduce the progress counter so that everything lines up correctly.
              // Also change the image to an empty-handed worker
            $("#haulerimage"+ this.id).html('<img src="img/movingempty.png" />');
          }else{
            console.log('Error - got to a target location and it wasn\'t there');
          }
        }else{
          // Determine how much progress we have made; whether we're moving x or y toward the target
          if(this.progress<=Math.abs(this.xpos-this.targetx)) {
            if(this.targetx>this.xpos) {
              $("#haulerimage"+ this.id).css('left', ((this.xpos+this.progress)*66) +'px');
            }else{
              $("#haulerimage"+ this.id).css('left', ((this.xpos-this.progress)*66) +'px');
            }
          }else{
            if(this.targety>this.ypos) {
              $("#haulerimage"+ this.id).css('top', ((this.ypos+(this.progress-Math.abs(this.xpos-this.targetx)))*66) +'px');
            }else{
              $("#haulerimage"+ this.id).css('top', ((this.ypos-(this.progress-Math.abs(this.xpos-this.targetx)))*66) +'px');
        } } }
      }else if(this.status==2) {
        // We have delivered the item and returning 'home'
        workpoints--;
        this.progress--;
        if(this.progress<=0) { // we have made it back to our 'starting' place
          this.status = 0;
          $("#haulerimage"+ this.id).remove();
        }else{
          if(this.progress<Math.abs(this.xpos-this.targetx)) {
            if(this.targetx>this.xpos) {
              $("#haulerimage"+ this.id).css('left', ((this.xpos+this.progress)*66) +'px');
            }else{
              $("#haulerimage"+ this.id).css('left', ((this.xpos-this.progress)*66) +'px');
            }
          }else{
            if(this.targety>this.ypos) {
              $("#haulerimage"+ this.id).css('top', ((this.ypos+(this.progress-Math.abs(this.xpos-this.targetx)))*66) +'px');
            }else{
              $("#haulerimage"+ this.id).css('top', ((this.ypos-(this.progress-Math.abs(this.xpos-this.targetx)))*66) +'px');
        } } }
      }else{
        console.log('Error in hauler->update: status='+ this.status +' is not valid');
      }
    }
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Item Hauler</b></center><br /><br />'+
                         'Employs a worker to carry an item from one location to another.  Select an output item from a neighbor below, then use the plus key to select a place '+
                         'to take them to.<br />'+
                         this.displaypriority() +'<br />');
    if(this.onhand==null) {
      $("#gamepanel").append('Holding: <span id="sidepanelholding">none</span><br /><br />');
    }else{
      $("#gamepanel").append('Holding: <span id="sidepanelholding">'+ this.onhand.name +'</span><br /><br />');
    }
    $("#gamepanel").append('<br /><a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />'+
                           '<b>Haulable items available:</b><br />');
      // Now search the neighbor blocks for possible items to pick up
    var alreadyseen = [];  // Holds all items already visited here, so items aren't duplicated in the list
    for(var i=0; i<4; i++) {
      var neighbor = this.getneighbor(i);
      if(neighbor!=null) {
        var itemlist = neighbor.possibleoutputs(null);
        for(var j=0; j<itemlist.length; j++) {
          if(alreadyseen.indexOf(itemlist[j])==-1) {  // This item has not been listed yet
            alreadyseen.push(itemlist[j]);
              // This item has not been listed yet.  List it now
            $("#gamepanel").append('<div id="sidepanelgroup'+ itemlist[j] +'"><b>'+ itemlist[j] +'</b> <a href="#" onclick="selectedblock.picknewtarget(\''+ itemlist[j] +'\')">(+)</a></div>');
            var k = this.targetindex(itemlist[j]);  // Now look for this item in this block's recorded list
            console.log('Searching for '+ itemlist[j] +' (position '+ k +')'); 
            if(k!=-1) {
              console.log('Targets list for '+ itemlist[j] +' length='+ this.targets[k].goingto.length);
              for(var m=0; m<this.targets[k].goingto.length; m++) {
                  // Verify this target is valid by checking that the target still exists where we are looking for it at
                console.log('Search for block at ['+ this.targets[k].goingto[m].x +','+ this.targets[k].goingto[m].y +']');
                var targetblock = blocklist.findongrid(this.targets[k].goingto[m].x, this.targets[k].goingto[m].y);
                if(targetblock==null) {  // This block doesn't exist... let's just remove it from the list
                  this.targets[k].goingto.splice(m,1);
                  m--;
                }else{
                    // Now list this block along with its coordinates and a way to remove it
                  $("#gamepanel").append('<div id="sidepaneltarget'+ itemlist[j] + targetblock.xpos + targetblock.ypos +'">'+ targetblock.name +' at ['+ targetblock.xpos +','+ targetblock.ypos +'] <a href="#" onclick="selectedblock.removetarget(\''+ this.targets[k].name +'\', '+ this.targets[k].goingto[m].x +','+ this.targets[k].goingto[m].y +')">(remove)</a></div>');
    } } } } } } }
  }
  
  targetindex(itemname) {
    // Returns the slot value of a target that matches the item name, or -1 if it doesn't exist (behaving like array.indexOf())
    for(var i=0; i<this.targets.length; i++) {
      if(this.targets[i].name==itemname) return i;
    }
    return -1;
  }
  
  picknewtarget(itemname) {
    this.waitingtofill = itemname;
    clicktrigger = 1; // this is a global variable that will call handlemaptrigger() when the user clicks on the map again.
  }
  
  handlemaptrigger(targetblock, gridx, gridy) {
    // Finishes the task of choosing a target for this item hauler block
    if(targetblock!=null) {
      console.log('Setting up move for '+ this.waitingtofill +' to ['+ gridx +','+ gridy +'] (a '+ targetblock.name +')');
      if(targetblock.acceptsinput({name: this.waitingtofill})==1) {  // Make sure this block can accept the target item we want to send it. We would pass only the item name,
                                                                     // but acceptsinput() expects the actual item to compare
          // We can now add this block to our targets list... but we should locate it in our targets first
        var position = this.targetindex(this.waitingtofill);
        if(position==-1) {
          // We don't have this item in the list yet.  Add it now, with this target block as its first entry
          this.targets.push({name:this.waitingtofill, goingto:[{x:targetblock.xpos, y:targetblock.ypos}]});
        }else{
          this.targets[position].goingto.push({x:targetblock.xpos, y:targetblock.ypos});
        }
        $("#sidepanelgroup"+ this.waitingtofill).append('<div id="sidepaneltarget'+ this.waitingtofill + gridx + gridy +'">'+ targetblock.name +' at ['+ gridx +','+ gridy +'] <a href="#" onclick="selectedblock.removetarget(\''+ this.waitingtofill +'\', '+ gridx +','+ gridy +')">(remove)</a></div>');
    } }
  }
  
  removetarget(itemname, xpos, ypos) {
    // Allows the user to remove a listed item target
    
    var i = this.targetindex(itemname);
    if(i!=-1) {
      for(var j=0; j<this.targets[i].goingto.length; j++) {
        if(this.targets[i].goingto[j].x==xpos && this.targets[i].goingto[j].y==ypos) {
          this.targets[i].goingto.splice(j,1);
          if(this.targets[i].goingto.length==0) {  // if this is the last entry for this item type, also delete the item
            this.targets.splice(i,1);
            console.log('Removing listing for ('+ itemname +','+ xpos +','+ ypos +')');
            $("#sidepaneltarget"+ itemname + xpos + ypos).remove();
          }
          return;
      } }
    }else{
      console.log('Error in hauler->removetarget: item name ('+ itemname +') not found in targets list');
    }
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array. Since the same food item was in two lists, we could not save the food list
    // for later, so we regenerate it on load.
  }  
}


