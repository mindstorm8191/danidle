
class stonemaker extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'stonemaker';
    this.onhand = 0;
    this.counter = 0;
    
    // Now, locate a chest that contains a pickaxe that we can use
    var chest = hasinstorage('flintpickaxe');
    if(chest==null) {
      $("#gameholder").append("Error - could not find any flint pickaxes");
    }else{
      this.equipment = chest.takeitem();
      drawgameblock(this.id, this.xpos*66, this.ypos*66, "stone.png", 1);
    }
  }
  
  acceptsinput(itemtype) {
    // This device does not accept any input
    return 0;
  }
  
  outputitem() {
    // Returns a stone piece, if we have one finished.
    if(this.onhand>0) {
      this.onhand = this.onhand -1;
      return 'stone';
    }
    return '';
  }
  
  possibleoutputs() {
    return ['stone'];
  }
  
  nextoutput() {
    if(this.onhand>0) return 'stone';
    return '';
  }
  
  update() {
    if(this.onhand<5) {
      this.counter = this.counter +1;
      if(this.counter==30) {
        this.counter = 0;
        this.onhand = this.onhand +1;
      }
    }
    if(this.onhand>0) this.output = "stone";
    $("#"+ this.id +"progress").css("width", ((this.counter/30.0)*60));
  }
}
