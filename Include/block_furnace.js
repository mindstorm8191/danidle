class furnace extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'furnace';
    this.input = [];
    this.working = null;  // what item is currently in the furnace
    this.fuel = [];       // fuel stored on hand, not being used yet.  Fuel won't be used unless there is work to be done 
    this.onhand = [];     // array of anything this block is holding, usually for output
    this.constructed = 0; // gets set to 1 when this block receives 20 dirt bricks, which is enough to complete its construction
    this.fuelcounter = 0; // how much time the current fuel has before it is burned out
    this.heat = 0;        // how hot this furnace is
    this.targetheat = 0;  // how hot the furnace needs to get to do its work
    this.targetcount = 0; // how long this item needs to be in the furnace
    this.counter = 0;     // how much progress has been made for the current operation
    this.drawgameblock('img/furnace.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    
    if(this.constructed==0) {
      if(item.name=='dirtbrick') return 1;  // This will accept exactly 20 bricks. Once received they will all be used, and this will no longer accept bricks
    }else{
      switch(item.name) {
        case 'firewood': case 'log': if(this.fuel.length<20) return 1;  // logs can be accepted as fuel too, but the fire has to be up to a certain temperature before they can
      }                                                                 // be used
    }
    return 0;
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    if(this.constructed==0) {
      if(item.name=='dirtbrick') {
        this.input.push(item);
        if(this.input.length>=20) {
          this.constructed = 1;
          this.input = [];  // empty the input array - the bricks are now part of the furnace
          if(this==selectedblock) {  // With the block completed, we will need to change the displayed content (if it is selected
            this.drawpanel();
      } } }
    }else{
      // divide the input between fuel and material
      switch(item.name) {
        case 'firewood':  // we can expand this list later by just adding new entries here
          if(this.fuel.length<20) {
            this.fuel.push(item);
          }
        break;
        case 'copperore':
          if(this.input.length<20) {
            this.input.push(item);
          }
        break;
        default:
          console.log('Error in furnace->receiveitem: item ('+ item.name +') not accepted here, it will be lost');
        break;
      }
    }     
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    if(this.constructed==0) {
      return [];
    }else{
      // Rather than listing all possible outputs all the time, we will list the outputs based on what is in the oven & what is ready to be put in
      var chunk = [];
      for(var i=0;i<this.onhand.length; i++) {
        chunk.push(this.onhand[i].name);
      }
      if(this.working!=null) {
        switch(this.working.name) {
          case 'copperore': chunk.push('copper');
        }
      }
      for(var i=0;i<this.input.length; i++) {
        switch(this.input[i].name) {
          case 'copperore': chunk.push('copper');
        }
      }
    }
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
    if(this.constructed!=0) {
      if(this.working==null) {
        // Nothing in the furnace.  Grab something from the input... if there is anything
        if(this.input.length>0 && this.onhand.length<20) {
          this.working = this.input[0];
          this.input.splice(0,1);
            // now, set the target heat
          switch(this.working.name) {
            case 'copperore': this.targettemp = 500; this.targetcount = 30; break;
          }
      } }
      if(this.working!=null) {
        if(this.fuelcounter>0) {
          this.temp+=10;
          this.fuelcounter--;
        }
        if(this.temp>0) {
          this.temp--;  // account for heat loss
        }
        if(this.temp<=this.targettemp && this.fuelcounter<=0) {
          // The fire needs more heat!  Add more fuel to the fire
          if(this.fuel.length>0) {
            switch(this.fuel[0].name) {
              case 'firewood': this.fuelcounter+=20; break;
            }
            this.fuel.splice(0,1);
          }
        }
        if(this.temp>=this.targettemp) {
          // this furnace is hot enough to do our work
          this.counter++;
          if(this.counter>=this.targetcount) {
            switch(this.working.name) {
              case 'copperore': this.working.name = 'copper'; break;
            }
            this.onhand.push(this.working);
            this.working = null;  // if there is more to work on, this will be filled in the next round
        } }
      }
    }
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Furnace</b></center><br /><br />'+
                         'A shaped furnace where extra air can be applied to the fire.  Used to smelt ores into metals.  To build, load with 20 dirt bricks, then provide fuel (firewood) and material. Furnace will need time to '+
                         'heat up, and looses heat over time.  Fuel will only be used if there is work to be done.<br />');
    if(this.constructed==0) {
      // This is not yet built. Show the total bricks left before this can be used
      $("#gamepanel").append('Under construction: need <span id="sidepanelbricks">'+ (20-this.input.length) +'</span> more bricks!');
    }else{
      if(this.working==null) {
        $("#gamepanel").append('Status: <span id="sidepanelstatus">idle</span><br />'+
                               'Temperature: <span id="sidepanelheat">'+ this.heat +'</span><br />');
      }else{
        $("#gamepanel").append('Status: <span id="sidepanelstatus">Smelting '+ this.working.name +'<span><br />'+
                               'Temperature: <span id="sidepaneltemp">'+ this.heat +' (target '+ this.targetheat +')</span><br />'); 
      }
      $("#gamepanel").append('Fuel on hand: <span id="sidepanelfuel">'+ this.fuel.length +'</span><br />'+
                             'Items waiting: <span id="sidepanelinput">'+ this.input.length +'</span><br />'+
                             'Output items stocked: <span id="sidepanelstock">'+ this.onhand.length +'</span><br />');
    }
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    if(this.constructed==0) {
      $("#sidepanelbricks").html( (20-this.input.length) );
    }else{
      if(this.working==null) {
        $("#sidepanelstatus").html('idle');
        $("#sidepanelheat").html(this.heat);
      }else{
        $("#sidepanelstatus").html('Smelting '+ this.working.name);
        $("#sidepanelheat").html(this.head +' (target '+ this.targetheat +')');
      }
      $("#sidepanelfuel").html(this.fuel.length);
      $("#sidepanelinput").html(this.input.length);
      $("#sidepanelstock").html(this.onhand.length);
    }
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    for(var i=0; i<this.input.length; i++) {
      Object.setPrototypeOf(this.input[i], item.prototype);
    }
    for(var i=0; i<this.fuel.length; i++) {
      Object.setPrototypeOf(this.fuel[i], item.prototype);
    }
    for(var i=0; i<this.onhand.length; i++) {
      Object.setPrototypeOf(this.onhand[i], item.prototype);
    }
    this.drawgameblock('img/furnace.png', 1);
      // We haven't yet started to use the progress bar for this... but we'll probably have one
  }
}



