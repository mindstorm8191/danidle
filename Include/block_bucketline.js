class bucketline extends activeblock {
    constructor(gridx, gridy) {
        super(gridx, gridy);
        this.name = 'bucketline';
        this.onhand = null;  // since this can only ever hold 1 item at a time, this isn't stored as an array
        this.refuselist = [];  // list of all items that this bucketline worker won't pick up.  Determined by all available outputs of all neighbors (including those linked to neighboring bucketline workers)
        this.pickupside = 0;   // which side of the bucketline worker we picked up an item from.  When searching for a place to put the item down, we will skip-over trying this side
        this.drawgameblock('img/bucketline_empty.png', 0);
    }

    acceptsinput(item) {
        // activeblock function to determine if this will accept a given input.
        // The bucketline will accept anything, so long as it isn't holding something already
        if (this.onhand == null) {
            return 1;
        } else {
            return 0;
        }
    }

    receiveitem(item) {
        //activeblock function to accept an item as input
        // This will accept anything, so long as it isn't already holding something
        if (this.onhand == null) {
            this.onhand = item;
        } else {
            console.log('Error in bucketline->receiveitem() - item received but this is already holding something.  New item has been lost.');
        }
    }

    possibleoutputs(askedlist) {
        // Handles determining what items this can possibly output
        // since bucketlines don't output items themselves, we will need to determine what items the neighboring blocks output.  We'll also need to be sure we don't request
        // data from blocks that have already been included in this path

        var outp = [];
        askedlist.push(this);
        for (var i = 0; i < 4; i++) {
            var neighbor = this.getneighbor(i);
            if (neighbor != null) {
                var flag = -1;
                for (var j = 0; j < askedlist.length; j++) { // run through the asked list and see if this neighbor has already been checked
                    if (neighbor.id == askedlist[j].id) {
                        flag = j;
                    }
                }
                if (flag == -1) {
                    outp.push(neighbor.possibleoutputs(askedlist));
                }
            }
        }
        return outp;
    }

    nextoutput() {
        // part of activeblock.  Returns the next item to be output by this, or empty string if there's nothing to output
        // bucketline movers don't inherently output any items
        return '';
    }

    outputitem() {
        //activeblock function to output an item, if possible.
        // bucketline movers don't allow other devices to give them items, they do the work of item movement
        return null;
    }

    getoutput(target) {
        return null;
    }

    update() {
        if (workpoints < 1) {
            return;
        }
        var triggered = 0;  // this is used to show when the mover puts down an item somewhere and has nothing else to pick up
        if (this.onhand == null) { // not holding anything.  Search nearby blocks for something to pick up
            for (var i = 0; i < 4; i++) {
                var neighbor = this.getneighbor(i);
                if (neighbor == null || this.refuselist.indexOf(neighbor.nextoutput()) !== -1) {
                    continue;
                }
                // Handle the refuse-list here
                this.onhand = neighbor.outputitem();  // Collects the item from the given block, if possible
                if (this.onhand == null) {
                    // nothing is picked up
                    continue;
                }

                this.pickupside = i;
                triggered = 1;
                workpoints--;
                switch (i) {  // now, update the displayed image to show the worker picking up an item
                    case 0:
                        $("#" + this.id + "img").attr("src", "img/bucketline_up.png");
                        break;
                    case 1:
                        $("#" + this.id + "img").attr("src", "img/bucketline_right.png");
                        break;
                    case 2:
                        $("#" + this.id + "img").attr("src", "img/bucketline_down.png");
                        break;
                    case 3:
                        $("#" + this.id + "img").attr("src", "img/bucketline_left.png");
                        break;
                }
                i = 5; // exit this loop now
            }
            if (triggered == 0) {  // nothing was found this round.  Set the image to holding nothing
                $("#" + this.id + "img").attr("src", "img/bucketline_empty.png");
            }
        } else {
            // Already holding something. Start by reducing the timer value of any food related items
            switch (this.onhand.name) {
                case 'deaddeer':
                case 'deadchicken':
                case 'deadwolf':
                case 'rawdeermeat':
                case 'rawchickenmeat':
                case 'rawwolfmeat':
                    this.onhand.lifetime--;
                    if (this.onhand.lifetime <= 0) {
                        this.onhand = null;
                    }
                    break;
            }

            // Now search nearby blocks for a valid place to put it
            for (var i = 0; i < 4; i++) {
                if (this.pickupside === i) {
                    continue;
                }
                var neighbor = this.getneighbor(i);
                if (neighbor == null || neighbor.acceptsinput(this.onhand) !== 1) {
                    continue;
                }
                neighbor.receiveitem(this.onhand);
                this.onhand = null;
                workpoints--;
                switch (i) {   // now, update the displayed image to show the worker picking up an item
                    case 0:
                        $("#" + this.id + "img").attr("src", "img/bucketline_up.png");
                        break;
                    case 1:
                        $("#" + this.id + "img").attr("src", "img/bucketline_right.png");
                        break;
                    case 2:
                        $("#" + this.id + "img").attr("src", "img/bucketline_down.png");
                        break;
                    case 3:
                        $("#" + this.id + "img").attr("src", "img/bucketline_left.png");
                        break;
                }
                i = 5; // exit this loop now
            }
        }
    }

    drawpanel() {
        $("#gamepanel").html('<center><b>Bucket-line Item Mover</b><center><br />' +
            'Place between item source and target to move items.  Can be set to manage where items flow to & from. This will be your most ' +
            'flexible item flow tool, but will always require a worker.<br /><br />' +
            this.displaypriority() + '<br />');
        if (this.onhand == null) {
            $("#gamepanel").append('Currently holding: <span id="itempanel">none</span>');
        } else {
            $("#gamepanel").append('Currently holding: <span id="itempanel">' + this.onhand.name + '</span>');
        }
        $("#gamepanel").append('<br /><a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br />' +
            'Possible inputs (click to disable):<br />');

        // Now, show all the possible inputs for this, allowing player to disable them.  Our refusal list will start empty.  The list of available
        // items won't be generated until this panel is displayed.
        var fulllist = []; // This prevents us from listing the same item multiple times
        for (var i = 0; i < 4; i++) {
            var neighbor = this.getneighbor(i);
            if (neighbor == null) {
                return;
            }
            var itemslist = neighbor.possibleoutputs([]);
            for (var j = 0; j < itemslist.length; j++) {
                if (fulllist.indexOf(itemslist[j]) !== -1) {
                    continue;
                }
                // This item is not yet in the list.  We will need to display it.  First though, we need to determine if that is already in our refusal list
                fulllist.push(itemslist[j]);
                var blockcolor = 'green';
                if (this.refuselist.indexOf(itemslist[j]) != -1) {
                    blockcolor = 'red';
                }
                $("#gamepanel").append('<div id="blacklistpanel' + itemslist[j] + '" class="sidepanelbutton" style="background-color:' + blockcolor + ';" ' +
                    'onclick="selectedblock.blacklist(\'' + itemslist[j] + '\');">' + itemslist[j] + '</div>');
                // We need to use 'selectedblock' here because grabbing something by the ID in 'blocklist' may not provide the same answer.  Using 'selectedblock'
                // will work fine until something else is selected; which is long enough for this purpose
            }
        }
    }

    updatepanel() {
        if (this.onhand == null) {
            $("#itempanel").html('none');
        } else {
            $("#itempanel").html(this.onhand.name);
        }
    }

    reload() {
        // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
        // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
        // (this is already done by here) and also any items this block contains.
        // In this function, we also need to add any editable items back into the foods list array.

        if (this.onhand != null) {  // of OnHand is already null... nothing to worry about
            Object.setPrototypeOf(this.onhand, item.prototype);
            switch (this.onhand.name) {
                case 'apple':
                case 'berry':
                case 'treenut':
                case 'mushroom':
                case 'deermeat':
                case 'wolfmeat':
                case 'chickenmeat':  // remember, this is only for edible foods, not uncooked stuff
                    foodlist.push(this.onhand);
                    break;
            }
        }
        this.drawgameblock('img/bucketline_empty.png', 0);
    }

    blacklist(itemname) {
        // This is a function called via onclick from the side panel, which adds or removes an item from the refuse list of this item mover.
        // itemname = string containing the name of the item to add (or remove) from the refuse list

        // First, determine if this item is on the list.
        var x = this.refuselist.indexOf(itemname);
        if (x == -1) {
            // not on the list.  Add it, and change the color of the block to red.
            this.refuselist.push(itemname);
            $("#blacklistpanel" + itemname).css("background-color", "red");
        } else {
            // item was found, so splice out the location
            this.refuselist.splice(x, 1);
            $("#blacklistpanel" + itemname).css("background-color", "green");
        }
    }
}




