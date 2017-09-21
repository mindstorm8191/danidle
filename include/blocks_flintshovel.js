class flintshovel extends activeblock { ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = "flintshovel";
    this.counter = 0;
    this.sticks = 0;
    this.flint = 0;
    this.onhand = 0;
    drawgameblock(this.id, this.xpos*66, this.ypos*66, "shovel_flint.png", 1);
  }
  
  allowedequipment() {
    // Returns a list of all items that can be used as equipment for this block.
    // Currently crafting of items don't have any extra equipment
    return null;
  }
  
  acceptsinput(itemtype) {
    if(itemtype=='stick' && this.sticks<10) return 1;
    if(itemtype=='flint' && this.flint<10) return 1;
    return 0;
  }
  
  possibleoutputs() {
    return ['flintshovel'];
  }
  
  nextoutput() {
    if(this.onhand>0) return 'flintshovel';
    return '';
  }
  
  outputitem() {
    if(this.onhand>0) {
      this.onhand = this.onhand-1;
      return 'flintshovel';
    }
    return '';
  }
  
  update() {
    if(this.input!='') {
      if(this.input=='stick' && this.sticks<10) this.sticks = this.sticks+1;
      if(this.input=='flint' && this.flint<10)  this.flint  = this.flint+1;
      this.input = '';
    }
    if(this.sticks>=2 && this.flint>=3 && this.onhand<5) {
      this.counter = this.counter +1;
      if(this.counter>=15) {
        this.counter = 0;
        this.onhand = this.onhand +1;
        this.sticks = this.sticks-2;
        this.flint = this.flint-3;
      }
    }
    $("#"+ this.id +"progress").css("width", 60.0*(this.counter/15.0));
  }
  
  drawpanel() {
    $("#gamepanel").html('<center><b>Flint Shovel Maker</b></center><br />'+
                         'Produces flint shovels from 2 sticks and 3 flint.<br /><br />'+
                         'Sticks stored: <span id="panelsticks">'+ this.sticks +'</span><br />'+
                         'Flint stored: <span id="panelflint">'+ this.flint +'</span><br />'+
                         'Progress: <span id="panelprogress">'+ Math.floor((this.counter/15.0)*100.0) +'</span>%<br />'+
                         'Finished shovels: <span id="panelstock">'+ this.onhand +'</span>');
  }
  
  updatepanel() {
    $("#panelsticks").html(this.sticks);
    $("#panelflint").html(this.flint);
    $("#panelprogress").html(Math.floor((this.counter/15.0)*100.0));
    $("#panelstock").html(this.onhand);
  }
}///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
