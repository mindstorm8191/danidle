// JavaScript Document

console.log("I exist!");

// Bugs
// Displayed equipment isn't updated when a new one is picked.

// Task List
// 1) Update block deletion function to return equipment before removing block 
// 1) Modify the Change Equipment function so we can detach it from the gravel maker, and use it in other blocks
// 1) Add an option to chests to allow them to output items
// 2) Set up space limits for storage units.  This will be upgradeable when new materials are available (such as wood planks)
// 2) Attempt to figure out round-robin routing for the bucketline mover workers
// 4) Set up a check within the chest code to determine when we can unlock gravel.  Once its unlocked, it should remain unlocked for good.  Unlocking
//    gravel will unlock flint filter and all related flint tools.  Stone won't be unlockable until a flint pickaxe is made
//  
// Try to keep the game 13 blocks wide by 9 blocks tall (858x594)

// Hand tools to offer (non-flint level):
// Chisel
// File
// Hammer
// Screwdriver


// We'll house all of our functions here... along with the global variables
var blocklist = [];
var blocklistlast = 0;
var cash = 3000;
var workers = 3;
var currentplacement = -1;
var mousex = 0;  // mousex & y will be updated every time the mouse moves, but won't be used until needed
var mousey = 0;
var selectedblock = null; // Which block is being shown on the far right.  This will be set when a block is first displayed

var unlocked_gravel = 0;
var unlocked_stone = 0;
var unlocked_iron = 0;

// I would make an item class, but it seems (for now) we don't need one; we can simply use strings for everything.

function startup() {
  // Lets start with some basic elements, to get the game going
  var r = new stickmaker(0,0);
  var s = new bucketline(1,0);
  var t = new market(2,0);
  var r = new storage(0,1);
  r.holds = 'woodshovel';
  r.count = 10;
  console.log(r.holds +'!');
  // Remember, use .remove() when we want to remove a game object from the html :)
  
  $(document).mousemove(function(e){
    mousex = e.pageX; mousey = e.pageY;
      // This needs to be offset for the game's page position
    $("#gridcursor").css("top", (Math.floor((e.pageY-$("#game").offset().top)/66)*66));
    $("#gridcursor").css("left", (Math.floor((e.pageX-$("#game").offset().left)/66)*66));
  });
  
  // Now, set up the timer code to trigger updates to the map
  mytimer = setInterval(function() {
    // Here we'll run through all blocks in the block list, and call its update function
      // Arrow functions!  (block)=> is the same as function(block), but doesn't modify scope
    blocklist.forEach((block)=> {
      if(block!=null) {  // This is a just-in-case thing
        block.update();
      }
    });
    if(selectedblock!=null) {
      selectedblock.updatepanel();
    }
    // Now, also update the cash value by paying all the workers, and update the displayed cash value
    cash = cash - workers;
    $("#showcash").html(cash);
  }, 1000);
}
      
function drawgameblock(id, xpos, ypos, image, hasscrollbar) {
  // Handles adding the graphical / html elements to the game block
  // id - what ID this new square will have
  // xpos/ypos - screen coordinates of the block, relative to the game block
  // image - what image to display (including extension)
  // hasscrollbar - set to 1 to display a scrollbar on top of the image
  
  if(hasscrollbar==1) {
    $("#game").append('<div id="'+ id +'" class="gameblock" style="top:'+ ypos +'px; left:'+ xpos +'px;" '+
                      'onclick="handleblockclick('+ id +')"><div style="position:relative;"><img id="'+ id +'img" src="'+ image +'" />'+
                      '<div id="'+ id +'progress" class="progressbar"></div></div></div>');
  }else{
    $("#game").append('<div id="'+ id +'" class="gameblock" style="top:'+ ypos +'px; left:'+ xpos +'px;" '+
                      'onclick="handleblockclick('+ id +')"><img id="'+ id +'img" src="'+ image +'" /></div>');
  } 
}

class activeblock { ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(gridx, gridy) {
    //this.blockid = block;
    this.name = 'fixme';
    this.xpos = gridx;
    this.ypos = gridy;
    this.input = '';
    this.output = '';
    this.id = blocklistlast;
    this.speedboost = 1.0;
    blocklist.push(this);
    blocklistlast = blocklistlast +1;
  }
  
