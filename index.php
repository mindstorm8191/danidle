<!-- <?php
  // DanIdle version 2
  // Build complex items from simple parts, 
  // starting from sticks and stones and working
  // up to advanced technologies
  
  // Task List
  // Add tooltips to the tools to show the current status (since colors aren't very descriptive). Then add to the block selection options,
  //    complete with descriptions about each
  // Set up ways to move blocks around based on buttons. Be sure to not allow one block to be placed on top of another.
  // Add buttons to the foraging post to decide if non-food things will be collected (such as seeds or flowers)
  
  // total project # of lines
  // index                   block_firewood        block_gravelmaker      block_storage
  //     blocks                  block_flintfilter     block_logmaker         block_watercup
  //         block_bucketline        block_flinttoolmaker  block_mudmaker        block_woodcupmaker
  //             block_claydryer         block_foragepost      block_stickmaker      block_woodshovel
  //                 block_clayformmaker    block_furnace         block_stonecrusher
  //                     block_dirtmaker        block_garbage         block_stonemaker
  // 316+131+177+119+202+130+149+150+204+87+195+76+131+134+117+68+140+125+126+88+142+103 = 3110 lines!
  
  // Population control - Determines how many human units on hand you have to manage
  // Factors affecting population
  //  Food on hand - If the player has enough food to feed everyone, the player will have positive population influence.  A variety of food sources will improve this as well (the more
  //                 the better)
  //  Housing space - Food alone will only allow a max of 10 units.  After that, everyone will need a place to rest & sleep.
  //                  Players will start with huts made of sticks & leaves (built on-site, like the current furnace)
  //  Safety - Fences around the factory space will help protect units from attack by creatures / attackers.  The better the fencing space, the better this score, though a given
  //           area will need only a certain amount of protection. Increasing it beyond that will not help matters
  //  Temp & rain - The player will eventually need to have covered areas for production of resources. Firstly to protect the human units from the elements, but later to protect
  //                the equipment too (especially electrical stuff).  Later, cooling methods will need to be considered
  
