class gravelmaker extends activeblock { ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'gravelmaker';
    this.onhand = 0;
    this.counter = 0;
    
    // Now, lets find (and take) a suitable shovel.  There is currently only two types.  We'll grab the worst available, and the user can upgrade
    // that later if necessary
    var chest = hasinstorage("woodshovel");
    if(chest==null) chest = hasinstorage("flintshovel");
    if(chest==null) {
      $("#gameholder").append("Error - could not find shovel to equip with gravelmaker");
    }
    this.equipment = chest.takeitem();
    drawgameblock(this.id, this.xpos*66, this.ypos*66, "gravel.png", 1);
  }
  
  allowedequipment(equipmentslot) {
    switch(equipmentslot) {
      case 'shovel':
        var myoutput = [ ['woodshovel', 1.0],
                       ['flintshovel', 1.5] ];
        if(unlocked_stone==1) {
          myoutput.push( ['coppershovel', 2.0] );
          if(unlocked_iron==1) {
            myoutput.push( ['ironshovel', 3.5] );
            if(unlocked_tin==1) {
              myoutput.push( ['bronzeshovel', 6.0] );
        } } }
        return myoutput;
      break;
    }
  }
  
  acceptsinput(itemtype) {
    return 0;  // This does not accept any input
  }
  
  outputitem() {
    if(this.onhand>0) {
      this.onhand = this.onhand-1;
      return 'gravel';
    }
    return '';
  }
  
  possibleoutputs() {
    return ['gravel'];
  }
  
  nextoutput() {
    if(this.onhand>0) return "gravel";
    return '';
  }
  
  update() {
    if(this.onhand<5) {
      this.counter = this.counter +1;
      if(this.counter==20) {
        this.counter = 0;
        this.onhand = this.onhand +1;
      }
    }
    if(this.onhand>0) this.output = "gravel";
    $("#"+ this.id +"progress").css("width", ((this.counter/20.0)*60));
  }
  
  drawpanel() {
    $("#gamepanel").html('<center><b>Gravel Maker</b></center><br />'+
                         'Collects gravel from nearby streams<br />'+
                         '<br />'+
                         'Progress: <span id="panelprogress">'+ Math.floor((this.counter/20)*100) +'</span>%<br />'+
                         'Gravel stored: <span id="panelstock">'+ this.onhand +'</span><br />');
    this.drawequipmentpanel();
  }
  
  drawequipmentpanel() {
    // Sets or replaces all the content on the equipment portion of the side panel
    
    //we're gonna keep this a lot simpler than the pervious plan. 
    //only one piece of equipment can be used at a time
    //for other situations we'll use a different system
    
    
    // Okay, so each class has an equipmentslots array, which contains pairs of general tool names, along with the actual tool it is filled with (or '' if empty).
    
    var scope = this;
    $("#equipmentpanel").remove();
    $("#gamepanel").append('<div id="equipmentpanel">');
    var chest = null;
    var showid = -2;
    var blockcolor = 'red';
    //var idx = 0;
      // Run through each of the possible equipment slots.  General equipment name is in slot 0, and actual item used is in slot 1 
    this.equipmentslots.forEach((equiptype, idx) => {
      if(equiptype[1]==null) {
        $("#gamepanel").append('Equipped '+ equiptype[0] +': None<br />');
      }else{
        $("#gamepanel").append('Equipped '+ equiptype[0] +': '+ equiptype[1] +'</br>');
      }
      $("#gamepanel").append('Other equipment available:<br />');
        // Get all valid equipment by passing the general equipment type to allowedequipment().
      var validequip = this.allowedequipment(equiptype[0]);
      validequip.forEach((equipoption) => {
        // Each equipoption is a valid equipment type in slot 0, and the speed boost magnifier in slot 1.
        chest = hasinstorage(equipoption[0]);
        if(chest!=null) {
          showid = chest.id;
          if(equiptype[1]==equipoption[0]) blockcolor='grey'; else blockcolor='green';
        }else{
          showid = -2;
          if(equiptype[1]==equipoption[0]) blockcolor='grey'; else blockcolor='red';
        }
        $("#gamepanel").append('<div class="sidepanelbutton" style="background-color:'+ blockcolor +';" '+
                                    'onclick="blocklist['+ this.id +'].changeequip('+ showid +','+ idx +');">'+ equipoption[0] +' (x'+ equipoption[1] +')</div>');
      });
    });
  }

  
  updatepanel() {
    $("#panelprogress").html(Math.floor((this.counter/20)*100));
    $("#panelstock").html(this.onhand);
  }
  
}///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