  acceptsinput(itemtype) {
    // Backup for the acceptsinput function.  Returns 1 if the given input can be accepted, or 0 if not.  This should be called in the subclass's code
    $("#gameholder").append("New item ("+ this.name +") still needs an acceptsinput() function");
  }

  update() {
    // Backup for the update function.  This should be called in the subclass's code.  Updates the internal operations of the block
    $("#gameholder").append("New item ("+ this.name +") still needs an update() function");
  }
  
  drawpanel() {
    // Backup for the drawpanel function.
    $("#gamepanel").append("Error: new item ("+ this.name +") needs a drawpanel() function");
  }
  
  updatepanel() { }  // Backup of rthe updatepanel function. Should be called in the subclass's code. Allows the displayed data to be udpated
                     // each tick
  
  outputitem() {
    // Backup for the outputitem function.  This should be called in the subclass's code. Outputs an item, if any is available
    $("#gameholder").append("Error: New item ("+ this.name +") needs an outputitem() function");
  }
  
  nextoutput() {
    // Backup for the nextoutput function; this should be called in the subclass's code.  Returns the name of the next item that will be output
    // by the given block
    $("#gameholder").append("Error: New item ("+ this.name +") needs a nextoutput() function");
  }
  
  addequipment(item) {
    $("#gameholder").append("Error: New item ("+ this.name +") needs an addequipment() function");
  }
  
  getneighbors(x,y) {
    // Returns a list of all neighboring blocks, in cardinal directions.  Fixed length of this returned array is 4.  Currently, this is only used for
    // bucketlines, but will probably be used for other item movers too
    var outputlist = [];
    var slot = 0;
    blocklist.forEach((squared)=> {
      if(squared!=null) {
        if(squared.xpos==x && squared.ypos==y-1) outputlist[0] = squared;  // top
        if(squared.xpos==x+1 && squared.ypos==y) outputlist[1] = squared;  // right
        if(squared.xpos==x && squared.ypos==y+1) outputlist[2] = squared;  // bottom
        if(squared.xpos==x-1 && squared.ypos==y) outputlist[3] = squared;  // left
      }
    });
    return outputlist;
  }
  
  allowedequipment() {
    // Returns a string list of allowed equipment useable in this block, along with the speed ratio change of that item (this will most likely be constant)
    $("#gameholder").append("Error: New item ("+ this.name +") needs an allowedequipment() function");
    return null;
  }
  
