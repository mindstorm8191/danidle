class market extends activeblock { /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(gridx, gridy) {
    super(gridx, gridy);
    this.name = 'market';
    drawgameblock(this.id, this.xpos*66, this.ypos*66, "market.png", 0);
  }
  
  allowedequipment() {
    // Returns a list of all equipment allowed in this machine, along with the speed boost for when it's applied
    // Markets won't use any equipment
    return null;
  }
  
  acceptsinput(itemtype) {
    // Accepts anything, so long as there isn't something already here
    if(this.input=='') return 1; else return 0;
  }
  
  outputitem() {
    // Does not output any items
    return '';
  }
  
  possibleoutputs() {
    return [];
  }
  
  nextoutput() {
    // Will not output any items
    return '';
  }
  
  update() {
    if(this.input!='') {
      switch(this.input) {
        case "stick":          cash = cash +30;   break;
        case "woodshovel":     cash = cash +100;  break;
        case "gravel":         cash = cash +80;   break;
        case "filteredgravel": cash = cash +30;   break;
        case "flint":          cash = cash +125;  break;
        case "flintshovel":    cash = cash +400;  break;
        case "flintpickaxe":   cash = cash +600;  break;
        case "flintaxe":       cash = cash +500;  break;
        case "stone":          cash = cash +130;  break;
        case "stoneblock":     cash = cash +300;  break;
        case "stonefurnace":   cash = cash +2000; break;
        default: $("#gameholder").append("Market received "+ this.input +", has no price");
      }
      this.input = '';
    }
  }
  
  drawpanel() {
    $("#gamepanel").html('<center><b>Market</b><center><br />'+
                         'Sells items.  All items can be sold, and are sold at a fixed price<br /><br />');
  }
  updatepanel() { }  // This is intentionally empty
}///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