?>
-->
<html>
  <head>
    <title>DanIdle (tentative name)</title>
    <script src="include/jquery.js"               type="text/javascript"></script>
    <script src="include/tippy.all.min.js"        type="text/javascript"></script>
    <script src="include/blocks.js"               type="text/javascript"></script>
    <script src="include/block_foragepost.js"     type="text/javascript"></script>
    <script src="include/block_stickmaker.js"     type="text/javascript"></script>
    <script src="include/block_bucketline.js"     type="text/javascript"></script>
    <script src="include/block_storage.js"        type="text/javascript"></script>
    <script src="include/block_woodshovel.js"     type="text/javascript"></script>
    <script src="include/block_woodpointspear.js" type="text/javascript"></script>
    <script src="include/block_huntingpost.js"    type="text/javascript"></script>
    <script src="include/block_campfire.js"       type="text/javascript"></script>
    <script src="include/block_garbage.js"        type="text/javascript"></script>
    <script src="include/block_gravelmaker.js"    type="text/javascript"></script>
    <script src="include/block_flintfilter.js"    type="text/javascript"></script>
    <script src="include/block_flinttoolmaker.js" type="text/javascript"></script>
    <script src="include/block_logmaker.js"       type="text/javascript"></script>
    <script src="include/block_firewood.js"       type="text/javascript"></script>
    <script src="include/block_dirtmaker.js"      type="text/javascript"></script>
    <script src="include/block_woodcupmaker.js"   type="text/javascript"></script>
    <script src="include/block_watercup.js"       type="text/javascript"></script>
    <script src="include/block_mudmaker.js"       type="text/javascript"></script>
    <script src="include/block_clayformmaker.js"  type="text/javascript"></script>
    <script src="include/block_claydryer.js"      type="text/javascript"></script>
    <script src="include/block_furnace.js"        type="text/javascript"></script>
    <script src="include/block_stonemaker.js"     type="text/javascript"></script>
    <script src="include/block_stonecrusher.js"   type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="include/style.css" />
  </head>
  <body>
    <table width="100%">
      <tr>
        <td style="width:208px;" valign="top">
          Factory Components:<br />
          Currently Selected: <span id="selectedblock">Delete Tool"</span>
          <div id="blockselector" style="position:relative">
            <div id="cursorselector"       class="blockchoice" onclick="setcursor('selector')"       title="Selection; highlight items and center screen" style="background-color:red;"><img src="img/cursor.png" /></div>
            <div id="cursorstorage"        class="blockchoice" onclick="setcursor('storage')"        title="Storage; Store items (like tools)"><img src="img/storage.png" /></div>
            <div id="cursorbucketline"     class="blockchoice" onclick="setcursor('bucketline')"     title="Bucket-line mover; Move items between blocks"><img src="img/bucketline_right.png" /></div>
            <div id="cursorstickmaker"     class="blockchoice" onclick="setcursor('stickmaker')"     title="Stick-Maker; Produces sticks"><img src="img/stickmaker.png" /></div>
            <div id="cursorwoodshovel"     class="blockchoice" onclick="setcursor('woodshovel')"     title="Wood Shovel Maker; Turns sticks into a shovel"><img src="img/shovel_wood.png" /></div>
            <div id="cursorforagepost"     class="blockchoice" onclick="setcursor('foragepost')"     title="Forage Post; Collect food from surrounding lands"><img src="img/foragepost.png" /></div>
            <div id="cursorwoodpointspear" class="blockchoice" onclick="setcursor('woodpointspear')" title="Wood-point spear maker; Make spears for hunting"><img src="img/woodpointspear.png" /></div>
          </div>
        </td>
        <td width="66%" valign="top" style="background-image:url(img/gridbackground.png);">
          <div id="gameholder" onclick="handlegameboxclick()">
            <div id="game">
              <div id="gridcursor"></div>
            </div>
          </div>
        </td>
        <td id="gamepanel" valign="top">
        </td>
      </tr>
    </table>
    <script type="text/javascript">
      var selectedblock = null;       // This is the block currently selected on the map, and information about this will be shown on the right
      var cursorselect = 'selector';  // this is the type of block placed down for any new blocks
      var mousex = 0, mousey = 0;
      var panellist = [];
      var lastblockid = 0;
      
      var population = 4; // number of colonists in the colony.  This determines how much work can be done per 'tick'
      var workpoints = 0; // number of work points is directly affected by population, but is reset at the start of every cycle.  This is global so that all blocks
                          // can access it
      
      // how to sort a JS array (based on internal values): https://stackoverflow.com/questions/2466356/javascript-object-list-sorting-by-object-property
      
      var blocklist = [];
      blocklist.compare = function(a, b) {
        return a.priority - b.priority;
      }
      blocklist.findbyid = function(id) {
        // returns a block based on its id, or null if that was not found
        for(var i=0; i<blocklist.length; i++) {
          if(blocklist[i].id==id) {
            return blocklist[i];
          }
        }
        return null;
      }
      blocklist.findongrid = function(x,y) {
        // returns a block based on its grid coordinates, or null if no block is there
        for(var i=0; i<blocklist.length; i++) {
          if(blocklist[i].xpos==x && blocklist[i].ypos==y) {
            return blocklist[i];
          }
        }
        return null;
      }
      blocklist.findinstorage = function(itemname, pickup) {
        // returns an item from a chest block matching the name, or null if no item of that exists in any chest
        // pickup - set to 1 if the item is to be collected, or 0 if this simply returns that it is available
        for(var i=0; i<blocklist.length; i++) {
          if(blocklist[i].name=='Storage') {
            if(blocklist[i].possibleoutputs()==itemname) {
              //console.log('blocklist.findinstorage: found '+ itemname);
              if(pickup==1) {
                return blocklist[i].outputitem(1);  // this outputitem function will perform all the tasks we need to retrieve the target item. no need for a special function here
              }else{
                return 1;
        } } } }
        return null;
      }
      blocklist.lastpriority = function() {
        // returns the value of the highest-value priority block (aka the block with the least priority level)
        // so long as the list is sorted by priority, this is actually very simple:
        if(blocklist.length>0) {
          return blocklist[blocklist.length-1].priority;
        }else{
          return 0;
        }
      }
      
      
      $(document).mousemove(function(e) {
        mousex = e.pageX;
        mousey = e.pageY;
        $("#gridcursor").css("top", (Math.floor((e.pageY-$("#game").offset().top)/66)*66));
        $("#gridcursor").css("left", (Math.floor((e.pageX-$("#game").offset().left)/66)*66));
      });
      
      function setcursor(blocktype) {
        $("#cursor"+ cursorselect).css("background-color", "white");
        cursorselect = blocktype;
        $("#cursor"+ cursorselect).css("background-color", "red");
      }
      
      function handlegameboxclick() {
      // Manages any clicks on the 'open map'
        
        var gridy = Math.floor((mousey-$("#game").offset().top)/66);
        var gridx = Math.floor((mousex-$("#game").offset().left)/66);
        if(cursorselect=='selector') {
          // The user is only using the selector mode.  Re-center the map
          $("#game").css("left", (((13-1)*66)/2) - (gridx*66));
          $("#game").css("top",  (((9-1)*66)/2) - (gridy*66));
        }else{
          var target = blocklist.findongrid(gridx,gridy);
          if(target==null) {
            switch(cursorselect) {
              case 'bucketline':     var makeblock = new bucketline(    gridx, gridy); break;
              case 'campfire':       var makeblock = new campfire(      gridx, gridy); break;
              case 'claydryer':      var makeblock = new claydryer(     gridx, gridy); break;
              case 'clayformmaker':  var makeblock = new clayformmaker( gridx, gridy); break;
              case 'dirtmaker':      var makeblock = new dirtmaker(     gridx, gridy); break;
              case 'firewood':       var makeblock = new firewood(      gridx, gridy); break;
              case 'flintfilter':    var makeblock = new flintfilter(   gridx, gridy); break;
              case 'flinttoolmaker': var makeblock = new flinttoolmaker(gridx, gridy); break;
              case 'foragepost':     var makeblock = new foragepost(    gridx, gridy); break;
              case 'furnace':        var makeblock = new furnace(       gridx, gridy); break;
              case 'garbage':        var makeblock = new garbage(       gridx, gridy); break;
              case 'gravelmaker':    var makeblock = new gravelmaker(   gridx, gridy); break;
              case 'huntingpost':    var makeblock = new huntingpost(   gridx, gridy); break;
              case 'logmaker':       var makeblock = new logmaker(      gridx, gridy); break;
              case 'mudmaker':       var makeblock = new mudmaker(      gridx, gridy); break; 
              case 'stickmaker':     var makeblock = new stickmaker(    gridx, gridy); break;
              case 'stonecrusher':   var makeblock = new stonecrusher(  gridx, gridy); break;
              case 'stonemaker':     var makeblock = new stonemaker(    gridx, gridy); break;
              case 'storage':        var makeblock = new storage(       gridx, gridy); break;
              case 'watercup':       var makeblock = new watercup(      gridx, gridy); break;
              case 'woodcupmaker':   var makeblock = new woodcupmaker(  gridx, gridy); break;
              case 'woodpointspear': var makeblock = new woodpointspear(gridx, gridy); break;
              case 'woodshovel':     var makeblock = new woodshovel(    gridx, gridy); break;
              
              default: console.log('Error in handlegameboxclick() - selected block of '+ selectedblock +' not yet handled!');
            }
            makeblock.selectblock();  // This handles making this the currently selected block
          }else{
            // There was a block found here... I'm not sure what to do.  Shouldn't this be handled by the individual block's on-click event?
          }
        }
      }
      
      $(document).ready(function() {
        mytimer = setInterval(function() {
          workpoints = population;
          blocklist.forEach((block) => {
            if(block!=null) {
              block.update();  // Blocks will still need to run their update function, even if there are no work points left, since some parts of block updates
                               // won't involve workers
            }
          });
          if(selectedblock!=null) {
            selectedblock.updatepanel();
          }
        }, 1000);
        
        
        var r = new stickmaker(0,0);
        
        var x = new panel('gravelmaker',   'img/gravel.png',        'woodshovel', 'Gravel Maker; Collects gravel. Requires a shovel');
        var x = new panel('flintfilter',   'img/filter_flint.png',  'woodshovel', 'Flint Filter; Filters flint from raw gravel. Requires a shovel');
        var x = new panel('garbage',       'img/garbage.png',       'woodshovel', 'Garbage; Destroys objects');
        var x = new panel('flinttoolmaker', 'img/flinttoolset.png', 'woodshovel', 'Flint tool maker; Creates 1 of 4 flint tools. Needs sticks & flint');
        var x = new panel('dirtmaker',     'img/dirt.png',          'woodshovel', 'Dirt Maker; Collects dirt. Requires a shovel');
        var x = new panel('logmaker',      'img/log.png',           'flintaxe', 'Log Maker; Collects logs. Requires an axe');
        var x = new panel('firewood',      'img/firewood.png',      'flintaxe', 'Firewood Maker; Turns logs into firewood. Requires an axe');
        var x = new panel('woodcupmaker',  'img/cup.png',           'flintaxe', 'Wooden cup maker; Turns logs into cups. Requires an axe');
        var x = new panel('furnace',       'img/furnace.png',       'flintaxe', 'Furnace; Fires things. Requires unfired dirt bricks, then firewood');
        var x = new panel('watercup',      'img/watercup.png',      'woodencup', 'Water Cup; Fills wooden cups with water');
        var x = new panel('mudmaker',      'img/mudmaker.png',      'woodencup', 'Mud Maker; Produces mud. Requires dirt & water');
        var x = new panel('clayformmaker', 'img/clayformmaker.png', 'woodencup', 'Clay From-maker; shapes mud into shapes');
        var x = new panel('claydryer',     'img/claydryer.png',     'woodencup', 'Clay Dryer; Dries clay before being fired');
        var x = new panel('stonemaker',    'img/stone.png',         'flintpickaxe', 'Stone Collector; Requires a pickaxe');
        var x = new panel('stonecrusher',  'img/stonecrusher.png',  'flintpickaxe', 'Stone Crusher; Crushes stone so ores can be extracted. Requires hammer');
        var x = new panel('huntingpost',   'img/huntingpost.png',   'woodpointspear', 'Hunting Post; collect meats from environment. Requires weapons');
        var x = new panel('campfire',      'img/campfire.png',      'woodpointspear', 'Campfire; cook foods collected from hunting'); 

//        This code is here for testing purposes only - it allows me to jump ahead so I'm not spending 5 minutes every time I want to test something new
/*        var r = new storage(-1,0);
        r.onhand.push(new item('flintaxe', 'axe', 200, 1));
        r.onhand.push(new item('flintaxe', 'axe', 200, 1));
        r.onhand.push(new item('flintaxe', 'axe', 200, 1));
        r.onhand.push(new item('flintaxe', 'axe', 200, 1));
        r.onhand.push(new item('flintaxe', 'axe', 200, 1));
        r.onhand.push(new item('flintaxe', 'axe', 200, 1));
        r.onhand.push(new item('flintaxe', 'axe', 200, 1));
        r.onhand.push(new item('flintaxe', 'axe', 200, 1));
        var r = new storage(-2,0);
        r.onhand.push(new item('flintshovel', 'shovel', 200, 1.25));
        r.onhand.push(new item('flintshovel', 'shovel', 200, 1.25));
        r.onhand.push(new item('flintshovel', 'shovel', 200, 1.25));
        r.onhand.push(new item('flintshovel', 'shovel', 200, 1.25));
        r.onhand.push(new item('flintshovel', 'shovel', 200, 1.25));
        r.onhand.push(new item('flintshovel', 'shovel', 200, 1.25));
        r.onhand.push(new item('flintshovel', 'shovel', 200, 1.25));
        findunlocks('woodshovel');
        findunlocks('flintaxe');
        findunlocks('woodencup');

        var r = new storage(-1,0);
        r.onhand.push(new item('flintpickaxe', 'pickaxe', 200, 1));
        r.onhand.push(new item('flintpickaxe', 'pickaxe', 200, 1));
        r.onhand.push(new item('flintpickaxe', 'pickaxe', 200, 1));
        r.onhand.push(new item('flintpickaxe', 'pickaxe', 200, 1));
        
        var r = new storage(-2,0);
        r.onhand.push(new item('flinthammer', 'hammer', 50, 1));
        r.onhand.push(new item('flinthammer', 'hammer', 50, 1));
        r.onhand.push(new item('flinthammer', 'hammer', 50, 1));
        r.onhand.push(new item('flinthammer', 'hammer', 50, 1));
        
        findunlocks('woodshovel');
        findunlocks('flintpickaxe');
*/        
      });
      
      function findunlocks(newitem) {
        // Searches for panels that can be unlocked (and displayed) based on a new item having been finished)
        for(var i=0; i<panellist.length; i++) {
          if(panellist[i].state==0) {
            if(panellist[i].unlocks==newitem) {
              panellist[i].state = 1;
              $("#blockselector").append('<div id="cursor'+ panellist[i].name +'" class="blockchoice" onclick="setcursor(\''+ panellist[i].name +'\')" title="'+ panellist[i].tooltip +'"><img src="'+ panellist[i].image +'" /></div>');
          } }
        }
      }
      
      
      // Need another class to manage the buildable options on the right. Use it to determine when items are shown and what gets constructed based on that item.
      // Use it to add structures to the game during initiation, and manage them through the game.
      
      class panel {
        constructor(panelname, imagepath, unlockitem, tooltip) {
          this.name = panelname;
          this.image = imagepath;
          this.state = 0;
          this.unlocks = unlockitem;
          this.tooltip = tooltip;
          panellist.push(this);
        }
      }
      
      
      class item {
        constructor(newname, toolrole='', endurance=0, efficiency=0) {
          this.name = newname;
          this.role = toolrole;  // a null string may be used here for non-tool items
          this.endurance = endurance;
          this.totalendurance = endurance;  // all tools (by default) start with 100% endurance
          this.efficiency = efficiency;
        }
      }
      
      
    </script>
  </body>
<html >