  changeequip(chestid, slottochange) {
    // Changes the equipped tool to what is in the chest.  If the tool in the chest is already what is equipped, this will be ignored.  If chestid is -2,
    // this will (again) be ignored.
    // chestid - which chest we are grabbing the new equipment from
    // slottochange - which slot in this.equipmentslots will be updated.
    
    // We'll use the class's allowedequipment() to determine what equipment can be used for the given slot.  We'll pass this.equipmentslots[slottochange],
    // which holds the general equipment name, and that will give us an array with pairs of possible equipment, coupled with a valid speed boost multiplier
    
    if(chestid!=-2) {
      $("#gameholder").append("Changing equipment... ");
      if(blocklist[chestid]!=null) {
        if(blocklist[chestid].name=='storage') {
          if(blocklist[chestid].holds!='') {
            if(blocklist[chestid].holds!=this.equipment) {  // Make sure we're not swapping for the same equipment.
                // Since the list of acceptable tools for this particular block is actually somewhat small, lets verify what types of tools is available in this
                // chest before attempting to apply it.
              
              
              var allowed = 0;
              switch(blocklist[chestid].holds) {
                case 'woodshovel': allowed = 1; break;
                case 'flintshovel': allowed = 1; break;
                case 'coppershovel': allowed = 1; break;
              }
              if(allowed==1) {
                // Now, find a chest for the current item
                var otherchest = hasinstorage(this.equipment);
                $("#gameholder").append("Getting rid of '"+ this.equipment +"': ");
                if(otherchest!=null) {
                  $("#gameholder").append("Back to storage");
                  otherchest.count = otherchest.count +1;
                    // We're not worried about this going over capacity; they'll just have to deal with it.
                }else{
                  var otherchest = findsuitablestorage(this.equipment);
                  if(otherchest!=null) {
                    otherchest.holds = this.equipment;
                    otherchest.count = otherchest.count +1;
                    $("#gameholder").append("Back to empty storage");
                  }else{
                      // Another chest wasn't found.  Let sell this thing out-right
                    switch(this.equipment) {
                      case 'woodshovel': cash = cash +100; $("#gameholder").append("Sold for 100!"); break;
                      case 'flintshovel': cash = cash +300; $("#gameholder").append("Sold for 300!"); break;
                      case 'coppershovel': cash = cash +800; $("#gameholder").append("Sold for 800!"); break;
                    }
                  }
                }
                // Now, remove the item from the target chest.
                this.equipment = blocklist[chestid].holds;
                blocklist[chestid].count = blocklist[chestid].count -1;
                if(blocklist[chestid].count==0) {
                  blocklist[chestid].holds = '';
                }
                
                // Now, adjust the production rate based on which equipment they selected.
                switch(this.equipment) {
                  case 'woodshovel': this.speedboost = 1.0; break;
                  case 'flintshovel': this.speedboost = 1.5; break;
                  case 'coppershovel': this.speedboost = 2.0; break;
                }
                $("#gameholder").append("Now using "+ this.equipment +"!");
              }else{
                $("#gameholder").append("Fail - type "+ blocklist[chestid].holds +" not allowed");
              }
            }else{
              $("#gameholder").append("Fail - type "+ blocklist[chestid] +" already in block");
            }
          }else{
            $("#gameholder").append("Fail - that chest is empty");
          }
        }else{
          $("#gameholder").append("Fail - block "+ chestid +" is not a storage unit");
        }
      }else{
        $("#gameholder").append("Fail - block "+ chestid +" was not fount");
      }
    }
  }
}///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  

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

class market extends activeblock { /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'market';
    drawgameblock(this.id, this.xpos*66, this.ypos*66, "market.png", 0);
  }
  
  allowedequipment() {
    // Returns a list of all equipment allowed in this machine, along with the speed boost for when it's applied
    // Markets won't use any equipment
    return null;
  }
  
  acceptsinput(itemtype) {
    // Accepts anything, so long as there isn't something already here
    if(this.input=='') return 1; else return 0;
  }
  
  outputitem() {
    // Does not output any items
    return '';
  }
  
  possibleoutputs() {
    return [];
  }
  
  nextoutput() {
    // Will not output any items
    return '';
  }
  
  update() {
    if(this.input!='') {
      switch(this.input) {
        case "stick":          cash = cash +30;   break;
        case "woodshovel":     cash = cash +100;  break;
        case "gravel":         cash = cash +80;   break;
        case "filteredgravel": cash = cash +30;   break;
        case "flint":          cash = cash +125;  break;
        case "flintshovel":    cash = cash +400;  break;
        case "flintpickaxe":   cash = cash +600;  break;
        case "flintaxe":       cash = cash +500;  break;
        case "stone":          cash = cash +130;  break;
        case "stoneblock":     cash = cash +300;  break;
        case "stonefurnace":   cash = cash +2000; break;
        default: $("#gameholder").append("Market received "+ this.input +", has no price");
      }
      this.input = '';
    }
  }
  
  drawpanel() {
    $("#gamepanel").html('<center><b>Market</b><center><br />'+
                         'Sells items.  All items can be sold, and are sold at a fixed price<br /><br />');
  }
  updatepanel() { }  // This is intentionally empty
}///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




function blockaffordable(blockid) {
  // Returns a list of items to consume if the user has sufficient resources to build a given structure, or null if no resources are needed.
  // This list does not include worker requirements
  
  switch(blockid) {
    case "storage": case "bucketline": case "market": case "stickmaker": case "woodshovel": case "flintshovel": case "flintaxe": case "flintpickaxe": 
      // these items don't require anything to set up; chests (#0) can be upgraded after placement
      return '';
    break;
    case "gravelmaker": case "flintfilter":
      if(hasinstorage('flintshovel')!=null) return 'flintshovel';
      if(hasinstorage('woodshovel')!=null) return 'woodshovel';
    break;
    case 10: case 11: // stone producer & stone block producer
      if(hasinstorage('flintpickaxe')!=null) return 'flintpickaxe';
    break;
    default:
      $("#gameholder").append("Error: blockaffordable() does not recognize "+ this.name);
    break;
  }
}

