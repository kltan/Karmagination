/*!
 * $hort <?=$version."\n"?>
 * http://github.com/kltan/short/tree/master
 * JS library development simplified 
 * Released under the MIT, BSD, and GPL Licenses.
 * Copyright 2009 Kean L. Tan 
 * Start date: 2009-04-01
 * Last build: <?=$time."\n"?>
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
	return new $.prototype.init( query, context );
};

$.prototype = {
	init: function(query, context) {
		query = query || document;
		context = context || document;
		
		// the stack to track callee $hort objects
		this.$hortStack = [];
		
		var result = [];
		
		if (query.nodeType || query === window) {
			this[0] = query;
			this.length = 1;
			this.query = query;
			return;
		}
		
		// string is most used query
		else if(typeof query === "string" && query.length > 0) {
			// if HTML, least used so we just accept it
			if (/^<(.|\s)+>$/.test(query)) {
				var tmp = document.createElement('DIV');
				tmp.innerHTML = $hort.cleanHTML(query);
				
				for (var i =0; i < tmp.childNodes.length; i++)
					result[i] = tmp.childNodes[i];
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
		else { 
			result = query; 
			if(query.query)
				this.query = query.query;
		}
		
		// try to populate the elements into $hort, for the fastest performance
		// in init we do not want to call to other functions if possible, 
		// code reuse is just giving shitty performance
		try { 
			this.length = 0;
			if($toString.call(result) != "[object Array]")
				result = $slice.call(result);
			if (result.length)
				$push.apply(this, result);
		} 
		catch(e) { $.error([e]); }
	}
}

$.fn = $.prototype.init.prototype;

// define extend (o,o2,o3,o4,o5 .......)
// make stiching prototypes easy
$.extend = function(o) {
	for ( var i = 0; i < arguments.length; i++ ) 
		for ( var key in arguments[i] ) 
			o[key] = arguments[i][key]; 
	return o;
};

$.extend($.fn, {

	// populate, wipe, stack and end
	// extremely fast and sanitizes results (makes clean array) for basic element population and wipe
	
	// populate nodes into $hort
	populate: function(elements ,n) {
		n = n || 0;
		// make a clean array
		this.length = n;
		elements = $slice.call(elements);

		// exit if no elements found
		if (!elements.length) return;
		// push elements into $hort
		$push.apply(this, elements);
		return this;
	},
	
	// empty all elements store in $hort, starting from index n,
	wipe: function(n){
		n = n || 0;
		
		for(var i=n; i<this.length; i++)
			delete this[i];

		this.length = n;
		
		return this;
	},
	
	// stacking $hort for chainability
	stack: function(o){
		this.query = o.query;
		this.$hortStack.push(o);
		return this;
	},
	
	andSelf: function() {
		return this.$hortStack.length ? $hort(this).populate(this.$hortStack[0], this.length).stack(this): $hort(this).stack(this);
	},
	
	// getting into the previous chain
	end: function() {
		return this.$hortStack[0];
	},
	
	// how many elements in $hort
	length: 0,
	
	// the query that was passed into the first unchained instance of $hort
	query: null,
	
	// $hort version
	$hort: <?=$version?>
});


$.extend($, {
	// Miller type detection
	isArray: function(o){ return $toString.call(o) === "[object Array]" },
	isObject: function(o){ return $toString.call(o) === "[object Object]" },
	isDate: function(o){ return $toString.call(o) === "[object Date]" },
	isGenericObject: function(o) { return typeof o === "object" },
	isFunction: function(o) { return typeof o === "function" },
	isString: function(o) { return typeof o === "string" },
	isNumber: function(o){ return typeof o === "number" },
	isBoolean: function(o){ return typeof o === "boolean" },

	// browser detection
	isIE: !!(window.ActiveXObject && document.all && !window.opera),
	isGecko: !!!(document.getBoxObjectFor === undefined),
	isOpera: !!window.opera,
	isWebkit: !!(!window.opera && !navigator.taintEnable && document.evaluate && document.getBoxObjectFor === undefined),
	
	cleanHTML: function(HTML){ return HTML.replace(/^\s+|[\n\r\t]|\s+$/g, ''); },
	
	// playing nice with otherss out there
	noConflict: function(extreme){
		window.$ = _$;

		if(extreme)
			window.$hort = _$hort;
			
		return $;
	},
	
	// throw error if they can be understood
	error: function(e) {
		if(window.console && window.console.log)
			console.log(e);
	},
	
	// returns a unique set of array
	unique: function(a) {
		var r = [];
		o:for(var i = 0, n = a.length; i < n; i++) {
			for(var x = i + 1 ; x < n; x++) {
				if(a[x]===a[i]) continue o; // prevent window == document for DOM comparison
			}
			r[r.length] = a[i];
		}
		return r;
	},
	
	selector: function(qry) {
		qry = qry.split('#');
		
		if(qry.length == 2)
			return [document.getElementById(qry[1])];
		
		else
			return document.getElementsByTagName(qry[0]);
	},
	
	hasSelector: function(){
		return !!$hort.selector.filter;
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
	
	// rgb(255, 0, 0) -> #FF0000
	rgbToHex: function(array){
		if (array.length < 3) return null;
		if (array.length == 4 && array[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (array[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return '#' + hex.join('');
	},
	
	// z-index -> zIndex
	camelCase: function(property){
		return property.replace(/\-(\w)/g, function(all, letter){ return letter.toUpperCase();	});
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
		
		// 100 ms is good enough
		if (!$.done) setTimeout(arguments.callee, 100);
	}
});

// listen to onDOMready events
$.ready();

})();// end anon