class flintaxe extends activeblock { ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'flintaxe';
    this.counter = 0;
    this.sticks = 0;
    this.flint = 0;
    this.onhand = 0;
    drawgameblock(this.id, this.xpos*66, this.ypos*66, "axe_flint.png", 1);
  }
  
  acceptsinput(itemtype) {
    if(itemtype=='stick' && this.sticks<10) return 1;
    if(itemtype=='flint' && this.flint<20) return 1;
    return 0;
  }

  possibleoutputs() {
    return ['flintaxe'];
  }
  
  nextoutput() {
    if(this.onhand>0) return 'flintaxe';
    return '';
  }
  
  outputitem() {
    if(this.onhand>0) {
      this.onhand = this.onhand-1;
      return 'flintaxe';
    }
    return '';
  }
  
  update() {
    if(this.input!='') {
      if(this.input=='stick' && this.sticks<12) this.sticks = this.sticks+1;
      if(this.input=='flint' && this.flint<20)  this.flint  = this.flint+1;
      this.input = '';
    }
    if(this.sticks>=3 && this.flint>=4 && this.onhand<5) {
      this.counter = this.counter +1;
      if(this.counter==15) {
        this.counter = 0;
        this.onhand = this.onhand +1;
        this.sticks = this.sticks-3;
        this.flint = this.flint-4;
      }
    }
    $("#"+ this.id +"progress").css("width", 60.0*(this.counter/15.0));
  }
  
  drawpanel() {
    $("#gamepanel").html('<center><b>Flint Pickaxe Maker</b></center><br />'+
                         'Produces 1 flint pickaxe from 3 sticks and 4 flint.<br /><br />'+
                         'Sticks stored: <span id="panelsticks">'+ this.sticks +'</span><br />'+
                         'Flint stored: <span id="panelflint">'+ this.flint +'</span><br />'+
                         'Progress: <span id="panelprogress">'+ Math.floor((this.counter/15.0)*100.0) +'</span><br />'+
                         'Finished axes: <span id="panelstock">'+ this.onhand +'</span>');
  }
  
  updatepanel() {
    $("#panelsticks").html(this.sticks);
    $("#panelflint").html(this.flint);
    $("#panelprogress").html(Math.floor((this.counter/15.0)*100.0));
    $("#panelstock").html(this.onhand);
  }
}///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