function hasinstorage(itemtype) {
  // Returns a handle to a storage unit containing a desired item, if any is found on the map, or null if not 
  var hit = null;
  blocklist.forEach((block)=> {
    if(hit==null) {
      if(block!=null) {
        if(block.name=='storage') {  // this is a storage unit
          if(block.holds==itemtype) {
            if(block.count>0) {
              hit = block;
              return block;
    } } } } }
  });
  return hit;
}

function findsuitablestorage(itemtype) {
  // Returns a handle to a storage unit where a desired item can go, like when the normal storage unit is empty and there aren't any other units to use.
  // This should be called only after hasinstorage() has returned null.  Primarily used for returning equipment when swapped out.
  var hit = null;
  blocklist.forEach((block)=> {
    if(hit==null) {
      if(block!=null) {
        if(block.name=='storage') {
          if(block.count<=0) {
            if(block.lastheld==itemtype) {
              hit = block;
              return block;
  } } } } } });
  return hit;
}

function workercost(blockname) {
  // Returns the cost of a worker, based on the blockid type
  switch(blockname) {
    case 'storage': return 0; break;
    case 'bucketline': case 'market': case 'stickmaker': case 'woodshovel': case 'gravelmaker': case 'flintfilter': case 'flintaxe': case 'flintshovel':
    case 'flintpickaxe':
    return 1; break;
    default: $("#gameholder").append("Error: workercost doesnt recognize "+ blockname);
  }
}

function findongrid(xpos, ypos) {
  var hit = null;
  blocklist.forEach((block)=> {
    if(block!=null) {
      if(block.xpos == xpos) {
        if(block.ypos == ypos) {
          hit = block; return hit;
  } } } });
  return hit;
}

function setcursor(newsetting) {
  $("#cursor"+ currentplacement).css("background-color", "white");
  $("#cursor"+ newsetting).css("background-color", "red");
  $("#selectedblock").html(newsetting);
  currentplacement = newsetting;
}

function handlegameclick() {
  // Here we'll handle all the interaction with the map
  // Start by determining if the place they clicked is valid
  var gridy = Math.floor((mousey-$("#game").offset().top)/66);
  var gridx = Math.floor((mousex-$("#game").offset().left)/66);
//  $("#gameholder").append("["+ gridx +","+ gridy +"]");
  
  var block = findongrid(gridx, gridy);
  if(currentplacement==-2) {
    // User is using the cursor.  Lets center the view screen around the given location.  We'll also show data on the right, once that's enabled
    $("#game").css("left", (((13-1)*66)/2) - (gridx*66));
    $("#game").css("top",  (((9-1)*66)/2) - (gridy*66));
    if(block!=null) {
      selectedblock = block;
      block.drawpanel();
    }
  }else{
    if(block==null) {
      if(currentplacement!=-1) {
        // There is no block here.  Lets add one now (assuming we have enough idle workers)
        var idleworkers = busyworkers();
        
        if(idleworkers-workercost(currentplacement)>=0) {
          // Now make sure the user has (in a chest somewhere) the required materials to create this
          var cost = blockaffordable(currentplacement);
          if(cost!='') {
            var chest = hasinstorage(cost);
            if(chest!=null) cost='';
          }
          if(cost=='') {
            switch(currentplacement) {
              case "storage":      var makeblock = new      storage(gridx, gridy); break;
              case "bucketline":   var makeblock = new   bucketline(gridx, gridy); break;
              case "market":       var makeblock = new       market(gridx, gridy); break;
              case "stickmaker":   var makeblock = new   stickmaker(gridx, gridy); break;
              case "woodshovel":   var makeblock = new   woodshovel(gridx, gridy); break;
              case "gravelmaker":  var makeblock = new  gravelmaker(gridx, gridy); break;
              case "flintfilter":  var makeblcok = new  flintfilter(gridx, gridy); break;
              case "flintshovel":  var makeblock = new  flintshovel(gridx, gridy); break;
              case "flintaxe":     var makeblcok = new     flintaxe(gridx, gridy); break;
              case "flintpickaxe": var makeblock = new flintpickaxe(gridx, gridy); break;
              default: $("#gameholder").append('in handlegameclick(): newblock type '+ currentplacement +' not handled'); break;
            }
            selectedblock = makeblock;
            if(makeblock!=null) {
              makeblock.drawpanel();
            }
            idleworkers = busyworkers();
          }else{
            $("#gameholder").append("You need to have a "+ cost +" in storage before building this");
          }
        }else{
          $("#gameholer").append("You need more workers");
        }
      }else{
        $("#gameholder").append("Cant delete nothing");
      }
    }else{
      // See if the user is trying to remove blocks
      if(currentplacement==-1) {
        var position = blocklist.indexOf(block);
        if(position!=-1) {
          //blocklist.splice(position, 1);
          //workers = workers + workercost(block.blockid);
          blocklist[position] = null;
          $("#"+ block.id).remove();
          block = null;
          $("#gameholder").append("Block removed");
          busyworkers();
        }
      }else{
        // Not trying to remove a block.  We should probably interact with this block in some way
        $("#gameholder").append("Interact with type "+ block.blockid);
      }
    }
  }
}

