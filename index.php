<html>
  <head>
    <title>DanIdle (tentative title)</title>
    <script src="include/jquery.js" type="text/javascript"></script>
    <script src="include/blocks.js"></script>
    <link rel="stylesheet" type="text/css" href="include/style.css">
  </head>
  <body>
    <div class="headerbar">Dan Idle</div>
    <table width="100%" height="100%">
      <tr>
        <td width="250px" valign="top">
          Factory Components:<br />
          Selected: <span id="selectedblock">Delete Tool</span><br />
          <div id="blockselector" style="position:relative;">
            <div id="cursor-2"         class="blockchoice" onclick="setcursor(-2);"><img src="cursor.png" /></div>
            <div id="cursor-1"         class="blockchoice" onclick="setcursor(-1);" style="background-color:red;"><img src="erase.png" /></div>
            <div id="cursorstorage"    class="blockchoice" onclick="setcursor('storage');"><img src="storage.png" /></div>
            <div id="cursorbucketline" class="blockchoice" onclick="setcursor('bucketline');"><img src="bucketline_right.png" /></div>
            <div id="cursormarket"     class="blockchoice" onclick="setcursor('market');"><img src="market.png" /></div>
            <div id="cursorstickmaker" class="blockchoice" onclick="setcursor('stickmaker');"><img src="stick.png" /></div>
            <div id="cursorwoodshovel" class="blockchoice" onclick="setcursor('woodshovel');"><img src="shovel_wood.png" /></div>
          </div>
        </td>
        <td valign="top" height="100%">
          Cash: <span id="showcash">30</span> Workers: <span id="showworkers">0</span> idle,<span id="totalworkers">3</span> total
          <input type="button" id="addworker" value="hire for $100" onclick="hireworker()"> /
          <input type="button" id="cutworker" value="fire worker" onclick="fireworker()"><br />
          <div id="gameholder" onclick="handlegameclick();">
            <div id="game">
              <div id="gridcursor"></div>
            </div>
          </div>
        </td>
        <td id="gamepanel" valign="top" height="100%">
          
        </td>
      </tr>
    </table>
    <script type="text/javascript">
      $(document).ready(startup);
    </script>
  </body>
</html>