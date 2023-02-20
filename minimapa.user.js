// ==UserScript==
// @name         Brop
// @namespace    Discord.io/Brasilop
// @version      3.0
// @description  Minimapa Brop
// @coder        Us br mais pika
// @match        https://pixelplanet.fun/*
// @match        http://pixelplanet.fun/*
// @homepage     Discord.io/Brasilop
// @updateURL    http://raw.githubusercontent.com/AsumaGC/Planet-Map/master/minimap.user.js
// @downloadURL  http://raw.githubusercontent.com/AsumaGC/Planet-Map/master/minimap.user.js
// ==/UserScript==

// ╔══╗─────────────╔╗───  ╔══╗───────╔═╗╔╗───  ╔═╗──────────────╔╗─
// ╚║║╝╔══╗╔═╗╔═╗╔╦╗╠╣╔═╗  ║╔╗║╔╦╗╔═╗─║═╣╠╣╔╗─  ║╬║╔╗─╔═╗─╔═╦╗╔═╗║╚╗
// ╔║║╗║║║║║╬║║╩╣║╔╝║║║╬║  ║╔╗║║╔╝║╬╚╗╠═║║║║╚╗  ║╔╝║╚╗║╬╚╗║║║║║╩╣║╔╣
// ╚══╝╚╩╩╝║╔╝╚═╝╚╝─╚╝╚═╝  ╚══╝╚╝─╚══╝╚═╝╚╝╚═╝  ╚╝─╚═╝╚══╝╚╩═╝╚═╝╚═╝
// ────────╚╝────────────  ───────────────────  ────────────────────

Number.prototype.between = function(a, b) {
  var min = Math.min.apply(Math, [a, b]),
    max = Math.max.apply(Math, [a, b]);
  return this > min && this < max;
};
var range = 25;
window.baseTepmlateUrl = 'https://raw.githubusercontent.com/iEv3rTon/ppbr/master/';

window.addEventListener('load', function () {
    //Regular Expression to get coordinates out of URL
    re = /(.*)\/\?p=(\-?(?:\d*)),(\-?(?:\d*))/g;
    //Regular Expression to get coordinates from cursor
    rec = /x\:(\d*) y\:(\d*)/g;
    //gameWindow = document.getElementById("gameWindow");
    //DOM element of the displayed X, Y variables
    coorDOM = null;
    //findCoor();
    //coordinates of the middle of the window
    x_window = 0;
    y_window = 0;
    //coordinates of cursor
    x = 0;
    y = 0;
    //list of all available templates
    template_list = null;
    zoomlevel = 9;
    //toggle options
    toggle_show = true;
    toggle_follow = true; //if minimap is following window, x_window = x and y_window = y;
    zooming_in = false;
    zooming_out = false;
    zoom_time = 100;
    //array with all loaded template-images
    image_list = [];
    counter = 0;
    //templates which are needed in the current area
    needed_templates = null;
    //Cachebreaker to force refresh
    cachebreaker = null;

    var div = document.createElement('div');
    div.setAttribute('class', 'post block bc2');
    div.innerHTML = '<div id="minimapbg" style="position: absolute; right: 1em; top: 1em;">' +
        '<div class="posy" id="posyt" style="background-size: 100%; background-image: url(https://i.imgur.com/2qu5Wch.png); color: rgb(250, 250, 250); font-family:auto;text-align: center; line-height: 42px; vertical-align: middle; width: auto; height: auto; border-radius: 21px; padding: 6px;">' +
        '<div id="minimap-title" style="line-height: 20px; padding: 0px;border: 1px solid red; color: gold; font-weight: bold; font-size: 0.9em; background-color:rgba(0, 0, 0,0.75);"> 🇧🇷 BROP 🇧🇷' +
        '<div id="minimap-text" style="display: none; color: rgb(250, 250, 250); font-size: 20px;"></div>' +
        '<div id="minimap-box" style="position: relative;width:420px;height:300px">' +
        '<canvas id="minimap" style="width: 100%; height: 100%;z-index:1;position:absolute;top:0;left:0;"></canvas>' +
        '<canvas id="minimap-board" style="width: 100%; height: 100%;z-index:2;position:absolute;top:0;left:0;"></canvas>' +
        '<canvas id="minimap-cursor" style="width: 100%; height: 100%;z-index:3;position:absolute;top:0;left:0;"></canvas>' +
        '</div><div id="minimap-config" style="line-height:20px;">' +
        '<span id="hide-map" style="cursor:pointer; padding: 8px;">Ocultar map</span>' +
        '</span> | <span id="follow-mouse" style="cursor:pointer; padding-left: 8px;">' +
        '</span>  Zoom  |<span id="zoom-plus" style="cursor:pointer;font-weight:bold;"> + </span>  /  ' +
        '<span id="zoom-minus" style="cursor:pointer;font-weight:bold;"> - </span>  |' +
        '</div>' +
        '</div>';
    document.body.appendChild(div);
    minimap = document.getElementById("minimap");
    minimap_board = document.getElementById("minimap-board");
    minimap_cursor = document.getElementById("minimap-cursor");
    minimap.width = minimap.offsetWidth;
    minimap_board.width = minimap_board.offsetWidth;
    minimap_cursor.width = minimap_cursor.offsetWidth;
    minimap.height = minimap.offsetHeight;
    minimap_board.height = minimap_board.offsetHeight;
    minimap_cursor.height = minimap_cursor.offsetHeight;
    ctx_minimap = minimap.getContext("2d");
    ctx_minimap_board = minimap_board.getContext("2d");
    ctx_minimap_cursor = minimap_cursor.getContext("2d");

    //No Antialiasing when scaling!
    ctx_minimap.mozImageSmoothingEnabled = false;
    ctx_minimap.webkitImageSmoothingEnabled = false;
    ctx_minimap.msImageSmoothingEnabled = false;
    ctx_minimap.imageSmoothingEnabled = false;

    drawBoard();
    drawCursor();

    document.getElementById("hide-map").onclick = function () {
        console.log("hide map");
        toggle_show = false;
        document.getElementById("minimap-box").style.display = "none";
        document.getElementById("minimap-config").style.display = "none";
        document.getElementById("minimap-text").style.display = "block";
        document.getElementById("minimap-text").innerHTML = "Mostrar Minimapa";
        document.getElementById("minimap-text").style.cursor = "pointer";
    };
    document.getElementById("minimap-text").onclick = function () {
        toggle_show = true;
        document.getElementById("minimap-box").style.display = "block";
        document.getElementById("minimap-config").style.display = "block";
        document.getElementById("minimap-text").style.display = "none";
        document.getElementById("minimap-text").style.cursor = "default";
        loadTemplates();
    };
    document.getElementById("zoom-plus").addEventListener('mousedown', function (e) {
        e.preventDefault();
        zooming_in = true;
        zooming_out = false;
        zoomIn();
    }, false);
    document.getElementById("zoom-minus").addEventListener('mousedown', function (e) {
        e.preventDefault();
        zooming_out = true;
        zooming_in = false;
        zoomOut();
    }, false);
    document.getElementById("zoom-plus").addEventListener('mouseup', function (e) {
        zooming_in = false;
    }, false);
    document.getElementById("zoom-minus").addEventListener('mouseup', function (e) {
        zooming_out = false;
    }, false);
    document.getElementById("follow-mouse").onclick = function () {
        toggle_follow = !toggle_follow;
        if (toggle_follow) {
            this.innerHTML = "Em baixo";
            document.getElementById("minimapbg").style = "position: absolute; right: 1em; top: 1em;";
            loadTemplates();
        } else {
            this.innerHTML = "Em cima";
            document.getElementById("minimapbg").style = "position: absolute; left: 1em; bottpm: 1em;";

        }
    };
    //gameWindow = document.querySelector("canvas");
    addEventListener('mouseup', function (evt) {
        if (!toggle_show)
            return;
        if (!toggle_follow)
            setTimeout(getCenter, 100);
    }, false);

    addEventListener('mousemove', function (evt) {
        if (!toggle_show)
            return;
        coorDOM = document.getElementsByClassName("coorbox")[0];
        coordsXY = coorDOM.innerHTML.split(/(-?\d+)/)
        //console.log(coordsXY);
        x_new = (coordsXY[0].substring(2) + coordsXY[1])*1
        y_new = (coordsXY[2].substring(3) + coordsXY[3])*1;
        //console.log({x_new,y_new});
        if (x != x_new || y != y_new) {
            x = parseInt(x_new);
            y = parseInt(y_new);
            if (toggle_follow) {
                x_window = x;
                y_window = y;
            } else {
                drawCursor();
            }
            loadTemplates();
        }
    }, false);

    updateloop();

}, false);

function updateloop() {

    console.log("Updating Template List");
    // Get JSON of available templates
    var xmlhttp = new XMLHttpRequest();
    var url = window.baseTepmlateUrl + "templates/data.json?" + new Date().getTime();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            template_list = JSON.parse(this.responseText);
            console.log(template_list);
            if (!toggle_follow)
                getCenter();
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    console.log("Refresh got forced.");
    image_list = [];
    loadTemplates();

    setTimeout(updateloop, 60000)
}

function toggleShow() {
    toggle_show = !toggle_show;
    if (toggle_show) {
        document.getElementById("minimap-box").style.display = "block";
        document.getElementById("minimap-config").style.display = "block";
        document.getElementById("minimap-text").style.display = "none";
        document.getElementById("minimapbg").onclick = function () {
        };
        loadTemplates();
    } else {
        document.getElementById("minimap-box").style.display = "none";
        document.getElementById("minimap-config").style.display = "none";
        document.getElementById("minimap-text").style.display = "none";
        document.getElementById("minimap-text").innerHTML = "Show Minimap";
        document.getElementById("minimapbg").onclick = function () {
            toggleShow()
        };
    }
}

function zoomIn() {
    if (!zooming_in)
        return;
    zoomlevel = zoomlevel * 1.1;
    if (zoomlevel > 45) {
        zoomlevel = 45;
        return;
    }
    drawBoard();
    drawCursor();
    loadTemplates();
    setTimeout(zoomIn, zoom_time);
}

function zoomOut() {
    if (!zooming_out)
        return;
    zoomlevel = zoomlevel / 1.1;
    if (zoomlevel < 1) {
        zoomlevel = 1;
        return;
    }
    drawBoard();
    drawCursor();
    loadTemplates();
    setTimeout(zoomOut, zoom_time);
}

