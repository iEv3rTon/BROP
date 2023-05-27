// ==UserScript==
// @name         PX
// @namespace    Watch Canvas
// @version      1.3
// @updateURL    https://github.com/Felipefury/PixelCanvas_px/raw/main/index.user.js
// @downloadURL  https://github.com/Felipefury/PixelCanvas_px/raw/main/index.user.js
// @description  sexo
// @author       GM#4630
// @match        https://pixelcanvas.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pixelcanvas.io
// @grant        none
// ==/UserScript==

(function() {

   var center, pixels = [], offset = { x: 0, y: 0 }, colors = [[255,255,255],[228,228,228],[136,136,136],[34,34,34],[255,167,209],[229,0,0],[229,149,0],[160,106,66],[229,217,0],[148,224,68],[2,190,1],[0,211,221],[0,131,199],[0,0,234],[207,110,228],[130,0,128]];
   var ctx = document.getElementById("gameWindow").getContext("2d");
   var evtSource = new EventSource('https://fanout.fly.dev/?fingerprint=' + Math.random().toString(36).substring(2, 10).repeat(4));

   function init() {

      center = window.location.pathname.substring(2).split(',');

      offset.x = parseInt(center[0]) - (window.innerWidth / 2);
      offset.y = parseInt(center[1]) - (window.innerHeight / 2);

      pixels.forEach(function(pixel, index){

         pixel.increase ? pixel.size += .9 : pixel.size -= 1;

         if(55 < pixel.size) {
            pixel.increase = false;
         };

         if(0 > pixel.size) {
            return delete pixels[index];
         };

         ctx.fillStyle = "rgba(" + colors[pixel.color] + ", 0.7)";
         ctx.beginPath();
         ctx.arc(pixel.x - offset.x, pixel.y - offset.y, pixel.size, 0, 2 * Math.PI);
         ctx.closePath();
         ctx.fill();

      });

      window.requestAnimationFrame(init);
   };

   evtSource.onmessage = function(e) {
      let pixel = JSON.parse(e.data);
      pixel.size = 1;
      pixel.increase = true;
      pixels.unshift(pixel);
   };

   init();

})();
