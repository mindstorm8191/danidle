class campfire extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'Campfire';
    this.foodin = [];   // list of things that are ready to be cooked
    this.fuelin = [];   // list of things that are ready to be burned
    this.onhand = [];   // array of anything this block is holding, usually for output
    this.counter = 0;   // how much progress has been made for the current operation
    this.foodcooking = 0; // Set to 1 if food is on the fire and is being cooked
    this.fuelburn = 0;  // how long the current fuel has left to burn
    this.temp = 0;      // how hot the fire is at any given time
    this.drawgameblock('img/campfire.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
  }
  
  acceptsinput(item) {
    //activeblock function to determine if a given item (name only) can be accepted by this block
    // returns 1 if accepted, 0 if not
    switch(item.name) {
      case 'stick':  // sticks can provide fuel for the fire... enough to keep it running, but not much
        if(this.fuelin.length<20) return 1;
        return 0;
      case 'deaddeer': case 'deadwolf': case 'deadchicken':  // dead animals can be cooked whole
      case 'rawdeermeat': case 'rawwolfmeat': case 'rawchickenmeat':  // A butcher shop will increase yield on meats (and cooking time)
        if(this.foodin.length<20) return 1;
        return 0;
    }
    return 0; // Anything else received will be refused
  }
  
  receiveitem(item) {
    // activeblock function to receive an actual item (as an object) from another source.
    
    switch(item.name) {
      case 'stick':
        if(this.fuelin.length<20) {
          this.fuelin.push(item);
        }else{
          console.log('Error in campfire->receiveitem: not enough room to accept next stick. This item has been lost');
        }
      break;
      case 'deaddeer': case 'deadwolf': case 'deadchicken': case 'rawdeermeat': case 'rawwolfmeat': case 'rawchickenmeat':
        if(this.foodin.length<20) {
          this.foodin.push(item);
        }else{
          console.log('Error in campfire->receiveitem: not enough room to accept food item. This item has been lost');
        }
      break;
      default:
        console.log('Error in campfire->receiveitem: item type of '+ item.name +' is not accepted by this block.  This item has been lost');
    }
  }
  
  possibleoutputs(askedlist) {
    // activeblock function to share what outputs this block can produce
    // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
    //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
    // return type is an array of item names
    
    return ['dearmeat', 'wolfmeat', 'chickenmeat', 'ash'];
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
    
    // Fires need, at minimum, 1 stick and 1 food item to start heating up.  While any given fuel is in use, the temp will increase by 5.  While any fuel is not in
    // use, the fire's temp will decrease by 1.
    // In order for a fire to begin cooking food, the temp must be above 50.  At 50, the fire will not cook the meat very fast; the hotter the fire, the faster something
    // will cook, up until the fire reaches a temp of 200.  Temperatures above 200 will not worsen the cook rate, aka the food will be held further away from the heat.
    // Generally, fires will try to reach a temp of 200, and hover around there.
    
    if(this.fuelburn>0) {  // this fire is heating up
      this.temp += 5;
      this.fuelburn--;
    }else{
      this.temp = Math.max(this.temp-2, 0);
    }
    if(this.foodin.length>0 && this.fuelin.length>0) {  // There is work to be done here!
      // First, see if there is food to be removed.  We will use the counter in a count-down setup.  Food may stay on a campfire for a little while longer than the target
      // cook time, but leaving it on too long will result in unuseable food.
      
        // Continue with cooking the food
      if(this.foodcooking==1) {
        var result = (this.temp-50)/150.0;
        if(result>1) result = 1;
        if(result<0) result = 0;
        this.counter -= result;
      }
      
      if(workpoints>=1) {
        console.log('(campfire) working; temp='+ this.temp +', fuelburn='+ this.fuelburn +', counter='+ this.counter +';');
          // Remove food from the campfire
        if(this.foodcooking==1 && this.counter<0) {
          workpoints--;
          if(this.counter>-30) { // make sure this food isn't burnt
            switch(this.foodin[0].name) {
              case 'deaddeer':  // deer meat. provides the most amount of food. In this form it provides a little less meat than if it were butchered before cooking
                this.onhand.push(new item('deermeat'));
                this.onhand.push(new item('deermeat'));
                this.onhand.push(new item('deermeat'));
                this.onhand.push(new item('deermeat'));
                this.onhand.push(new item('deermeat'));
                this.onhand.push(new item('deermeat'));
              break;
              case 'deadchicken':  // chicken meat. Small animal, but still provides a good deal of food
                this.onhand.push(new item('chickenmeat'));
                this.onhand.push(new item('chickenmeat'));
              break;
              case 'deadwolf':  // wolf meat. A little larger than a chicken
                this.onhand.push(new item('wolfmeat'));
                this.onhand.push(new item('wolfmeat'));
                this.onhand.push(new item('wolfmeat'));
              break;
              case 'rawdeermeat':
                this.onhand.push(new item('deermeat'));
              break;
              case 'rawwolfmeat':
                this.onhand.push(new item('wolfmeat'));
              break;
              case 'rawchickenmeat':
                this.onhand.push(new item('chickenmeat'));
              break;
            }
          }
          this.foodin.splice(0,1); // removes the first item from the list
          this.foodcooking = 0;
          this.counter = 0;
        }else{
          // next, see if there is food to be added
          if(this.foodcooking==0 && this.foodin.length>0) {
            //console.log('(campfire) Lets start cooking');
            workpoints--;
            this.foodcooking = 1;
            this.counter = this.cooktime(this.foodin[0].name);
          }else{
            // Last, add fuel to the fire to keep it hot
            if(this.temp<200 && this.fuelburn<=0 && this.fuelin.length>0) {
              console.log('(campfire) Add some wood (temp='+ this.temp +')');
              workpoints--;
              switch(this.fuelin[0].name) {
                case 'stick': this.fuelburn = 5; break;
                case 'firewood': this.fuelburn = 12; break;
              }
              this.fuelin.splice(0,1);
      } } } }
    }
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Camp Fire</b></center><br /><br />'+
                         'A place for meats to be cooked. Requires firewood (such as sticks) to function.  Fires must reach a temperature of 50 before it will'+
                         'start cooking meats, and increase cooking speed up to a temp of 200 (above 200 has no change in effect).<br /><br />'+
                         'Priority: <img src="img/arrowleft.png" onclick="selectedblock.setpriority(-1)"> '+
                         '<span id="sidepanelpriority">'+ this.priority +'</span> '+
                         '<img src="img/arrowright.png" onclick="selectedblock.setpriority(1)"><br />'+
                         'Fire temperature: <span id="sidepanelheat">'+ this.temp +'</span><br />');
    if(this.foodin.length>0) {
      var cooking = this.cooktime(this.foodin[0].name);
      $("#gamepanel").append('Cooking progress: <span id="sidepanelprogress">'+ Math.floor(((cooking-this.counter)/cooking)*100.0) +'</span>%<br />');
    }else{
      $("#gamepanel").append('Cooking progress: <span id="sidepanelprogress">N/A</span><br />');
    }
    $("#gamepanel").append('Firewood on hand: <span id="sidepanelfuel">'+ this.fuelin.length +'</span><br />'+
                           'Raw food on hand: <span id="sidepanelfood">'+ this.foodin.length +'</span><br />'+
                           'Cooked food ready: <span id="sidepanelcooked">'+ this.onhand.length +'</span><br />'+
                           '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />');
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    
    $("#sidepanelheat").html(this.temp);
    if(this.foodin.length>0) {
      var cooking = this.cooktime(this.foodin[0].name);
      $("#sidepanelprogress").html(Math.floor(((cooking-this.counter)/cooking)*100.0));
    }else{
      $("#sidepanelprogress").html('N/A');
    }
    $("#sidepanelfuel").html(this.fuelin.length);
    $("#sidepanelfood").html(this.foodin.length);
    $("#sidepanelcooked").html(this.onhand.length);
  }
  
  cooktime(itemname) {
    // Returns the total cooking time for a given item.  Pass the name of the unfinished product, not the completed one
    switch(itemname) {
      case 'deaddeer': return 100;
      case 'deadwolf': return 70;
      case 'deadchicken': return 50;
      case 'rawdeermeat': return 10;  // The butchered meats will all be relatively the same size, so have the same cooking time.  These may seem short, but
      case 'rawwolfmeat': return 10;  // it will help support larger populations
      case 'rawchickenmeat': return 10;
    }
  }
}