function loadTemplates() {
    if (!toggle_show)
        return;
    if (template_list == null)
        return;

    var x_left = x_window * 1 - minimap.width / zoomlevel / 2;
    var x_right = x_window * 1 + minimap.width / zoomlevel / 2;
    var y_top = y_window * 1 - minimap.height / zoomlevel / 2;
    var y_bottom = y_window * 1 + minimap.height / zoomlevel / 2;
    //console.log("x_left : " + x_left);
    //console.log("x_right : " + x_right);
    //console.log("y_top : " + y_top);
    //console.log("y_bottom : " + y_bottom);
    //console.log(template_list);
    var keys = [];
    for (var k in template_list) keys.push(k);
    needed_templates = [];
    var i;
    for (i = 0; i < keys.length; i++) {
        template = keys[i];

        var temp_x = parseInt(template_list[template]["x"]) * 1;
        var temp_y = parseInt(template_list[template]["y"]) * 1;
        var temp_xr = parseInt(template_list[template]["x"]) + parseInt(template_list[template]["width"]);
        var temp_yb = parseInt(template_list[template]["y"]) + parseInt(template_list[template]["height"]);
        // if (temp_xr <= x_left || temp_yb <= y_top || temp_x >= x_right || temp_y >= y_bottom)
        //    continue
        //console.log(x_window, y_window);
        if (!x_window.between(temp_x-range*1, temp_xr+range*1))
            continue
        if (!y_window.between(temp_y-range*1, temp_yb+range*1))
            continue

        needed_templates.push(template);
    }
    if (needed_templates.length == 0 && toggle_show == true) {
        if (zooming_in == false && zooming_out == false) {
            document.getElementById("minimap-box").style.display = "none";
           // document.getElementById("minimap-title").style.display = "none";
            document.getElementById("minimap-text").style.display = "block";
            document.getElementById("minimap-text").innerHTML = "Aqui não há templates.";
            //console.log("Not in ranger")
        }
    } else {
        document.getElementById("minimap-box").style.display = "block";
        document.getElementById("minimap-text").style.display = "none";
        counter = 0;
        for (i = 0; i < needed_templates.length; i++) {
            if (image_list[needed_templates[i]] == null) {
                loadImage(needed_templates[i]);
            } else {
                counter += 1;
                //if last needed image loaded, start drawing
                if (counter == needed_templates.length)
                    drawTemplates();
            }
        }
    }
}

function loadImage(imagename) {
    console.log("    Load image : " + imagename);
    image_list[imagename] = new Image();
    if (cachebreaker != null)
        image_list[imagename].src = window.baseTepmlateUrl +"images/"+template_list[imagename].name;
    else
        image_list[imagename].src = window.baseTepmlateUrl +"images/"+ template_list[imagename].name;
    image_list[imagename].onload = function () {
        counter += 1;
        //if last needed image loaded, start drawing
        if (counter == needed_templates.length)
            drawTemplates();
    }
}

function drawTemplates() {
    ctx_minimap.clearRect(0, 0, minimap.width, minimap.height);
    var x_left = x_window * 1 - minimap.width / zoomlevel / 2;
    var y_top = y_window * 1 - minimap.height / zoomlevel / 2;
    var i;
    for (i = 0; i < needed_templates.length; i++) {
        var template = needed_templates[i];
        var xoff = (template_list[template]["x"] * 1 - x_left * 1) * zoomlevel;
        var yoff = (template_list[template]["y"] * 1 - y_top * 1) * zoomlevel;
        var newwidth = zoomlevel * image_list[template].width;
        var newheight = zoomlevel * image_list[template].height;
        var img = image_list[template];
        ctx_minimap.drawImage(img, xoff, yoff, newwidth, newheight);
        let color = Math.floor(Math.random() * 10) + 1;
        hookForAutoSelectColor(color)

    }
}

function drawBoard() {
    ctx_minimap_board.clearRect(0, 0, minimap_board.width, minimap_board.height);
    if (zoomlevel <= 4.6)
        return;
    ctx_minimap_board.beginPath();
    var bw = minimap_board.width + zoomlevel;
    var bh = minimap_board.height + zoomlevel;
    var xoff_m = (minimap.width / 2) % zoomlevel - zoomlevel;
    var yoff_m = (minimap.height / 2) % zoomlevel - zoomlevel;
    var z = 1 * zoomlevel;

    for (var x = 0; x <= bw; x += z) {
        ctx_minimap_board.moveTo(x + xoff_m, yoff_m);
        ctx_minimap_board.lineTo(x + xoff_m, bh + yoff_m);
    }

    for (var x = 0; x <= bh; x += z) {
        ctx_minimap_board.moveTo(xoff_m, x + yoff_m);
        ctx_minimap_board.lineTo(bw + xoff_m, x + yoff_m);
    }
    ctx_minimap_board.strokeStyle = "black";
    ctx_minimap_board.stroke();
}

function drawCursor() {
    var x_left = x_window * 1 - minimap.width / zoomlevel / 2;
    var x_right = x_window * 1 + minimap.width / zoomlevel / 2;
    var y_top = y_window * 1 - minimap.height / zoomlevel / 2;
    var y_bottom = y_window * 1 + minimap.height / zoomlevel / 2;
    ctx_minimap_cursor.clearRect(0, 0, minimap_cursor.width, minimap_cursor.height);
    if (x < x_left || x > x_right || y < y_top || y > y_bottom)
        return
    xoff_c = x - x_left;
    yoff_c = y - y_top;

    ctx_minimap_cursor.beginPath();
    ctx_minimap_cursor.lineWidth = zoomlevel / 3;
    ctx_minimap_cursor.strokeStyle = "red";
    ctx_minimap_cursor.rect(zoomlevel * xoff_c, zoomlevel * yoff_c, zoomlevel, zoomlevel);
    ctx_minimap_cursor.stroke();

}

function getCenter() {
    var url = window.location.href;
    x_window = url.replace(re, '$2');
    y_window = url.replace(re, '$3');
    if (x_window == url || y_window == url) {
        x_window = 0;
        y_window = 0;
    }
    loadTemplates();
}

function findColor() {
    //all elements with style attributes
    return 15
}
/*
const colorConverter = {
  getClosestColorFromPalette(gamePalette, reservedOffset, r2, g2, b2) {
    const idx = this.convertActualColorFromPalette(gamePalette, reservedOffset, r2, g2, b2);
    return this.getActualColorFromPalette(gamePalette, idx);
  },
  convertActualColorFromPalette(gamePalette, reservedOffset, r2, g2, b2) {
    var _a;
    const resultColorIdx = (_a = gamePalette.map((color2, i2) => {
      if (i2 < reservedOffset)
        return void 0;
      const difference = Math.sqrt((r2 - color2[0]) ** 2 + (g2 - color2[1]) ** 2 + (b2 - color2[2]) ** 2);
      return {
        difference,
        color: color2,
        index: i2
      };
    }).filter((a2) => !!a2).map((a2) => a2).sort((aa2, bb2) => aa2.difference - bb2.difference)[0]) == null ? void 0 : _a.index;
    if (resultColorIdx === void 0)
      throw new Error(`Color not found ${r2}, ${g2}, ${b2} from ${JSON.stringify(gamePalette)}`);
    return resultColorIdx;
  },
  getActualColorFromPalette(gamePalette, color2) {
    const colorData = gamePalette[color2];
    if (!colorData)
      return null;
    return [colorData[0], colorData[1], colorData[2]];
  },
  areColorsEqual(gamePalette, c1, c2) {
    if (c1 === c2) {
      return true;
    }
    const color1 = gamePalette[c1];
    const color2 = gamePalette[c2];
    if (!color1 || !color2)
      return c1 === c2;
    let areEqual = true;
    areEqual = areEqual && color1[0] === color2[0];
    areEqual = areEqual && color1[1] === color2[1];
    areEqual = areEqual && color1[2] === color2[2];
    return areEqual;
  },
  parseColor(colorStr) {
    const r2 = parseInt(colorStr.substr(1, 2), 16);
    const g2 = parseInt(colorStr.substr(3, 2), 16);
    const b2 = parseInt(colorStr.substr(5, 2), 16);
    return [r2, g2, b2];
  }
};*/

/*
const selectCurrentHoverPixelOnOutputImageColorIndexInPalette = createSelector(selectPlacementAutoSelectColor, selectModifierSmolPixels, selectHoverPixel, selectPlacementXOffset, selectPlacementYOffset, selectRenderImageData, selectCanvasPalette, selectCanvasReservedColorCount, (autoSelectColor, modifierSmolPixels, hoverPixel, placementXOffset, placementYOffset, renderImageData, palette2, reservedColorCount) => {
  if (!autoSelectColor)
    return void 0;
  if (!renderImageData)
    return void 0;
  const smolPixelsCanvasSizeModifier = modifierSmolPixels ? 3 : 1;
  const smolPixelsCanvasExtraOffsetToMiddle = Math.floor(smolPixelsCanvasSizeModifier / 2);
  const offsetXInImage = (hoverPixel.x - placementXOffset) * smolPixelsCanvasSizeModifier + smolPixelsCanvasExtraOffsetToMiddle;
  const offsetYInImage = (hoverPixel.y - placementYOffset) * smolPixelsCanvasSizeModifier + smolPixelsCanvasExtraOffsetToMiddle;
  if (offsetXInImage < 0 || offsetXInImage >= renderImageData.width || offsetYInImage < 0 || offsetYInImage >= renderImageData.height)
    return void 0;
  const idx = renderImageData.width * offsetYInImage + offsetXInImage << 2;
  const r2 = renderImageData.data[idx + 0];
  const g2 = renderImageData.data[idx + 1];
  const b2 = renderImageData.data[idx + 2];
  const a2 = renderImageData.data[idx + 3];
  if (r2 == null || g2 == null || b2 == null || a2 == null)
    return void 0;
  if (a2 < 30)
    return void 0;
  //const colorIndex = colorConverter.convertActualColorFromPalette(palette2, reservedColorCount, r2, g2, b2);
  return colorIndex;
});*/
/*
const selectPageStateHoverPixel = createSelector((state) => {
  var _a;
  return (_a = state.canvas.hover) == null ? void 0 : _a[0];
}, (state) => {
  var _a;
  return (_a = state.canvas.hover) == null ? void 0 : _a[1];
}, (hoverPixelX, hoverPixelY) => {
  if (hoverPixelX == null || hoverPixelY == null)
    return void 0;
  return {
    x: hoverPixelX,
    y: hoverPixelY
  };
});*/

function getStoreFromReactInternalEl(el2) {
  var _a, _b, _c;
  if (el2.tag !== 0 || !el2.child)
    return void 0;
  if (el2.child.tag !== 10)
    return void 0;
  if (!el2.child.memoizedProps)
    return void 0;
  const childStore = (_b = (_a = el2.child.memoizedProps) == null ? void 0 : _a.value) == null ? void 0 : _b.store;
  if (!isStoreFromRedux(childStore))
    return void 0;
  const parentStore = (_c = el2.memoizedProps) == null ? void 0 : _c.store;
  if (!isStoreFromRedux(parentStore))
    return void 0;
  if (childStore !== parentStore)
    return void 0;
  return parentStore;
}


function findReactRootContainerEl() {
  return document.getElementById("app");
}

