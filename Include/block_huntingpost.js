class huntingpost extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'Hunting Post';
    this.weapon = null;  // current weapon being used for hunting
    this.targetweapon = ''; // next weapon to use when the current one breaks
    this.onhand = [];     // array of anything this block is holding, usually for output
    this.counter = 0;     // how much progress has been made for the current operation
    this.drawgameblock('img/huntingpost.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    
    // This block doesn't accept items directly; weapons will be loaded like tools
    return 0;
  }
  
//  receiveitem(item) { }
    // activeblock function to receive an actual item (as an object) from another source.
    // This shouldn't be called; we can use the error function from the core activeblock
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    return ['deaddeer', 'deadchicken', 'deadwolf'];
  }

  nextoutput() {
    // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    
    if(this.onhand.length!=0) {
      return this.onhand[0].name;
    }
    return '';
  }

  outputitem() {
    // activeblock function that returns the actual item to be collected by the calling block.  Be sure to delete access to the item while doing this
    // This code below is generally all that's needed to manage this
    
    if(this.onhand.length>0) {
      var grab = this.onhand[0];
      this.onhand.splice(0,1);
      return grab;
    }else{
      return null;
    }
  }

  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    
    if(this.weapon!=null) {
      if(this.onhand.length<10) {
        if(workpoints>=1) {
          workpoints--;
          this.counter += this.weapon.efficiency;
          this.weapon.endurance--;
          if(this.weapon.endurance<=0) {  // This weapon is worn out
            this.weapon = blocklist.findinstorage(this.targetweapon, 1);
          }
          if(this.counter>=30) {
            this.counter-=30;
            switch(Math.floor(Math.random()*3)) {
              case 0: this.onhand.push(new item('deaddeer')); break;
              case 1: this.onhand.push(new item('deadchicken')); break;
              case 2: this.onhand.push(new item('deadwolf')); break;
          } }
          $("#"+ this.id +"progress").css({"width":(this.counter*2)});  // aka 60/30
      } }
    }else{
      if(this.targetweapon!='') {
        this.weapon = blocklist.findinstorage(this.targetweapon, 1);
    } }
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Hunting Post</b></center><br /><br />'+
                         'Operation point for hunting operations. Only 1 hunting post can be constructed for a given area. Requires weapons (such as spears) to function. Weapons '+
                         'are not loaded the same as items. Instead, place them in storage and they can then be loaded with the buttons below.<br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
                         'Progress: <span id="sidepanelprogress">'+ Math.floor((this.counter/30.0)*100) +'</span><br />'+
                         'Items on hand: <span id="sidepanelstock">'+ this.onhand.length +'</span><br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />'+
                         'Tool selection:<br /><b>Weapon</b><br />');
    if(this.weapon==null) {
      $("#gamepanel").append('<span id="sidepanelactivetool">none loaded</span><br />');
    }else{
      $("#gamepanel").append('<span id="sidepanelactivetool">'+ this.weapon.name +' ('+ (Math.floor((this.weapon.endurance / this.weapon.totalendurance)*100)) +'% health)</span><br/>');
    }
    $("#gamepanel").append('<span id="sidepaneltool"               class="sidepanelbutton" style="background-color: '+ this.choosetoolcolor(this.targetweapon, '')               +'" title="'+ this.choosetoolpopup(this.targetweapon, '')               +'" onclick="selectedblock.pickweapon(\'\');">None</span>'+
                           '<span id="sidepaneltoolwoodpointspear" class="sidepanelbutton" style="background-color: '+ this.choosetoolcolor(this.targetweapon, 'woodpointspear') +'" title="'+ this.choosetoolpopup(this.targetweapon, 'woodpointspear') +'" onclick="selectedblock.pickweapon(\'woodpointspear\');">Wood Point Spear</span>');
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    $("#sidepanelprogress").html(Math.floor((this.counter/30.0)*100));
    $("#sidepanelstock").html(this.onhand.length);
    if(this.weapon==null) {
      $("#sidepanelactivetool").html('none loaded');
    }else{
      $("#sidepanelactivetool").html(this.weapon.name +' ('+ (Math.floor((this.weapon.endurance / this.weapon.totalendurance)*100)) +'% health)');
    }
    
    $("#sidepaneltool"              ).css('background-color', this.choosetoolcolor(this.targetweapon, ''));
    $("#sidepaneltool"              ).attr('title', this.choosetoolpopup(this.targetweapon, ''));
    $("#sidepaneltoolwoodpointspear").css('background-color', this.choosetoolcolor(this.targetweapon, 'woodpointspear'));
    $("#sidepaneltoolwoodpointspear").attr('title', this.choosetoolpopup(this.targetweapon, 'woodpointspear'));
  }
  
  pickweapon(newweapon) {
    this.targetweapon = newweapon;
    $("#sidepaneltool"              ).css('background-color', this.choosetoolcolor(this.targetweapon, ''));
    $("#sidepaneltoolwoodpointspear").css('background-color', this.choosetoolcolor(this.targetweapon, 'woodpointspear'));
  }
}



