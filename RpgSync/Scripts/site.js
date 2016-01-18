var ChatName = "";
var ActivePlayerID;
var templateHelper = new TemplateHelper();
var gameStateHelper = new GameStateHelper();
var gameRules = new GameRules();
var rpgProxy = $.connection.rpgHub;
var isMouseDown;
var isShiftKeyPressed;

$(document).ready(function () {
    //monitor mouseButton and shiftKey
    isMouseDown = 0;
    document.body.onmousedown = function () {
        ++isMouseDown;
    }
    document.body.onmouseup = function () {
        --isMouseDown;
    }
    isShiftKeyPressed = 0;
    $(document).keydown(function (e) {
        if (e.keyCode == 16) {
            ++isShiftKeyPressed;
        }
    });
    $(document).keyup(function (e) {
        if (e.keyCode == 16) {
            --isShiftKeyPressed;
        }
    });
    
    rpgProxy.client.broadcastMessage = function (name, message) {
        //Append
        $('<div/>').text(" [" + moment().format('HH:mm:ss') + "] " + name + ": " + message).appendTo('#chat');
        $("#chat").scrollTop($("#chat")[0].scrollHeight);

    };
    rpgProxy.client.broadcastFirstLogon = function (name) {
        $('<div/>').text(" [" + moment().format('HH:mm:ss') + "] " + name + " has joined the chat.").appendTo('#chat');
        $("#chat").scrollTop($("#chat")[0].scrollHeight);
    };
    rpgProxy.client.broadcastUpdateTile = function (tileId) {
        var index;
        if (scene.updateQueue.tileId.length == 0) {
            index = 0;
        }
        else {
            index = scene.updateQueue.tileId.length;
        }
        scene.updateQueue.tileId[index] = tileId;
    };
    rpgProxy.client.broadcastLoadMap = function (mapID) {
        scene.mapID=mapID;
        scene.loadMap=1;
    };

    $.sendMessage = function sendMessage(name, message) {
        rpgProxy.server.sendMessage(name, message);
    };
    $.sendFirstLogon = function sendMessage(name) {
        rpgProxy.server.firstLogon(name);
    };
    $.updateTile = function updateTile(tileId) {
        rpgProxy.server.updateTile(tileId);
    };
    $.loadMap = function loadMap(mapID) {
        rpgProxy.server.loadMap(mapID);
    };

    //Start connection is in LoadUserPlayer() in Create_Character.js
    LoadUserPlayer(templateHelper);

    $('#Create-New-Character').click(function () { CreateNewCharacterClick(templateHelper); });
    $('#Manage-Characters').click(function () { ManageCharacterClick(templateHelper); });
    $('#Map-Editor').click(function () { startMapEditor(templateHelper); });

    //var newCharacter = new NewCharacter(); // initialize variable to be used to store info to create character
    //$('#interactive-inner').tooltip({
    //    tooltipClass: "Selection-tooltip",
    //    track: true
    //});
    //document.addEventListener("mouseup", function () {
    //    $('#interactive-inner').tooltip("close");
    //});

     $(".chat").resizable({
         handles: 'n'
     });

     //$("#character-info").slimScroll({
     //    height: '84%'
     //});
     $("#party-info").slimScroll({
         height: 'auto',
         railVisible: false,
     });
     $("#chat").slimScroll({
         height: '100%'
     });

});

function alertBox(Text,okFunction,data,size,binding,bindingID) {
    if (Text == '' || Text == undefined) {
        Text = 'Are you sure?'; // set to Default value if no input
    }
    if (size < 0 || size > 2 || size == undefined) {
        size = 0; // default size
    }
    $('#alertBox-Text').html(Text);
    //set size of bounding box
    if (size == 0) {
        $(".alertbox-bounding").attr("class", "alertbox-bounding");
    }
    else if (size == 1){
        $(".alertbox-bounding").attr("class", "alertbox-bounding alertbox-bounding-medium");
    }
    else {
        $(".alertbox-bounding").attr("class", "alertbox-bounding alertbox-bounding-large");
    }
    //check to see if there is something to bind via knockout
    if (binding != undefined) {
        ko.applyBindings(binding, document.getElementById(bindingID));
    }

    //Fade in Div and foreground overlay
    $('#alertbox').fadeIn(100, function () {
        $('#alertbox-buttons').html(templateHelper.alertBoxDefault());
        $('#alertBox-Cancel').click(function () {
            // Close alert Box
            $('#alertbox').fadeOut(50, function () {
                $('#alertBox-Text').html('Are you sure?');
            });
        });
        $('#alertBox-Ok').click(function () {
            var notReady;
            if (okFunction != undefined) {
                notReady = okFunction(data); // execute Callback function
                //Allows function to return a value to defer closing alertbox
                if (notReady == undefined) {
                    notReady = 0;
                }
            }
            // Close alert Box
            if (notReady == 0) {
                $('#alertbox').fadeOut(50, function () {
                    $('#alertBox-Text').html('Are you sure?');
                });
            }
        });
    });
}