function findStoreInRoot(el2) {
  const reactContainerName = Object.keys(el2).filter((k2) => k2.startsWith("__reactContainer"))[0];
   //console.log("reactContainerName", reactContainerName)
  if (!reactContainerName)
    throw new Error("couldn't find internal react root");
  const root = el2[reactContainerName];
  let checkedReactInternalElement = root;
  while (checkedReactInternalElement.child) {
    const store2 = getStoreFromReactInternalEl(checkedReactInternalElement);
    //console.log('store2', store2)
    if (store2)
      return store2;
    checkedReactInternalElement = checkedReactInternalElement.child;
  }
  return void 0;
}
function createSlice(options) {
  var name2 = options.name;
  if (!name2) {
    throw new Error("`name` is a required option for createSlice");
  }
  var initialState2 = typeof options.initialState == "function" ? options.initialState : createNextState2(options.initialState, function() {
  });
  var reducers = options.reducers || {};
  var reducerNames = Object.keys(reducers);
  var sliceCaseReducersByName = {};
  var sliceCaseReducersByType = {};
  var actionCreators = {};
  reducerNames.forEach(function(reducerName) {
    var maybeReducerWithPrepare = reducers[reducerName];
    var type = getType2(name2, reducerName);
    var caseReducer;
    var prepareCallback;
    if ("reducer" in maybeReducerWithPrepare) {
      caseReducer = maybeReducerWithPrepare.reducer;
      prepareCallback = maybeReducerWithPrepare.prepare;
    } else {
      caseReducer = maybeReducerWithPrepare;
    }
    sliceCaseReducersByName[reducerName] = caseReducer;
    sliceCaseReducersByType[type] = caseReducer;
    actionCreators[reducerName] = prepareCallback ? createAction(type, prepareCallback) : createAction(type);
  });
  function buildReducer() {
    var _c = typeof options.extraReducers === "function" ? executeReducerBuilderCallback(options.extraReducers) : [options.extraReducers], _d = _c[0], extraReducers = _d === void 0 ? {} : _d, _e = _c[1], actionMatchers = _e === void 0 ? [] : _e, _f = _c[2], defaultCaseReducer = _f === void 0 ? void 0 : _f;
    var finalCaseReducers = __spreadValues(__spreadValues({}, extraReducers), sliceCaseReducersByType);
    return createReducer(initialState2, finalCaseReducers, actionMatchers, defaultCaseReducer);
  }
  var _reducer;
  return {
    name: name2,
    reducer: function(state, action) {
      if (!_reducer)
        _reducer = buildReducer();
      return _reducer(state, action);
    },
    actions: actionCreators,
    caseReducers: sliceCaseReducersByName,
    getInitialState: function() {
      if (!_reducer)
        _reducer = buildReducer();
      return _reducer.getInitialState();
    }
  };
}
var reactIs$1 = { exports: {} };
var reactIs_production_min$2 = {};
/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var b$2 = typeof Symbol === "function" && Symbol.for, c$2 = b$2 ? Symbol.for("react.element") : 60103, d$2 = b$2 ? Symbol.for("react.portal") : 60106, e$2 = b$2 ? Symbol.for("react.fragment") : 60107, f$3 = b$2 ? Symbol.for("react.strict_mode") : 60108, g$2 = b$2 ? Symbol.for("react.profiler") : 60114, h$2 = b$2 ? Symbol.for("react.provider") : 60109, k$3 = b$2 ? Symbol.for("react.context") : 60110, l$3 = b$2 ? Symbol.for("react.async_mode") : 60111, m$4 = b$2 ? Symbol.for("react.concurrent_mode") : 60111, n$3 = b$2 ? Symbol.for("react.forward_ref") : 60112, p$3 = b$2 ? Symbol.for("react.suspense") : 60113, q$3 = b$2 ? Symbol.for("react.suspense_list") : 60120, r$1 = b$2 ? Symbol.for("react.memo") : 60115, t$1 = b$2 ? Symbol.for("react.lazy") : 60116, v$2 = b$2 ? Symbol.for("react.block") : 60121, w$1 = b$2 ? Symbol.for("react.fundamental") : 60117, x$1 = b$2 ? Symbol.for("react.responder") : 60118, y$1 = b$2 ? Symbol.for("react.scope") : 60119;
var createNextState2 = fn;
function _defineProperty$6(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function ownKeys$5(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    i2 % 2 ? ownKeys$5(Object(source), true).forEach(function(key) {
      _defineProperty$6(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$5(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function formatProdErrorMessage(code) {
  return "Minified Redux error #" + code + "; visit https://redux.js.org/Errors?code=" + code + " for the full message or use the non-minified dev environment for full errors. ";
}
var $$observable = function() {
  return typeof Symbol === "function" && Symbol.observable || "@@observable";
}();
var reactIs_production_min = {};
/** @license React v17.0.2
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var b = 60103, c = 60106, d = 60107, e = 60108, f = 60114, g = 60109, h = 60110, k = 60112, l = 60113, m = 60120, n = 60115, p = 60116, q = 60121, r = 60122, u = 60117, v = 60129, w = 60131;
if (typeof Symbol === "function" && Symbol.for) {
  var x = Symbol.for;
  b = x("react.element");
  c = x("react.portal");
  d = x("react.fragment");
  e = x("react.strict_mode");
  f = x("react.profiler");
  g = x("react.provider");
  h = x("react.context");
  k = x("react.forward_ref");
  l = x("react.suspense");
  m = x("react.suspense_list");
  n = x("react.memo");
  p = x("react.lazy");
  q = x("react.block");
  r = x("react.server.block");
  u = x("react.fundamental");
  v = x("react.debug_trace_mode");
  w = x("react.legacy_hidden");
}
function y(a2) {
  if (typeof a2 === "object" && a2 !== null) {
    var t2 = a2.$$typeof;
    switch (t2) {
      case b:
        switch (a2 = a2.type, a2) {
          case d:
          case f:
          case e:
          case l:
          case m:
            return a2;
          default:
            switch (a2 = a2 && a2.$$typeof, a2) {
              case h:
              case k:
              case p:
              case n:
              case g:
                return a2;
              default:
                return t2;
            }
        }
      case c:
        return t2;
    }
  }
}
var z = g, A = b, B = k, C = d, D = p, E = n, F = c, G = f, H = e, I = l;
reactIs_production_min.ContextConsumer = h;
reactIs_production_min.ContextProvider = z;
reactIs_production_min.Element = A;
reactIs_production_min.ForwardRef = B;
reactIs_production_min.Fragment = C;
reactIs_production_min.Lazy = D;
reactIs_production_min.Memo = E;
reactIs_production_min.Portal = F;
reactIs_production_min.Profiler = G;
reactIs_production_min.StrictMode = H;
reactIs_production_min.Suspense = I;
reactIs_production_min.isAsyncMode = function() {
  return false;
};
reactIs_production_min.isConcurrentMode = function() {
  return false;
};
reactIs_production_min.isContextConsumer = function(a2) {
  return y(a2) === h;
};
reactIs_production_min.isContextProvider = function(a2) {
  return y(a2) === g;
};
reactIs_production_min.isElement = function(a2) {
  return typeof a2 === "object" && a2 !== null && a2.$$typeof === b;
};
reactIs_production_min.isForwardRef = function(a2) {
  return y(a2) === k;
};
reactIs_production_min.isFragment = function(a2) {
  return y(a2) === d;
};
reactIs_production_min.isLazy = function(a2) {
  return y(a2) === p;
};
reactIs_production_min.isMemo = function(a2) {
  return y(a2) === n;
};
reactIs_production_min.isPortal = function(a2) {
  return y(a2) === c;
};
reactIs_production_min.isProfiler = function(a2) {
  return y(a2) === f;
};
reactIs_production_min.isStrictMode = function(a2) {
  return y(a2) === e;
};
reactIs_production_min.isSuspense = function(a2) {
  return y(a2) === l;
};
reactIs_production_min.isValidElementType = function(a2) {
  return typeof a2 === "string" || typeof a2 === "function" || a2 === d || a2 === f || a2 === v || a2 === e || a2 === l || a2 === m || a2 === w || typeof a2 === "object" && a2 !== null && (a2.$$typeof === p || a2.$$typeof === n || a2.$$typeof === g || a2.$$typeof === h || a2.$$typeof === k || a2.$$typeof === u || a2.$$typeof === q || a2[0] === r) ? true : false;
};
reactIs_production_min.typeOf = y;
function capitalize(string) {
  if (typeof string !== "string") {
    throw new Error(formatMuiErrorMessage(7));
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function createChainedFunction(...funcs) {
  return funcs.reduce((acc, func) => {
    if (func == null) {
      return acc;
    }
    return function chainedFunction(...args) {
      acc.apply(this, args);
      func.apply(this, args);
    };
  }, () => {
  });
}
function getType2(slice2, actionKey) {
  return slice2 + "/" + actionKey;
}

function createAction(type, prepareAction) {
  function actionCreator() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    if (prepareAction) {
      var prepared = prepareAction.apply(void 0, args);
      if (!prepared) {
        throw new Error("prepareAction did not return an object");
      }
      return __spreadValues(__spreadValues({
        type,
        payload: prepared.payload
      }, "meta" in prepared && { meta: prepared.meta }), "error" in prepared && { error: prepared.error });
    }
    return { type, payload: args[0] };
  }
  actionCreator.toString = function() {
    return "" + type;
  };
  actionCreator.type = type;
  actionCreator.match = function(action) {
    return action.type === type;
  };
  return actionCreator;
}

var IS_PRODUCTION = true;
function configureStore(options) {
  var curriedGetDefaultMiddleware = curryGetDefaultMiddleware();
  var _c = options || {}, _d = _c.reducer, reducer2 = _d === void 0 ? void 0 : _d, _e = _c.middleware, middleware2 = _e === void 0 ? curriedGetDefaultMiddleware() : _e, _f = _c.devTools, devTools = _f === void 0 ? true : _f, _g = _c.preloadedState, preloadedState = _g === void 0 ? void 0 : _g, _h = _c.enhancers, enhancers = _h === void 0 ? void 0 : _h;
  var rootReducer;
  if (typeof reducer2 === "function") {
    rootReducer = reducer2;
  } else if (isPlainObject$1(reducer2)) {
    rootReducer = combineReducers(reducer2);
  } else {
    throw new Error('"reducer" is a required argument, and must be a function or an object of functions that can be passed to combineReducers');
  }
  var finalMiddleware = middleware2;
  if (typeof finalMiddleware === "function") {
    finalMiddleware = finalMiddleware(curriedGetDefaultMiddleware);
  }
  var middlewareEnhancer = applyMiddleware.apply(void 0, finalMiddleware);
  var finalCompose = compose$1;
  if (devTools) {
    finalCompose = composeWithDevTools(__spreadValues({
      trace: !IS_PRODUCTION
    }, typeof devTools === "object" && devTools));
  }
  var storeEnhancers = [middlewareEnhancer];
  if (Array.isArray(enhancers)) {
    storeEnhancers = __spreadArray([middlewareEnhancer], enhancers);
  } else if (typeof enhancers === "function") {
    storeEnhancers = enhancers(storeEnhancers);
  }
  var composedEnhancer = finalCompose.apply(void 0, storeEnhancers);
  return createStore(rootReducer, preloadedState, composedEnhancer);
}

//var logger = new Logger();
function n$7(n2) {
  for (var r2 = arguments.length, t2 = Array(r2 > 1 ? r2 - 1 : 0), e2 = 1; e2 < r2; e2++)
    t2[e2 - 1] = arguments[e2];
  throw Error("[Immer] minified error nr: " + n2 + (t2.length ? " " + t2.map(function(n3) {
    return "'" + n3 + "'";
  }).join(",") : "") + ". Find the full error at: https://bit.ly/3cXEKWf");
}
function r$5(n2) {
  return !!n2 && !!n2[Q$2];
}
function t$5(n2) {
  return !!n2 && (function(n3) {
    if (!n3 || typeof n3 != "object")
      return false;
    var r2 = Object.getPrototypeOf(n3);
    if (r2 === null)
      return true;
    var t2 = Object.hasOwnProperty.call(r2, "constructor") && r2.constructor;
    return t2 === Object || typeof t2 == "function" && Function.toString.call(t2) === Z$1;
  }(n2) || Array.isArray(n2) || !!n2[L$1] || !!n2.constructor[L$1] || s(n2) || v$5(n2));
}
function i(n2, r2, t2) {
  t2 === void 0 && (t2 = false), o(n2) === 0 ? (t2 ? Object.keys : nn)(n2).forEach(function(e2) {
    t2 && typeof e2 == "symbol" || r2(e2, n2[e2], n2);
  }) : n2.forEach(function(t3, e2) {
    return r2(e2, t3, n2);
  });
}
function o(n2) {
  var r2 = n2[Q$2];
  return r2 ? r2.i > 3 ? r2.i - 4 : r2.i : Array.isArray(n2) ? 1 : s(n2) ? 2 : v$5(n2) ? 3 : 0;
}
function u$5(n2, r2) {
  return o(n2) === 2 ? n2.has(r2) : Object.prototype.hasOwnProperty.call(n2, r2);
}
function a(n2, r2) {
  return o(n2) === 2 ? n2.get(r2) : n2[r2];
}
function f$4(n2, r2, t2) {
  var e2 = o(n2);
  e2 === 2 ? n2.set(r2, t2) : e2 === 3 ? (n2.delete(r2), n2.add(t2)) : n2[r2] = t2;
}
function c$3(n2, r2) {
  return n2 === r2 ? n2 !== 0 || 1 / n2 == 1 / r2 : n2 != n2 && r2 != r2;
}
function s(n2) {
  return X$1 && n2 instanceof Map;
}
function v$5(n2) {
  return q$8 && n2 instanceof Set;
}
function p$8(n2) {
  return n2.o || n2.t;
}
function l$6(n2) {
  if (Array.isArray(n2))
    return Array.prototype.slice.call(n2);
  var r2 = rn(n2);
  delete r2[Q$2];
  for (var t2 = nn(r2), e2 = 0; e2 < t2.length; e2++) {
    var i2 = t2[e2], o2 = r2[i2];
    o2.writable === false && (o2.writable = true, o2.configurable = true), (o2.get || o2.set) && (r2[i2] = { configurable: true, writable: true, enumerable: o2.enumerable, value: n2[i2] });
  }
  return Object.create(Object.getPrototypeOf(n2), r2);
}
function d$3(n2, e2) {
  return e2 === void 0 && (e2 = false), y$3(n2) || r$5(n2) || !t$5(n2) ? n2 : (o(n2) > 1 && (n2.set = n2.add = n2.clear = n2.delete = h$5), Object.freeze(n2), e2 && i(n2, function(n3, r2) {
    return d$3(r2, true);
  }, true), n2);
}
function h$5() {
  n$7(2);
}
function y$3(n2) {
  return n2 == null || typeof n2 != "object" || Object.isFrozen(n2);
}
function b$3(r2) {
  var t2 = tn[r2];
  return t2 || n$7(18, r2), t2;
}
function m$6(n2, r2) {
  tn[n2] || (tn[n2] = r2);
}
function _$1() {
  return U$2;
}
function j(n2, r2) {
  r2 && (b$3("Patches"), n2.u = [], n2.s = [], n2.v = r2);
}
function O$1(n2) {
  g$3(n2), n2.p.forEach(S$2), n2.p = null;
}
function g$3(n2) {
  n2 === U$2 && (U$2 = n2.l);
}
function w$4(n2) {
  return U$2 = { p: [], l: U$2, h: n2, m: true, _: 0 };
}
function S$2(n2) {
  var r2 = n2[Q$2];
  r2.i === 0 || r2.i === 1 ? r2.j() : r2.O = true;
}
function P$2(r2, e2) {
  e2._ = e2.p.length;
  var i2 = e2.p[0], o2 = r2 !== void 0 && r2 !== i2;
  return e2.h.g || b$3("ES5").S(e2, r2, o2), o2 ? (i2[Q$2].P && (O$1(e2), n$7(4)), t$5(r2) && (r2 = M$2(e2, r2), e2.l || x$3(e2, r2)), e2.u && b$3("Patches").M(i2[Q$2].t, r2, e2.u, e2.s)) : r2 = M$2(e2, i2, []), O$1(e2), e2.u && e2.v(e2.u, e2.s), r2 !== H$3 ? r2 : void 0;
}
function M$2(n2, r2, t2) {
  if (y$3(r2))
    return r2;
  var e2 = r2[Q$2];
  if (!e2)
    return i(r2, function(i2, o3) {
      return A$4(n2, e2, r2, i2, o3, t2);
    }, true), r2;
  if (e2.A !== n2)
    return r2;
  if (!e2.P)
    return x$3(n2, e2.t, true), e2.t;
  if (!e2.I) {
    e2.I = true, e2.A._--;
    var o2 = e2.i === 4 || e2.i === 5 ? e2.o = l$6(e2.k) : e2.o;
    i(e2.i === 3 ? new Set(o2) : o2, function(r3, i2) {
      return A$4(n2, e2, o2, r3, i2, t2);
    }), x$3(n2, o2, false), t2 && n2.u && b$3("Patches").R(e2, t2, n2.u, n2.s);
  }
  return e2.o;
}
function A$4(e2, i2, o2, a2, c2, s2) {
  if (r$5(c2)) {
    var v2 = M$2(e2, c2, s2 && i2 && i2.i !== 3 && !u$5(i2.D, a2) ? s2.concat(a2) : void 0);
    if (f$4(o2, a2, v2), !r$5(v2))
      return;
    e2.m = false;
  }
  if (t$5(c2) && !y$3(c2)) {
    if (!e2.h.F && e2._ < 1)
      return;
    M$2(e2, c2), i2 && i2.A.l || x$3(e2, c2);
  }
}
function x$3(n2, r2, t2) {
  t2 === void 0 && (t2 = false), n2.h.F && n2.m && d$3(r2, t2);
}
function z$4(n2, r2) {
  var t2 = n2[Q$2];
  return (t2 ? p$8(t2) : n2)[r2];
}
function I$3(n2, r2) {
  if (r2 in n2)
    for (var t2 = Object.getPrototypeOf(n2); t2; ) {
      var e2 = Object.getOwnPropertyDescriptor(t2, r2);
      if (e2)
        return e2;
      t2 = Object.getPrototypeOf(t2);
    }
}
function k$5(n2) {
  n2.P || (n2.P = true, n2.l && k$5(n2.l));
}
function E$3(n2) {
  n2.o || (n2.o = l$6(n2.t));
}
function R$2(n2, r2, t2) {
  var e2 = s(r2) ? b$3("MapSet").N(r2, t2) : v$5(r2) ? b$3("MapSet").T(r2, t2) : n2.g ? function(n3, r3) {
    var t3 = Array.isArray(n3), e3 = { i: t3 ? 1 : 0, A: r3 ? r3.A : _$1(), P: false, I: false, D: {}, l: r3, t: n3, k: null, o: null, j: null, C: false }, i2 = e3, o2 = en;
    t3 && (i2 = [e3], o2 = on);
    var u2 = Proxy.revocable(i2, o2), a2 = u2.revoke, f2 = u2.proxy;
    return e3.k = f2, e3.j = a2, f2;
  }(r2, t2) : b$3("ES5").J(r2, t2);
  return (t2 ? t2.A : _$1()).p.push(e2), e2;
}
function D$3(e2) {
  return r$5(e2) || n$7(22, e2), function n2(r2) {
    if (!t$5(r2))
      return r2;
    var e3, u2 = r2[Q$2], c2 = o(r2);
    if (u2) {
      if (!u2.P && (u2.i < 4 || !b$3("ES5").K(u2)))
        return u2.t;
      u2.I = true, e3 = F$3(r2, c2), u2.I = false;
    } else
      e3 = F$3(r2, c2);
    return i(e3, function(r3, t2) {
      u2 && a(u2.t, r3) === t2 || f$4(e3, r3, n2(t2));
    }), c2 === 3 ? new Set(e3) : e3;
  }(e2);
}
function F$3(n2, r2) {
  switch (r2) {
    case 2:
      return new Map(n2);
    case 3:
      return Array.from(n2);
  }
  return l$6(n2);
}
function N$2() {
  function t2(n2, r2) {
    var t3 = s2[n2];
    return t3 ? t3.enumerable = r2 : s2[n2] = t3 = { configurable: true, enumerable: r2, get: function() {
      var r3 = this[Q$2];
      return en.get(r3, n2);
    }, set: function(r3) {
      var t4 = this[Q$2];
      en.set(t4, n2, r3);
    } }, t3;
  }
  function e2(n2) {
    for (var r2 = n2.length - 1; r2 >= 0; r2--) {
      var t3 = n2[r2][Q$2];
      if (!t3.P)
        switch (t3.i) {
          case 5:
            a2(t3) && k$5(t3);
            break;
          case 4:
            o2(t3) && k$5(t3);
        }
    }
  }
  function o2(n2) {
    for (var r2 = n2.t, t3 = n2.k, e3 = nn(t3), i2 = e3.length - 1; i2 >= 0; i2--) {
      var o3 = e3[i2];
      if (o3 !== Q$2) {
        var a3 = r2[o3];
        if (a3 === void 0 && !u$5(r2, o3))
          return true;
        var f2 = t3[o3], s3 = f2 && f2[Q$2];
        if (s3 ? s3.t !== a3 : !c$3(f2, a3))
          return true;
      }
    }
    var v2 = !!r2[Q$2];
    return e3.length !== nn(r2).length + (v2 ? 0 : 1);
  }
  function a2(n2) {
    var r2 = n2.k;
    if (r2.length !== n2.t.length)
      return true;
    var t3 = Object.getOwnPropertyDescriptor(r2, r2.length - 1);
    if (t3 && !t3.get)
      return true;
    for (var e3 = 0; e3 < r2.length; e3++)
      if (!r2.hasOwnProperty(e3))
        return true;
    return false;
  }
  var s2 = {};
  m$6("ES5", { J: function(n2, r2) {
    var e3 = Array.isArray(n2), i2 = function(n3, r3) {
      if (n3) {
        for (var e4 = Array(r3.length), i3 = 0; i3 < r3.length; i3++)
          Object.defineProperty(e4, "" + i3, t2(i3, true));
        return e4;
      }
      var o4 = rn(r3);
      delete o4[Q$2];
      for (var u2 = nn(o4), a3 = 0; a3 < u2.length; a3++) {
        var f2 = u2[a3];
        o4[f2] = t2(f2, n3 || !!o4[f2].enumerable);
      }
      return Object.create(Object.getPrototypeOf(r3), o4);
    }(e3, n2), o3 = { i: e3 ? 5 : 4, A: r2 ? r2.A : _$1(), P: false, I: false, D: {}, l: r2, t: n2, k: i2, o: null, O: false, C: false };
    return Object.defineProperty(i2, Q$2, { value: o3, writable: true }), i2;
  }, S: function(n2, t3, o3) {
    o3 ? r$5(t3) && t3[Q$2].A === n2 && e2(n2.p) : (n2.u && function n3(r2) {
      if (r2 && typeof r2 == "object") {
        var t4 = r2[Q$2];
        if (t4) {
          var e3 = t4.t, o4 = t4.k, f2 = t4.D, c2 = t4.i;
          if (c2 === 4)
            i(o4, function(r3) {
              r3 !== Q$2 && (e3[r3] !== void 0 || u$5(e3, r3) ? f2[r3] || n3(o4[r3]) : (f2[r3] = true, k$5(t4)));
            }), i(e3, function(n4) {
              o4[n4] !== void 0 || u$5(o4, n4) || (f2[n4] = false, k$5(t4));
            });
          else if (c2 === 5) {
            if (a2(t4) && (k$5(t4), f2.length = true), o4.length < e3.length)
              for (var s3 = o4.length; s3 < e3.length; s3++)
                f2[s3] = false;
            else
              for (var v2 = e3.length; v2 < o4.length; v2++)
                f2[v2] = true;
            for (var p2 = Math.min(o4.length, e3.length), l2 = 0; l2 < p2; l2++)
              o4.hasOwnProperty(l2) || (f2[l2] = true), f2[l2] === void 0 && n3(o4[l2]);
          }
        }
      }
    }(n2.p[0]), e2(n2.p));
  }, K: function(n2) {
    return n2.i === 4 ? o2(n2) : a2(n2);
  } });
}
function s(n2) {
  return X$1 && n2 instanceof Map;
}
function o(n2) {
  var r2 = n2[Q$2];
  return r2 ? r2.i > 3 ? r2.i - 4 : r2.i : Array.isArray(n2) ? 1 : s(n2) ? 2 : v$5(n2) ? 3 : 0;
}
function i(n2, r2, t2) {
  t2 === void 0 && (t2 = false), o(n2) === 0 ? (t2 ? Object.keys : nn)(n2).forEach(function(e2) {
    t2 && typeof e2 == "symbol" || r2(e2, n2[e2], n2);
  }) : n2.forEach(function(t3, e2) {
    return r2(e2, t3, n2);
  });
}
var G$3, U$2, W$2 = typeof Symbol != "undefined" && typeof Symbol("x") == "symbol", X$1 = typeof Map != "undefined", q$8 = typeof Set != "undefined", B$2 = typeof Proxy != "undefined" && Proxy.revocable !== void 0 && typeof Reflect != "undefined", H$3 = W$2 ? Symbol.for("immer-nothing") : ((G$3 = {})["immer-nothing"] = true, G$3), L$1 = W$2 ? Symbol.for("immer-draftable") : "__$immer_draftable", Q$2 = W$2 ? Symbol.for("immer-state") : "__$immer_state", Z$1 = "" + Object.prototype.constructor, nn = typeof Reflect != "undefined" && Reflect.ownKeys ? Reflect.ownKeys : Object.getOwnPropertySymbols !== void 0 ? function(n2) {
  return Object.getOwnPropertyNames(n2).concat(Object.getOwnPropertySymbols(n2));
} : Object.getOwnPropertyNames, rn = Object.getOwnPropertyDescriptors || function(n2) {
  var r2 = {};
  return nn(n2).forEach(function(t2) {
    r2[t2] = Object.getOwnPropertyDescriptor(n2, t2);
  }), r2;
}, tn = {}, en = { get: function(n2, r2) {
  if (r2 === Q$2)
    return n2;
  var e2 = p$8(n2);
  if (!u$5(e2, r2))
    return function(n3, r3, t2) {
      var e3, i3 = I$3(r3, t2);
      return i3 ? "value" in i3 ? i3.value : (e3 = i3.get) === null || e3 === void 0 ? void 0 : e3.call(n3.k) : void 0;
    }(n2, e2, r2);
  var i2 = e2[r2];
  return n2.I || !t$5(i2) ? i2 : i2 === z$4(n2.t, r2) ? (E$3(n2), n2.o[r2] = R$2(n2.A.h, i2, n2)) : i2;
}, has: function(n2, r2) {
  return r2 in p$8(n2);
}, ownKeys: function(n2) {
  return Reflect.ownKeys(p$8(n2));
}, set: function(n2, r2, t2) {
  var e2 = I$3(p$8(n2), r2);
  if (e2 == null ? void 0 : e2.set)
    return e2.set.call(n2.k, t2), true;
  if (!n2.P) {
    var i2 = z$4(p$8(n2), r2), o2 = i2 == null ? void 0 : i2[Q$2];
    if (o2 && o2.t === t2)
      return n2.o[r2] = t2, n2.D[r2] = false, true;
    if (c$3(t2, i2) && (t2 !== void 0 || u$5(n2.t, r2)))
      return true;
    E$3(n2), k$5(n2);
  }
  return n2.o[r2] === t2 && typeof t2 != "number" && (t2 !== void 0 || r2 in n2.o) || (n2.o[r2] = t2, n2.D[r2] = true, true);
}, deleteProperty: function(n2, r2) {
  return z$4(n2.t, r2) !== void 0 || r2 in n2.t ? (n2.D[r2] = false, E$3(n2), k$5(n2)) : delete n2.D[r2], n2.o && delete n2.o[r2], true;
}, getOwnPropertyDescriptor: function(n2, r2) {
  var t2 = p$8(n2), e2 = Reflect.getOwnPropertyDescriptor(t2, r2);
  return e2 ? { writable: true, configurable: n2.i !== 1 || r2 !== "length", enumerable: e2.enumerable, value: t2[r2] } : e2;
}, defineProperty: function() {
  n$7(11);
}, getPrototypeOf: function(n2) {
  return Object.getPrototypeOf(n2.t);
}, setPrototypeOf: function() {
  n$7(12);
} }, on = {};
i(en, function(n2, r2) {
  on[n2] = function() {
    return arguments[0] = arguments[0][0], r2.apply(this, arguments);
  };
}), on.deleteProperty = function(r2, t2) {
  return on.set.call(this, r2, t2, void 0);
}, on.set = function(r2, t2, e2) {
  return en.set.call(this, r2[0], t2, e2, r2[0]);
};

var un = function() {
  function e2(r2) {
    var e3 = this;
    this.g = B$2, this.F = true, this.produce = function(r3, i3, o2) {
      if (typeof r3 == "function" && typeof i3 != "function") {
        var u2 = i3;
        i3 = r3;
        var a2 = e3;
        return function(n2) {
          var r4 = this;
          n2 === void 0 && (n2 = u2);
          for (var t2 = arguments.length, e4 = Array(t2 > 1 ? t2 - 1 : 0), o3 = 1; o3 < t2; o3++)
            e4[o3 - 1] = arguments[o3];
          return a2.produce(n2, function(n3) {
            var t3;
            return (t3 = i3).call.apply(t3, [r4, n3].concat(e4));
          });
        };
      }
      var f2;
      if (typeof i3 != "function" && n$7(6), o2 !== void 0 && typeof o2 != "function" && n$7(7), t$5(r3)) {
        var c2 = w$4(e3), s2 = R$2(e3, r3, void 0), v2 = true;
        try {
          f2 = i3(s2), v2 = false;
        } finally {
          v2 ? O$1(c2) : g$3(c2);
        }
        return typeof Promise != "undefined" && f2 instanceof Promise ? f2.then(function(n2) {
          return j(c2, o2), P$2(n2, c2);
        }, function(n2) {
          throw O$1(c2), n2;
        }) : (j(c2, o2), P$2(f2, c2));
      }
      if (!r3 || typeof r3 != "object") {
        if ((f2 = i3(r3)) === void 0 && (f2 = r3), f2 === H$3 && (f2 = void 0), e3.F && d$3(f2, true), o2) {
          var p2 = [], l2 = [];
          b$3("Patches").M(r3, f2, p2, l2), o2(p2, l2);
        }
        return f2;
      }
      n$7(21, r3);
    }, this.produceWithPatches = function(n2, r3) {
      if (typeof n2 == "function")
        return function(r4) {
          for (var t3 = arguments.length, i4 = Array(t3 > 1 ? t3 - 1 : 0), o3 = 1; o3 < t3; o3++)
            i4[o3 - 1] = arguments[o3];
          return e3.produceWithPatches(r4, function(r5) {
            return n2.apply(void 0, [r5].concat(i4));
          });
        };
      var t2, i3, o2 = e3.produce(n2, r3, function(n3, r4) {
        t2 = n3, i3 = r4;
      });
      return typeof Promise != "undefined" && o2 instanceof Promise ? o2.then(function(n3) {
        return [n3, t2, i3];
      }) : [o2, t2, i3];
    }, typeof (r2 == null ? void 0 : r2.useProxies) == "boolean" && this.setUseProxies(r2.useProxies), typeof (r2 == null ? void 0 : r2.autoFreeze) == "boolean" && this.setAutoFreeze(r2.autoFreeze);
  }
  var i2 = e2.prototype;
  return i2.createDraft = function(e3) {
    t$5(e3) || n$7(8), r$5(e3) && (e3 = D$3(e3));
    var i3 = w$4(this), o2 = R$2(this, e3, void 0);
    return o2[Q$2].C = true, g$3(i3), o2;
  }, i2.finishDraft = function(r2, t2) {
    var e3 = r2 && r2[Q$2];
    var i3 = e3.A;
    return j(i3, t2), P$2(void 0, i3);
  }, i2.setAutoFreeze = function(n2) {
    this.F = n2;
  }, i2.setUseProxies = function(r2) {
    r2 && !B$2 && n$7(20), this.g = r2;
  }, i2.applyPatches = function(n2, t2) {
    var e3;
    for (e3 = t2.length - 1; e3 >= 0; e3--) {
      var i3 = t2[e3];
      if (i3.path.length === 0 && i3.op === "replace") {
        n2 = i3.value;
        break;
      }
    }
    e3 > -1 && (t2 = t2.slice(e3 + 1));
    var o2 = b$3("Patches").$;
    return r$5(n2) ? o2(n2, t2) : this.produce(n2, function(n3) {
      return o2(n3, t2);
    });
  }, e2;
}(), an = new un(), fn = an.produce;
var createNextState2 = fn;
const initialState$7 = {
  gameGui: {
    hoverPixel: {
      x: 0,
      y: 0
    },
    viewScale: 1,
    viewCenter: {
      x: 0,
      y: 0
    },
    waitDate: new Date()
  },
  canvas: {
    palette: [],
    reservedColorCount: 0,
    id: 0,
    canvasSize: 1,
    selectedColor: 0,
    maxTimeoutMs: 100,
    timeoutOnBaseMs: 100,
    timeoutOnPlacedMs: 100,
    latestPixelReturnCooldownMs: 0
  }
};

function ownKeys$5(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function createReducer(initialState2, mapOrBuilderCallback, actionMatchers, defaultCaseReducer) {
  if (actionMatchers === void 0) {
    actionMatchers = [];
  }
  var _c = typeof mapOrBuilderCallback === "function" ? executeReducerBuilderCallback(mapOrBuilderCallback) : [mapOrBuilderCallback, actionMatchers, defaultCaseReducer], actionsMap = _c[0], finalActionMatchers = _c[1], finalDefaultCaseReducer = _c[2];
  var getInitialState;
  if (isStateFunction(initialState2)) {
    getInitialState = function() {
      return createNextState2(initialState2(), function() {
      });
    };
  } else {
    var frozenInitialState_1 = createNextState2(initialState2, function() {
    });
    getInitialState = function() {
      return frozenInitialState_1;
    };
  }
  function reducer2(state, action) {
    if (state === void 0) {
      state = getInitialState();
    }
    var caseReducers = __spreadArray([
      actionsMap[action.type]
    ], finalActionMatchers.filter(function(_c2) {
      var matcher = _c2.matcher;
      return matcher(action);
    }).map(function(_c2) {
      var reducer22 = _c2.reducer;
      return reducer22;
    }));
    if (caseReducers.filter(function(cr) {
      return !!cr;
    }).length === 0) {
      caseReducers = [finalDefaultCaseReducer];
    }
    return caseReducers.reduce(function(previousState, caseReducer) {
      if (caseReducer) {
        if (r$5(previousState)) {
          var draft = previousState;
          var result = caseReducer(draft, action);
          if (typeof result === "undefined") {
            return previousState;
          }
          return result;
        } else if (!t$5(previousState)) {
          var result = caseReducer(previousState, action);
          if (typeof result === "undefined") {
            if (previousState === null) {
              return previousState;
            }
            throw Error("A case reducer on a non-draftable value must not return undefined");
          }
          return result;
        } else {
          return createNextState2(previousState, function(draft2) {
            return caseReducer(draft2, action);
          });
        }
      }
      return previousState;
    }, state);
  }
  reducer2.getInitialState = getInitialState;
  return reducer2;
}

var __spreadArray = globalThis && globalThis.__spreadArray || function(to, from2) {
  for (var i2 = 0, il2 = from2.length, j2 = to.length; i2 < il2; i2++, j2++)
    to[j2] = from2[i2];
  return to;
};
function isStateFunction(x2) {
  return typeof x2 === "function";
}
function getType2(slice2, actionKey) {
  return slice2 + "/" + actionKey;
}

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = function(obj, key, value) {
  return key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
};
var __defProp2 = Object.defineProperty;
var __defProps2 = Object.defineProperties;
var __getOwnPropDescs2 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols2 = Object.getOwnPropertySymbols;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __propIsEnum2 = Object.prototype.propertyIsEnumerable;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues2 = (a2, b2) => {
  for (var prop in b2 || (b2 = {}))
    if (__hasOwnProp2.call(b2, prop))
      __defNormalProp2(a2, prop, b2[prop]);
  if (__getOwnPropSymbols2)
    for (var prop of __getOwnPropSymbols2(b2)) {
      if (__propIsEnum2.call(b2, prop))
        __defNormalProp2(a2, prop, b2[prop]);
    }
  return a2;
};
var __spreadProps2 = (a2, b2) => __defProps2(a2, __getOwnPropDescs2(b2));

var __spreadValues = function(a2, b2) {
  for (var prop in b2 || (b2 = {}))
    if (__hasOwnProp.call(b2, prop))
      __defNormalProp(a2, prop, b2[prop]);
  if (__getOwnPropSymbols)
    for (var _i = 0, _c = __getOwnPropSymbols(b2); _i < _c.length; _i++) {
      var prop = _c[_i];
      if (__propIsEnum.call(b2, prop))
        __defNormalProp(a2, prop, b2[prop]);
    }
  return a2;
};
function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(function(key) {
    var reducer2 = reducers[key];
    var initialState2 = reducer2(void 0, {
      type: ActionTypes.INIT
    });
    if (typeof initialState2 === "undefined") {
      throw new Error(formatProdErrorMessage(12));
    }
    if (typeof reducer2(void 0, {
      type: ActionTypes.PROBE_UNKNOWN_ACTION()
    }) === "undefined") {
      throw new Error(formatProdErrorMessage(13));
    }
  });
}
function isPlainObject$2(obj) {
  if (typeof obj !== "object" || obj === null)
    return false;
  var proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
}

function _objectSpread2(target) {
  for (var i2 = 1; i2 < arguments.length; i2++) {
    var source = arguments[i2] != null ? arguments[i2] : {};
    i2 % 2 ? ownKeys$5(Object(source), true).forEach(function(key) {
      _defineProperty$6(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$5(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function formatProdErrorMessage(code) {
  return "Minified Redux error #" + code + "; visit https://redux.js.org/Errors?code=" + code + " for the full message or use the non-minified dev environment for full errors. ";
}
var $$observable = function() {
  return typeof Symbol === "function" && Symbol.observable || "@@observable";
}();
var randomString = function randomString2() {
  return Math.random().toString(36).substring(7).split("").join(".");
};
var createClearListenerMiddleware = function(listenerMap) {
  return function() {
    listenerMap.forEach(cancelActiveListeners);
    listenerMap.clear();
  };
};
var ActionTypes = {
  INIT: "@@redux/INIT" + randomString(),
  REPLACE: "@@redux/REPLACE" + randomString(),
  PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
    return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
  }
};
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }
  return function(createStore2) {
    return function() {
      var store2 = createStore2.apply(void 0, arguments);
      var _dispatch = function dispatch() {
        throw new Error(formatProdErrorMessage(15));
      };
      var middlewareAPI = {
        getState: store2.getState,
        dispatch: function dispatch() {
          return _dispatch.apply(void 0, arguments);
        }
      };
      var chain = middlewares.map(function(middleware2) {
        return middleware2(middlewareAPI);
      });
      _dispatch = compose$1.apply(void 0, chain)(store2.dispatch);
      return _objectSpread2(_objectSpread2({}, store2), {}, {
        dispatch: _dispatch
      });
    };
  };
}
var NOT_FOUND = "NOT_FOUND";
function createStore(reducer2, preloadedState, enhancer) {
  var _ref2;
  if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
    throw new Error(formatProdErrorMessage(0));
  }
  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState;
    preloadedState = void 0;
  }
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error(formatProdErrorMessage(1));
    }
    return enhancer(createStore)(reducer2, preloadedState);
  }
  if (typeof reducer2 !== "function") {
    throw new Error(formatProdErrorMessage(2));
  }
  var currentReducer = reducer2;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }
  function getState() {
    if (isDispatching) {
      throw new Error(formatProdErrorMessage(3));
    }
    return currentState;
  }
  function subscribe(listener2) {
    if (typeof listener2 !== "function") {
      throw new Error(formatProdErrorMessage(4));
    }
    if (isDispatching) {
      throw new Error(formatProdErrorMessage(5));
    }
    var isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener2);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      if (isDispatching) {
        throw new Error(formatProdErrorMessage(6));
      }
      isSubscribed = false;
      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener2);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }
  function dispatch(action) {
    if (!isPlainObject$2(action)) {
      throw new Error(formatProdErrorMessage(7));
    }
    if (typeof action.type === "undefined") {
      throw new Error(formatProdErrorMessage(8));
    }
    if (isDispatching) {
      throw new Error(formatProdErrorMessage(9));
    }
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    var listeners = currentListeners = nextListeners;
    for (var i2 = 0; i2 < listeners.length; i2++) {
      var listener2 = listeners[i2];
      listener2();
    }
    return action;
  }
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error(formatProdErrorMessage(10));
    }
    currentReducer = nextReducer;
    dispatch({
      type: ActionTypes.REPLACE
    });
  }
  function observable() {
    var _ref;
    var outerSubscribe = subscribe;
    return _ref = {
      subscribe: function subscribe2(observer) {
        if (typeof observer !== "object" || observer === null) {
          throw new Error(formatProdErrorMessage(11));
        }
        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }
        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe
        };
      }
    }, _ref[$$observable] = function() {
      return this;
    }, _ref;
  }
  dispatch({
    type: ActionTypes.INIT
  });
  return _ref2 = {
    dispatch,
    subscribe,
    getState,
    replaceReducer
  }, _ref2[$$observable] = observable, _ref2;
}

var assertFunction = function(func, expected) {
  if (typeof func !== "function") {
    throw new TypeError(expected + " is not a function");
  }
};
var defaultErrorHandler = function() {
  var args = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    args[_i] = arguments[_i];
  }
  console.error.apply(console, __spreadArray([alm + "/error"], args));
};
const gameSlice = createSlice({
  initialState: initialState$7,
  name: "game",
  reducers: {
    setHoverPixel: (state, action) => {
      state.gameGui.hoverPixel = action.payload;
    },
    setViewScale: (state, action) => {
      state.gameGui.viewScale = action.payload;
    },
    setViewCenter: (state, action) => {
      state.gameGui.viewCenter = action.payload;
    },
    setPalette: (state, action) => {
      state.canvas.palette = action.payload;
    },
    setReservedColorCount: (state, action) => {
      state.canvas.reservedColorCount = action.payload;
    },
    setCanvasId: (state, action) => {
      state.canvas.id = action.payload;
    },
    setCanvasSize: (state, action) => {
      state.canvas.canvasSize = action.payload;
    },
    setSelectedColor: (state, action) => {
      state.canvas.selectedColor = action.payload;
    },
    setWaitDate: (state, action) => {
      state.gameGui.waitDate = action.payload;
    },
    setMaxTimeoutMs: (state, action) => {
      state.canvas.maxTimeoutMs = action.payload;
    },
    setTimeoutOnBaseMs: (state, action) => {
      state.canvas.timeoutOnBaseMs = action.payload;
    },
    setTimeoutOnPlacedMs: (state, action) => {
      state.canvas.timeoutOnPlacedMs = action.payload;
    },
    setLatestPixelReturnCooldown: (state, action) => {
      state.canvas.latestPixelReturnCooldownMs = action.payload;
    }
  }
});

const usePageReduxStoreDispatch = () => {
  const store = usePageReduxStore();
  if (!store)
    return void 0;
  return store.dispatch;
};

const usePageReduxStoreSelector = (selector) => {
  const store2 = usePageReduxStore();
  const [selectedResult, setSelectedResult] = react.exports.useState();
  react.exports.useEffect(() => {
    if (!store2)
      return void 0;
    setSelectedResult(selector(store2.getState()));
    const unsubscribe = store2.subscribe(() => {
      setSelectedResult(selector(store2.getState()));
    });
    return () => unsubscribe();
  }, [store2, selector]);
  return selectedResult;
};
const listenerMiddleware = createListenerMiddleware();

function createListenerMiddleware(middlewareOptions) {
  var _this = this;
  if (middlewareOptions === void 0) {
    middlewareOptions = {};
  }
  var listenerMap = /* @__PURE__ */ new Map();
  var extra = middlewareOptions.extra, _c = middlewareOptions.onError, onError = _c === void 0 ? defaultErrorHandler : _c;
  assertFunction(onError, "onError");
  var insertEntry = function(entry) {
    entry.unsubscribe = function() {
      return listenerMap.delete(entry.id);
    };
    listenerMap.set(entry.id, entry);
    return function(cancelOptions) {
      entry.unsubscribe();
      if (cancelOptions == null ? void 0 : cancelOptions.cancelActive) {
        cancelActiveListeners(entry);
      }
    };
  };
  var findListenerEntry = function(comparator) {
    for (var _i = 0, _c2 = listenerMap.values(); _i < _c2.length; _i++) {
      var entry = _c2[_i];
      if (comparator(entry)) {
        return entry;
      }
    }
    return void 0;
  };
  var startListening = function(options) {
    var entry = findListenerEntry(function(existingEntry) {
      return existingEntry.effect === options.effect;
    });
    if (!entry) {
      entry = createListenerEntry(options);
    }
    return insertEntry(entry);
  };
  var stopListening = function(options) {
    var _c2 = getListenerEntryPropsFrom(options), type = _c2.type, effect2 = _c2.effect, predicate = _c2.predicate;
    var entry = findListenerEntry(function(entry2) {
      var matchPredicateOrType = typeof type === "string" ? entry2.type === type : entry2.predicate === predicate;
      return matchPredicateOrType && entry2.effect === effect2;
    });
    if (entry) {
      entry.unsubscribe();
      if (options.cancelActive) {
        cancelActiveListeners(entry);
      }
    }
    return !!entry;
  };
  var notifyListener = function(entry, action, api, getOriginalState) {
    return __async(_this, null, function() {
      var internalTaskController, take, listenerError_1;
      return __generator$1(this, function(_c2) {
        switch (_c2.label) {
          case 0:
            internalTaskController = new AbortController();
            take = createTakePattern(startListening, internalTaskController.signal);
            _c2.label = 1;
          case 1:
            _c2.trys.push([1, 3, 4, 5]);
            entry.pending.add(internalTaskController);
            return [4, Promise.resolve(entry.effect(action, assign$1({}, api, {
              getOriginalState,
              condition: function(predicate, timeout) {
                return take(predicate, timeout).then(Boolean);
              },
              take,
              delay: createDelay(internalTaskController.signal),
              pause: createPause(internalTaskController.signal),
              extra,
              signal: internalTaskController.signal,
              fork: createFork(internalTaskController.signal),
              unsubscribe: entry.unsubscribe,
              subscribe: function() {
                listenerMap.set(entry.id, entry);
              },
              cancelActiveListeners: function() {
                entry.pending.forEach(function(controller, _2, set) {
                  if (controller !== internalTaskController) {
                    abortControllerWithReason(controller, listenerCancelled);
                    set.delete(controller);
                  }
                });
              }
            })))];
          case 2:
            _c2.sent();
            return [3, 5];
          case 3:
            listenerError_1 = _c2.sent();
            if (!(listenerError_1 instanceof TaskAbortError)) {
              safelyNotifyError(onError, listenerError_1, {
                raisedBy: "effect"
              });
            }
            return [3, 5];
          case 4:
            abortControllerWithReason(internalTaskController, listenerCompleted);
            entry.pending.delete(internalTaskController);
            return [7];
          case 5:
            return [2];
        }
      });
    });
  };
  var clearListenerMiddleware = createClearListenerMiddleware(listenerMap);
  var middleware2 = function(api) {
    return function(next2) {
      return function(action) {
        if (addListener.match(action)) {
          return startListening(action.payload);
        }
        if (clearAllListeners.match(action)) {
          clearListenerMiddleware();
          return;
        }
        if (removeListener.match(action)) {
          return stopListening(action.payload);
        }
        var originalState = api.getState();
        var getOriginalState = function() {
          if (originalState === INTERNAL_NIL_TOKEN) {
            throw new Error(alm + ": getOriginalState can only be called synchronously");
          }
          return originalState;
        };
        var result;
        try {
          result = next2(action);
          if (listenerMap.size > 0) {
            var currentState = api.getState();
            var listenerEntries = Array.from(listenerMap.values());
            for (var _i = 0, listenerEntries_1 = listenerEntries; _i < listenerEntries_1.length; _i++) {
              var entry = listenerEntries_1[_i];
              var runListener = false;
              try {
                runListener = entry.predicate(action, currentState, originalState);
              } catch (predicateError) {
                runListener = false;
                safelyNotifyError(onError, predicateError, {
                  raisedBy: "predicate"
                });
              }
              if (!runListener) {
                continue;
              }
              notifyListener(entry, action, api, getOriginalState);
            }
          }
        } finally {
          originalState = INTERNAL_NIL_TOKEN;
        }
        return result;
      };
    };
  };
  return {
    middleware: middleware2,
    startListening,
    stopListening,
    clearListeners: clearListenerMiddleware
  };
}
N$2();
//var createSelector = /* @__PURE__ */ createSelectorCreator(defaultMemoize);
function createThunkMiddleware(extraArgument) {
  var middleware2 = function middleware3(_ref) {
    var dispatch = _ref.dispatch, getState = _ref.getState;
    return function(next2) {
      return function(action) {
        if (typeof action === "function") {
          return action(dispatch, getState, extraArgument);
        }
        return next2(action);
      };
    };
  };
  return middleware2;
}
var thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;
var thunkMiddleware = thunk;
function isBoolean(x2) {
  return typeof x2 === "boolean";
}
var __extends = globalThis && globalThis.__extends || function() {
  var extendStatics = function(d2, b2) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d3, b3) {
      d3.__proto__ = b3;
    } || function(d3, b3) {
      for (var p2 in b3)
        if (Object.prototype.hasOwnProperty.call(b3, p2))
          d3[p2] = b3[p2];
    };
    return extendStatics(d2, b2);
  };
  return function(d2, b2) {
    if (typeof b2 !== "function" && b2 !== null)
      throw new TypeError("Class extends value " + String(b2) + " is not a constructor or null");
    extendStatics(d2, b2);
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b2 === null ? Object.create(b2) : (__.prototype = b2.prototype, new __());
  };
}();
function persistReducer(config2, baseReducer) {
  var version = config2.version !== void 0 ? config2.version : DEFAULT_VERSION;
  config2.debug || false;
  var stateReconciler = config2.stateReconciler === void 0 ? autoMergeLevel1 : config2.stateReconciler;
  var getStoredState$1 = config2.getStoredState || getStoredState;
  var timeout = config2.timeout !== void 0 ? config2.timeout : DEFAULT_TIMEOUT;
  var _persistoid = null;
  var _purge = false;
  var _paused = true;
  var conditionalUpdate = function conditionalUpdate2(state) {
    state._persist.rehydrated && _persistoid && !_paused && _persistoid.update(state);
    return state;
  };
  return function(state, action) {
    var _ref = state || {}, _persist = _ref._persist, rest = _objectWithoutProperties$1(_ref, ["_persist"]);
    var restState = rest;
    if (action.type === PERSIST) {
      var _sealed = false;
      var _rehydrate = function _rehydrate2(payload, err) {
        if (!_sealed) {
          action.rehydrate(config2.key, payload, err);
          _sealed = true;
        }
      };
      timeout && setTimeout(function() {
        !_sealed && _rehydrate(void 0, new Error('redux-persist: persist timed out for persist key "'.concat(config2.key, '"')));
      }, timeout);
      _paused = false;
      if (!_persistoid)
        _persistoid = createPersistoid(config2);
      if (_persist) {
        return _objectSpread$3({}, baseReducer(restState, action), {
          _persist
        });
      }
      if (typeof action.rehydrate !== "function" || typeof action.register !== "function")
        throw new Error("redux-persist: either rehydrate or register is not a function on the PERSIST action. This can happen if the action is being replayed. This is an unexplored use case, please open an issue and we will figure out a resolution.");
      action.register(config2.key);
      getStoredState$1(config2).then(function(restoredState) {
        var migrate = config2.migrate || function(s2, v2) {
          return Promise.resolve(s2);
        };
        migrate(restoredState, version).then(function(migratedState) {
          _rehydrate(migratedState);
        }, function(migrateErr) {
          _rehydrate(void 0, migrateErr);
        });
      }, function(err) {
        _rehydrate(void 0, err);
      });
      return _objectSpread$3({}, baseReducer(restState, action), {
        _persist: {
          version,
          rehydrated: false
        }
      });
    } else if (action.type === PURGE) {
      _purge = true;
      action.result(purgeStoredState(config2));
      return _objectSpread$3({}, baseReducer(restState, action), {
        _persist
      });
    } else if (action.type === FLUSH) {
      action.result(_persistoid && _persistoid.flush());
      return _objectSpread$3({}, baseReducer(restState, action), {
        _persist
      });
    } else if (action.type === PAUSE) {
      _paused = true;
    } else if (action.type === REHYDRATE) {
      if (_purge)
        return _objectSpread$3({}, restState, {
          _persist: _objectSpread$3({}, _persist, {
            rehydrated: true
          })
        });
      if (action.key === config2.key) {
        var reducedState = baseReducer(restState, action);
        var inboundState = action.payload;
        var reconciledRest = stateReconciler !== false && inboundState !== void 0 ? stateReconciler(inboundState, state, reducedState, config2) : reducedState;
        var _newState = _objectSpread$3({}, reconciledRest, {
          _persist: _objectSpread$3({}, _persist, {
            rehydrated: true
          })
        });
        return conditionalUpdate(_newState);
      }
    }
    if (!_persist)
      return baseReducer(state, action);
    var newState = baseReducer(restState, action);
    if (newState === restState)
      return state;
    return conditionalUpdate(_objectSpread$3({}, newState, {
      _persist
    }));
  };
}
function _toConsumableArray$1(arr) {
  return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _nonIterableSpread$1();
}
function _nonIterableSpread$1() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}
function _iterableToArray$1(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]")
    return Array.from(iter);
}
function _arrayWithoutHoles$1(arr) {
  if (Array.isArray(arr)) {
    for (var i2 = 0, arr2 = new Array(arr.length); i2 < arr.length; i2++) {
      arr2[i2] = arr[i2];
    }
    return arr2;
  }
}

function ownKeys$2(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
var reactDom = { exports: {} };
var I$2 = Array.isArray, J$1 = Object.prototype.hasOwnProperty, K$1 = { current: null }, L = { key: true, ref: true, __self: true, __source: true };
function M$1(a2, b2, e2) {
  var d2, c2 = {}, k2 = null, h2 = null;
  if (b2 != null)
    for (d2 in b2.ref !== void 0 && (h2 = b2.ref), b2.key !== void 0 && (k2 = "" + b2.key), b2)
      J$1.call(b2, d2) && !L.hasOwnProperty(d2) && (c2[d2] = b2[d2]);
  var g2 = arguments.length - 2;
  if (g2 === 1)
    c2.children = e2;
  else if (1 < g2) {
    for (var f2 = Array(g2), m2 = 0; m2 < g2; m2++)
      f2[m2] = arguments[m2 + 2];
    c2.children = f2;
  }
  if (a2 && a2.defaultProps)
    for (d2 in g2 = a2.defaultProps, g2)
      c2[d2] === void 0 && (c2[d2] = g2[d2]);
  return { $$typeof: l$5, type: a2, key: k2, ref: h2, props: c2, _owner: K$1.current };
}
var createRoot;
var m$1 = reactDom.exports;
{
  createRoot = m$1.createRoot;
}
function configureAppStore() {
  return configureStore({
    reducer: {
      //overlay: persistedOverlayReducer,
      game: gameSlice.reducer,
      //chunkData: chunkDataSlice.reducer,
      //pixelPlacement: pixelPlacementSlice.reducer,
      //processedImages: processedImagesSlice.reducer
    },
    devTools: false,
    middleware(getDefaultMiddleware2) {
      return getDefaultMiddleware2().concat([listenerMiddleware.middleware]);
    }
  });
}
function curryGetDefaultMiddleware() {
  return function curriedGetDefaultMiddleware(options) {
    return getDefaultMiddleware(options);
  };
}
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i2 = 0; i2 < reducerKeys.length; i2++) {
    var key = reducerKeys[i2];
    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);
  var shapeAssertionError;
  try {
    assertReducerShape(finalReducers);
  } catch (e2) {
    shapeAssertionError = e2;
  }
  return function combination(state, action) {
    if (state === void 0) {
      state = {};
    }
    if (shapeAssertionError) {
      throw shapeAssertionError;
    }
    var hasChanged = false;
    var nextState = {};
    for (var _i = 0; _i < finalReducerKeys.length; _i++) {
      var _key = finalReducerKeys[_i];
      var reducer2 = finalReducers[_key];
      var previousStateForKey = state[_key];
      var nextStateForKey = reducer2(previousStateForKey, action);
      if (typeof nextStateForKey === "undefined") {
        action && action.type;
        throw new Error(formatProdErrorMessage(14));
      }
      nextState[_key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}
var MiddlewareArray = function(_super) {
  __extends(MiddlewareArray2, _super);
  function MiddlewareArray2() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var _this = _super.apply(this, args) || this;
    Object.setPrototypeOf(_this, MiddlewareArray2.prototype);
    return _this;
  }
  Object.defineProperty(MiddlewareArray2, Symbol.species, {
    get: function() {
      return MiddlewareArray2;
    },
    enumerable: false,
    configurable: true
  });
  MiddlewareArray2.prototype.concat = function() {
    var arr = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      arr[_i] = arguments[_i];
    }
    return _super.prototype.concat.apply(this, arr);
  };
  MiddlewareArray2.prototype.prepend = function() {
    var arr = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      arr[_i] = arguments[_i];
    }
    if (arr.length === 1 && Array.isArray(arr[0])) {
      return new (MiddlewareArray2.bind.apply(MiddlewareArray2, __spreadArray([void 0], arr[0].concat(this))))();
    }
    return new (MiddlewareArray2.bind.apply(MiddlewareArray2, __spreadArray([void 0], arr.concat(this))))();
  };
  return MiddlewareArray2;
}(Array);
function getDefaultMiddleware(options) {
  if (options === void 0) {
    options = {};
  }
  var _c = options.thunk, thunk2 = _c === void 0 ? true : _c;
  options.immutableCheck;
  options.serializableCheck;
  var middlewareArray = new MiddlewareArray();
  if (thunk2) {
    if (isBoolean(thunk2)) {
      middlewareArray.push(thunkMiddleware);
    } else {
      middlewareArray.push(thunkMiddleware.withExtraArgument(thunk2.extraArgument));
    }
  }
  return middlewareArray;
}

