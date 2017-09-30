class storage extends activeblock { ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'storage';
    this.holds = '';
    this.lastheld = '';  // This is set whenever items are added, and kept when the chest is empty.  Should give us a place to put items back, when
                         // equipment is swapped out.
    this.count = 0;
    this.size = 10; // default storage size
    drawgameblock(this.id, this.xpos*66, this.ypos*66, "storage.png", 0);
  }
  
  acceptsinput(itemtype) {
    if(this.holds=='') return 1;
    if(this.holds==itemtype && this.count < this.size) return 1;
    return 0;
  }
  
  allowedequipment() {
    // Returns a list of all suitable items that can be used as equipment for this unit.  speed boost affects storage capacity instead.
    // Currently we don't have any buildable equipment for chests.  This will change later
    return null;
  }
  
  outputitem() {
    // Chests don't automatically output items (we will change this later)
    return '';
  }
  
  possibleoutputs() {
    return [];
    //return [this.holds];
  }
  
  nextoutput() {
    return '';
  }
  
  takeitem() {
    // Chest-specific function that lets other things pull items from storage, even if output is disabled.  Mostly used for new blocks that require equipment
    if(this.holds=='') return '';
    var output = this.holds;
    this.count = this.count -1;
    if(this.count==0) this.holds = '';
    return output;
  }
  
  drawpanel() {
    $("#gamepanel").html('<center><b>Storage</b></center><br />'+
                         'Stores items for later use. Only holds 1 type.  Capacity can be increased by equiping storage units.<br /><br />'+
                         'Capacity: 10 items<br />');          
    if(this.holds=='') {
      $("#gamepanel").append('Holding: <span id="storagecontent">empty</span><br /><br />');
    }else{
      $("#gamepanel").append('Holding: <span id="storagecontent">'+ this.holds +' x'+ this.count +'</span><br /><br />');
    }
    $("#gamepanel").append('Equipment options not yet available');
  }
  
  updatepanel() {
    //$("#gamepanel").append("! ");
    if(this.holds=='') {
      $("#storagecontent").html('empty');
    }else{
      $("#storagecontent").html(this.holds +' x'+ this.count);
    }
  }
  
  update() {
    if(this.holds=='') {
      // Nothing in chest currently.  Will accept any item
      if(this.input != '') {
        this.holds = this.input;
        this.lastheld = this.input;
        this.input = '';
        this.count = 1;
        this.output = this.holds;
      }
    }else{
      if(this.output == '') {
        // Something has taken an item from this chest.
        this.count = this.count-1;
        if(this.count==0) {
          this.holds = '';
        }else{
          this.output = this.holds;
        }
      }
      if(this.input != '') {
        if(this.holds==this.input && this.count<this.size) {
          this.count = this.count+1;
          this.input = '';
        }else{
          $("#gameholder").append("Error - chest full, but accepted input");
          this.input = '';
        }
      }
    }
              
    // Now, lets determine if the user has items granting them new access levels
    if(unlocked_gravel==0 && this.holds=='woodshovel') {
      $("#gameholder").append('Gravel unlocked!!!');
      unlocked_gravel = 1;
      $("#blockselector").append('<div id="cursorgravelmaker"  class="blockchoice" onclick="setcursor(\'gravelmaker\');"><img src="gravel.png" /></div>'+
                                 '<div id="cursorflintfilter"  class="blockchoice" onclick="setcursor(\'flintfilter\');"><img src="filter_flint.png" /></div>'+
                                 '<div id="cursorflintshovel"  class="blockchoice" onclick="setcursor(\'flintshovel\');"><img src="shovel_flint.png" /></div>'+
                                 '<div id="cursorflintaxe"     class="blockchoice" onclick="setcursor(\'flintaxe\');"><img src="axe_flint.png" /></div>'+
                                 '<div id="cursorflintpickaxe" class="blockchoice" onclick="setcursor(\'flintpickaxe\');"><img src="pickaxe_flint.png" /></div>');
    }
    if(unlocked_dirt==0 && this.holds=='flintshovel') {
      unlocked_dirt = 1;
      $("#blockselector").append('<div id="cursordirtmaker" class="blockchoice" onclick="setcursor(\'dirtmaker\');"><img src="dirt.png" /></div>');
    }
    if(unlocked_stone==0 && this.holds=='flintpickaxe') {
      unlocked_stone = 1;
      $("#blockselector").append('<div id="cursorstonemaker" class="blockchoice" onclick="setcursor(\'stonemaker\');"><img src="stone.png" /></div>'+
                                 '<div id="cursorstoneblock" class="blockchoice" onclick="setcursor(\'stoneblock\');"><img src="stoneblock.png" /></div>'+
                                 '<div id="cursorstonefurnace" class="blockchoice" onclick="setcursor(\'stonefurnace\');"><img src="furnace_stone.png" /></div>');
    }
    if(unlocked_log==0 && this.holds=='flintaxe') {
      unlocked_log = 1;
      $("#blockselector").append('<div id="cursorlog" class="blockchoice" onclick="setcursor(\'logmaker\');"><img src="log.png" /></div>'+
                                 '<div id="cursorfirewood" class="blockchoice" onclick="setcursor(\'firewood\');"><img src="firewood.png" /></div>');
    }
  }
}///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
