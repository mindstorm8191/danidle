class butchershop extends activeblock {
    constructor(gridx, gridy) {
        super(gridx, gridy);
        this.name = 'butchershop';
        this.input = [];      // array holding everything received so far
        this.onhand = [];     // array of anything this block is holding, usually for output
        this.counter = 0;     // how much progress has been made for the current operation
        this.knife = null;
        this.targetknife = '';
        this.drawgameblock('img/butcher.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
    }

    acceptsinput(item) {
        //activeblock function to determine if a given item (name only) can be accepted by this block
        // returns 1 if accepted, 0 if not

        switch (item.name) {
            case 'deaddeer':
            case 'deadchicken':
            case 'deadwolf':
                if (this.input.length < 10) {
                    return 1;
                }
                break;
        }
        return 0;
    }

    receiveitem(item) {
        // activeblock function to receive an actual item (as an object) from another source.

        switch (item.name) {
            case 'deaddeer':
            case 'deadchicken':
            case 'deadwolf':
                if (this.input.length < 10) {
                    this.input.push(item);
                }
                break;
            default:
                console.log('AError in butchershop->reveiveitem: new item (' + item.name + ') not accepted here. This item will be lost');
        }
    }

    possibleoutputs(askedlist) {
        // activeblock function to share what outputs this block can produce
        // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
        //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
        // return type is an array of item names

        return ['rawdeermeat', 'rawchickenmeat', 'rawwolfmeat', 'animalskin', 'feather', 'bone'];
    }

    nextoutput() {
        // activeblock function that returns the name of the next item to be output. if none is available, return ''.

        if (this.onhand.length !== 0) {
            return this.onhand[0].name;
        }
        return '';
    }

    outputitem() {
        // activeblock function that returns the actual item to be collected by the calling block.  Be sure to delete access to the item while doing this
        // This code below is generally all that's needed to manage this
        if (this.onhand.length <= 0) {
            return null;
        }

        var grab = this.onhand[0];
        this.onhand.splice(0, 1);
        return grab;
    }

    getoutput(targetitem) {
        // Returns a specific item that is marked as output for this block, or null if no item of that type was available.

        switch (targetitem) {
            case 'rawdeermeat':
            case 'rawwolfmeat':
            case 'rawchickenmeat':
            case 'bone':
            case 'animalskin':
            case 'feather':
                // Unlike other blocks that have 1 output, we will need to sift though the items stored here to see if we can output the target item
                for (var i = 0; i < this.onhand.length; i++) {
                    if (this.onhand[i].name === targetitem) {
                        var grab = this.onhand[i];
                        this.onhand.splice(i, 1);
                        return grab;
                    }
                }
                break;
        }
        return null;
    }

    update() {
        // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
        if (this.knife == null && this.targetknife !== '') {  // No knife loaded.  Load one now (if possible)
            this.knife = blocklist.findinstorage(this.targetknife, 1);
            return;
        }
        if (this.input.length > 0 && this.onhand.length < 40 && workpoints >= 1) {
            workpoints--;
            this.counter += this.knife.efficiency;
            this.knife.endurance--;
            if (this.knife.endurance <= 0) {
                this.knife = blocklist.findinstorage(this.targetknife, 1);
            }
            if (this.counter >= this.processtime()) {
                this.counter -= this.processtime();
                switch (this.input[0].name) {
                    case 'deaddeer': // dead deer. produces LOTS of meat, and a fair amount of bone

                        // Xetera: condensed to a single loop
                        for (var i = 0; i < 12; i++) {
                            if (i < 4) {
                                this.onhand.push(new item('animalskin'));
                            }
                            if (i < 5){
                                this.onhand.push(new item('bone'));
                            }
                            this.onhand.push(new item('rawdeermeat'));
                        }
                        break;
                    case 'deadwolf':
                        for (var i = 0; i < 8; i++) {
                            this.onhand.push(new item('rawwolfmeat'));
                        }
                        this.onhand.push(new item('bone'));
                        this.onhand.push(new item('bone'));
                        this.onhand.push(new item('animalskin'));
                        this.onhand.push(new item('animalskin'));
                        break;
                    case 'deadchicken':
                        // Xetera: this looks like something you want to put in a function
                        // since you're calling it a lot
                        this.onhand.push(new item('rawchickenmeat'));
                        this.onhand.push(new item('rawchickenmeat'));
                        this.onhand.push(new item('rawchickenmeat'));
                        this.onhand.push(new item('feather'));
                        this.onhand.push(new item('bone'));
                        break;
                }
                this.input.splice(0, 1);  // splice out the input item
            }
            $("#" + this.id + "progress").css({"width": (this.counter * 60 / this.processtime())});
        }
        // Nothing to work on.  Search nearby for something to collect
        var targetlist = ['deaddeer', 'deadwolf', 'deadchicken'];
        for (var i = 0; i < 4; i++) {
            var neighbor = this.getneighbor(i);
            if (neighbor == null) {
                continue;
            }
            for (var j = 0; j < targetlist.length; j++) {
                var pickup = neighbor.getoutput(targetlist[j]);
                if (pickup == null) {
                    continue;
                }
                this.input.push(pickup);
                i = 5;
                j = 4;  // exit both loops now
            }
        }
    }

    drawpanel() {
        // activeblock functino that generates the content
        $("#gamepanel").html('<center><b>Butcher Shop</b></center><br /><br />' +
            'Butchers dead animals, turning them into useful raw meats and other products (such as bones and skins)' +
            this.displaypriority() + '<br />' +
            'Work on hand: <span id="sidepanelinput">' + this.input.length + '</span><br />' +
            'Progress: <span id="sidepanelprogress">' + (Math.floor((this.counter / this.processtime) * 100)) + '</span>%<br />' +
            'Output items: <span id="sidepanelstock">' + this.onhand.length + '</span><br />' +
            '<a href="#" onclick="selectedblock.deleteblock()">Delete Block</a><br /><br >' +
            'Tool Selection:<br /><b>Knife</b><br />');
        if (this.knife == null) {
            $("#gamepanel").append('<span id="sidepanelactivetool">none loaded</span><br />');
        } else {
            $("#gamepanel").append('<span id="sidepanelactivetool">' + this.knife.name + ' (' + (Math.floor((this.knife.endurance / this.knife.totalendurance) * 100)) + '% health)</span><br />');
        }
        this.displaytoollist(this.targetknife, ['flintknife']);
    }

    updatepanel() {
        // activeblock function to update the panel once per tick
        $("#sidepanelinput").html(this.input.length);
        $("#sidepanelprogress").html(Math.floor((this.counter / this.processtime()) * 100));
        $("#sidepanelstock").html(this.onhand.length);
        if (this.knife == null) {
            $("#sidepanelactivetool").html('none loaded');
        } else {
            $("#sidepanelactivetool").html(this.knife.name + ' (' + (Math.floor((this.knife.endurance / this.knife.totalendurance) * 100)) + '% health)');
        }
        this.updatetoollist(this.targetknife, ['flintknife']);
    }

    reload() {
        // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
        // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
        // (this is already done by here) and also any items this block contains.
        // In this function, we also need to add any editable items back into the foods list array.

        if (this.knife != null) Object.setPrototypeOf(this.knife, item.prototype);  // the tool's storage source is an ID number of the target block... so this is already data-loop safe
        for (var i = 0; i < this.input.length; i++) {
            Object.setPrototypeOf(this.input[i], item.prototype);
        }
        for (var i = 0; i < this.onhand.length; i++) {
            Object.setPrototypeOf(this.onhand[i], item.prototype);
        }
        this.drawgameblock('img/butcher.png', 1);
        $("#" + this.id + "progress").css({"width": (this.counter * 60 / this.processtime())});
    }

    picktool(newtool) {
        this.targetknife = newtool;
        $("#sidepaneltool").css("background-color", this.choosetoolcolor(this.targetknife, ''));
        $("#sidepaneltoolflintknife").css("background-color", this.choosetoolcolor(this.targetknife, 'flintknife'));
    }

    processtime() {
        // Returns the total time it takes to complete the current item that is next to be butchered
        if (this.input.length <= 0) {
            return 0;
        }
        switch (this.input[0].name) {
            case 'deaddeer':
                return 40;
            case 'deadwolf':
                return 25;
            case 'deadchicken':
                return 10;
            default:
                console.log('Error in butchershop->processtime: new item (' + this.input[0].name + ') is not handled here');
        }
    }

    deleteblock() {
        // Handles actions that are done before the block is deleted.
        if (this.knife != null) {
            var prevstorage = blocklist.findbyid(this.knife.storagesource);
            if (prevstorage != null && prevstorage.acceptsinput(this.knife)) {
                prevstorage.receiveitem(this.knife);
            }
        }
        super.deleteblock();
    }
}