function createSelectorCreator(memoize) {
  for (var _len = arguments.length, memoizeOptionsFromArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    memoizeOptionsFromArgs[_key - 1] = arguments[_key];
  }

  var createSelector = function createSelector() {
    for (var _len2 = arguments.length, funcs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      funcs[_key2] = arguments[_key2];
    }

    var _recomputations = 0;

    var _lastResult; // Due to the intricacies of rest params, we can't do an optional arg after `...funcs`.
    // So, start by declaring the default value here.
    // (And yes, the words 'memoize' and 'options' appear too many times in this next sequence.)


    var directlyPassedOptions = {
      memoizeOptions: undefined
    }; // Normally, the result func or "output selector" is the last arg

    var resultFunc = funcs.pop(); // If the result func is actually an _object_, assume it's our options object

    if (typeof resultFunc === 'object') {
      directlyPassedOptions = resultFunc; // and pop the real result func off

      resultFunc = funcs.pop();
    }

    if (typeof resultFunc !== 'function') {
      throw new Error("createSelector expects an output function after the inputs, but received: [" + typeof resultFunc + "]");
    } // Determine which set of options we're using. Prefer options passed directly,
    // but fall back to options given to createSelectorCreator.


    var _directlyPassedOption = directlyPassedOptions,
        _directlyPassedOption2 = _directlyPassedOption.memoizeOptions,
        memoizeOptions = _directlyPassedOption2 === void 0 ? memoizeOptionsFromArgs : _directlyPassedOption2; // Simplifying assumption: it's unlikely that the first options arg of the provided memoizer
    // is an array. In most libs I've looked at, it's an equality function or options object.
    // Based on that, if `memoizeOptions` _is_ an array, we assume it's a full
    // user-provided array of options. Otherwise, it must be just the _first_ arg, and so
    // we wrap it in an array so we can apply it.

    var finalMemoizeOptions = Array.isArray(memoizeOptions) ? memoizeOptions : [memoizeOptions];
    var dependencies = getDependencies(funcs);
    var memoizedResultFunc = memoize.apply(void 0, [function recomputationWrapper() {
      _recomputations++; // apply arguments instead of spreading for performance.

      return resultFunc.apply(null, arguments);
    }].concat(finalMemoizeOptions)); // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.

    var selector = memoize(function dependenciesChecker() {
      var params = [];
      var length = dependencies.length;

      for (var i = 0; i < length; i++) {
        // apply arguments instead of spreading and mutate a local list of params for performance.
        // @ts-ignore
        params.push(dependencies[i].apply(null, arguments));
      } // apply arguments instead of spreading for performance.


      _lastResult = memoizedResultFunc.apply(null, params);
      return _lastResult;
    });
    Object.assign(selector, {
      resultFunc: resultFunc,
      memoizedResultFunc: memoizedResultFunc,
      dependencies: dependencies,
      lastResult: function lastResult() {
        return _lastResult;
      },
      recomputations: function recomputations() {
        return _recomputations;
      },
      resetRecomputations: function resetRecomputations() {
        return _recomputations = 0;
      }
    });
    return selector;
  }; // @ts-ignore

  return createSelector;
}
var createSelector = /* #__PURE__ */createSelectorCreator(defaultMemoize);
var defaultEqualityCheck = function defaultEqualityCheck(a, b) {
  return a === b;
};

