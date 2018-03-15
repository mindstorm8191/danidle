class clayformmaker extends activeblock {
    constructor(gridx, gridy) {
        super(gridx, gridy);
        this.name = 'clayformmaker';
        this.counter = 0;
        this.timetocomplete = 0; // since time to complete objects can vary, this determines how much time is necessary to produce a given item, based on what they are making
        this.input = [];
        this.targetout = '';  // what we want to craft next.  This will depend on what inputs are provided
        this.currentout = '';  // what is currently being crafted.  This will be set to targetout every time something gets finished, or if targetout is blank
        this.onhand = []; // array of anything this block is holding, usually for output
        this.lastshowninput = '';  // text of what input we showed the user last.  Will determine when the output options are updated or refreshed
        this.drawgameblock('img/clayformmaker.png', 1); // use 1 to include a scroll bar, or 0 to exclude that
    }

    acceptsinput(item) {
        //activeblock function to determine if a given item (name only) can be accepted by this block
        // returns 1 if accepted, 0 if not

        if (this.input.length < 5 && item.name === 'mud') {
            return 1;
        }
        return 0;
    }

    receiveitem(item) {
        // activeblock function to receive an actual item (as an object) from another source.
        if (item.name == 'mud') {
            this.input.push(item);
        } else {
            console.log('Error in clayformmaker->receiveitem: item (' + item.name + ') not supported; only accepts mud.  This item has been lost');
        }
    }

    possibleoutputs(askedlist) {
        // activeblock function to share what outputs this block can produce
        // askedlist - for this search, the list of blocks that have already been queried for possible outputs.  This is useful for linked things (such as bucketline movers)
        //             which will ask nearby items what it also provides, and to avoid infinite loops in its search
        // return type is an array of item names

        return ['rawdirtbrick'];
    }

    nextoutput() {
        // activeblock function that returns the name of the next item to be output. if none is available, return ''.
        if (this.onhand.length > 0) {
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
        // Returns a specific item, if it is stored here
        switch (targetitem) {
            case 'rawdirtbrick':
                // Since this block is capable of outputting many other things, we should search the onhand array to see if we have any of the target item.
                for (var i = 0; i < this.onhand.length; i++) {
                    if (this.onhand[i].name !== targetitem) {
                        continue;
                    }
                    var grab = this.onhand[i];
                    this.onhand.splice(i, 1);
                    return grab;
                }
                break;
            // Xetera: you're looking for the default keyword here
            default:
                return null;
        }
    }

    update() {
        // activeblock function that allows any internal processes to be carried out, once per tick.  This is called from a 'global' position
        if (this === selectedblock) {
            console.log('Current output = "' + this.currentout + '". TimetoComplete=' + this.timetocomplete);
        }
        if (this.currentout === '') {
            this.currentout = this.targetout;
            switch (this.currentout) {
                case '':
                    break; // don't even need to worry about updating this
                case 'rawdirtbrick':
                    this.timetocomplete = 15;
                    break;
                default:
                    console.log('Error in clayformmaker->update: target type (' + this.currentout + ') doesnt have a set time');
            }
        }
        // Xetera: Every time you have nested ifs with no else branch and no other functionality you can
        // Xetera: Combine them using && to prevent a pyramid of doom
        if (this.input.length > 0 && this.currentout !== '' && this.onhand.length < 10 && workpoints >= 1) {
            this.counter++;
            workpoints--;
            if (this.counter >= this.timetocomplete) {
                this.counter -= this.timetocomplete;
                this.input.splice(0, 1);
                this.onhand.push(new item(this.currentout));
                this.currentout = this.targetout;
                switch (this.currentout) {
                    case '':
                        this.timetocomplete = 0;
                        break;
                    case 'rawdirtbrick':
                        this.timetocomplete = 15;
                        break;
                    default:
                        console.log('Error in clayformmaker->update: target type (' + this.currentout + ') doesnt have a set time');
                }
            }
            $("#" + this.id + "progress").css({"width": (this.counter * (60 / this.timetocomplete))});
            return;
        }
        // Nothing is on hand currently. Let's serach nearby for something to pick up.  We'll eventually accept many items, so we'll have to account for that, even though we only
        // have 1 right now
        var picklist = ['mud'];
        for (var i = 0; i < 4; i++) {
            var neighbor = this.getneighbor(i);
            if (neighbor == null) {
                continue;
            }
            for (var j = 0; j < picklist.length; j++) {
                var pickitem = neighbor.getoutput(picklist[j]);
                if (pickitem == null) {
                    continue;
                }
                this.input.push(pickitem);
                j = picklist.length + 1;
                i = 5;
            }
        }
    }

    drawpanel() {
        // activeblock function that generates the content
        $("#gamepanel").html('<center><b>Clay Form Maker</b></center><br /><br />' +
            'Forms clay (and mud) into shapes that can be turned into solid objects (after drying)<br />' +
            'Craftable items must be selected, and are dependent on input.<br /><br />' +
            this.displaypriority() + '<br />' +
            'Output items on hand: ' + this.onhand.length + '<br /><br />' +
            '<div id="sidepaneloutput"></div>');
        this.drawoutputlist();
    }

    updatepanel() {
        // Xetera: look at this part, just by using return statements (since this is a void function)
        // Xetera: We removed 3 layers of nesting and now it's readable :thumbsup: damn it this isn't discord

        // activeblock function to update the panel once per tick
        if (this.lastshowninput === '') {
            if (this.input.length > 0) {
                // the input has changed.  We need to re-generate the entire output selection portion
                this.drawoutputlist();
            }
            // We don't need to update the panel; there is nothing in the input, so nothing can happen here
            return;
        }
        if (this.input.length === 0) {
            // there is nothing left in the input.  Re-generate the output section again
            this.drawoutputlist();
            return;
        }
        if (this.lastshowninput !== this.input[0].name) {
            // input type doesn't match what it used to be.
            this.drawoutputlist();
            return;
        }
        this.updateoutputlist();
    }

    reload() {
        // activeblock function to manage regenerating the game while loading.  This is mostly used to re-instantiate items into object, as using localStorage and JSON doesn't
        // hold onto the class instances when re-generating classes.  Therefore we need to use Object.setPrototypeOf(targetobject, classname.prototype) on each block instance
        // (this is already done by here) and also any items this block contains.
        // In this function, we also need to add any editable items back into the foods list array.

        for (var i = 0; i < this.input.length; i++) {
            Object.setPrototypeOf(this.input[i], item.prototype);
        }
        for (var i = 0; i < this.onhand.length; i++) {
            Object.setPrototypeOf(this.onhand[i], item.prototype);
        }
        this.drawgameblock('img/clayformmaker.png', 1);
        $("#" + this.id + "progress").css({"width": (this.counter * (60 / this.timetocomplete))});
    }

    drawoutputlist() {
        // Renders the whole output section based on the current input to choose from.  This is called from drawpanel, and can be called again by updatepanel when the device input changes
        // The entire contents of the sidepaneloutput div will be changed whenever the current input chagnes

//    var box = 'red';
//    if(this.targetout=='') box = 'green';  // the 'none' option is listed for all input types
//    $("#sidepaneloutput").append('<span id="sidepaneloutput_none" class="sidepanelbutton" style="background-color:'+ box +'" onclick="selectedblock.setoutput(\'\')">none</span>');

        if (this.input.length <= 0) {
            $("#sidepaneloutput").html('On hand: nothing<br />' +
                'Add input items (mud or clay) to before selecting output options');
            this.lastshowninput = null;
            return;
        }
        this.lastshowninput = this.input[0].name;
        $("#sidepaneloutput").html('On hand: <span id="sidepanelinput">' + this.input[0].name + ' x' + this.input.length + '</span><br />');
        if (this.timetocomplete == 0) {
            $("#sidepaneloutput").append('Progress: <span id="sidepanelprogress">0</span>%<br />');
        } else {
            $("#sidepaneloutput").append('Progress: <span id="sidepanelprogress">' + Math.floor((this.counter / this.timetocomplete) * 100) + '</span>%<br />');
        }
        $("#gamepanel").append('<span id="sidepaneloutput_none" class="sidepanelbutton" style="background-color:' + this.chooseoutputcolor('') + '" onclick="selectedblock.setoutput(\'\');">none</span>');
        switch (this.input[0].name) {
            case 'mud':
                //     if(this.targetout=='dirtbrick') box = 'green'; else box = 'grey';
                $("#gamepanel").append('<span id="sidepaneloutput_rawdirtbrick" class="sidepanelbutton" style="background-color:' + this.chooseoutputcolor('rawdirtbrick') + '" onclick="selectedblock.setoutput(\'rawdirtbrick\')">dirt brick</span>');
                break;
        }
    }


    updateoutputlist() {
        // Updates the colors of the output selections, based on what the user has clicked.
        // We can assume that the input is not empty, otherwise this won't run... check that it isn't empty anyway.

        if (this.input.length === 0) {
            console.log('Error in clayformmaker->updateoutputlist: this function shouldnt be called when input is empty');
            return;
        }

        $("#sidepaneloutput_none").css("background-color", this.chooseoutputcolor('none'));
        if (this.timetocomplete > 0) {
            $("#sidepanelprogress").html(Math.floor((this.counter / this.timetocomplete) * 100));
        }
        switch (this.lastshowninput.name) {
            case 'mud':
                $("#sidepaneloutput_rawdirtbrick").css("background-color", this.chooseoutputcolor('rawdirtbrick'));
                break;
        }
    }

    chooseoutputcolor(outputname) {
        // Sets a color for a given block.  Use as follows:
        // $("#myblockid").css("background-color", this.chooseoutputcolor('outputtype'));

        if (outputname === 'none') {
            if (this.targetout === '') {
                return 'green';
            } else {
                return 'grey';
            }
        }
        if (this.targetout === outputname) {
            return 'green';
        } else {
            return 'grey';
        }
    }

    setoutput(newoutput) {
        console.log('Now crafting ' + newoutput + '!');
        this.targetout = newoutput;
        this.updateoutputlist();
    }
}




