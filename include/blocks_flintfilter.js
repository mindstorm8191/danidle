class flintfilter extends activeblock { ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = "flintfilter";
    this.counter = 0;
    this.onhand = 0;  // strictly for output
    this.gravel = 0;
    this.filteredgravel = 0;
    drawgameblock(this.id, this.xpos*66, this.ypos*66, "filter_flint.png", 1);
  }
  
  allowedequipment() {
    return [ ['woodshovel', 1.0],
             ['flintshovel', 1.5],
             ['coppershovel', 2.0] ];
  }
  
  acceptsinput(itemtype) {
    if(itemtype=='gravel' && this.gravel<15) return 1;
    return 0;
  }
  
  outputitem() {
    if(this.onhand>0) {
      this.onhand = this.onhand-1;
      return 'flint';
    }
    if(this.filteredgravel>0) {
      this.filteredgravel = this.filteredgravel-1;
      return 'filteredgravel';
    }
    return '';
  }
  
  possibleoutputs() {
    return ['flint','filteredgravel'];
  }
  
  nextoutput() {
    if(this.onhand>0) return 'flint';
    if(this.filteredgravel>0) return 'filteredgravel';
    return '';
  }
  
  update() {
    if(this.input!='') {
      if(this.input=='gravel' && this.gravel<20) this.gravel = this.gravel+1;
      this.input = '';
    }
    if(this.gravel>=5 && this.onhand<5 && this.filteredgravel<20) {
      this.counter = this.counter+1;
      if(this.counter>=20) {
        this.counter = 0;
        this.gravel = this.gravel-3;
        this.onhand = this.onhand +1;
        this.filteredgravel = this.filteredgravel+4;
      }
    }
    $("#"+ this.id +"progress").css("width", 60.0*(this.counter/20.0));
  }
  
  drawpanel() {
    $("#gamepanel").html('<center><b>Flint Filter</b></center>'+
                         'Filters flint out of gravel.  Produces 1 flint and 4 filtered gravel for every 5 gravel.<br /><br />'+
                         'Gravel on hand: <span id="panelgravelcount">'+ this.gravel +'</span><br />'+
                         'Progress: <span id="panelprogress">'+ Math.floor((this.counter/20.0)*100) +'</span>%<br />'+
                         'Flint stocked: <span id="panelflint">'+ this.onhand +'</span><br />'+
                         'Filtered gravel stocked: <span id="panelfiltered">'+ this.filteredgravel +'</span>');
  }
  
  updatepanel() {
    $("#panelgravelcount").html(this.gravel);
    $("#panelprogress").html(Math.floor((this.counter/20.0)*100));
    $("#panelflint").html(this.onhand);
    $("#panelfiltered").html(this.filteredgravel);
  }
}///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