// Cache implementation based on Erik Rasmussen's `lru-memoize`:
// https://github.com/erikras/lru-memoize

var NOT_FOUND = 'NOT_FOUND';

function createSingletonCache(equals) {
  var entry;
  return {
    get: function get(key) {
      if (entry && equals(entry.key, key)) {
        return entry.value;
      }

      return NOT_FOUND;
    },
    put: function put(key, value) {
      entry = {
        key: key,
        value: value
      };
    },
    getEntries: function getEntries() {
      return entry ? [entry] : [];
    },
    clear: function clear() {
      entry = undefined;
    }
  };
}

function createLruCache(maxSize, equals) {
  var entries = [];

  function get(key) {
    var cacheIndex = entries.findIndex(function (entry) {
      return equals(key, entry.key);
    }); // We found a cached entry

    if (cacheIndex > -1) {
      var entry = entries[cacheIndex]; // Cached entry not at top of cache, move it to the top

      if (cacheIndex > 0) {
        entries.splice(cacheIndex, 1);
        entries.unshift(entry);
      }

      return entry.value;
    } // No entry found in cache, return sentinel


    return NOT_FOUND;
  }

  function put(key, value) {
    if (get(key) === NOT_FOUND) {
      // TODO Is unshift slow?
      entries.unshift({
        key: key,
        value: value
      });

      if (entries.length > maxSize) {
        entries.pop();
      }
    }
  }

  function getEntries() {
    return entries;
  }

  function clear() {
    entries = [];
  }

  return {
    get: get,
    put: put,
    getEntries: getEntries,
    clear: clear
  };
}

