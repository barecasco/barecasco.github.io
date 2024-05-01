
var Charm    			= function (new_config) {
	var self            = this;
	var pi				= Math.PI;

	var config			= {
		canvasPosType	: "absolute",
		containerSize	: "auto",
		canvasWidth		: 1024,
		canvasHeight	: 768,
		canvasLeft		: "0px",
		canvasTop		: "0px",
		canvasZindex	: 0,
		canvasBgColor	: '#ffffff',
		assetTargetCount: 25
	};

	if (new_config) {
		for (param in new_config) {
			if (new_config.hasOwnProperty(param)) {
				// console.log(param, new_config[param]);
				config[param]	= new_config[param];
			}
		}
	}

	self.config				= config;

	var drawFunctions		= [];
	var activeContext;
    var canvasIterator  	= 0;
	self.assetCount			= 0;
	self.assetTargetCount	= config.assetTargetCount;
	self.onImageReady		= function () {};
	var canvasScaleX		= 1;
	var canvasScaleY 		= 1;
	var readyImage			= function (imageName) {
		if (self.assetCount > self.assetTargetCount) return;
		self.assetCount++;
		let imgname = "";
		if(imageName) imgname = imageName;
		console.log("ready state:", self.assetCount,'from', self.assetTargetCount, imgname);
		if (self.assetCount == self.assetTargetCount){
			self.onImageReady();
			// self.assetCount = 0;
		}
	};

	(function () {
		// requestAnimationFrame failsafe
		window.requestAnimFrame = (function(callback) {
			return 	window.requestAnimationFrame 	||
				window.webkitRequestAnimationFrame 	||
				window.mozRequestAnimationFrame 	||
				window.oRequestAnimationFrame 		||
				window.msRequestAnimationFrame 		||
				function(callback) {
					window.setTimeout (callback, 1000 / 60);
				};
			}
		)();
	}) ();

	var activePropagator		= undefined;
	self.setActivePropagator	= function (inputPropagator) {
		activePropagator 		= inputPropagator;
	};
	self.getActivePropagator	= function () {
		return activePropagator;
	};
	var Canvas2d 				= function (inputContainer, dynamicState) {
        var self 				= this;

		self.x					= 0;
		self.y					= 0;
		var dom					= undefined;
		var context				= undefined;
		var xScale				= 1.0;
		var yScale				= 1.0;
        var touchable			= true;
        self.index              = canvasIterator;
        canvasIterator++;

		var container 			= document.getElementById(inputContainer);
		if (!container) return undefined;

		dom 						= document.createElement("canvas");
		dom.position				= config.canvasPosType;
		dom.width					= config.canvasWidth;
		dom.height					= config.canvasHeight;
		dom.style.position 			= config.canvasPosType;
		dom.style.left 				= config.canvasLeft;
		dom.style.top 				= config.canvasTop;
		dom.style.zIndex 			= config.canvasZindex;
		dom.style.backgroundColor 	= config.canvasBgColor;
		context						= dom.getContext("2d");
        container.appendChild (dom);
        var onResizeSubscribers     = [];

		self.getScaleX			= function() {
			return xScale;
		}
        self.onResize           = function(){
            for(var i = 0; i < onResizeSubscribers.length; i++){
                onResizeSubscribers[i]();
            }
        };
        self.addResizeSubscriber = function(fun){
            onResizeSubscribers.push(fun);
        };
		self.updateSize 		= function () {
			var size			= config.containerSize;
			var canvasHeight	= config.canvasHeight;
			var canvasWidth		= config.canvasWidth;

			switch (size) {
				case ""				:
				case "default"		:
					container.style.width 	= canvasWidth + "px";
					container.style.height 	= canvasHeight + "px";
					xScale 					= 1.0;
					yScale 					= 1.0;
					dom.width			= canvasWidth;
					dom.height			= canvasHeight;
					dom.style.left 		= dom.style.left+"px";
					dom.style.top 		= dom.style.top+"px";
					break;
				case "auto"			:
					var ws 					= container.offsetWidth/canvasWidth;
					var hs 					= container.offsetHeight/canvasHeight;
					xScale 					= Math.min(ws,hs);
					yScale 					= xScale;
					dom.width 			= canvasWidth * xScale;
					dom.height 			= canvasHeight * yScale;
					canvasScaleX		= xScale;
					canvasScaleY		= yScale;
					// in scaled context everything is drawn smaller.....
					context.scale(xScale, yScale);
					dom.style.left 		= ((container.offsetWidth - canvasWidth * xScale)/2) + "px";
					dom.style.top 		= ((container.offsetHeight - canvasHeight * yScale)/2) + "px";
					break;
				case "fit"			:
					xScale 					= container.offsetWidth/canvasWidth;
					yScale 					= container.offsetHeight/canvasHeight;
					dom.width				= container.offsetWidth;
					dom.height 				= container.offsetHeight;
					context.scale (xScale, yScale);
					dom.style.left			= ((container.offsetWidth-canvasWidth*xScale)/2) + "px";
					dom.style.top 			= ((container.offsetHeight-canvasHeight*yScale)/2) + "px";
					break;
				case "fitwidth"		:
					xScale 					= container.offsetWidth/canvasWidth;
					yScale 					= xScale;
					container.style.height 	= (canvasHeight*yScale) + "px";
					dom.width				= container.offsetWidth;
					dom.height				= canvasHeight*yScale;
					context.scale(xScale, yScale);
					dom.style.left			= ((container.offsetWidth-canvasWidth*xScale)/2)+"px";
					dom.style.top			= ((container.offsetHeight-canvasHeight*yScale)/2)+"px";
					break;
				case "fitheight"	:
					yScale 					= container.offsetHeight/canvasHeight;
					xScale 					= yScale;
					container.style.width 	= (canvasWidth*xScale) + "px";
					dom.height 				= container.offsetHeight;
					dom.width 				= canvasWidth*xScale;
					context.scale(xScale, yScale);
					dom.style.left 			= ((container.offsetWidth-canvasWidth*xScale)/2)+"px";
					dom.style.top 			= ((container.offsetHeight-canvasHeight*yScale)/2)+"px";
					break;
            }
            self.onResize();
		};
		self.setAbsolutePos		= function () {
			var curleft = 0;
			var curtop 	= 0;
			var obj		= dom;
			if (obj.offsetParent) {
				do {
					curleft += obj.offsetLeft;
					curtop 	+= obj.offsetTop;
				} while (obj = obj.offsetParent);
			}
			self.x		= curleft;
			self.y		= curtop;
		};
		self.getContext			= function () {
			return context;
		};
		self.getCanvas			= function () {
			return dom;
        };
        if(dynamicState && dynamicState == 'static') return;

		// interaction routine
		var onMouseDowns		= [];
		var onMouseUps			= [];
		var onMouseMoves		= [];
		var mouseDownMasks		= [];
		var downIndices			= {};
		var moveIndices			= {};
        var upIndices			= {};
		var mouseDownLength		= 0;
		var mouseUpLength		= 0;
		var mouseMoveLength		= 0;
		var removedEvents		= [];
        var isInteracting       = false;

		self.addEventListener		= function (sceneNumber, eventType, listener) {
			if (eventType == 'KEY_SPACE_DOWN') {
				document.addEventListener ('keyup', function (event) {
					var keyCode		= event.keyCode;
					if (keyCode == '32') listener();
				}, false);
				return;
			}

			if (eventType == 'MOUSE_DOWN') {
				onMouseDowns.push(listener);
				mouseDownLength++;
				// let keyString = Math.round(Math.random () * 10000000).toString();
				// downIndices[keyString] = mouseDownLength - 1;
				// console.log("add new listener, current onMouseDowns:", onMouseDowns.length);
				// return keyString;
			}

			if (eventType == 'MOUSE_UP') {
				onMouseUps.push(listener);
				mouseUpLength++;
				// let keyString = Math.round(Math.random () * 10000000).toString();
				// upIndices[keyString] = mouseUpLength - 1;
				// console.log("current mouse up events is", onMouseUps.length);
				// return keyString;
			}

			if (eventType == 'MOUSE_MOVE') {
				onMouseMoves.push(listener);
				mouseMoveLength++;
				// let keyString = Math.round(Math.random () * 10000000).toString();
				// moveIndices[keyString] = mouseMoveLength - 1;
				// return keyString;
            }
		};

		self.removeEventListener	= function (eventType, listener) {
			// console.log("removing event listener", eventType);
			if (eventType == 'MOUSE_DOWN') {
				removedEvents.push(function(){
					let index	= onMouseDowns.indexOf(listener);
					// console.log(index);
					if(index < 0) {
						// console.log("event has already erased:", eventType);
						return;
					}
					onMouseDowns.splice(index, 1);

					mouseDownLength--;
					// console.log("remaining mouse down event:", onMouseDowns.length);
				});
				return;
			}

			if (eventType == 'MOUSE_UP') {
				removedEvents.push(function() {
					let index	= onMouseUps.indexOf(listener);
					if(index < 0) {
						console.log("fail to remove event listener", eventType);
						return;
					}
					onMouseUps.splice(index, 1);
					mouseUpLength--;
					// console.log("remaining mouse up event:", onMouseUps.length);
				});
				return;
			}

			if (eventType == 'MOUSE_MOVE') {
				removedEvents.push(function(){
					let index	= onMouseMoves.indexOf(listener);
					if(index < 0) return;
					onMouseMoves.splice(index, 1);
					mouseMoveLength--;
				});
				return;
			}
		};

		self.setMouseDownMask  		= function (listener) {
			let index = onMouseDowns.indexOf(listener);
			mouseDownMasks.push(index);
			// mouseDownMasks.push(-1);
		};

		self.clearMouseDownMask 	= function() {
			mouseDownMasks			= [];
		};

		var flushEventRemoval		= function () {
			// console.log("flush event removal");
			for (var i = 0; i < removedEvents.length; i++) {
				removedEvents[i]();
			}
			removedEvents			= [];
		};
		self.flushEventRemoval 		= flushEventRemoval;

		self.riseEventListener		= function (eventType, listener) {
			let risen;
			let listenerIndex 	= -1;
			switch(eventType) {
				case 'MOUSE_DOWN':
					listenerIndex	= onMouseDowns.indexOf(listener);
					risen			= onMouseDowns.splice(listenerIndex, 1);
					onMouseDowns.push(risen[0]);
					// console.log(risen, onMouseDowns.length);
					break;
				case 'MOUSE_MOVE':
					listenerIndex	= onMouseMoves.indexOf(listener);
					risen			= onMouseMoves.splice(listenerIndex, 1);
					onMouseMoves.push(risen[0]);
					break;
				case 'MOUSE_UP':
					listenerIndex	= onMouseUps.indexOf(listener);
					risen			= onMouseUps.splice(listenerIndex, 1);
					onMouseUps.push(risen[0]);
					break;
			}
		};

		self.purgeEventListener		= function () {
			mouseDownLength 		= 0;
			mouseUpLength			= 0;
			mouseMoveLength			= 0;
			touchDownLength			= 0;
			touchUpLength			= 0;
			touchMoveLength			= 0;
			onMouseDowns			= [];
			onMouseMoves			= [];
			onMouseUps				= [];
			onTouchDowns			= [];
			onTouchMoves			= [];
			onTouchUps				= [];
		};

		function mouseDown(e) {
            if(isInteracting) return;
			isInteracting   = true;
			if (!e) var e 	= window.event;

			let ex, ey;
			if (e.touches) {
				ex = e.touches[0].pageX;
				ey = e.touches[0].pageY;
				if(e.touches.length > 1) return;
			}
			else {
				ex = e.pageX;
				ey = e.pageY;
			}

			var tx = (ex - self.x)/xScale;
			var ty = (ey - self.y)/yScale;
			//------------------------------------------------

			if (mouseDownMasks.length > 0) {
				mouseDownMasks.forEach(function(maskIndex){
					onMouseDowns[maskIndex](tx, ty);
				});
			}
			else {
				for (var i = mouseDownLength-1; i>=0; i--) {
					onMouseDowns[i](tx, ty);
				}
			}

			// console.log("current onmousedowns:", onMouseDowns.length);
			flushEventRemoval ();
			e.preventDefault();
			e.stopPropagation();
		}

		function mouseUp (e) {
			if (!e) var e = window.event;
			if(e.touches) {
				if(e.touches.length > 0) return;
			}
			let ex, ey, tx, ty;
			for (var i = 0; i < mouseUpLength; i++) {
				onMouseUps[i]();
			}

			flushEventRemoval ();
			e.preventDefault();
			e.stopPropagation();
            isInteracting = false;
        }

		function mouseMove (e) {
			if (!e) var e = window.event;

			let ex, ey;
			if (e.touches) {
				ex = e.touches[0].pageX;
				ey = e.touches[0].pageY;
			}
			else {
				ex = e.pageX;
				ey = e.pageY;
			}

			var tx = (ex - self.x)/xScale;
			var ty = (ey - self.y)/yScale;


			for (var i = 0; i<mouseMoveLength; i++) {
				onMouseMoves[i](tx, ty);
			}
			e.preventDefault();
			e.stopPropagation();
        }

        dom.addEventListener('touchstart', mouseDown,false);
        document.addEventListener('touchmove', mouseMove,false);
		document.addEventListener('touchend', mouseUp,false);
		document.addEventListener('touchout', mouseUp, false);
        dom.addEventListener('mousedown', mouseDown,false);
		document.addEventListener('mousemove', mouseMove,false);
		document.addEventListener('mouseup', mouseUp,false);
		document.addEventListener('mouseout', mouseUp, false);
	};

	// BM propagator
	var Propagator				= function (inputContext) {
		var self				= this;
		var context = activeContext	= inputContext;
		var dom					= context.canvas;
		var subscribers			= [];
		var dynscribers			= [];
		var it 					= 0;
		var subsLength			= 0;
		var dynsLength 			= 0;
		var sceneNumber			= 0;
		var lateUpdates 		= [];
		var latelength 			= 0;
		var frameStep 			= 0.0;
		var frameStart 			= undefined;

		self.paused 			= false;
		self.setScene			= function (inputNumber) {
			sceneNumber 		= inputNumber;
		};
		self.start 				= function () {
			requestAnimFrame ( function(hrtime){
				animationUpdate (hrtime);
			});
		};

		self.purgeDynamicSubscribers = function () {
			dynscribers.forEach(function(dyn){
				let index = subscribers.indexOf(dyn);
				subscribers.splice(index, 1);
			});
			subsLength 	= subscribers.length;
			dynscribers	= [];
		};

		self.addSubscriber		= function (en) {
			// if(en.type) console.log(en.type);
			subscribers.push (en);
			subsLength	= subscribers.length;
		};

		self.addActionSubscriber = function(en) {
			dynscribers.push(en);
			dynsLength 	= dynscribers.length;
		};

		self.insertSubscriber 	= function (en, insert_index) {
			lateUpdates.push(function(){
				subscribers.splice (insert_index, 0, en);
				subsLength = subscribers.length;
			})
			latelength = lateUpdates.length;
		};

		self.getSubscriberName = function(index) {
			if (subscribers[index].name){
				return subscribers[index].name;
			}
			return "n/a";

		};

		self.getSubscribeIndex = function (en) {
			return subscribers.indexOf(en);
		}
		self.postfixSubscriber = function (source_sub, target_sub) {
			// summon source_sub to be next to (after) target_sub
			lateUpdates.push(function() {

				let target_index = subscribers.indexOf(target_sub);
				let source_index = subscribers.indexOf(source_sub);
				if (target_index < 0 || source_index < 0) return;
				if(source_index == target_index) return;

				// console.log("doing postfix", source_index, target_index);
				// if(target_index+1 > subscribers.length-1) {
				// 	subscribers.splice (source_index, 1);
				// 	subscribers.push(source_sub);
				// }
				// else {
				// 	subscribers.splice (source_index, 1);
				// 	target_index = subscribers.indexOf(target_sub);
				// 	subscribers.splice (target_index+1, 0, source_sub);

				// }

				subscribers.splice (target_index, 1);
				source_index = subscribers.indexOf(source_sub);
				subscribers.splice (source_index, 0, target_sub);

			});
			latelength = lateUpdates.length;
		};

		self.prefixSubscriber = function (source_sub, target_sub) {
			// summon source_sub to be next to (after) target_sub
			lateUpdates.push(function() {
				let target_index = subscribers.indexOf(target_sub);
				let source_index = subscribers.indexOf(source_sub);
				if (target_index < 0 || source_index < 0) return;
				if (source_index == target_index) return;

				// subscribers.splice (source_index, 1);
				// subscribers.unshift(source_sub);
				// console.log("doing prefix");

				// if(target_index-1 < 0) {
				// 	subscribers.splice (source_index, 1);
				// 	subscribers.unshift(source_sub);
				// }
				// else {
				// 	subscribers.splice (source_index, 1);
				// 	target_index = subscribers.indexOf(target_sub);
				// 	subscribers.splice (target_index-1, 0, source_sub);
				// }

				subscribers.splice (source_index, 1);
				target_index = subscribers.indexOf(target_sub);
				subscribers.splice (target_index, 0, source_sub);
			});
			latelength = lateUpdates.length;
		};

		self.getFirstSubscriber = function() {
			return subscribers[0];
		};

		self.removeSubscriber 	= function (toremove, is_dynamic, callback) {
			let is_dyn = is_dynamic;
			lateUpdates.push(function() {
				if(is_dyn) {
					// console.log("removing dynamic subscribers");
					let toremove_index = dynscribers.indexOf(toremove);
					while(toremove_index >= 0) {
						dynscribers.splice(toremove_index, 1);
						toremove_index = dynscribers.indexOf(toremove);
					}
					dynsLength = dynscribers.length;
				}
				else {
					let toremove_index = subscribers.indexOf(toremove);
					while(toremove_index >= 0) {
						subscribers.splice(toremove_index, 1);
						toremove_index = subscribers.indexOf(toremove);
					}
					subsLength = subscribers.length;
				}

				if(callback) callback();
			})
			latelength = lateUpdates.length;
		};

		self.removeActionSubscriber = function(toremove, callback) {
			lateUpdates.push(function() {
				let toremove_index = dynscribers.indexOf(toremove);
				while(toremove_index >= 0) {
					dynscribers.splice(toremove_index, 1);
					toremove_index = dynscribers.indexOf(toremove);
				}
				dynsLength = dynscribers.length;
				if(callback) callback();
			})
			latelength = lateUpdates.length;
		};

		self.riseSubscriber		= function (obj, is_second) {
			//console.log("599 rising subscriber");
			self.paused = true;
			// console.log("rise subscriber");
			var res = [];
			var index = subscribers.indexOf(obj);
			let slength = subscribers.length;
			var top = subscribers[slength-1];
			for (var i = 0; i < slength-1; i++) {
				if (i != index) {
					res.push(subscribers[i]);
				}
			}
			if (is_second) {
				res.push(obj);
				res.push(top);
			}
			else {
				res.push(top);
				res.push(obj);
			}
			subscribers = res.slice();
			self.paused = false;
			// console.log("current target index", subscribers.indexOf(obj));
		};

		self.riseSubscriberDebug		= function (obj, is_second) {
			console.log("debug rising subscriber");
			self.paused = true;
			// console.log("rise subscriber");
			// var res = [];
			// var index = subscribers.indexOf(obj);
			// let slength = subscribers.length;
			// var top = subscribers[slength-1];
			// for (var i = 0; i < slength-1; i++) {
			// 	if (i != index) {
			// 		res.push(subscribers[i]);
			// 	}
			// }
			// if (is_second) {
			// 	res.push(obj);
			// 	res.push(top);
			// }
			// else {
			// 	res.push(top);
			// 	res.push(obj);
			// }

			var index = subscribers.indexOf(obj);
			let slength = subscribers.length;
			for (var i = index; i < slength-2; i++){
				subscribers[i] = subscribers[i+1]
			}
			subscribers[slength - 2] = obj;
			console.log(subscribers.length);
			self.paused = false;
			// console.log("current target index", subscribers.indexOf(obj));
		};

		self.swapSubscriber		= function (obj, target_index) {
			var index = subscribers.indexOf(obj);
			if(index == target_index) return;
			let swapper 		= subscribers[index];
			subscribers[index]  = {};
			subscribers[index]  = subscribers[target_index];
			subscribers[target_index] = swapper;
			// console.log(subscribers[index]);
			// console.log(subscribers[top]);
			// console.log("---");
		};

		self.riseSubscribers	= function (oblist) {
			var indices = [];
			var res 	= [];
			var slength = subscribers.length;

			// get the list indices
			for (var i = 0; i < oblist.length; i++) {
				indices.push(subscribers.indexOf(oblist[i]));
			}

			for (var i = 0; i < slength; i++) {
				if(indices.indexOf(i) < 0) {
					res.push(subscribers[i]);
				}
			}
			for (var i = 0; i < indices.length; i++) {
				res.push (subscribers[indices[i]]);
			}
			subscribers = res;
		};

		self.frameTimer 		= function (callback, frame_number) {
			var pod 	= {};
			var counter = 0;
			pod.update 	= function(){
				counter++;
				if(counter == frame_number) {
					self.removeSubscriber(pod);
					callback();
				}
			};
			self.addSubscriber(pod);
		};

		var animationUpdate	= function(hrtime) {
			if (frameStart == undefined) frameStart = hrtime;
			frameStep 			= (hrtime - frameStart)/1000.0;

			frameStart = hrtime;
			if (frameStep > 0.1) frameStep = 0.1;
			if (!self.paused) {
				context.clearRect	(0, 0, config.canvasWidth, config.canvasHeight);
				for (it = 0; it < dynsLength; it++) {
					dynscribers[it].update (context, frameStep, sceneNumber);
				}
				for (it = 0; it < subsLength; it++) {
					subscribers[it].update (context, frameStep, sceneNumber);
				}
				for(it = 0; it < latelength; it++) {
					lateUpdates[it]();
				}
				lateUpdates 	= [];
				latelength 		= 0;
				subsLength 		= subscribers.length;
			}
			else {
				console.log("pause detected");
""			}

			requestAnimFrame(animationUpdate);
		};
	};

	var NativeSound				= function (title) {
		var self				= this;

		let tag					= '/mp3';
		let audio 				= document.createElement('audio');
		let supportMp3			= audio.canPlayType('audio/mpeg');
		let supportOgg			= audio.canPlayType('audio/ogg');
		let supportAac			= audio.canPlayType('audio/aac');

		if ( supportMp3 === "maybe") {
			tag 	= '.mp3';
		}
		else if (supportOgg === "maybe") {
			tag		= '.ogg';
		}
		else if (supportAac === "maybe") {
			tag 	= '.aac';
		}

		if ( supportMp3 === "probably") {
			// console.log("browser supports mp3:");
			tag 	= '.mp3';
		}
		else if (supportOgg === "probably") {
			console.log("browser supports ogg");
			tag		= '.ogg';
		}
		else if (supportAac === "probably") {
			console.log("browser supports aac");
			tag 	= '.aac';
		}
		// console.log('created sound tag is ', tag);
		var naudio 				= new Audio ('sounds/'+title+tag);
		self.getAudio			= function(){
			return naudio;
		}
		self.play				= function () {
			naudio.currentTime = 0;
			naudio.play();
		};
		self.stop 				= function () {
			naudio .pause();
			naudio.currentTime = 0;
		};
		self.volume				= function(vol) {
			naudio.volume 		= vol;
		};
		self.setLoop 			= function(bool) {
			if (typeof naudio.loop == 'boolean') {
				naudio.loop = bool;
			}
			else {
				naudio.addEventListener('ended', function() {
					naudio.currentTime = 0;
					naudio.play();
				}, false);
			}
		};
	};

	var Sound					= function (title) {
		var self				= this;
		var audio 				= document.createElement('audio');
		var loaded				= false;
		var attempted			= false;
		var isLooping			= false;
		audio.preload			= 'auto';
		audio.innerHTML 		= "";
		audio.innerHTML 		+= '<source src="sounds/' + title + '.mp3" type="audio/mpeg">';
		audio.innerHTML 		+= '<source src="sounds/' + title + '.ogg" type="audio/ogg">';
		audio.innerHTML			+= 'Audio element is not supported'
		//a.innerHTML += '<source src="sounds/'+s+'.aac" type="audio/mpeg">';
		audio.load();

		// main issue
		audio.addEventListener('canplaythrough', function() {
			loaded 				= true;
			if (attempted) {
				console.log("atempted");
				this.currentTime = 1;
				self.play(isLooping);
				attempted = false;
			}
		});

		self.play				= function (isLoop) {
			isLooping 			= isLoop ? isLoop : false;
			if (!loaded) {
				attempted 		= true;
				return;
			}

			if(isLooping) {
				audio.addEventListener('ended', function() {
					this.currentTime = 1;
					this.play();
				}, false);
			}

			audio.play();
		};
	};

	var NativeVideo				= function (title) {
		var self				= this;
		let tag					= '.mp4';
		let nvideo 				= document.createElement('video');
		let available 			= false;
		// var img 				= new Image();
		var canplays 			= [];

		var playformats			= ['mp4', 'webm', 'ogv'];
		canplays.push(nvideo.canPlayType("video/mp4"));
		canplays.push(nvideo.canPlayType("video/webm"));
		canplays.push(nvideo.canPlayType("video/ogg"));

		for (var index = 0; index < canplays.length; index++) {
			if (canplays[index] == 'maybe') {
				let format = playformats[index];
				gapp.set_debug_text('running ' + format + ' with maybe capability');
				tag = '.' + format;
				nvideo.setAttribute("src",'videos/'+title+tag);
				available = true;
				break;
			}
		}

		for (var index = 0; index < canplays.length; index++) {
			if (canplays[index] == 'probably') {
				let format = playformats[index];
				gapp.set_debug_text('running ' + format + ' with probable capability');
				tag = '.' + format;
				nvideo.setAttribute("src",'videos/'+title+tag);
				available = true;
				break;
			}
		}

		if(!available) {
			console.log("video cant be played");
			return;
		}

		var ready				= false;
		var isDisabled			= false;

		self.width, self.height;
		self.onload 			= function(){
			console.log("NATIVE ONLOAD");
		};

		self.type 				= "video";
		self.transform  		= new Transform(0, 0);
		var tf 					= self.transform;

		self.getVideo			= function(){
			return nvideo;
		}

		self.play				= function () {
			nvideo.play();
		};

		self.pause				= function() {
			nvideo.pause();
		};

		self.stop 				= function () {
			nvideo.pause();
			nvideo.currentTime = 0;
		};

		self.setVolume			= function(vol) {
			nvideo.volume 		= vol;
		};

		self.setCurrentTime 		= function (current_time) {
			nvideo.currentTime 		= current_time;
		};

		self.getCurrentTime 		= function() {
			return nvideo.currentTime;
		};

		nvideo.onended 				= function() {
			self.onended();
		};
		var is_loaded = false;
		nvideo.onloadeddata			= function () {
			if(is_loaded) return;
			if (activePropagator) {
				activePropagator.addSubscriber(self);
			}
			else {
				console.log("No propagator detected");
				return;
			}
			self.video 			= nvideo;
			self.width 			= nvideo.videoWidth;
			self.height 		= nvideo.videoHeight;
			ready				= true;

			self.onload();
			readyImage();
			is_loaded = true;
			console.log('onloadeddata fired');

			// console.log("video height:", self.height);
		};

		nvideo.onloadedmetadata			= function () {
			if(is_loaded) return;
			if (activePropagator) {
				activePropagator.addSubscriber(self);
			}
			else {
				console.log("No propagator detected");
				return;
			}
			self.video 			= nvideo;
			self.width 			= nvideo.videoWidth;
			self.height 		= nvideo.videoHeight;
			ready				= true;

			self.onload();
			readyImage();
			is_loaded = true;
			console.log('onloadedmetadata fired');
			// console.log("video height:", self.height);
		};

		self.disable 			= function() {
			isDisabled			= true;
		};

		self.enable				= function() {
			isDisabled			= false;
		};

		self.setVideoScale	  	= function (new_scale){
			self.width 			= new_scale * nvideo.videoWidth;
			self.height			= new_scale * nvideo.videoHeight;
		};

		self.setAnchorPos		= function(ax, ay) {
			// anchor type wont work on periodic image
			anchorX = ax;
		 	anchorY = ay;
		};

		// self.captureFrame 		= function (activeCanvas) {
			// img.src = activeCanvas.toDataURL();
		// }

		self.update 			= function (cx, frameStep, sceneNumber) {
			if (isDisabled) return;
			if (!ready) {
				return;
			}

			// if (nvideo.readyState == 1) {
				// cx.save ();
				// cx.drawImage (img, 0, 0, config.canvasWidth, config.canvasHeight);
				// cx.restore();
			// }
			// else {
				// cx.save ();
				// cx.translate (tf.x, tf.y);
				// cx.drawImage (nvideo, 0, 0, self.width, self.height);
				// cx.restore ();
			// }

			cx.save ();
			cx.translate (tf.x, tf.y);
			cx.drawImage (nvideo, 0, 0, self.width, self.height);
			cx.restore ();

		};
	};


	self.createNativeVideo		= function(title) {
		return new NativeVideo(title);
	};

	var Animator2d 				= function (propagator) {
		/*
		This class is to animate within allocated time.
		you may use entity.update function to update continuously.
		*/
		var self				= this;
		self.propagator			= propagator;
		self.moveTo 			= function (transform, targetX, targetY, phaseTime, callback) {
			var currentX		= transform.x;
			var currentY		= transform.y;
			var time 			= 0;
			var pod 			= {};
			var deltaX			= targetX - currentX;
			var deltaY			= targetY - currentY;
			pod.update			= function (context, frameStep, sceneNumber) {
				time			+= frameStep;
				if (time > phaseTime) {
					time 	= phaseTime;
					transform.x		= currentX + deltaX;
					transform.y		= currentY + deltaY;
					// self.propagator.removeSubscriber (pod, true);
					self.propagator.removeActionSubscriber (pod);
					if(callback) callback();
					return;
				}
				transform.x		= currentX + time/phaseTime * deltaX;
				transform.y		= currentY + time/phaseTime * deltaY;
			};
			// pod.propagateKey 	= self.propagator.addSubscriber (pod, true);
			pod.propagateKey 	= self.propagator.addActionSubscriber (pod);
			transform.anipod 	= pod;
		};

		self.easeMoveTo 		= function (entity, targetX, targetY, phaseTime, callback) {
			var currentX		= entity.x;
			var currentY		= entity.y;
			var time 			= 0;
			var pod 			= {};
			entity.pod			= pod;
			var deltaX			= targetX - currentX;
			var deltaY			= targetY - currentY;
			var frac 			= 0;
			var val 			= 0;
			pod.update			= function (context, frameStep, sceneNumber) {
				time			+= frameStep;
				if (time > phaseTime) {
					time 			= phaseTime;
					entity.x		= currentX + deltaX;
					// entity.y		= currentY + deltaY;
					// self.propagator.removeSubscriber (pod, true);
					self.propagator.removeActionSubscriber (pod);
					entity.pod 		= undefined;
					if(callback) callback();
					return;
				}
				frac 			= time / phaseTime;
				val				= Math.sin(frac * Math.PI/2);
				entity.x		= currentX + val * deltaX;
				entity.y		= currentY + val * deltaY;

			};
			pod.propagateKey 	= self.propagator.addActionSubscriber (pod);
		};

		self.cancelAnimation	= function(transform, callback) {
			if (transform.anipod)	{
				self.propagator.removeSubscriber (transform.anipod, true, callback);
			}
			else {
				if(callback) callback();
			}
		};
		self.zoomOut 			= function (transform, phaseTime, callback) {
			var time 			= 0;
			var pod 			= {};
			var image, text, w, h;
			var initScaleX 		= transform.defaultScaleX;
			var initScaleY 		= transform.defaultScaleY;
			transform.scaleX	= 0;
			transform.scaleY	= 0;

			// image			= transform.getComponentByType("Image");
			// w				= image.imageWidth;
			// h 				= image.imageHeight;

			pod.update			= function (context, frameStep, sceneNumber) {
				time			+= frameStep;
				if (time > phaseTime) {
					transform.scaleX = initScaleX;
					transform.scaleY = initScaleY;
					time 	= phaseTime;
					// self.propagator.removeSubscriber (pod, true);
					self.propagator.removeActionSubscriber (pod);
					if(callback) callback();
					return;
				}
				var frac 		= time / phaseTime;
				var val			= Math.sin (frac * Math.PI/2);
				transform.scaleX	= val * initScaleX;
				transform.scaleY	= val * initScaleY;
				// entity.x		= startX - val * w/2;
				// entity.y		= startY - val * h/2;

			};
			// pod.propagateKey 	= self.propagator.addSubscriber (pod, true);
			pod.propagateKey 	= self.propagator.addActionSubscriber (pod);
		};
		self.shrink 			= function (transform, phaseTime, callback) {
			var time 			= 0;
			var pod 			= {};
			var image, text, w, h;
			var initScaleX 		= transform.defaultScaleX;
			var initScaleY 		= transform.defaultScaleY;
			transform.scaleX	= 0;
			transform.scaleY	= 0;

			// image			= transform.getComponentByType("Image");
			// w				= image.imageWidth;
			// h 				= image.imageHeight;

			pod.update			= function (context, frameStep, sceneNumber) {
				time			+= frameStep;
				if (time > phaseTime) {
					transform.scaleX = initScaleX;
					transform.scaleY = initScaleY;
					time 	= phaseTime;
					// self.propagator.removeSubscriber (pod, true);
					self.propagator.removeActionSubscriber (pod);
					if(callback) callback();
					return;
				}
				var frac 		= time / phaseTime;
				var val			= Math.cos (frac * Math.PI/2);
				transform.scaleX	= val * initScaleX;
				transform.scaleY	= val * initScaleY;
				// entity.x		= startX - val * w/2;
				// entity.y		= startY - val * h/2;

			};
			// pod.propagateKey 	= self.propagator.addSubscriber (pod, true);
			pod.propagateKey 	= self.propagator.addActionSubscriber (pod);
		};
		self.fadeIn				= function (entity, phaseTime, callback) {
			var time 			= 0;
			var pod 			= {};
			pod.update			= function (context, frameStep, sceneNumber) {
				time			+= frameStep;
				if (time > phaseTime) {
					time 			= phaseTime;
					entity.alpha	= 1;
					self.propagator.removeActionSubscriber (pod);
					if(callback) callback();
				}
				var frac 		= time / phaseTime;
				entity.alpha	= frac;
			};
			pod.propagateKey 	= self.propagator.addActionSubscriber (pod);

		};
		self.fadeOut			= function(entity, phaseTime, callback) {
			// console.log('entity:', entity);
			var time 			= 0;
			var pod 			= {};
			// if (entity.alpha <= 0) return;
			pod.update			= function (context, frameStep, sceneNumber) {
				time			+= frameStep;
				if (time > phaseTime) {
					entity.alpha = 0;
					time 	= phaseTime;
					// self.propagator.removeSubscriber (pod, true);
					self.propagator.removeActionSubscriber (pod);
					if(callback) callback();
					return;
				}
				var frac 		= time / phaseTime;
				entity.alpha	= 1-frac;
			};
			// pod.propagateKey 	= self.propagator.addSubscriber (pod, true);
			pod.propagateKey 	= self.propagator.addActionSubscriber (pod);
		};
		self.spark				= function (transform, targetX, targetY, phaseTime, callback) {
			var time 			= 0;
			transform.scaleX	= 0;
			transform.scaleY	= 0;
			var pod 			= {};
			transform.x 		= targetX;
			transform.y			= targetY;
			let startX			= transform.x;
			let startY			= transform.y;
			let moveX			= 0;
			let moveY			= -400;
			let speedX			= 0;
			let speedY 			= -300;
			let accX			= -50 + Math.random()*100;
			let accY			= (2 * speedY - moveY) * 1.2;
			let rot				= -180 + Math.random() * 360;
			pod.update			= function (context, frameStep, sceneNumber) {
				time			+= frameStep;
				// console.log("sparking");
				if (time > phaseTime) {
					time 	= phaseTime;
					// self.propagator.removeSubscriber (pod, true);
					self.propagator.removeActionSubscriber (pod);
					if(callback) callback();
				}
				var frac 		= time / phaseTime;
				var val			= Math.sin (frac * Math.PI);
				transform.rotation = rot * frac;
				transform.scaleX	= val;
				transform.scaleY	= val;
				transform.x		= startX + (speedX - 0.5*accX*frac) * frac;
				transform.y		= startY + (speedY - 0.5*accY*frac) * frac;
			};
			// pod.propagateKey 	= self.propagator.addSubscriber (pod, true);
			pod.propagateKey 	= self.propagator.addActionSubscriber (pod);
		};

		self.pulse				= function (transform, targetX, targetY, phaseTime, callback) {
			var time 			= 0;
			transform.scaleX	= 0;
			transform.scaleY	= 0;
			var pod 			= {};
			transform.x 		= targetX;
			transform.y			= targetY;
			pod.update			= function (context, frameStep, sceneNumber) {
				time			+= frameStep;
				// console.log("sparking");
				if (time > phaseTime) {
					time 	= phaseTime;
					// self.propagator.removeSubscriber (pod, true);
					self.propagator.removeActionSubscriber (pod);
					if(callback) callback();
				}
				var frac 		= time / phaseTime;
				var val			= 1 + 0.4*Math.sin (frac * Math.PI);
				transform.scaleX	= val;
				transform.scaleY	= val;
			};
			// pod.propagateKey 	= self.propagator.addSubscriber (pod, true);
			pod.propagateKey 	= self.propagator.addActionSubscriber (pod);
		};

		self.rotateForever 		= function (transform, frequency) {
			var time 			= 0;
			var period 			= 1/frequency;
			var seg 			= 8;
			var segPhase 		= period/seg;
			var pod 			= {};
			console.log('attempt to rotate');
			pod.update			= function (context, frameStep, sceneNumber) {
				time 				+= frameStep;
				if (time >= period) time = 0;
				transform.rotation 	= Math.floor(time/segPhase)/seg * 360;
				// console.log(transform.rotation);
			};
			pod.propagateKey 	= self.propagator.addActionSubscriber (pod);
		};

		self.moveToValue		= function (startVal, endVal, phaseTime, listener, callback) {
			var value 			= startVal;
			var time 			= 0;
			var pod 			= {};
			var delta 			= endVal - startVal;
			pod.update			= function (context, frameStep, sceneNumber) {
				time			+= frameStep;
				if (time > phaseTime) {
					time 	= phaseTime;
					// self.propagator.removeSubscriber (pod, true);
					self.propagator.removeActionSubscriber (pod);
					if(callback) callback();
				}
				value			= startVal + delta * time/phaseTime;
				if(listener) listener(value);
			};
			// pod.propagateKey 	= self.propagator.addSubscriber (pod, true);
			pod.propagateKey 	= self.propagator.addActionSubscriber (pod);
		};
	};

	var Transform 					= function (xPos, yPos) {
		/*
		rotation is in degrees;
		*/
		var self 				= this;
		self.x					= xPos;
		self.y					= yPos;
		self.width				= 0;
		self.height				= 0.0;
		self.alpha				= 1;
		self.rotation			= 0.0;
		self.scaleX				= 1;
		self.scaleY				= 1;
		self.defaultScaleX		= self.scaleX;
		self.defaultScaleY 		= self.scaleY;
		self.visible			= true;
		self.components			= [];
		self.type 				= "Transform";
		self.propagateKey		= "";
		// -----------------------------------------------------
		self.set				= function (specs) {
			for (param in specs) {
				if (specs.hasOwnProperty(param)) {
					self[param]	= specs[param];
				}
			}
		}
		// -----------------------------------------------------

		self.update				= function (context, frameStep, sceneNumber) {};

		function createAnimaton (en, specs) {
			var animaton		= new Animaton ();
			var sprites			= specs.sprites;
			for (var i=0; i < sprites.length; i++) {

				var sprite		= new Sprite (en, {
					path					: specs.sprites[i].path,
					sprite_array 			: specs.sprites[i].array,
					sprite_column_number	: specs.sprites[i].colnumber,
					sprite_row_number 		: specs.sprites[i].rownumber
				});

				animaton.addMove (specs.sprites[i].name, sprite);
			}
			return animaton;
		}

	};

	var Sprite 					= function (entity, specs) {
		/*
			sprite array is the segments that is going to be used
			sprite number indicates how many segments exists

			spritePath, spriteArray, colnumber, rownumber
		*/
		var spritePath  	= specs.path;
		var spriteArray 	= specs.sprite_array;
		var colnumber		= specs.sprite_column_number;
		var rownumber 		= specs.sprite_row_number;

		var self			= this;
		self.type 			= "Sprite";
		self.propagateKey	= "";
		var isDisabled		= false;
		self.isDisabled 	= isDisabled;
		var en				= entity;
		var image 			= new Image ();
		image.src 			= spritePath;
		var ready			= false;
		self.width			= 0;
		self.height			= 0;
		var fps				= 12;
		var array			= spriteArray;
		var arrayLength		= array.length;
		var spriteIndex		= 0;
		var counter			= 0;
		var fpsGate			= 0.0;
		// pos, width, offset
		var x,y,w,h;
		var isPlaying		= false;
		var isPlayingOnce	= false;
		var anchorX  		= 0;
		var anchorY 		= 0;
		var anchorRatioX 	= 0;
		var anchorRatioY 	= 0;

		self.onload 		= function (){};
		image.onload		= function () {
			var imageWidth 	= image.width;
			var imageHeight	= image.height;
			ready 			= true;
			w				= imageWidth / colnumber;
			h				= imageHeight / rownumber;
			// console.log(imageWidth, colnumber, w, h);
			self.width		= w * en.scaleX;
			self.height		= h * en.scaleY;
			anchorX 		= anchorRatioX * w;
			anchorY 		= anchorRatioY * h;
			self.onload();
			readyImage();
		};
		self.play			= function (isOnce) {
			if(isOnce) isPlayingOnce 	= true;
			isPlaying		= true;
		};
		self.stop 			= function () {
			isPlaying		= false;
		};
		self.resetState		= function() {
			counter			= 0;
			spriteIndex 	= 0;
			x 				= 0;
			y				= 0;
		}
		self.goTo			= function (spriteIndex) {
			x				= spriteIndex%colnumber;
			y				= Math.floor(spriteIndex/colnumber);
		};
		self.setAnchorPos	= function(ax, ay) {
			// anchor type wont work on periodic image
			anchorX 	= ax;
			anchorY 	= ay;
		};
		self.setAnchorRatio = function (rx, ry) {
			anchorRatioX = rx;
			anchorRatioY = ry;
		};
		self.update 		= function (cx, frameStep, sceneNumber) {
			if (isDisabled) return;
			if (!ready || !cx) {
				console.log("sprite not ready");
				return;
			}
			// console.log('drawing');
			cx.save ();
			cx.translate (en.x, en.y);
			cx.scale (en.scaleX, en.scaleY);
			cx.rotate (en.rotation * Math.PI/180);
			cx.globalAlpha	= en.alpha;

			if (!isPlaying) {
				cx.drawImage (image, x*w, y*h, w, h, -anchorX, -anchorY, w, h);
				cx.restore();
				return;
			};

			cx.drawImage (image, x*w, y*h, w, h, -anchorX, -anchorY, w, h);
			cx.restore();

			fpsGate += frameStep;
			if ((counter == arrayLength-1) && isPlayingOnce) {
				isPlayingOnce 	= false;
				isPlaying		= false;
				fpsGate 		= 0.0;
				return;
			}
 			if (fpsGate > 1/fps) {
				counter++;
				spriteIndex	= array[counter-1];
				x	= spriteIndex%colnumber;
				y	= Math.floor(spriteIndex/colnumber);
				if (counter > arrayLength-1) counter = 0;
				fpsGate = 0.0;
			}
		};
		self.disable		= function () {
			isDisabled		= true;
			self.isDisabled = true;
		};
		self.enable			= function () {
			isDisabled		= false;
			self.isDisabled = false;
		};

		if (activePropagator) {
			if(specs.layerIndex) {
				activePropagator.insertSubscriber(self, specs.layerIndex);
			}
			else {
				activePropagator.addSubscriber(self);
			}

		}

	};

	var Animaton 				= function () {
		var self				= this;
		var moves				= {};
		var sprites				= [];
		self.activeMove			= undefined;
		activeMove 				= self.activeMove;
		var isDisabled			= false;
		self.type 				= "Animaton";
		self.name 				= "animaton";
		self.propagateKey		= "";
		self.addMove			= function (moveName, sprite) {
			sprite.disable ();
			moves[moveName]		= sprite;
			sprites.push(sprite);
		};

		self.eraseMove			= function (moveName) {
			delete moves[moveName];
		};

		self.playMove			= function (moveName, isOnce) {
			if (activeMove) {
				activeMove.disable ();
				activeMove.stop ();
			}
			activeMove			= moves[moveName];
			activeMove.resetState();
			activeMove.enable ();
			activeMove.play (isOnce);
		};

		self.stopMove			= function () {
			activeMove.stop ();
		};
		self.disable		= function () {
			isDisabled		= true;
		};
		self.enable			= function () {
			for (var moveName in moves) {
				if (moves.hasOwnProperty(moveName)) {
					moves[moveName].enable ();
				}
			};
		};
		self.disable		= function () {
			if (activeMove) activeMove.disabled (false);
			// for (moveName in moves) {
			// 	if (moves.hasOwnProperty(moveName)) {
			// 		moves[moveName].disabled (false);
			// 	}
			// };
		};
		self.bubble_up 			= function () {
			if(activePropagator) {
				activePropagator.riseSubscribers(sprites);
			}
		};
	};

	var PeriodicImage			= function (entity, specs) {
		var self 				= this;
		var ready				= false;
		var isDisabled			= false;
		var en 					= entity;
		var anchorX 			= 0;
		var anchorY 			= 0;
		var isPeriodic			= specs.periodic || false;
		self.type 				= "Image";
		self.offsetX			= 0.0;
		self.offsetY			= 0.0;
		self.sx					= 1.0;
		self.sy					= 1.0;
		self.strokewidth 		= 5;
		var sw 					= self.strokewidth;
		var ss 					= 1; // strokescale
		var image				= new Image();
		image.src				= specs.path;
		self.width, self.height;
		self.onload 			= function(){};
		image.onload			= function () {
			// console.log("loaded", specs.path);
			self.image 				= image;
			// periodic boundary condition
			self.width = image.naturalWidth;
			self.height = image.naturalHeight;
			// image crop area
			self.dx 				= self.width;
			self.dy 				= self.height;
			ss 						= (self.dx + sw)/self.dx;
			// image crop position
			self.cx 				= 0;
			self.cy 				= 0;
			// image scaled size
			self.sx 				= self.dx;
			self.sy 				= self.dy;
			ready					= true;
			self.setAnchorPos(anchorX, anchorY);
			self.onload();
			readyImage();
		};

		if (activePropagator) {
			self.propagateKey	= activePropagator.addSubscriber(self);
		}

		self.disable 			= function() {
			isDisabled			= true;
		};
		self.enable				= function() {
			isDisabled			= false;
		};
		self.setAnchorPos		= function(ax, ay) {
			// anchor type wont work on periodic image
			anchorX = ax;
			anchorY = ay;
		}
		self.update				= function (cx, frameStep, sceneNumber) {

			if (isDisabled) return;
			if (!ready) {
				return;
			}
			cx.save ();
			cx.translate (en.x, en.y);
			cx.scale (en.scaleX, en.scaleY);
			cx.globalAlpha = en.alpha;
			cx.rotate (en.rotation * pi/180.0);
			if (isPeriodic) {
				let domain	= -Math.floor(en.x/self.imageWidth);
				cx.drawImage (image, self.cx, self.cy, self.dx, self.dy,
					(domain - 1) * self.imageWidth + self.offsetX, self.offsetY, self.sx, self.sy);
				cx.drawImage (image, self.cx, self.cy, self.dx, self.dy,
					domain * self.imageWidth + self.offsetX, self.offsetY, self.sx, self.sy);
				cx.drawImage (image, self.cx, self.cy, self.dx, self.dy,
					(domain + 1) * self.imageWidth+ self.offsetX, self.offsetY, self.sx, self.sy);
			}
			else {

				cx.drawImage (image, self.cx, self.cy, self.dx, self.dy,
					// (self.offsetX - anchorX) - self.dx * (ss - 1)/2.,
					// (self.offsetY - anchorY) - self.dy * (ss - 1)/2.,
					(self.offsetX - anchorX),
					(self.offsetY - anchorY),
					self.sx * ss, self.sy * ss);

				cx.globalCompositeOperation='source-atop';
				cx.fillStyle = "yellow";
				cx.fillRect(
					(self.offsetX - anchorX) - sw/2,
					(self.offsetY - anchorY) - sw/2,
					self.dx, self.dy);

				cx.drawImage (image, self.cx, self.cy, self.dx, self.dy,
					self.offsetX - anchorX,
					self.offsetY - anchorY,
					self.sx, self.sy);

			}
			cx.restore ();
		}
	};

	var CmImage					= function (entity, specs) {
		var self 				= this;
		var ready				= false;
		var isDisabled			= false;
		var en 					= entity;
		var anchorX 			= specs.anchorX || 0;
		var anchorY 			= specs.anchorY || 0;
		self.type 				= "Image";
		self.sx					= 1.0;
		self.sy					= 1.0;
		self.glow				= false;
		if(specs.name) {
			self.name = specs.name;
		}
		var image				= new Image();
		image.src				= specs.path;
		// console.log("creating image", image.src);

		self.width, self.height;
		self.onload 			= function(){};
		image.onload			= function () {
			// console.log("loaded", specs.path);
			self.image 				= image;
			// periodic boundary condition
			self.width = image.naturalWidth;
			self.height = image.naturalHeight;
			// image crop area
			self.dx 				= self.width;
			self.dy 				= self.height;
			// image crop position
			self.cx 				= 0;
			self.cy 				= 0;
			// image scaled size
			self.sx 				= self.dx;
			self.sy 				= self.dy;
			ready					= true;
			if(specs.anchorPreset == "center") {
				self.setAnchorPos(self.width/2, self.height/2);
			}
			else {
				self.setAnchorPos(anchorX, anchorY);
			}
			self.onload();
			readyImage();
		};

		if (activePropagator) {
			if (specs.layerIndex) {
				self.propagateKey	= activePropagator.insertSubscriber(self, specs.layerIndex);
			}
			else {
				self.propagateKey	= activePropagator.addSubscriber(self);
			}
		}
		self.disable 			= function() {
			isDisabled			= true;
		};
		self.enable				= function() {
			isDisabled			= false;
		};
		self.setAnchorPos		= function(ax, ay) {
			// anchor type wont work on periodic image
			anchorX = ax;
			anchorY = ay;
		};
		self.update				= function (cx, frameStep, sceneNumber) {

			if (isDisabled) return;
			if (!ready) {
				return;
			}
			cx.save ();
			cx.translate (en.x, en.y);
			cx.scale (en.scaleX, en.scaleY);
			cx.globalAlpha = en.alpha;
			cx.rotate (en.rotation * pi/180.0);

			if(self.glow) {
				cx.shadowColor 		= '#ffff00';
				cx.shadowBlur 		= 20;
				cx.shadowOffsetX 	= 0;
				cx.shadowOffsetY 	= 0;
		  	}

			cx.drawImage (image, self.cx, self.cy, self.dx, self.dy,
				-anchorX, -anchorY,
				self.sx, self.sy);

			cx.restore ();
		};
		self.setSource  		= function(path) {
			image.src			= path;
		};
	};

    var CmShape                 = function (entity, specs) {
		var self			= this;

		var kind 			= specs.kind ? specs.kind : 'polygon';
		var verticesX 		= specs.verticesX ? specs.verticesX : [];
		var verticesY 		= specs.verticesY ? specs.verticesY : [];
		var radius 			= specs.radius ? specs.radius : 10;
		var fillColor 		= specs.color ? specs.color : "#000000";
		var outline 		= specs.outline ? specs.outline : false;
		var verticesLength 	= 0;

		if (verticesX.length != verticesY.length) {
            return undefined;
        }

		self.type 			= "Shape";
		self.propagateKey	= "";
		var isDisabled		= true;
		var en              = entity;
		self.transform 		= entity;
        self.width			= (Math.max.apply(null, verticesX) - Math.min.apply(null, verticesX));
		self.height			= (Math.max.apply(null, verticesY) - Math.min.apply(null, verticesY));
		var crad  			= 1.5;
		var arcsX			= [];
		var arcsY			= [];
		var anchorX 		= specs.anchorX || 0;
		var anchorY 		= specs.anchorY || 0;

		shapefy();

		self.setFillColor 	= function(new_color) {
			fillColor 		= new_color;
		};

		self.updateVertices = function(in_x, in_y) {
			// use this function to reshape the polygon
			verticesX 		= in_x;
			verticesY 		= in_y;
			arcsX  			= [];
			arcsY 			= [];
			shapefy();
		}

        self.setAnchorPos	= function(ax, ay) {
			// anchor type wont work on periodic image
			anchorX = ax;
			anchorY = ay;
		}

		switch(kind) {
			case 'polygon':
				self.update = update_polygon;
				break;
			case 'circle':
			// console.log("creating circle");
				self.update = update_circle;
				break;
		}

		function update_circle (cx, frameStep, sceneNumber) {
			if (isDisabled) return;
			cx.save ();
			cx.translate (en.x - anchorX, en.y - anchorY);
			// console.log (anchorX, anchorY);

			cx.scale (en.scaleX, en.scaleY);
			cx.rotate (en.rotation * Math.PI/180);
			cx.globalAlpha	= en.alpha;
            cx.beginPath();
			cx.arc(0, 0, radius, 0, 2*Math.PI);
			// cx.arc(radius/5 * 3, 0, radius*0.2, 0, 2*Math.PI);
			cx.closePath();
			cx.lineWidth  = 2.7;
            cx.fillStyle   = fillColor;
            cx.fill();
            if (outline) {
				cx.strokeStyle = '#444444';
				cx.stroke();
			}

            cx.restore();
		}

		function update_polygon(cx, frameStep, sceneNumber) {
			if (isDisabled) return;
			cx.save ();
			cx.translate (en.x - anchorX, en.y - anchorY);
			// console.log (anchorX, anchorY);
			cx.scale (en.scaleX, en.scaleY);
			cx.rotate (en.rotation * Math.PI/180);
			cx.globalAlpha	= en.alpha;
            cx.beginPath();
			cx.moveTo ( arcsX[0], arcsY[0]);
            for (var i=1; i < verticesLength; i++) {
				cx.arcTo(verticesX[i], verticesY[i], arcsX[i], arcsY[i], crad);
			}
			cx.arcTo(verticesX[0], verticesY[0], arcsX[0], arcsY[0], crad);
			cx.closePath();

			cx.lineWidth  = 1.5;
            cx.fillStyle   = fillColor;
            cx.fill();
            if (outline) {
				cx.strokeStyle = '#444444';
				cx.stroke();
			}

            cx.restore();
		}


		self.disable		= function () {
			isDisabled		= true;
		};
		self.enable			= function () {
			isDisabled		= false;
		};

		function shapefy() {
			verticesLength  = verticesX.length;

			for (var i = 0; i < verticesLength; i++) {
				let iprev  	= (i-1) < 0 ? verticesLength-1 : (i-1);
				let inext 	= (i+1) > verticesLength-1 ? 0 : i+1;
				let px 		= verticesX[i];
				let py 		= verticesY[i];

				let vxprev = verticesX[iprev] - verticesX[i];
				let vyprev = verticesY[iprev] - verticesY[i];
				let vxnext = verticesX[inext] - verticesX[i];
				let vynext = verticesY[inext] - verticesY[i];

				let vprevlength = Math.sqrt (vxprev*vxprev + vyprev*vyprev);
				let vnextlength = Math.sqrt (vxnext*vxnext + vynext*vynext);

				let leftshiftx 	= crad/vprevlength * vxprev;
				let leftshifty	= crad/vprevlength * vyprev;

				let rightshiftx = crad/vnextlength * vxnext;
				let rightshifty = crad/vnextlength * vynext;

				if(i == 0) {
					arcsX.push(px + 0.5*vxnext);
					arcsY.push(py + 0.5*vynext);
				}
				else {
					arcsX.push( px + rightshiftx);
					arcsY.push( py + rightshifty);
				}
			}

		}
	};

	var CmPath                 = function (transform, specs) {
		var verticesX 		= specs.verticesX;
		var verticesY 		= specs.verticesY;
		var strokeStyle 	= specs.color;
		var lineWidth 		= specs.thickness;
		var verticesLength 	= verticesX.length;

		if (verticesX.length != verticesY.length) {
			console.log("error on creating path");
            return undefined;
        }

		var self			= this;
		self.type 			= "Path";
		var isDisabled		= false;
		var en              = transform;

		self.update 		= function (cx, frameStep, sceneNumber) {
			if (isDisabled) return;
            cx.save ();
			cx.lineJoin = 'round';
			cx.lineCap = 'round';
            cx.translate (en.x, en.y);
			cx.scale (en.scaleX, en.scaleY);
			cx.globalAlpha	= en.alpha;
            cx.beginPath();
			cx.moveTo (verticesX[0], verticesY[0]);
			for (var i=1; i < verticesLength; i++) {
				cx.lineTo(verticesX[i], verticesY[i]);
			}
			cx.lineWidth  = lineWidth;
			cx.strokeStyle = strokeStyle;
			cx.stroke();
            cx.restore();
		};

		self.updateVertices = function (vertices_x, vertices_y) {
			verticesX = vertices_x;
			verticesY = vertices_y;
			verticesLength = verticesX.length;
		}

		self.setFillColor 	= function(color) {
			strokeStyle 	= color;
		};

		self.disable		= function () {
			isDisabled		= true;
		};

		self.enable			= function () {
			isDisabled		= false;
		};
	};

	var CmWavePath       	= function (transform, specs) {
		// var verticesX 		= specs.verticesX;
		// var verticesY 		= specs.verticesY;
		var strokeStyle 	= specs.color;
		var lineWidth 		= specs.thickness;
		// var verticesLength 	= verticesX.length;
		var waveRadius 		= specs.waveRadius;
		var waveLength 		= specs.waveLength;
		var waveAmount 		= Math.floor(waveRadius/waveLength);
		var maxWaveAmount 	= waveAmount;
		var halfFov			= specs.waveFov * Math.PI/ 360;

		var self			= this;
		self.type 			= "Wave Path";
		var isDisabled		= false;
		var en              = transform;

		self.update 		= function (cx, frameStep, sceneNumber) {
			if (isDisabled) return;
            cx.save ();
            cx.translate (en.x, en.y);
			cx.scale (en.scaleX, en.scaleY);
			cx.globalAlpha	= en.alpha;

			cx.lineWidth  	= lineWidth;
			cx.strokeStyle 	= strokeStyle;

			for (var i = 1; i <= waveAmount; i++) {
				cx.beginPath();
				cx.arc(0, 0, i * waveLength, -halfFov, halfFov);
				cx.stroke();
			}

            cx.restore();
		};

		self.updateWaveAmount = function (newRatio) {
			let newAmount 	= Math.floor(newRatio * maxWaveAmount);
			waveAmount 		= newAmount;
		};

		self.setFillColor 	= function(color) {
			strokeStyle 	= color;
		};

		self.disable		= function () {
			isDisabled		= true;
		};

		self.enable			= function () {
			isDisabled		= false;
		};
	};

	self.createShape 			= function(transform, specs) {
		var shape 				= new CmShape (transform, specs);
		if (activePropagator) {
			activePropagator.addSubscriber(shape);
		}
		return shape;
	};

	self.createPath 		= function(specs) {
		/*
			specs:
				x, y, verticesX, verticesY, color, thickness
		*/
		var path 			= {};
		path.transform 		= new Transform(specs.x, specs.y);
		path.path 			= new CmPath (path.transform, specs);
		if (activePropagator) {
			activePropagator.addSubscriber(path.path);
		}
		path.destroy = function () {
			//console.log("destroying path");
			if (activePropagator) {
				activePropagator.removeSubscriber(path.path);
			}
			path = undefined;
		}
		return path;
	};

	self.destroyPath  		= function (path) {
		if (activePropagator) {
			activePropagator.removeSubscriber(path);
		}
	}

	self.createWavePath		= function (specs) {
		var wavePath 	= {};
		wavePath.transform 	= new Transform(specs.x, specs.y);
		wavePath.path 		= new CmWavePath(wavePath.transform, specs);
		if (activePropagator) {
			activePropagator.addSubscriber(wavePath.path);
		}
		return wavePath;
	};

	self.userGestureStarter		= function (containerId, callback) {
		var autoplaySolved 	= false;
		var dom          	= document.getElementById(containerId);
		var btnHeight       = 70;
		var btnWidth        = 70;
		var btnLineHeight   = 50;
		var canvasWidth     = 1024;
		var canvasHeight    = 768;
		var xScale          = dom.offsetWidth/canvasWidth;
		var yScale          = xScale;
		var fontSize        = 50;
		var titleSize       = 35;
		var silentFile      = "silent";
		var img				= undefined;

		var sound = new NativeSound(silentFile);
		checkPolicy();

		function fileFailed() {
			// file failed to load, attempting to run callback
			// callback();
		}

		function checkPolicy () {
			console.log("checkAutoPolicy called");
			let audio 	= sound.getAudio();

			var autoPlayPromise = audio.play();
			if (autoPlayPromise !== undefined) {
				prompt_user_input();
			}
			else {
				console.log("autoplay promise undefined, proceed to run the app.");
				create_clickme_image(proceeed_without_policy);
			}

			if(!autoplaySolved){
				document.addEventListener("mousedown", clicked);
				window.addEventListener("resize",updateSize);
			}

			function prompt_user_input() {
				console.log("promise defined.");

				autoPlayPromise.then(function() {
					console.log("autoplay is granted");
					autoplaySolved = true;
					document.removeEventListener("mousedown", clicked);
					clearCover();
					callback();
				}, function() {
					console.log("autoplay policy active.");
					create_clickme_image();
				});
			}

			function proceeed_without_policy() {
				autoplaySolved = true;
				document.removeEventListener("mousedown", clicked);
				clearCover();
				callback();
			}
		}

		function clearCover() {
			while (dom.firstChild) {
				// console.log("clearing cover :", dom.firstChild);
				dom.removeChild(dom.firstChild);
			}
		}

		function create_clickme_image(callback) {
			img	= document.createElement('img');
			img.src	= "images/clickme.png";
			img.style.position          = "absolute";
			img.style.top               = dom.offsetHeight/2 - btnHeight/2 * yScale + "px";
			img.style.left              = dom.offsetWidth/2  - btnWidth/2 * xScale + "px";
			img.style.width             = btnWidth * xScale + "px";
			img.style.height            = btnHeight * yScale + "px";
			dom.appendChild(img);
			if(callback) img.onload = callback;


		}

		function createNextBtn() {
			btn.className="button";
			btn.style.position="absolute";

			btn.style.textAlign     = "center";
			btn.style.fontWeight    = "bold";
			btn.style.color         = "#0099cc";
			btn.innerText           = "\u261D";
			btn.style.outline       = "none";
			btn.style.border        = "none";

			//btn.style.textAlign="center";
			// btn.style.background="#0099cc";
			// btn.style.boxShadow="0 0 3px gray";
			// btn.style.borderRadius="50%";
			// btn.style.fontWeight="bold";
			// btn.style.border="2px solid #0099cc";
			// btn.style.color="#ffffff";
			// btn.innerText="\u2192";
			// btn.style.outline="none";

			btn.style.fontSize          = fontSize*xScale + "px";
			btn.style.top               = dom.offsetHeight/2 - btnHeight/2 * yScale + "px";
			btn.style.left              = dom.offsetWidth/2 - btnWidth/2 * xScale + "px";
			btn.style.width             = btnWidth * xScale + "px";
			btn.style.height            = btnHeight * yScale + "px";
			//btn.style.lineHeight        = btnLineHeight * yScale + "px";
			dom.appendChild(btn);
		}

		function clicked(ev) {
			checkPolicy();
		}

		function updateSize() {
			var size = "auto";
			var ws = dom.offsetWidth/canvasWidth;
			var hs = dom.offsetHeight/canvasHeight;
			xScale = Math.min(ws,hs);
			yScale = xScale;
			img.style.top               = dom.offsetHeight/2 - btnHeight/2 * yScale + "px";
			img.style.left              = dom.offsetWidth/2  - btnWidth/2 * xScale + "px";
			img.style.width             = btnWidth * xScale + "px";
			img.style.height            = btnHeight * yScale + "px";

		}
	};

	self.createCanvas			= function (inputContainer, propagationMode) {
		var canvas2d			= new Canvas2d (inputContainer, propagationMode);
		canvas2d.updateSize();
		canvas2d.setAbsolutePos ();
		window.addEventListener("resize",function(){
			canvas2d.updateSize ();
			canvas2d.setAbsolutePos ();
		},false);

		return canvas2d;
	};

	self.createPropagator		= function (inputContext) {
		if (!inputContext) return undefined;
		var propagator 			= new Propagator (inputContext);
		activePropagator		= propagator;
		return propagator;
	};

	self.createTransform		= function () {
		var entity				= new Transform ();
		return entity;
	};

	self.createImage 	 		= function(specs) {
		var q		= {};
		var tr 		= new Transform ();
		q.transform = tr;
		tr.x 		= specs.x;
		tr.y		= specs.y;
		tr.scaleX	= specs.scaleX ? specs.scaleX : 1.0;
		tr.scaleY 	= specs.scaleY ? specs.scaleY : 1.0;
		tr.rotation = specs.rotation || 0;
		q.image 	= new CmImage(tr, specs);
		return q;
	};

	self.createSprite 			= function(specs) {
		var q = {};
		var tf, sp;
		q.transform 		= new Transform();
		tf 					= q.transform;
		tf.x 				= specs.x || 0;
		tf.y 				= specs.y || 0;
		tf.scaleX			= specs.scale_x || 1;
		tf.scaleY 			= specs.scale_y || 1;
		// sp = q.sprite 		= tf.addComponent ("Sprite", specs);
		sp = q.sprite 		= new Sprite (tf, specs);
		// console.log(specs);
		let ratio_x 		= specs.anchor_ratio_x || 0;
		let ratio_y 		= specs.anchor_ratio_y || 0;
		sp.setAnchorRatio (ratio_x, ratio_y);
		sp.goTo(0);
		return q;
	};

	self.createNativeText 		= function (specs) {
		var q			= {};
		q.transform 	= new Transform();
		var transform 	= q.transform;
		q.transform.x 	= specs.x;
		q.transform.y 	= specs.y;

		q.type 			= "Text";
		q.propagateKey	= "";
		var isDisabled	= false;
		var ready		= true;
		var fonts 		= specs.fonts;
		var fills 		= specs.fills;
		var colors	 	= specs.colors;
		var lines		= specs.lines || self.utils.makeArrayOf(fills.length);
		var linesWidth 	= specs.linesWidth || 20;

		var isOutlined 	= false;
		if(specs.strokeStyle) {
			var strokeStyle = specs.strokeStyle;
			var strokeWidth = specs.strokeWidth;
			isOutlined = true;
		}

		var lengthFill 	= fills.length;
		let shift_x 	= 0;
		let shift_y 	= 0;
		var textLength 	= 0;
		var textAlign 	= specs.textAlign ? specs.textAlign : "center";

		q.setFills		= function(filling) {
			fills 		= filling;
			lengthFill 	= fills.length;
		};

		q.setFonts 		= function (font_strings) {
			fonts 		= font_strings;
		};

		if (activePropagator) {
			q.propagateKey = activePropagator.addSubscriber(q);
		}

		q.update 			= function (cx, frameStep, sceneNumber) {
			if (isDisabled) return;
			if (!ready || !cx) {
				console.log("text not ready");
				return;
			}
			cx.save ();
			cx.translate (transform.x, transform.y);
			cx.globalAlpha 		= transform.alpha;
			cx.textAlign 	= textAlign;
			shift_x 			= 0;
			shift_y 			= 0;

			// set white stroke
			if(isOutlined) {
				cx.miterLimit 	= 2;
				cx.lineJoin 	= 'circle';
				cx.strokeStyle 	= strokeStyle;
				cx.lineWidth 	= strokeWidth;
			}

			for (var i = 0; i < lengthFill; i++) {
				cx.font 		= fonts[i];
				cx.fillStyle 	= colors[i];
				let shift_y_tmp = lines[i] * linesWidth;
				if(shift_y_tmp > shift_y) {
					shift_y = shift_y_tmp;
					shift_x = 0;
				}
				if(isOutlined) cx.strokeText(fills[i], shift_x, shift_y);
				cx.fillText(fills[i], shift_x, shift_y);
				shift_x 		+= cx.measureText(fills[i]).width;
			}
			textLength = shift_x;

			cx.restore();
		};

		q.getLengthTo		= function(c, isAfter) {
			let cx 		= activeContext;
			let res  	= 0;

			// join the whole string
			let totalString = "";
			for (var i = 0; i < lengthFill; i++) {
				totalString += fills[i];
			}

			// get index
			let targetIndex = totalString.indexOf(c);
			let index	= isAfter ? targetIndex + 1 : targetIndex;

			// get substring
			let substring = totalString.slice(0, index);

			cx.save ();
			cx.globalAlpha 	= 0;
			cx.font 	= fonts[0];
			cx.fillText(substring, 0, 0);
			res  = cx.measureText(substring).width;
			cx.restore();

			return res;
		};

		q.getLengthToIndex 	= function(index) {
			let cx 	= activeContext;
			let res	= 0;
			let totalString = "";
			for (var i = 0; i < lengthFill; i++) {
				totalString += fills[i];
			}
			// get substring
			let substring = totalString.slice(0, index);

			cx.save ();
			cx.globalAlpha 	= 0;
			cx.font 	= fonts[0];
			cx.fillText(substring, 0, 0);
			res  = cx.measureText(substring).width;
			cx.restore();

			return res;
		};

		q.getClosestIndex 	= function (distance, alignMode) {
			let cx 	= activeContext;
			let res	= 0;
			let maxlength = q.getLength();
			let it = 0;
			let totalString = "";
			for (var i = 0; i < lengthFill; i++) {
				totalString += fills[i];
			}
			if(distance > maxlength) return totalString.length-1;
			while(true) {
				let dr = (q.getLengthToIndex(it) - distance);
				if (dr > 0) {
					// console.log("index is", it);
					return it-1;
					break;
				}
				it++;
			}
		};
		// BM centerize with frame timer

		q.centerize			= function(callback) {
			if(activePropagator) {
				let init_alpha 		= q.transform.alpha;
				q.transform.alpha 	= 0;
				activePropagator.frameTimer(function(){
					q.transform.x 		= specs.x - textLength/2;
					q.transform.alpha 	= init_alpha;
					if(callback) callback();
				}, 3);
			}
		};
		q.disable			= function() {
			isDisabled 		= true;
		};
		q.enable			= function() {
			isDisabled		= false;
		};

		return q;
	}

	self.createAnimator2d	= function (propagator) {
		var animator 			= new Animator2d (propagator);
		return animator;
	};

	self.createSplashScreen	= function (containerId, domcanvas) {
		var container 			= document.getElementById(containerId);
		console.log(containerId);
		/*
			args: -
			return:
				splash:
					.start(duration=1000) :start the splash with given duration
					.end() :force end of the splash screen.
		*/
		var splasher 			= {};
		splash 					= document.createElement("img");
		splash.src				= "images/splash.png";
		splash.style.position 	= "absolute";
		splash.style.textAlign 	= "center"
		splash.style.margin		= "auto";
		splash.style.width 		= "100%";
		splash.style.top		= domcanvas.style.top;

		splasher.start			= function (duration) {
			container.appendChild(splash);
			setTimeout(function(){
				container.removeChild(splash);
			}, duration);
		};

		window.addEventListener("resize",function(){
			splash.style.top	= domcanvas.style.top;
		},false);

		return splasher;

	};

	self.createSound		= function (title) {
		console.log("creating sound");
		var sound 				= new Sound(title);
		return sound;
	};

	self.createNativeSound	= function(title) {
		// console.log("creating native sound");
		return new NativeSound(title);
	};

	self.destroy			= function(obj) {
		if (activePropagator) {
			activePropagator.removeSubscriber(obj);
		}
	};

	self.constants			= {
		pi 			: Math.PI,
		twopi		: 2*Math.PI
	};

	var ut;

	self.utils				= ut = {
		// getCombination		: function (sourceSet, nTaken) {
		// 	var result  = [];
		// 	function combination (problemSet, pickNum, element) {
		// 		let setLength 	= problemSet.length;
		// 		if(element.length == pickNum) {
		// 			result.push(element);
		// 			return;
		// 		}
		// 		if (setLength < 1) return;
		// 		for (var i = 0; i < setLength; i++) {
		// 			combination (problemSet.slice(i+1), pickNum, [...element, problemSet[i]]);
		// 		}
		// 	}
		// 	combination(sourceSet, nTaken);
		// 	return result;
		// },
		constants			: {
			pi : Math.PI,
			twopi: 2*Math.PI
		},

		isAboveRectangle 	: function (x, y, cx, cy, rx, ry) {
			// console.log(x-cx, y-cy);
			if (Math.abs(x - cx) <= rx && Math.abs(y-cy) <= ry) return true;
			return false;
		},

		getRange			: function (start, end, step) {
			let result		= [];
			for (var i = start; i < end; i += step) {
				result.push(i);
			}
			return result;
		},

		getRandomSet		: function (sourceSet, nTaken) {
			let sourceLength	= sourceSet.length;
			let set				= sourceSet.slice(0);
			let result			= [];
			while (set.length > (sourceLength - nTaken)) {
				let nrandom		= Math.floor(set.length * Math.random());
				result.push(set[nrandom]);
				set.splice(nrandom, 1);
			}
			// console.log(result);
			return result;
		},

		makeArrayOf			: function (value, length) {
			let arr = [], i = length;
			while (i--) {
				arr[i] = value;
			}
			return arr;
		},

		spliceRandomSet		: function (sourceSet, nTaken) {
			let sourceLength	= sourceSet.length;
			let set				= sourceSet;
			let result			= [];
			while (set.length > (sourceLength - nTaken)) {
				let nrandom		= Math.floor(set.length * Math.random());
				result.push(set[nrandom]);
				set.splice(nrandom, 1);
			}
			return result;
		},

		sliceRandomSet 		: function (sourceSet, nTaken, exceptionSet) {
			let set				= sourceSet.slice(0);

			if (exceptionSet) {
				for (var i = 0; i < exceptionSet.length; i++) {
					let exIndex = set.indexOf(exceptionSet[i]);
					if (exIndex < 0) continue;
					set.splice(exIndex, 1);
				}
			}

			let length			= set.length;
			let result			= [];
			let numTaken		= nTaken > length ? length : nTaken;
			while (set.length > (length - numTaken)) {
				let nrandom		= Math.floor(set.length * Math.random());
				result.push(set[nrandom]);
				set.splice(nrandom, 1);
			}
			return result;
		},

		getRandomInteger	: function(start, end) {
			return start + Math.floor(Math.random () * (end+1 - start));
		},

		getRandomFloat		: function(start, end) {
			return start + (Math.random () * (end - start));
		},

		getRandomBool		: function(trueProb) {
			let prob = trueProb || 0.5;
			return Math.random() < prob ? true: false;
		},

		getRandomIntegerFromArray: function(arr) {
			let index = Math.floor(Math.random () * arr.length);
			return arr[index];
		},

		createPolygonVertices: function(num_of_corners, radius) {
			var verticesX 		= [];
			var verticesY 		= [];
			var radius 			= radius;
			var pi 				= Math.PI;
			let n 				= num_of_corners < 3 ? 3:num_of_corners;
			for (var i = 0; i < n; i++) {
				let dAngle 	= 2*pi/n;
				let angle	= dAngle * i;
				let rad 	= radius ;
				let vx 		= rad * Math.cos(angle);
				let vy	 	= rad * Math.sin(angle);
				verticesX.push(vx);
				verticesY.push(vy);
			}
			return {
				x : verticesX,
				y : verticesY
			}
		},

		distance2d			: function(x1, y1, x2, y2) {
			return Math.sqrt ((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
		},

		rectdist2d			: function(x1, y1, x2, y2) {
			return Math.max(Math.abs(x1-x2), Math.abs(y1-y2));
		},

		isArrayMember		: function(n, array) {
			if(array.indexOf(n) >= 0) return true;
			return false;
		},

		isInsideRectangle	: function(x, y, cx, cy, rx, ry) {
			if (Math.abs(x - cx) <= rx && Math.abs(y-cy) <= ry) return true;
			return false;
		},

		isInsideEllipse : function(x, y, h, k, rx, ry) {
			// I WAS BORN
			let term1 	= (x-h)*(x-h)/(rx*rx);
			let term2	= (y-k)*(y-k)/(ry*ry);
			// SHE WAS BORN
			if (term1 + term2 <= 1) {
				return true;
			}
			else return false;
		},

		ellipseCarlo : function(centerX, centerY, rx, ry, N) {
			isShooting 	= true;
			nCount		= 0;
			mainRadius	= rx > ry ? rx:ry;
			carlos		= [];
			while(isShooting) {
				let x 	= -mainRadius + 2 * Math.random() * mainRadius;
				let y 	= -mainRadius + 2 * Math.random() * mainRadius;
				if (ut.isInsideEllipse(x, y, 0, 0, rx, ry)) {
					carlos.push([x + centerX, y + centerY]);
					nCount++;
					if (nCount >= N) isShooting = false;
				}
			}
			return carlos;
		},

		isNeighbor				: function(pos, neighbors, nearDist) {
			let length			= neighbors.length;
			for (var i = 0; i < length; i++) {
				let nbor = neighbors[i];
				if (ut.distance2d(nbor[0], nbor[1], pos[0], pos[1]) < nearDist) {
					return true;
				}
			}
			return false;
		},

		ellipseIntersectCarlo	: function(center1x, center1y, r1x, r1y, center2x, center2y, r2x, r2y, N, offset) {
			isShooting 	= true;
			nCount		= 0;
			mainRadius1 = r1x > r1y ? r1x-offset : r1y - offset;
			mainRadius2 = r2x > r2y ? r2x-offset : r2y - offset;
			carlos	 	= [];
			while (isShooting && N > 0) {
				let x 	= -mainRadius1 + 2 * Math.random() * mainRadius1 + center1x;
				let y 	= -mainRadius1 + 2 * Math.random() * mainRadius1 + center1y;

				if (	self.utils.isInsideEllipse(x, y, center1x, center1y, r1x-offset, r1y-offset) &&
						self.utils.isInsideEllipse(x, y, center2x, center2y, r2x - offset, r2y - offset) &&
						!ut.isNeighbor ([x, y], carlos, 80) ) {
					carlos.push([x, y]);
					nCount++;
					if (nCount >= N) {
						isShooting = false;
						break;
					}
				}

				x 	= -mainRadius2 + 2 * Math.random() * mainRadius2 + center2x;
				y 	= -mainRadius2 + 2 * Math.random() * mainRadius2 + center2y;

				if (	self.utils.isInsideEllipse(x, y, center1x, center1y, r1x - offset, r1y - offset) &&
						self.utils.isInsideEllipse(x, y, center2x, center2y, r2x - offset, r2y - offset) &&
						!ut.isNeighbor ([x, y], carlos, 80) ) {
					carlos.push([x, y]);
					nCount++;
					if (nCount >= N) {
						isShooting = false;
						break;
					}
				}
			}
			return carlos;
		},

		ellipseExcludeCarlo : function(center1x, center1y, r1x, r1y, center2x, center2y, r2x, r2y, N, offset) {
			isShooting 	= true;
			nCount		= 0;
			mainRadius1 = r1x > r1y ? r1x-offset : r1y - offset;
			carlos	 	= [];
			while (isShooting && N > 0) {
				let x 	= -mainRadius1 + 2 * Math.random() * mainRadius1 + center1x;
				let y 	= -mainRadius1 + 2 * Math.random() * mainRadius1 + center1y;

				if (	self.utils.isInsideEllipse(x, y, center1x, center1y, r1x - offset, r1y - offset) &&
						!self.utils.isInsideEllipse(x, y, center2x, center2y, r2x + offset, r2y + offset) &&
						!ut.isNeighbor ([x, y], carlos, 80) ) {
					carlos.push([x, y]);
					nCount++;
					if (nCount >= N) {
						isShooting = false;
						break;
					}
				}
			}
			return carlos;
		},

		getRandomMultiple	: function(n, startRange, endRange) {
			let multiplier 	= self.utils.getRandomInteger(startRange, endRange);
			return n*multiplier;
		},

		rgbToHex : function (r,g, b) {
			var red = toHex(r);
			var green = toHex(g);
			var blue = toHex(b);
			return "#"+red+green+blue;

			function toHex (n) {
				var hex = Number(n).toString(16);
				if (hex.length < 2) {
					 hex = "0" + hex;
				}
				return hex;
			}
		  },

		intersectSet	: function(set1, set2){
			let intersection  	= [];
			let length1 		= set1.length;
			let length2			= set2.length;

			for (var i = 0; i < length1; i++) {
				for (var j = 0; j < length2; j++) {
					let n1	= set1[i];
					let n2	= set2[j];
					if (n1 == n2) {
						intersection.push (n1);
					}
				}
			}
			return intersection;
		},

		sliceSet		: function(mainSet, slicingSet) {
			let sliced 			= [];
			let mainLength 		= mainSet.length;
			let slicingLength 	= slicingSet.length;
			let ismember		= true;

			for (var i = 0; i < mainLength; i++) {
				let n1		= mainSet[i];
				ismember 	= true;
				for (var j = 0; j < slicingLength; j++) {
					let n2	= slicingSet[j];
					if (n1 == n2) ismember = false;
				}
				if(ismember) sliced.push(n1);
			}

			return sliced;
		},

		radian 		: function(deg) {
			return pi/180 * deg;
		},

		degree		: function(rad) {
			return 180/pi * rad;
		},

		joinSet			: function(setArray) {
			let sumset = [];
			setArray.forEach(function(set){
				sumset 	= sumset.concat(set);
			})
			return sumset;
		},

		set_interval : function(callback, periode) {
			var pod 	= {};
			var timer  	= 0;
			pod.update 	= function(cx, frameStep, sceneNumber) {
				timer += frameStep;
				if(timer>=periode) {
					timer = 0;
					callback();
				}
			}
			if(activePropagator) {
				activePropagator.addActionSubscriber(pod);
				return pod;
			}
		},

		clear_interval : function(pod) {
			if(activePropagator) {
				activePropagator.removeActionSubscriber(pod);
			}
		},

		get_user_agent : function() {
			var user_agent = "non-mobile";
			if(/Android/i.test(navigator.userAgent) ) {
				user_agent = "android";
			}
			else if (/ipad/i.test(navigator.userAgent) ){
				user_agent = "ipad";
			}
			else if (/iphone/i.test(navigator.userAgent) ){
				user_agent = "iphone";
			}
			else {
			}
			return user_agent;
		},
		get_user_browser : function() {
			var browser_name = '';
			isIE = /*@cc_on!@*/false || !!document.documentMode;
			isEdge = !isIE && !!window.StyleMedia;

			if(navigator.userAgent.indexOf("Chrome") != -1 && !isEdge)
			{
				browser_name = 'chrome';
			}
			else if(navigator.userAgent.indexOf("Safari") != -1 && !isEdge)
			{
				browser_name = 'safari';
			}
			else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
			{
				browser_name = 'ie';
			}
			else if(isEdge)
			{
				browser_name = 'edge';
			}
			else
			{
			   browser_name = 'other-browser';
			}

			return browser_name;
		}
	};
};11
