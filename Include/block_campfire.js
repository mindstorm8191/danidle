class campfire extends activeblock {
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'campfire';
    this.foodin = [];   // list of things that are ready to be cooked
    this.fuelin = [];   // list of things that are ready to be burned
    this.onhand = [];   // array of anything this block is holding, usually for output
    this.counter = 0;   // how much progress has been made for the current operation
    this.foodcooking = 0; // Set to 1 if food is on the fire and is being cooked
    this.fuelburn = 0;  // how long the current fuel has left to burn
    this.temp = 0;      // how hot the fire is at any given time
    this.outputfood = 0; // toggles whether food is output or not
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
    
    if(this.outputfood==0) {
      return ['ash'];
    }else{
      return ['dearmeat', 'wolfmeat', 'chickenmeat', 'ash'];
    }
  }

  nextoutput() {
    // activeblock function that returns the name of the next item to be output. if none is available, return ''.
    if(this.outputfood!=0) {
      if(this.onhand.length!=0) {
        return this.onhand[0].name;
    } }
    return '';
  }

  outputitem() {
    // activeblock function that returns the actual item to be collected by the calling block.  Be sure to delete access to the item while doing this
    // This code below is generally all that's needed to manage this
    
    if(this.outputfood!=0) {
      if(this.onhand.length>0) {
        var grab = this.onhand[0];
        this.onhand.splice(0,1);
        return grab;
      }else{
        return null;
      }
    }else{
      return null;
    }
  }
  
  getoutput(targetitem) {
    // For the moment this block doesn't output any cooked food items.  This might change later on though.
    return null;
  }
  
  update() {
    // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
    
    // Fires need, at minimum, 1 stick and 1 food item to start heating up.  While any given fuel is in use, the temp will increase by 5.  While any fuel is not in
    // use, the fire's temp will decrease by 1.
    // In order for a fire to begin cooking food, the temp must be above 50.  At 50, the fire will not cook the meat very fast; the hotter the fire, the faster something
    // will cook, up until the fire reaches a temp of 200.  Temperatures above 200 will not worsen the cook rate, aka the food will be held further away from the heat.
    // Generally, fires will try to reach a temp of 200, and hover around there.
    
      // update the lifetimes of all current input items. We need to manage additional changes if the currently-cooking item expires
    if(this.foodin.length>0) {
      this.foodin[0].lifetime--;
      if(this.foodin[0].lifetime<=0) {
        this.foodin.splice(0,1);
        this.counter = 0;
        this.foodcooking = 0;
        for(var i=0;i<this.foodin.length;i++) { // we'll have to do this here, since if one item is deleted, the below loop will skip an item
          this.foodin[i].lifetime--;
          if(this.foodin[i].lifetime<=0) {
            this.foodin.splice(i,1);
        } }
      }else{
        for(var i=1;i<this.foodin.length;i++) { // we'll have to do this here, since if one item is deleted, the below loop will skip an item
          this.foodin[i].lifetime--;
          if(this.foodin[i].lifetime<=0) {
            this.foodin.splice(i,1);
    } } } }
    
    if(this.fuelburn>0) {  // this fire is heating up
      this.temp += 5;
      this.fuelburn--;
    }else{
      this.temp = Math.max(this.temp-2, 0);
    }
    if(this.foodin.length>0 && this.fuelin.length>0) {  // There is work to be done here!
      if(this.onhand.length<20) {
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
          //console.log('(campfire) working; temp='+ this.temp +', fuelburn='+ this.fuelburn +', counter='+ this.counter +';');
            // Remove food from the campfire
          if(this.foodcooking==1 && this.counter<0) {
            workpoints--;
            if(this.counter>-30) { // make sure this food isn't burnt
              switch(this.foodin[0].name) {
                case 'deaddeer':  // deer meat. provides the most amount of food. In this form it provides a little less meat than if it were butchered before cooking
                  var food = new item('deermeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);  // 600 = 10 minutes
                  var food = new item('deermeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                  var food = new item('deermeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                  var food = new item('deermeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                  var food = new item('deermeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                  var food = new item('deermeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                break;
                case 'deadchicken':  // chicken meat. Small animal, but still provides a good deal of food
                  var food = new item('chickenmeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                  var food = new item('chickenmeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                break;
                case 'deadwolf':  // wolf meat. A little larger than a chicken
                  var food = new item('wolfmeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                  var food = new item('wolfmeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                  var food = new item('wolfmeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                break;
                case 'rawdeermeat':
                  var food = new item('deermeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                break;
                case 'rawwolfmeat':
                  var food = new item('wolfmeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
                break;
                case 'rawchickenmeat':
                  var food = new item('chickenmeat'); food.lifetime = 600; food.location = this.id; foodlist.push(food); this.onhand.push(food);
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
                //console.log('(campfire) Add some wood (temp='+ this.temp +')');
                workpoints--;
                switch(this.fuelin[0].name) {
                  case 'stick': this.fuelburn = 5; break;
                  case 'firewood': this.fuelburn = 12; break;
                }
                this.fuelin.splice(0,1);
      } } } } }
    }else{
      // We are lacking material to continue.  First figure out what we need
      if(this.fuelin.length==0) {
          // Start by finding some fuel
        for(var i=0; i<4; i++) {
          var neighbor = this.getneighbor(i);
          if(neighbor!=null) {
            var pickup = neighbor.getoutput('stick');
            if(pickup!=null) {
              this.fuelin.push(pickup);
              i=5;
        } } }
      }else{
        var itemslist = ['deaddeer', 'deadwolf', 'deadchicken', 'rawdeermeat', 'rawwolfmeat', 'rawchickenmeat'];
        for(var i=0; i<4; i++) {
          var neighbor = this.getneighbor(i);
          if(neighbor!=null) {
            for(var j=0; j<itemslist.length; j++) {
              var pickup = neighbor.getoutput(itemslist[j]);
              if(pickup!=null) {
                this.foodin.push(pickup);
                i=5; j=itemslist.length+1;
        } } } }
      }
    }
  }
  
  drawpanel() {
    // activeblock functino that generates the content
    $("#gamepanel").html('<center><b>Camp Fire</b></center><br /><br />'+
                         'A place for meats to be cooked. Requires firewood (such as sticks) to function.  Fires must reach a temperature of 50 before it will'+
                         'start cooking meats, and increase cooking speed up to a temp of 200 (above 200 has no change in effect).<br /><br />'+
                         this.displaypriority() +'<br />'+
                         'Fire temperature: <span id="sidepanelheat">'+ this.temp +'</span><br />');
    if(this.foodin.length>0) {
      var cooking = this.cooktime(this.foodin[0].name);
      $("#gamepanel").append('Cooking: <span id="sidepanelprogress">'+ this.foodin[0].name +' ('+ Math.floor(((cooking-this.counter)/cooking)*100.0) +'% done)</span><br />');
    }else{
      $("#gamepanel").append('Cooking: <span id="sidepanelprogress">None</span><br />');
    }
    $("#gamepanel").append('Firewood on hand: <span id="sidepanelfuel">'+ this.fuelin.length +'</span><br />'+
                           'Raw food on hand: <span id="sidepanelfood">'+ this.foodin.length +'</span><br />'+
                           'Cooked food ready: <span id="sidepanelcooked">'+ this.onhand.length +'</span><br />'+
                           '<span id="sidepaneltoggleoutput" class="sidepanelbutton" style="background-color:'+ this.outputtogglecolor() +'" onclick="selectedblock.toggleoutput()">Output Foods</span><br />'+
                           '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />');
  }
  
  updatepanel() {
    // activeblock function to update the panel once per tick
    
    $("#sidepanelheat").html(this.temp);
    if(this.foodin.length>0) {
      var cooking = this.cooktime(this.foodin[0].name);
      $("#sidepanelprogress").html(this.foodin[0].name +' ('+ Math.floor(((cooking-this.counter)/cooking)*100.0) +'% done)');
    }else{
      $("#sidepanelprogress").html('None');
    }
    $("#sidepanelfuel").html(this.fuelin.length);
    $("#sidepanelfood").html(this.foodin.length);
    $("#sidepanelcooked").html(this.onhand.length);
  }
  
  reload() {
    // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
    // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
    // (this is already done by here) and also any items this block contains.
    // In this function, we also need to add any editable items back into the foods list array.
    
    for(var i=0;i<this.foodin.length;i++) {
      Object.setPrototypeOf(this.foodin[i], item.prototype);
    }
    for(var i=0;i<this.fuelin.length;i++) {
      Object.setPrototypeOf(this.fuelin[i], item.prototype);
    }
    for(var i=0;i<this.onhand.length;i++) {
      Object.setPrototypeOf(this.onhand[i], item.prototype);
      switch(this.onhand[i].name) {  // Everything this block outputs is edible... for now. That could change later, though, so we'll keep this check in place
        case 'deermeat': case 'wolfmeat': case 'chickenmeat':
          foodlist.push(this.onhand[i]);
        break;
    } }
    this.drawgameblock('img/campfire.png', 1);
      // We need to set the width of the progress bar, but we're not actually using it yet
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
  
  toggleoutput() {
    this.outputfood = 1 - this.outputfood;
    $("#sidepaneltoggleoutput").css('background-color', this.outputtogglecolor());
  }
  
  outputtogglecolor() {
    // returns the color that the output toggle should be
    if(this.outputfood==1) {
      return 'green';
    }
    return 'red';
  }
}