var defaultEqualityCheck = function defaultEqualityCheck(a, b) {
  return a === b;
};
function createCacheKeyComparator(equalityCheck) {
  return function areArgumentsShallowlyEqual(prev, next) {
    if (prev === null || next === null || prev.length !== next.length) {
      return false;
    } // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.


    var length = prev.length;

    for (var i = 0; i < length; i++) {
      if (!equalityCheck(prev[i], next[i])) {
        return false;
      }
    }

    return true;
  };
}
function getDependencies(funcs) {
  var dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;

  if (!dependencies.every(function (dep) {
    return typeof dep === 'function';
  })) {
    var dependencyTypes = dependencies.map(function (dep) {
      return typeof dep === 'function' ? "function " + (dep.name || 'unnamed') + "()" : typeof dep;
    }).join(', ');
    throw new Error("createSelector expects all input-selectors to be functions, but received the following types: [" + dependencyTypes + "]");
  }

  return dependencies;
}

/** A function that accepts a potential "extra argument" value to be injected later,
 * and returns an instance of the thunk middleware that uses that value
 */
function defaultMemoize(func, equalityCheckOrOptions) {
  var providedOptions = typeof equalityCheckOrOptions === 'object' ? equalityCheckOrOptions : {
    equalityCheck: equalityCheckOrOptions
  };
  var _providedOptions$equa = providedOptions.equalityCheck,
      equalityCheck = _providedOptions$equa === void 0 ? defaultEqualityCheck : _providedOptions$equa,
      _providedOptions$maxS = providedOptions.maxSize,
      maxSize = _providedOptions$maxS === void 0 ? 1 : _providedOptions$maxS,
      resultEqualityCheck = providedOptions.resultEqualityCheck;
  var comparator = createCacheKeyComparator(equalityCheck);
  var cache = maxSize === 1 ? createSingletonCache(comparator) : createLruCache(maxSize, comparator); // we reference arguments instead of spreading them for performance reasons

  function memoized() {
    var value = cache.get(arguments);

    if (value === NOT_FOUND) {
      // @ts-ignore
      value = func.apply(null, arguments);

      if (resultEqualityCheck) {
        var entries = cache.getEntries();
        var matchingEntry = entries.find(function (entry) {
          return resultEqualityCheck(entry.value, value);
        });

        if (matchingEntry) {
          value = matchingEntry.value;
        }
      }

      cache.put(arguments, value);
    }

    return value;
  }

  memoized.clearCache = function () {
    return cache.clear();
  };

  return memoized;
}

