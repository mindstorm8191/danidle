class stickmaker extends activeblock {
  constructor(gridx,gridy) {
    super(gridx, gridy);
    this.name = 'stickmaker';
    this.onhand = [];
    this.counter = 0; // this is used to determine when the next
    
    this.drawgameblock('img/stickmaker.png', 1); 
  }
  
  acceptsinput(item) {
    // Accepts input... only, the stickmaker doesn't accept anything
    return 0;
  }

  // receiveitem() isn't declared here, since it shouldn't be called anyway

  possibleoutputs(askedlist) {
    // Since this doesn't loop anyway, we're not going to worry about the asked list
    return ['stick'];
  }

  nextoutput() {
    // activeblock function to determine what the next output item is
    if(this.onhand.length>0) {
      return this.onhand[0].name;  // this only outputs a name, not the actual item
    }
    return '';
  }

  outputitem() {
    // Outputs an item, if possible
    if(this.onhand.length>0) {
      var grab = this.onhand[0];
      this.onhand.splice(0,1);
      return grab;
    }
    return null;
  }

  update() {
    if(this.onhand.length<5) {
      if(workpoints>=1) {
        workpoints--;
        this.counter++;
        if(this.counter>=6) {
          this.counter=0;
          this.onhand.push(new item('stick','', 0));
    } } }
    $("#"+ this.id +"progress").css({"width":(this.counter*10)});  // aka counter * (60/6)
  }

  drawpanel() {
    $("#gamepanel").html('<center><b>Stick Maker</b></center><br />'+
                         'Uses a worker to produce sticks from nearby trees.  The worker can be equipped with tools to produce sticks faster<br /><br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
                         'Progress: <span id="panelprogress">'+ Math.floor((this.counter/6.0)*100) +'</span>%<br />'+
                         'Sticks stored: <span id="panelstock">'+ this.onhand.length +'</span><br /><br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a>');
  }
  
  updatepanel() {
    $("#panelprogress").html( Math.floor((this.counter/6.0)*100));
    $("#panelstock").html(this.onhand.length);
  }
}



