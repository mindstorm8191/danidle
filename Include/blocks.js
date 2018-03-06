class activeblock {
  constructor(gridx, gridy) {
    this.name = 'fixme';
    this.xpos = gridx;
    this.ypos = gridy;
    this.priority = blocklist.lastpriority() +1;  // priority affects which block gets work before others, when there is more work than workers available
    this.id = lastblockid; lastblockid++;
    blocklist.push(this);
  }
  
  acceptsinput(item) {
    // Another backup function
    console.log('New block ('+ this.name +') still needs an acceptsinput() function');
    return 0;
  }

  receiveitem(item) {
    // Another backup function
    console.log('New block ('+ this.name +') still needs a receiveitem() function');
  }

  possibleoutputs(askedlist) {
    // another backup function.  This returns a list of strings that contains all the possible outputs of any neighboring blocks.
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    console.log('New block ('+ this.name +') still needs a possibleoutputs() function');
  }

  nextoutput() {
    // Another backup function. Returns the next item that will be output
    console.log('New block ('+ this.name +') still needs a nextoutput() function');
  }

  outputitem() {
    // Another backup function. Should return an output item, if/when possible
    console.log('New block ('+ this.name +') still needs an outputitem() function');
    return null;
  }
  
  getoutput(targetitem) {
    // Another backup function. Should return an item searched for, or null if the block does not output it.
    console.log('New block ('+ this.name+') still needs a getoutput() function');
  }
  
  update() {
    // Backup for the update function.  Each activeblock type should have its own update function and fully override this one.
    console.log('New block ('+ this.name +') still needs an update() function');
  }
  
  drawpanel() {
    // Another backup function
    console.log('New block ('+ this.name +') still needs a drawpanel() function');
  }
  
  updatepanel() {
    // Another backup function
    console.log('New block ('+ this.name +') still needs an updatepanel() function');
  }
  
  reload() {
    // Another backup function
    console.log('New block ('+ this.name +') still needs a reload() function');
  }
  
  selectblock() {
    // Handles the user clicking on this block (this isn't a backup function)
    this.drawpanel();
    selectedblock = this;
  }
  
  deleteblock() {
    // Removes this block from the game.  For blocks with additional special data structures, this should be overwritten; they can then call super() for this if needed
    $("#"+ this.id).remove();
    $("#gamepanel").html('');  // Blank out the side panel so the user can't keep messing with it
    blocklist.splice(blocklist.indexOf(this), 1);
    selectedblock = null;
  }
  
  drawgameblock(image, hasscrollbar) {
    // Handles adding the graphical / html elements to the game block.  This should only be called once, and only during block creation
    // image - what image to display (including extension)
    // hasscrollbar - set to 1 to display a scrollbar on top of the image

    if(hasscrollbar==1) {
      $("#game").append('<div id="'+ this.id +'" class="gameblock" style="top:'+ (this.ypos *66) +'px; left:'+ (this.xpos *66) +'px;" '+
                        'onclick="blocklist.findbyid('+ this.id +').selectblock()"><div style="position:relative;"><img id="'+ this.id +'img" src="'+ image +'" />'+
                        '<div id="'+ this.id +'progress" class="progressbar"></div></div></div>');
    }else{
      $("#game").append('<div id="'+ this.id +'" class="gameblock" style="top:'+ (this.ypos *66) +'px; left:'+ (this.xpos *66) +'px;" '+
                        'onclick="blocklist.findbyid('+ this.id +').selectblock()"><img id="'+ this.id +'img" src="'+ image +'" /></div>');
    }
  }
  
  choosetoolcolor(targetslot, toolname) {
    // Generic function to determine what color the span block should be for a given tool
    // targetslot - which tool is currently loaded in the target slot
    // toolname - which tool this div block is for
    
    if(toolname=='none' || toolname=='') {
      if(targetslot=='') {
        return 'green';  // active in use... always available
      }else{
        return 'grey';  // not active, but always available
      }
    }else{
      if(blocklist.findinstorage(toolname, 0)==1) {
        if(targetslot==toolname) {
          return 'green';  // active in use, with more available
        }else{
          return 'grey';  // not active, but available
        }
      }else{
        if(targetslot==toolname) {
          return 'orange'; // active in use, but no more are available
        }else{
          return 'red'; // not in use; none are available
    } } }
  }
  
  choosetoolpopup(targetslot, toolname) {
    if(toolname=='none' || toolname=='') {
      if(targetslot=='') {
        return 'Active';  // active in use... always available
      }else{
        return 'Not Active';  // not active, but always available
      }
    }else{
      if(blocklist.findinstorage(toolname, 0)==1) {
        if(targetslot==toolname) {
          return 'Active - More Available';  // active in use, with more available
        }else{
          return 'Not Active - More Available';  // not active, but available
        }
      }else{
        if(targetslot==toolname) {
          return 'Active - Last One!'; // active in use, but no more are available
        }else{
          return 'None Available'; // not in use; none are available
    } } }
  }
  
  getneighbor(location) {
    // Returns an activeblock that is a neighbor of this activeblock, or null if nothing is there
    //   location - which side to look on. 0 = top, 1 = right, 2 = bottom, 3 = left.  To use this function, call it once for each side and check for null
    
    switch(location) {
      case 0: return blocklist.findongrid(this.xpos, this.ypos-1); break;
      case 1: return blocklist.findongrid(this.xpos+1, this.ypos); break;
      case 2: return blocklist.findongrid(this.xpos, this.ypos+1); break;
      case 3: return blocklist.findongrid(this.xpos-1, this.ypos); break;
    }
  }
  
  setpriority(direction) {
    // Allows the user to set the priority of this block.  All blocks will require a sidepanelpriority to be drawn when the panel is shown, so that the displayed value can be updated
    // direction - set to 1 to increase the priority value, or -1 to decrease its value
    // The block list will be sorted directly after this is called.
    
    this.priority = Math.max(0, this.priority+direction);
    $("#sidepanelpriority").html(this.priority);
    blocklist.sort(blocklist.compare);
  }
  
  displaytoollist(targettool, toolslist) {
    // Handles showing all tool options for a given tool role
    // targettool: which tool slot will get filled by this
    // toolslist: array of tool names to include.  The option 'none' will automatically be included
    
    $("#gamepanel").append('<span id="sidepaneltool" class="sidepanelbutton" style="background-color: '+ this.choosetoolcolor(targettool, '') +'" title="'+ this.choosetoolpopup(targettool, '') +'" onclick="selectedblock.picktool(\'\');">None</span>');
    for(var i=0; i<toolslist.length; i++) {
      $("#gamepanel").append('<span id="sidepaneltool'+ toolslist[i] +'" class="sidepanelbutton" style="background-color: '+ this.choosetoolcolor(targettool, toolslist[i]) +'" title="'+ this.choosetoolpopup(targettool, toolslist[i]) +'" onclick="selectedblock.picktool(\''+ toolslist[i] +'\');">'+ toolslist[i] +'</span>');
    }
  }
  
  updatetoollist(targettool, toolslist) {
    $("#sidepaneltool").css('background-color', this.choosetoolcolor(targettool, ''));
    $("#sidepaneltool").attr('title', this.choosetoolpopup(targettool, ''));
    for(var i=0; i<toolslist.length; i++) {
      $("#sidepaneltool"+ toolslist[i]).css('background-color', this.choosetoolcolor(targettool, toolslist[i]));
      $("#sidepaneltool"+ toolslist[i]).attr('title', this.choosetoolpopup(targettool, toolslist[i]));
    }
  }
  
  displaypriority() {
    // Handles displaying the priority levels of blocks.  The actual displayed priority will change based on the total number of priority levels. If there are more than 10,
    // a double-arrow will show. If there are more than 100, a triple-arrow will be displayed
    
    var output = 'Priority: ';
    var top = blocklist.lastpriority();
    if(this.priority>111) output += '<img src="img/arrowleft3.png" onclick="selectedblock.setpriority(-100)"> ';
    if(this.priority> 11) output += '<img src="img/arrowleft2.png" onclick="selectedblock.setpriority(-10)"> ';
    output += '<img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
              '<span id="sidepanelpriority">'+ this.priority +'</span> '+
              '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)">';
    if(top>11 & this.priority<top-10) output += '<img src="img/arrowright2.png" onclick="selectedblock.setpriority(10)"> ';
    if(top>111 & this.priority<top-100) output += '<img src="img/arrowright3.png" onclick="selectedblock.setpriority(100)"> ';
    return output;
  }
}



