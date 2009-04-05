/*!
 * $hort 0.1 
 * JS library development simplified 
 * Tri-licensed under the MIT, BSD and GPL
 * Copyright 2009 Kean Tan 
 * Start date: 2009-04-01
 * Last build: 2009-04-01 03:19:28 PM 
 */

(function(){ //start anon

var window = this,
	document = this.document,
	$push = Array.prototype.push,
	$slice = Array.prototype.slice,	
	$toString = Object.prototype.toString,
	undefined;
	
var _$ = this.$,
	_$hort = this.$hort;
		  
var $ = window.$ = this.$hort = function( query, context ) {
	// Constructor
	return new $.fn.init( query, context );
};

$.fn = $.prototype = {
	init: function(query, context) {
		query = query || document;
		context = context || document;
		
		var result = [];
		
		if (query.nodeType) {
			result[0] = query;
			this.query = query;
		}
		
		else if(typeof query === "string" && query.length > 0) {
			// if HTML
			if (/^<(.|\s)+>$/.test(query)) {
				var x = document.createElement('DIV');
				x.innerHTML = query;
				for (var i =0; i < x.childNodes.length; i++)
					result[i] = x.childNodes[i];
			}
			else {
				// if CSS query
				result = $.selector(query, context);
				this.query = query;
			}
		}
		
		// onDOMready
		else if (typeof query === "function") {
			$.ready_queue(function(){
				query.call(window, $);
			});
		}

		// if array, object or $hort object
		else { result = query; }
		
		// try to populate the elements into $hort
		try { this.populate(result); } 
		catch(e) { $.error([e]); }
	},
	
	// populate, wipe, stack and end is meant for plugin use
	// extremely fast and sanitizes results (makes clean array) for basic element population and wipe
	
	// populate nodes into $hort
	populate: function(elements) {
		// make a clean array
		elements = $slice.call(elements);
		// exit if no elements found
		if (!elements.length) return;
		// push elements into $hort
		$push.apply(this, elements);
	},
	
	// empty all elements store in $hort, starting from index n
	wipe: function(n){
		n = n || 0;
		
		for(var i=n; i<this.length; i++)
			delete this[i];

		this.length = n;
		
		return this;
	},
	
	// stacking $hort for chainability
	stack: function(object){
		this.$hortStack.push(object);
	},
	
	// getting into the previous chain
	end: function() {
		return this.$hortStack[0];
	},
	
	// the stack to track callee $hort objects
	$hortStack: [],
	
	// cache DOM operations
	// should follow this convetion queryStack[query] = arrayOfElement(s)
	queryStack:{}, 

	// how many elements in $hort
	length: 0,
	
	// the query that was passed into this instance of $hort
	query: null,
	
	// $hort version
	$hort: 0.1
}

// hook up the methods to init
for(var prop in $.fn) {
	if (prop != 'init')
		$.fn.init.prototype[prop] = $.fn[prop];
}

// define extend (o,o2,o3,o4,o5 .......)
$.extend = function(o) {
	for ( var i = 0; i < arguments.length; i++ ) 
		for ( var key in arguments[i] ) 
			o[key] = arguments[i][key]; 
	return o;
};

$.extend($, {
	// reliable type detection
	isArray: function(o){ return $toString.call(o) === "[object Array]" },
	isObject: function(o){ return $toString.call(o) === "[object Object]" },
	isDate: function(o){ return $toString.call(o) === "[object Date]" },
	isGenericObject: function(o) { return typeof o === "object" },
	isFunction: function(o) { return typeof o === "function" },
	isString: function(o) { return typeof o === "string" },
	isNumber: function(o){ return typeof o === "number" },
	isBoolean: function(o){ return typeof o === "boolean" },

	// reliable browser detection
	isIE: !!(window.ActiveXObject && document.all && !window.opera),
	isGecko: !!!(document.getBoxObjectFor === undefined),
	isOpera: !!window.opera,
	isWebkit: !!(!window.opera && !navigator.taintEnable && document.evaluate && document.getBoxObjectFor === undefined),
	
	cleanHTML: function(HTML){
		return HTML.replace(/[\n\r\t]/g, '').replace( /^\s+|\s+$/g, '');
	},	
	// playing nice with otherss out there
	noConflict: function(extreme){
		window.$ = _$;
		if(extreme)
			window.$hort = _$hort;
			
		return $;
	},
	
	// throw error if you suspect coding error
	error: function(e) {
		if(window.console && window.console.log) {
			for(var i=0; i< e.length; i++)
				window.console.log(e[i]);
		}
		else throw new Error(e[0]);
	},
	
	// method to namespace function
	namespace: function(name, root) {
		if (name) {
			// explode namespace with delimiter
		    name=name.split(".");
			// root is defaulted to window obj
		    var ns = root || window;
			// loop through each level of the namespace
		    for (var i =0; i<name.length; i++) {
				// nm is current level name
		    	var nm = name[i];
				// if not exist, add current name as obj to parent level, assign ns (parent) to current
				ns = ns[nm] || ( ns[nm] = {} ); 
				
				// this will determine if we have successfully created the namespace
				if (i === name.length-1) 
					return !!($.isGenericObject(ns) || $.isFunction(ns)); // only object and function can accept namespacing
			}
		}
		return false;
	},
	
	fns: [], // functions to fire onDOMready
	done: false, // onDOMready functions fired yet?
	// add functions to $hort.fns
	ready_queue: function(fn){
		if($.isFunction(fn))
			$.fns.push(fn);
	},
	// reliable onDOMready code
	ready: function(){
		var init = function() {
			if($.done) return;
			$.done = true;
			var errors = [];
		
			// run all functions that are associated with ready
			for(var i=0; i< $.fns.length; i++) {
				try{ $.fns[i](); }
				catch(e){ errors.push(e); }
			}
			
			if (errors.length)
				$.error(errors);
		}
		
		if(document.addEventListener)
			document.addEventListener('DOMContentLoaded', init, false);

		if($.isIE) {
			if (document.body) {
				try {
					document.createElement('div').doScroll('left');
					return init();
				} catch(e) {}
			}
		}
		else if (/loaded|complete/.test(document.readyState)) return init();
		
		if (!$.done) setTimeout(arguments.callee, 100);
		
		var _prevOnload = window.onload;
		window.onload = function() {
			if(!$.done)
				init();
				
			if ($.isFunction(_prevOnload))
				_prevOnload();
		};
	}
});

// listen to ready events
$.ready();

})();// end anon