function handleblockclick(id) {
  // Handles the user clicking on a given block.  Generally, we'll show data about the block on the right.  If they click on something with the
  // delete tool selected, we'll just delete the block unit.
  if(currentplacement==-1) {
    var block = getblockfromid(id);
    if(block!=null) {
      var position = blocklist.indesOf(block);
      if(position==-1) {
        $("#gameholder").append("Error - block "+ block.id +" not in list");
      }else{
        blocklist.splice(position, 1);
        $("#"+ block.id).remove();
        workers = workers + workercost(block.blockid);
        block = null;
        $("#gameholder").append("Block removed");
        busyworkers();
      }
    }
  }else{
    $("#gameholder").append("Interact with block");
  }
}

function getblockfromid(id) {
  // Returns the actual class instance of a block, when given its ID, if it exists
  blocklist.forEach((block)=> {
    if(block!=null) {
      if(block.id==id) return block;
    }
  });
  return null;
}

function hireworker() {
  // Manages adding workers to the game
  // First determine if the user actually has the funds to add another worker
  var costofworker = 70 +(workers*10);
  if(cash>=costofworker) {
    cash = cash - costofworker;
    workers = workers +1;
    // Now, update the game screen to reflect this new worker
    busyworkers();
    $("#totalworkers").html(workers);
    $("#addworker").attr("value", "hire for "+ (70+(workers*10)));
  }
}

function fireworker() {
  // Manages removing workers from the game. Workers can only be removed it they are not on a task
  
  // First determine if there are any unused workers
  if(busyworkers()>0) {
    // We were going to have a cost to fire workers, but we'll just do without that.  Hiring, however, will still have an up-front cost
    workers = workers -1;
    // Now call busyworkers() again to update the idle count
    busyworkers();
    $("#totalworkers").html(workers);
  }
}

function busyworkers() {
  // Generates a count of all the workers being in use.
  var count = 0;
  blocklist.forEach((block)=> {
    if(block!=null) {
      switch(block.name) {
        case 'storage': break; // storage spaces do not require a worker to manage
        case 'bucketline': case 'market': case 'stickmaker': case 'woodshovel': case 'gravelmaker': case 'flintfilter': case 'flintaxe':
        case 'flintshovel': case 'flintpickaxe': count = count + 1; break;  // these blocks need 1 worker each
        default: $("#gameholder").append("Error in busyworkers: block type "+ block.name +" not handled"); break;
      }
    }
  });
  // Now, apply the results to the rest of the game.  Our workers count should be constant per number of workers we have, but the idleworkers
  // will vary based on this function
  $("#showworkers").html( (workers-count));
  return count;
}





      