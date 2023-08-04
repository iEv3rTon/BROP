// ==UserScript==
// @name         Brop Minimap Loader
// @namespace    http://tampermonkey.net/
// @version      2.1.1
// @description  Brop Minimap
// @author       @@
// @grant 		 GM_xmlhttpRequest
// @grant 		 unsafeWindow
// @require		 https://raw.githubusercontent.com/mitchellmebane/GM_fetch/master/GM_fetch.min.js
// @connect		 githubusercontent.com
// @connect		 github.io
// @connect		 github.com
// @connect      localhost
// @connect		 pixelzone.io
// @connect		 pixelplanet.fun
// @connect		 fuckyouarkeros.fun
// @match      *://*.pixelplanet.fun*
// @match      *://*.fuckyouarkeros.fun*
// @homepage     https://github.com/iEv3rTon/BROP
// @updateURL    https://github.com/iEv3rTon/BROP/raw/main/load_minimap.user.js
// @downloadURL  https://github.com/iEv3rTon/BROP/raw/main/load_minimap.user.js
// ==/UserScript==

[
	['.*:\/\/.*pixelplanet\.fun.*', 'https://raw.githubusercontent.com/iEv3rTon/BROP/main/code.js'],
	['.*:\/\/.*fuckyouarkeros\.fun.*', 'https://raw.githubusercontent.com/iEv3rTon/BROP/main/code.js']
].forEach(([reg, src]) => {
	if (new RegExp(reg).test(location.href)) {
		console.log(`trigger "${reg}"\nload code from "${src}"`);


		function t(e) {
			return new Promise((t, r) => {
				e.onload = t;
				e.onerror = r;
				e.onabort = r;
				e.ontimeout = r;
				GM.xmlHttpRequest(e);
			});
		}

		(async () => {
			try {
				const res = await t({ method: "GET", url: `${src}?t=${Date.now()}` })
				const code = res.responseText;
				new Function("const [self, GM, unsafeWindow] = arguments;\n" + code)(self, GM, unsafeWindow);
			} catch(e) {
				console.error(e);
			}
		})();
	}
});
