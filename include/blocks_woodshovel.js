class woodshovel extends activeblock { /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Produces wood shovels.  Once stored, will unlock gravel collection & flint tools
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'woodshovel';
    this.counter = 0;
    this.onhand = 0;  // this is strictly for output
    this.sticks = 0;
    drawgameblock(this.id, this.xpos*66, this.ypos*66, "shovel_wood.png", 1);
  }
  
  allowedequipment() {
    // Returns a list of items this block can accept, along with the speed boost it provides.
    // We may or may not allow equipment for this block in the future.
    return null;
  }
  
  acceptsinput(itemtype) {
    if(itemtype=='stick' && this.sticks < 9) return 1;
    return 0;
  }
  
  outputitem() {
    if(this.onhand>0) {
      this.onhand = this.onhand-1;
      return 'woodshovel';
    }
    return '';
  }
  
  possibleoutputs() {
    return ['woodshovel'];
  }
  
  nextoutput() {
    if(this.onhand>0) return 'woodshovel';
    return '';
  }
  
  update() {
    if(this.input!='') {
      // Make sure we were given sticks (which, there's nothing else we can accept... but still)
      if(this.input=='stick' && this.sticks<9) this.sticks = this.sticks +1;
      this.input = '';
    }
    if(this.sticks>=3) {
      if(this.onhand<5) {
        this.counter = this.counter+1;
        if(this.counter>=10) {
          this.counter = 0;
          this.sticks = this.sticks -3;
          this.onhand = this.onhand +1;
        }
      }
    }
    if(this.onhand>0) {
      this.output = "wood shovel";
    }
        
    // Now update the progress bars on the block
    var progress = this.counter/10.0;
    $("#"+ this.id +"progress").css("width", 60*progress);
  }
  
  drawpanel() {
    $("#gamepanel").html('<center><b>Wood Shovel Maker</b></center><br />'+
                         'Turns 3 sticks into 1 wood shovel.<br /><br />'+
                         'Sticks on hand: <span id="stickscount">'+ this.sticks +'</span><br />'+
                         'Progress: <span id="progresscount">'+ Math.floor((this.counter/10.0)*100) +'</span>%<br />'+
                         'Shovels stored: <span id="stockcount">'+ this.onhand +'</span>');
  }
  
  updatepanel() {
    $("#stickscount").html(this.sticks);
    $("#progresscount").html( Math.floor((this.counter/10.0)*100));
    $("#stockcount").html(this.onhand);
  }
}///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
