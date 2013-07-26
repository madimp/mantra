"use strict";(function(window){
var Mantra = window['Mantra'] = {
	/** @const */
	HAS_POINTEREVENTS: window.navigator.pointerEnabled || window.navigator.msPointerEnabled,

	/** @const */
	HAS_TOUCHEVENTS: ('ontouchstart' in window),

	/** @const */
	MOBILE_REGEX: /mobile|tablet|ip(ad|hone|od)|android/i,
	/** @const */
	NO_MOUSEEVENTS: this.HAS_TOUCHEVENTS && window.navigator.userAgent.match(this.MOBILE_REGEX),

	/** @const */
	POINTER_MOUSE: 'mouse',
	/** @const */
	POINTER_TOUCH: 'touch',
	/** @const */
	POINTER_PEN: 'pen',

	/** @const */
	EVENT_START: 'start',
	/** @const */
	EVENT_MOVE: 'move',
	/** @const */
	EVENT_END: 'end'
};

/** @const */
Mantra.DOCUMENT = window.document;



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

/*global Mantra: true */

Mantra["define"]("Mantra.utils.NodeStore",
	/**
	 * @lends Mantra.utils.NodeStore.prototype
	 */
	{
		constructor: function (target, id) {
			this["target"] = target;
			this["id"] = id;
			this._store = {};
		},

		"get": function (name) {
			return this._store[name];
		},

		"set": function (name, value) {
			this._store[name] = value;
			return value;
		},

		"remove": function (name) {
			var value = this["get"](name);
			delete this._store[name];
			return value;
		},

		/**
		 * @lends Mantra.utils.NodeStore
		 */
		"statics": {
			_stores: {},
			_targetsIds: {},
			_id: 0,

			"getStore": function (target) {
				var id = target["_mid"],
					store;

				if (id === void 0) {
					target["_mid"] = id = this._id++;
					this._targetsIds[id] = target;
				}

				store = this._stores[id];

				if (!store) {
					store = this._stores[id] = new Mantra["utils"]["NodeStore"](target, id);
				}

				return store;
			}
		}
	}
);

Mantra["relayMethod"](Mantra, Mantra["utils"]["NodeStore"], "getStore");

/*global Mantra: true */

Mantra['define']('Mantra.gestures'
	/**
	 * @lends Mantra.gestures
	 *
	{

	}*/
);

/*global Mantra: true */

Mantra['define']('Mantra.gestures.Dispatcher',
	/**
	 * @lends Mantra.gestures.Dispatcher.prototype
	 */
	{
		"singleton": true,

		/**
		 * @constructs
		 */
		constructor: function () {
			this._detect = this._detect.bind(this);
			this._determineEventTypes();
		},

		_gestures: {},

		_gestureListeners: 0,

		_determineEventTypes: function () {
			var types = {};

			if (Mantra.HAS_TOUCHEVENTS) {
				if (Mantra.NO_MOUSEEVENTS) {
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
			}
			// TODO: pointer events

			Mantra.EVENT_TYPES = types;
		},

		/**
		 * @param gesture
		 */
		"register": function (gesture) {
			if (!(gesture instanceof Mantra['gestures']["Gesture"])) {
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

			var store = Mantra["getStore"](target),
				gestureListeners;

			gestureListeners = store["get"](gestureName) || (store["set"](gestureName, []));
			gestureListeners.push(fn);

			this._gestureListeners++;
			this._gestures[gestureName].listeners++;


			var startedTarget = store["get"]("detecting") || 0;
			store["set"]("detecting", startedTarget++);

			if (startedTarget == 1) {
				this._bind(Mantra.EVENT_TYPES[Mantra.EVENT_START], target);
			}

			if (this._gestureListeners == 1) {
				this._bind(Mantra.EVENT_TYPES[Mantra.EVENT_MOVE] + ' ' + Mantra.EVENT_START[Mantra.EVENT_END]);
			}
		},

		"off": function (gestureName, target, fn) {
			if (!this._gestures[gestureName]) {
				return;
			}

			var store = Mantra["getStore"](target),
				gestureListeners;

			gestureListeners = store["get"](gestureName);

			var index = gestureListeners.indexOf(fn);

			if (index > -1) {
				store["set"](gestureName, gestureListeners.splice(index, 1));

				this._gestureListeners--;
				this._gestures[gestureName].listeners--;

				var startedTarget = store["get"]("detecting");

				store["set"]("detecting", startedTarget--);

				if (!startedTarget) {
					this._unbind(Mantra.EVENT_TYPES[Mantra.EVENT_START], target);
				}

				if (this._gestureListeners === 0) {
					this._unbind(Mantra.EVENT_TYPES[Mantra.EVENT_MOVE] + ' ' + Mantra.EVENT_START[Mantra.EVENT_END]);
				}
			}
		},

		_bind: function (events, target) {
			var i, l;

			events = events.split(' ');
			target || (target = Mantra.DOCUMENT);

			for (i = 0, l = events.length; i < l; i++) {
				target.addEventListener(events[i],  this._detect, false);
			}
		},

		_unbind: function (events, target) {
			var i, l;

			events = events.split(' ');
			target || (target = Mantra.DOCUMENT);

			for (i = 0, l = events.length; i < l; i++) {
				target.removeEventListener(events[i],  this._detect, false);
			}
		},

		_detect: function (e) {
			console.log(e.type);
		},

		/**
		 * @lends Mantra.gestures.Dispecher
		 */
		"statics": {

		}
	}
);

Mantra["relayMethod"](Mantra, Mantra['gestures']['Dispatcher'], "on");
Mantra["relayMethod"](Mantra, Mantra['gestures']['Dispatcher'], "off");
Mantra["relayMethod"](Mantra, Mantra['gestures']['Dispatcher'], "register");


/*global Mantra: true */

Mantra['define']('Mantra.gestures.Gesture',
	/**
	 * @lends Mantra.gestures.Gesture.prototype
	 */
	{

		"singleton": true,
		"abstract": true,

		"name": null,

		/**
		 * @constructs
		 */
		constructor: function () {
			this["name"] && Mantra['gestures']['Dispecher']["register"](this);
		},

		/**
		 * @lends Mantra.gestures.Gesture
		 */
		"statics": {

		}
	}
);

/*global Mantra: true */

Mantra['define']('Mantra.gestures.Tap',
	/**
	 * @lends Mantra.gestures.Tap.prototype
	 */
	{
		"extend": 'Mantra.gestures.Gesture',

		"name": "tap",

		/**
		 * @constructs
		 */
		constructor: function () {
			this["superconstructor"].apply(this);
		}

	}
);
}).call(this, window);