function compose$1() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }
  if (funcs.length === 0) {
    return function(arg) {
      return arg;
    };
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce(function(a2, b2) {
    return function() {
      return a2(b2.apply(void 0, arguments));
    };
  });
}
const selectPageStateCanvasPalette = createSelector((state) => state.canvas.palette.abgr, (paletteAbgr) => {
  return Array.from(new Uint32Array(paletteAbgr)).map((abgr) => {
    const b = (abgr & 16711680) >>> 16;
    const g = (abgr & 65280) >>> 8;
    const r = abgr & 255;
    return [r, g, b];
  });
});

function isPlainObject$1(value) {
  if (typeof value !== "object" || value === null)
    return false;
  var proto = Object.getPrototypeOf(value);
  if (proto === null)
    return true;
  var baseProto = proto;
  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto);
  }
  return proto === baseProto;
}

function usePageStoreCurrentSelectedColor() {
  console.log('a')
  const dispatch = useAppDispatch();
  const currentSelectedColor = usePageReduxStoreSelector(selectPageStateCurrentSelectedColor);
  reactExports.useEffect(() => {
    if (currentSelectedColor)
      dispatch(gameSlice.actions.setSelectedColor(currentSelectedColor));
  }, [dispatch, currentSelectedColor]);
}

const store = configureAppStore();

