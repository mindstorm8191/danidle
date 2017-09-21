class stickmaker extends activeblock { /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'stickmaker';
    this.onhand = 0;
    this.counter = 0;
    drawgameblock(this.id, this.xpos*66, this.ypos*66, "stick.png", 1);
  }
  
  acceptsinput(itemtype) {
    // Does not accept anything
    return 0;
  }
  
  outputitem() {
    if(this.onhand>0) {
      this.onhand = this.onhand-1;
      return 'stick';
    }
    return '';
  }
  
  possibleoutputs() {
    return ['stick'];
  }
  
  nextoutput() {
    if(this.onhand>0) return 'stick';
    return '';
  }
  
  update() {
    if(this.onhand<5) {
      this.counter = this.counter +1;
      if(this.counter>=6) {
        this.counter = 0;
        this.onhand = this.onhand + 1;
      }
    }
    if(this.onhand>0) this.output = "stick";
        
    // Now, update the progress bar on the block.
    $("#"+ this.id +"progress").css({"width":(this.counter*10)});
  }
  
  drawpanel() {
    $("#gamepanel").html('<center><b>Stick Maker</b></center><br />'+
                         'Uses a worker to produce sticks from nearby trees.  The worker can be equipped with tools to produce sticks faster<br /><br />'+
                         'Progress: <span id="panelprogress">'+ Math.floor((this.counter/6.0)*100) +'</span>%<br />'+
                         'Sticks stored: <span id="panelstock">'+ this.onhand +'</span><br /><br />'+
                         'Upgrade options are not yet available');
  }
  
  updatepanel() {
    $("#panelprogress").html( Math.floor((this.counter/6.0)*100));
    $("#panelstock").html(this.onhand);
  }
}///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////