class flintfilter extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'Flint filter';
    this.onhand = []; // array of anything this block is holding, usually for output
    this.rawgravel = [];
    this.counter = 0;
    this.shovel = null;
    this.targetshovel = '';
    this.drawgameblock('img/filter_flint.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    // This should only accept raw gravel
    if(item.name=='rawgravel') {
      if(this.rawgravel.length<10) {
        return 1;
    } }
    return 0;
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    if(item.name=='rawgravel') {
      this.rawgravel.push(item);
    }else{
      console.log('Error in flintfilter->receiveitem - recieved '+ item.name +', this should only receive raw gravel');
    }
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    return ['gravel', 'flint'];
  }

  nextoutput() {
    // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    if(this.onhand.length>0) {
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
    
    if(this.shovel!=null) {  // this does not load a shovel right when the block starts.  The user will have to select the block and load one in
      if(this.onhand.length<15) {
        if(this.rawgravel.length>=5) {  // need at least 5 gravel on hand before starting
          if(workpoints>=1) {
            workpoints--;
            this.counter+= this.shovel.efficiency;
            this.shovel.endurance--;
            if(this.shovel.endurance<=0) {
              this.shovel = blocklist.findinstorage(this.targetshovel, 1);
            }
            if(this.counter>=16) {
              this.counter-=16;
              this.onhand.push(new item('gravel'));
              this.onhand.push(new item('gravel'));
              this.onhand.push(new item('gravel'));
              this.onhand.push(new item('gravel'));
              this.onhand.push(new item('flint'));
              this.rawgravel.splice(0,5); // deletes 5 items
        } } }
        $("#"+ this.id +"progress").css({"width":(this.counter*4)});  // aka counter * (60/15)
      }
    }else{
      if(this.targetshovel!='') {
        this.shovel = blocklist.findinstorage(this.targetshovel, 1);
      }     
    }
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Flint Filter</b></center><br /><br />'+
                         'Filters flint out of raw gravel.  With 5 raw gravel, returns 1 flint and 4 pure gravel.<br /><br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
                         'Progress: <span id="panelprogress">'+ Math.floor((this.counter/15.0)*100) +'</span>%<br />'+
                         'Raw gravel stored: <span id="panelgravel">'+ this.rawgravel.length +'</span><br />'+
                         'Output items: <span id="panelstock">'+ this.onhand.length +'</span><br />'+
                         '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />'+
                         'Tool Selection:<br /><b>Shovel</b><br />');
    if(this.shovel==null) {
      $("#gamepanel").append('<span id="sidepanelactivetool">none loaded</span><br />');
    }else{
      $("#gamepanel").append('<span id="sidepanelactivetool">'+ this.shovel.name +' ('+ (Math.floor((this.shovel.endurance / this.shovel.totalendurance)*100)) +'% health)</span><br />');
    }
    $("#gamepanel").append('<span id="sidepanel_noshovel"    class="sidepanelbutton" style="background-color:'+ this.choosetoolcolor(this.targetshovel, 'none'       ) +'" onclick="selectedblock.pickshovel(\'\')"           >none</span>');
    $("#gamepanel").append('<span id="sidepanel_woodshovel"  class="sidepanelbutton" style="background-color:'+ this.choosetoolcolor(this.targetshovel, 'woodshovel' ) +'" onclick="selectedblock.pickshovel(\'woodshovel\')" >woodshovel</span>');
    $("#gamepanel").append('<span id="sidepanel_flintshovel" class="sidepanelbutton" sytle="background-color:'+ this.choosetoolcolor(this.targetshovel, 'flintshovel') +'" onclick="selectedblock.pickshovel(\'flintshovel\')">flintshovel</span>');
  }
  
  updatepanel() {
    // activeblock function to update the side panel once per tick
    $("#panelprogress").html(Math.floor((this.counter/12.0)*100));
    $("#panelgravel").html(this.rawgravel.length);
    $("#panelstock").html(this.onhand.length);
    
      // Update the status of any tools being used
    if(this.shovel==null) {
      $("#sidepanelactivetool").html('none loaded');
    }else{
      $("#sidepanelactivetool").html(this.shovel.name +' ('+ (Math.floor((this.shovel.endurance / this.shovel.totalendurance)*100)) +'% health)');
    }
    
      // We also need to update the colors of the existing panels, as the status of these can change at any point
    $("#sidepanel_noshovel"   ).css("background-color", this.choosetoolcolor(this.targetshovel, 'none'));
    $("#sidepanel_woodshovel" ).css("background-color", this.choosetoolcolor(this.targetshovel, 'woodshovel'));
    $("#sidepanel_flintshovel").css("background-color", this.choosetoolcolor(this.targetshovel, 'flintshovel'));
  }
  
  pickshovel(newshovelname) {
    // (not an activeblock function) Changes the tool that is selected to what the user picked.
    
    this.targetshovel = newshovelname;
  }
  
  deleteblock() {
    // Sets up the block to be deleted.  The base block class has a delete function, but we need to add additional actions when deleting
    // Return the tool to the storage it was in before being used
    if(this.shovel!=null) {
      var prevstorage = blocklist.findbyid(this.shovel.storagesource);
      if(prevstorage!=null) {
        if(prevstorage.acceptsinput(this.shovel)) {  // be sure this storage will still accept the shovel back
          prevstorage.receiveitem(this.shovel);
            // if the shovel isn't accepted, it will just be deleted when this block is destroyed
    } } }
    
    super.deleteblock();
  }
}