function isStoreFromRedux(store) {
  if (typeof store !== "object")
    return false;
  if (!store.dispatch)
    return false;
  if (!store.getState)
    return false;
  if (!store.subscribe)
    return false;
  return true;
}

function hookForAutoSelectColor(colorIndex) {
  const pageStore = findPageReduxStore();
  const pageDispatch = pageStore.dispatch;
  let lastColorIndex;
  pageStore.subscribe(() => {
    console.log()
    //const colorIndex = selectCurrentHoverPixelOnOutputImageColorIndexInPalette(store.getState());
    //const colorIndex = findColor();
    if (colorIndex !== void 0 && colorIndex !== lastColorIndex) {
      lastColorIndex = colorIndex;
      pageDispatch(pageReduxStoreSelectColorAction(colorIndex));
      console.log('foi?', colorIndex)
    }
  });
}

function findPageReduxStore() {
  const reactRootEl = findReactRootContainerEl();
  console.log(reactRootEl)
  if (!reactRootEl)
    throw new Error("Couldn't find React root container");
  const store2 = findStoreInRoot(reactRootEl);
  console.log('store2:', store2)
  if (!store2)
    throw new Error("Couldn't find Redux store");
  return store2;
}

function pageReduxStoreSelectColorAction(colorIndex) {
  return {
    type: "SELECT_COLOR",
    color: colorIndex
  };
}

function executeAllHooks(retryCounter = 0) {
  try {
    //hookForAutoSelectColor();
    //hookForHoverPixel();
  } catch (error) {
    if (retryCounter > 5) {
      console.log("failed to executeAllHooks multiple times. Rethrowing exception");
      throw error;
    }
    const retryInMs = (retryCounter + 1) * 1e3;
    console.log("failed to executeAllHooks", error, "retrying in", retryInMs);
    setTimeout(() => {
      executeAllHooks(retryCounter + 1);
    }, retryInMs);
  }
}

function init() {
  executeAllHooks();
}

if (document.readyState !== "complete") {
  document.addEventListener("readystatechange", function readyStateChange() {
    if (document.readyState === "complete") {
      document.removeEventListener("readystatechange", readyStateChange);
      //init();
    }
  });
} else {
  //init();
}
