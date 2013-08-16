"use strict";(function(window){/*global $: true, Modernizr: true */

var Mantra = window['Mantra'] = {

	/**
	 * @const
	 */
	Modernizr: Modernizr || window["Modernizr"]
};

/** @const */
Mantra.DOCUMENT = $(window.document);

/*global Mantra: true */

var Modernizr = Mantra.Modernizr;

Modernizr["addTest"]('pointerevents', function () {
	return window.navigator["pointerEnabled"] || window.navigator["msPointerEnabled"] || false;
});

/**
 * @const
 */
var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

Modernizr["addTest"]('mouseevents', function () {
	return !(Modernizr.touch && window.navigator.userAgent.match(MOBILE_REGEX));
});

/**
 * @const
 * @type {{}}
 */
Mantra.INPUT_TYPES = [,, "TOUCH", "PEN", "MOUSE"];

/** @const */
Mantra.POINTER_MOUSE = 'mouse';

/** @const */
Mantra.POINTER_TOUCH = 'touch';

/** @const */
Mantra.POINTER_PEN = 'pen';

/** @const */
Mantra.EVENT_START = 'start';

/** @const */
Mantra.EVENT_MOVE = 'move';

/** @const */
Mantra.EVENT_END = 'end';

;(function(){
	var types = {};

	if (Mantra.Modernizr["touch"]) {
		if (!Mantra.Modernizr["mouseevents"]) {
			/** @const */
			types[Mantra.EVENT_START] = 'touchstart';
			/** @const */
			types[Mantra.EVENT_MOVE] = 'touchmove';
			/** @const */
			types[Mantra.EVENT_END] = 'touchend touchcancel';

		} else {
			/** @const */
			types[Mantra.EVENT_START] = 'touchstart mousedown';
			/** @const */
			types[Mantra.EVENT_MOVE] = 'touchmove mousemove';
			/** @const */
			types[Mantra.EVENT_END] = 'touchend touchcancel mouseup';
		}

	} else {
		if (Mantra.Modernizr["pointerevents"]){
			/** @const */
			types[Mantra.EVENT_START] = 'pointerdown MSPointerDown';
			/** @const */
			types[Mantra.EVENT_MOVE] = 'pointermove MSPointerMove';
			/** @const */
			types[Mantra.EVENT_END] = 'pointerup pointercancel MSPointerUp MSPointerCancel';

		} else {
			/** @const */
			types[Mantra.EVENT_START] = 'mousedown';
			/** @const */
			types[Mantra.EVENT_MOVE] = 'mousemove';
			/** @const */
			types[Mantra.EVENT_END] = 'mouseup';
		}
	}

	/**
	 * @const
	 * @type {{}}
	 */
	Mantra.EVENT_TYPES = types;
})();

/*global Mantra: true */

/**
 * @param name
 * @param object
 */
Mantra['define'] = function (name, object) {
	object || (object = {});
	var source = Mantra,
		constructor = object.hasOwnProperty('constructor') && typeof object["constructor"] == 'function' ? object["constructor"] : false,
		statics,
		extend = typeof object["extend"] == 'string' ? Mantra['resolve'](object["extend"]) : object["extend"];

	if (constructor) {
		var prototype,
			_constructor = constructor;

		constructor = function () {
			_constructor.apply(this, arguments);
		};

		if (extend) {
			var F = function () {};

			/* TODO: static names ['prop'] for constructor, superconstructor, superclass */
			F.prototype = extend.prototype;
			constructor.prototype = new F();
			constructor.prototype["constructor"] = constructor;
			constructor.prototype["superconstructor"] = extend;
			constructor.prototype["superclass"] = extend.prototype;
		}

		prototype = constructor.prototype;

		for (var objectProp in object) {
			if (object.hasOwnProperty(objectProp) && objectProp != 'constructor' && objectProp != 'statics') {
				prototype[objectProp] = object[objectProp];
			}
		}

		if (constructor.prototype["singleton"] && !constructor.prototype.hasOwnProperty("abstract")) {
			constructor = new constructor();
		}
	}

	name = name.split('.');

	if (name[0] == 'Mantra') {
		name.shift();
	}

	//if (name) {
	for (var i = 0, l = name.length; i < l; i++) {
		var subname = name[i];

		if (!source[subname]) {
			if (i == l - 1 && constructor) {
				source[subname] = constructor;
			} else {
				source[subname] = {};
			}
		}

		source = source[subname];
	}
	//}

	statics = constructor ? object["statics"] : object;
	if (statics) {
		for (var staticProp in statics) {
			if (statics.hasOwnProperty(staticProp)) {
				source[staticProp] = statics[staticProp];
			}
		}
	}

	return source;

};

Mantra['resolve'] = function (name) {
	var object = Mantra;

	name = name.split('.');

	if (name[0] == 'Mantra') {
		name.shift();
	}

	for (var i = 0, l = name.length; i < l; i++) {
		var subname = name[i];

		object = object[subname];

		if (!object) {
			break;
		}
	}

	return object;
};

Mantra["relayMethod"] = function (target, source, method) {
	if (method) {
		target[method] = source[method].bind(source);

	} else {
		for (method in source) {
			if (source.hasOwnProperty(method) && typeof source[method] == 'function') {
				Mantra["relayMethod"](target, source, method);
			}
		}

	}
};

/*global Mantra: true, $: true */

/**
 * @const
 * @type {string}
 */
Mantra.NODESTORENAME = '_mantra';

Mantra['getStore'] = function (target) {
	var store = Mantra["hasStore"](target);

	if (!store) {
		$(target).data(Mantra.NODESTORENAME, {});
		store = $(target).data(Mantra.NODESTORENAME);
	}

	return store;
};

Mantra["hasStore"] = function (target) {
	var store = $(target).data(Mantra.NODESTORENAME);

	return store;
};

/*global Mantra: true, $: true */

Mantra['define']('Mantra.GesturesDispatcher',
	/**
	 * @lends Mantra.GesturesDispatcher.prototype
	 */
	{
		"singleton": true,

		/**
		 * @constructs
		 */
		constructor: function () {
			this.detect = this.detect.bind(this);
		},

		_gestures: {},

		_gestureListeners: 0,

		// GESTURES

		/**
		 * register gesture handlers
		 * @param Mantra.Gesture
		 */
		"register": function (gesture) {
			if (!(gesture instanceof Mantra["Gesture"])) {
				if (typeof gesture == 'string') {
					gesture = Mantra["resolve"](gesture);
				}
				gesture = new gesture();
			}

			this._gestures[gesture["name"]] = {
				"gesture": gesture,
				listeners: 0
			};
		},

		"on": function (gestureName, target, fn) {
			if (!this._gestures[gestureName]) {
				return;
			}

			target = $(target);

			var store = Mantra['getStore'](target),
				gestureListeners;

			store["listeners"] || (store["listeners"] = {});

			// remember listeners for target and gesture name
			gestureListeners = store["listeners"][gestureName] || (store["listeners"][gestureName] = []);
			gestureListeners.push(fn);

			// remember global listeners
			this._gestureListeners++;
			this._gestures[gestureName].listeners++;

			var targetListeners = store.count || (store.count = 1);

			// if first gesture on the target – bind detect
			if (targetListeners == 1) {
				target[0].style.msTouchAction = "none";
				this._bind(Mantra.EVENT_TYPES[Mantra.EVENT_START], target);
			}

			// if first gesture at all – bind move
			if (this._gestureListeners == 1) {
				this._bind(Mantra.EVENT_TYPES[Mantra.EVENT_MOVE] + ' ' + Mantra.EVENT_TYPES[Mantra.EVENT_END]);
			}
		},

		"off": function (gestureName, target, fn) {
			if (!this._gestures[gestureName]) {
				return;
			}

			target = $(target);

			var store = Mantra['getStore'](target),
				gestureListeners;

			gestureListeners = store["listeners"][gestureName];

			var index = gestureListeners.indexOf(fn);

			// if gesture listeners has fn
			if (index > -1) {
				// remove fn
				store[gestureName] = gestureListeners.splice(index, 1);

				this._gestureListeners--;
				this._gestures[gestureName].listeners--;

				var targetListeners = store["listeners"].count;

				targetListeners--;

				// if last gesture listener on target - unbind detect
				if (!targetListeners) {
					target[0].style.msTouchAction = null;
					this._unbind(Mantra.EVENT_TYPES[Mantra.EVENT_START], target);
				}

				// if last gesture listener at all – unbind move
				if (this._gestureListeners === 0) {
					this._unbind(Mantra.EVENT_TYPES[Mantra.EVENT_MOVE] + ' ' + Mantra.EVENT_TYPES[Mantra.EVENT_END]);
				}
			}
		},

		_bind: function (events, target) {
			target || (target = Mantra.DOCUMENT);
			target['on'](events,  this.detect);
		},

		_unbind: function (events, target) {
			target || (target = Mantra.DOCUMENT);
			target['off'](events,  this.detect);
		},




		// DETECTOR

		_handleGestures: function(event){
			var changedFinger;

			for (var i = 0, l = event["changedFingers"].length; i < l; i++){
				changedFinger = event["changedFingers"][i];

				var target = changedFinger["firstTarget"];

				while (target){
					var $t = $(target),
						store = Mantra['hasStore']($t);

					if (store && store["listeners"]){
						// TODO: priority
						for (var gestureName in store["listeners"]) if (store["listeners"].hasOwnProperty(gestureName)){
							var listeners = store["listeners"][gestureName],
								gesture = this._gestures[gestureName]["gesture"];

							event["fingers"] = store["fingers"];
							gesture["process"](changedFinger, event);
						}

					}

					target = target.parentNode;
				}
			}

		},

		_detecting: false,

		detect: function (e) {


			// return if already handled event
			if (e["originalEvent"]["_mantraHandled"]){
				return;
			}
			e["originalEvent"]["_mantraHandled"] = true;


			// TODO: ?
			e.preventDefault();

			var event = this._getEvent(e);

			var type = event["type"],
				//id =
				input = event["input"];/*,
				target = $(e.target),
				store = Mantra['getStore'](target);*/

			// do not process different inputs at the same time
			// do not process moves and ends without start
			if (this._detecting && this._detecting != input || !this._detecting && type != Mantra.EVENT_START){
				return;
			}

			this._processFingers(event);

			if (type == Mantra.EVENT_START) {
				// store current input for decetion
				this._detecting = input;
				this._handleGestures(event);

			} else if (type == Mantra.EVENT_MOVE) {
				this._handleGestures(event);

			} else if (type == Mantra.EVENT_END) {
				if (!this._fingers.length){
					this._detecting = false;
				}

				this._handleGestures(event);
			}

		},

		_getEvent: function(e){
			e.originalEvent && (e = e.originalEvent);

			var event = {
				"originalEvent": e,
				"changedFingers": []
			};

			event["type"] = this._getEventType(event);
			event["input"] = this._getEventInput(event);

			return event;
		},

		_getEventInput: function (e) {
			var input;

			e = e["originalEvent"];

			if (Mantra.Modernizr["pointerevents"]){
				input = Mantra["POINTER_" + Mantra.INPUT_TYPES[e["pointerType"]]];

			} else {
				input = e["type"];

				if (input.indexOf('touch') == 0){
					input = Mantra.POINTER_TOUCH;
				} else {
					input = Mantra.POINTER_MOUSE;
				}
			}

			return input;
		},

		_getEventType: function (e) {
			e = e["originalEvent"];

			var type = e["type"];

			if (!!~Mantra.EVENT_TYPES[Mantra.EVENT_START].indexOf(type)) {
				type = Mantra.EVENT_START;

			} else if (!!~Mantra.EVENT_TYPES[Mantra.EVENT_END].indexOf(type)) {
				type = Mantra.EVENT_END;

			} else if (!!~Mantra.EVENT_TYPES[Mantra.EVENT_MOVE].indexOf(type)) {
				type = Mantra.EVENT_MOVE;

			}

			return type;
		},

		_fingers: [],

		_fingersById: {},

		_processFingers: function(event){
			var e = event["originalEvent"];

			if (Mantra.Modernizr["pointerevents"]){
				this._makeFinger(e["pointerId"], event, e);

			} else if (e["changedTouches"]) {
				for (var i = 0, l = e["changedTouches"].length; i < l; i++){
					var touch = e["changedTouches"][i];
					this._makeFinger(touch["identifier"], event, touch);
				}

			} else {
				// mouse fallback
				this._makeFinger(0, event, e);
			}

			//event["fingers"] = this._fingers.concat();
		},

		_makeFinger: function(id, event, touch){
			var finger,
				type = event["type"];
//TODO targetFingers
			switch (type){
				case Mantra.EVENT_START:
					if (!this._fingersById[id]){
						finger = this._fingersById[id] = new Mantra["Finger"](touch);
						this._fingers.push(finger);

						var target = finger["firstTarget"];

						while (target){
							var $t = $(target),
								store = Mantra['hasStore']($t);

							if (store){
								store["fingers"] || (store["fingers"] = []);
								store["fingers"].push(finger);
							}

							target = target.parentNode;
						}

					} else {
						finger = this._fingersById[id];
					}

				break;

				case Mantra.EVENT_MOVE:
					finger = this._fingersById[id];
					finger.update(touch, type);

				break;

				case Mantra.EVENT_END:
					finger = this._fingersById[id];
					this._fingers.splice(this._fingers.indexOf(finger), 1);
					delete this._fingersById[id];
					finger.update(touch, type);

					var target = finger["firstTarget"];

					while (target){
						var $t = $(target),
							store = Mantra['hasStore']($t);

						if (store){
							store["fingers"].splice(store["fingers"].indexOf(finger), 1);
						}

						target = target.parentNode;
					}

				break;
			}

			if (event["changedFingers"].indexOf(finger) == -1){
				event["changedFingers"].push(finger);
			}
		},

		/**
		 * @lends Mantra.GesturesDispatcher
		 */
		"statics": {

		}
	}
);

Mantra["relayMethod"](Mantra, Mantra['GesturesDispatcher'], "on");
Mantra["relayMethod"](Mantra, Mantra['GesturesDispatcher'], "off");
Mantra["relayMethod"](Mantra, Mantra['GesturesDispatcher'], "register");


/*global Mantra: true */

Mantra['define']('Mantra.Gesture',
	/**
	 * @lends Mantra.Gesture.prototype
	 */
	{

		"singleton": true,
		"abstract": true,

		"name": null,

		/**
		 * @constructs
		 */
		constructor: function () {
			this["name"] && Mantra['GesturesDispatcher']["register"](this);
		},

		"process": function(){
			return false;
		},

		/**
		 * @lends Mantra.gestures.Gesture
		 */
		"statics": {

		}
	}
);

/*global Mantra: true, $: true */

Mantra['define']('Mantra.Finger',
	/**
	 * @lends Mantra.Finger.prototype
	 */
	{
		/**
		 * @constructs
		 */
		constructor: function (touch) {
			this["phase"] = "start";
			this["states"] = [];
			this._getState(touch, this);
			this["firstTarget"] = touch["target"];
		},

		"identifier": null,
		"clientX": null,
		"clientY": null,
		"pageX": null,
		"pageY": null,
		"screenX": null,
		"screenY": null,
		"target": null,
		"phase": null,
		"firstTarget": null,

		"states": null,

		"update": function(touch, phase){
			this["phase"] = phase;
			this["states"].push(this._getState(this));
		},

		_getState: function(from, to){
			var obj = to || {};

			from || (from = this);

			obj["identifier"] = "identifier" in from ? from["identifier"] : from["pointerId"] || 0;
			obj["clientX"] = from["clientX"];
			obj["clientY"] = from["clientY"];
			obj["pageX"] = from["pageX"];
			obj["pageY"] = from["pageY"];
			obj["screenX"] = from["screenX"];
			obj["screenY"] = from["screenY"];
			obj["target"] = from["target"];

			return obj;
		},

		"statics": {
		}
	}
);

/*global Mantra: true */

Mantra['define']('Mantra.gestures'
	/**
	 * @lends Mantra.gestures
	 *
	{

	}*/
);

/*global Mantra: true */

Mantra['define']('Mantra.gestures.Tap',
	/**
	 * @lends Mantra.gestures.Tap.prototype
	 */
	{
		"extend": 'Mantra.Gesture',

		"name": "tap",

		/**
		 * @constructs
		 */
		constructor: function () {
			this["superconstructor"].apply(this);
		},

		"process": function(finger, event){
			//console.log(finger.identifier, event.type, event.fingers.length);
			//oldc.log(finger, event);
			oldc.log(finger, event.fingers, event.changedFingers);
		}

	}
);
}).call(this, window);