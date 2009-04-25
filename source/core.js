/*!
 * $hort <?=$version."\n"?>
 * http://github.com/kltan/short/tree/master
 * JS library development simplified 
 * Released under the MIT, BSD, and GPL Licenses
 * Copyright 2009 Kean L. Tan 
 * Start date: 2009-04-01
 * Last build: <?=$time."\n"?>
 */

;(function(){ //start anon

var window = this,
	document = this.document,
	$push = Array.prototype.push,
	$slice = Array.prototype.slice,	
	$toString = Object.prototype.toString,
	undefined;
	
var _$ = this.$,
	_$hort = this.$hort;
		  
var $ = this.$ = this.$hort = function( query, context ) {
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
				var tmp;
				
				query = $hort.cleanHTML(query);
				
				if(/^<(tr)+/i.test(query)) {
					query = '<table>' + query + '</table>';
					tmp = document.createElement('DIV');
					tmp.innerHTML=query;
					
					tmp = tmp.firstChild;
					
				}
				// td or th
				else if(/^<(td|th)+/i.test(query)) {
					query = '<table><tr>' + query + '</tr></table>';
					tmp = document.createElement('DIV');
					tmp.innerHTML=query;

					tmp = tmp.firstChild.firstChild.firstChild;
					
				}
				
				else if(!tmp){
					tmp = document.createElement('DIV');
					tmp.innerHTML = query;
				}
				
				for (var i =0; i < tmp.childNodes.length; i++)
					result[i] = tmp.childNodes[i];
				
				this.query = query;
			}
			else {
				// if CSS query
				result = $.selector(query, context);
				this.query = query;
			}
		}
		
		// onDOMready
		else if (typeof query === "function") {
			this[0] = document;
			if(!$hort.done)
				$.ready_queue(function(){
					query.call(document, $);
				});
			else
				query.call(document, $);
				
			return;
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
			this.populate(result);
		} 
		catch(e) { $.error([e]); }
	}
}

$.fn = $.prototype.init.prototype;

// define extend (o,o2,o3,o4,o5 .......)
// make stiching prototypes easy
$.extend = function(o) {
	if (!(typeof arguments[0] === 'object' || typeof o === 'function')) return;
	
	for ( var i = 1; i < arguments.length; i++ ) 
		for ( var key in arguments[i] ) 
			arguments[0][key] = arguments[i][key]; 
	return arguments[0];
};

$.extend($.fn, {

	// populate nodes into $hort
	populate: function(elements ,n) {
		n = n || 0;
		// make a clean array
		this.length = n;
		if(!$hort.isArray(elements))
			elements = $hort.makeArray(elements);

		// exit if no elements found
		if (!elements.length) return this;
		
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
	
	// adding self to chain
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
	
	createElement: function(elName, elAttr, html, i, scope) {
		if(!$hort.isNumber(i) || i===0) i = 1;
		scope = scope || window;
				
		var ret = [],
			el = scope.document.createElement(elName.toUpperCase());
			
		for(var j=0; j<i; j++) {
			ret.push(el.cloneNode(false));
			if($hort.isString(html) || $hort.isNumber(html))
				ret[j].innerHTML = html; 
		}
		
		return $hort(ret).attr(elAttr).get();
	},
	
	$hort: <?=$version?>,
		 
	// Miller type detection, learning from c.l.js
	isArray: function(o){ return $toString.call(o) === "[object Array]" },
	isObject: function(o){ return $toString.call(o) === "[object Object]" },
	isDate: function(o){ return $toString.call(o) === "[object Date]" },
	isGenericObject: function(o) { return typeof o === "object" },
	isFunction: function(o) { return typeof o === "function" },
	isString: function(o) { return typeof o === "string" },
	isNumber: function(o){ return typeof o === "number" },
	isBoolean: function(o){ return typeof o === "boolean" },
	
	isHTML: function(o) { return /^<(.|\s)+>$/.test(o) },

	// browser detection, !! added to force return as boolean
	isIE6: !!(document.createElement('div').style.maxHeight === undefined),
	isIE7: !!(window.ActiveXObject && !window.opera && window.XMLHttpRequest && !document.querySelectorAll),
	isIE8: !!(window.ActiveXObject && !window.opera && document.querySelectorAll),
	isIE: !!(window.ActiveXObject && !window.opera),
	isGecko: !(document.getBoxObjectFor === undefined),
	isOpera: !!window.opera,
	isWebkit: !!(!window.opera && !navigator.taintEnable && document.evaluate && document.getBoxObjectFor === undefined),
	
	// trim front/ending whitespaces and newlines so innerHTML won't go crazy
	cleanHTML: function(HTML){ return HTML.replace(/^\s+|[\n\r\t]|\s+$/g, ''); },
	
	// make array-like objects into true array, CFT method, note that keyword is array-like
	// only works for array-like object like querynodelist
	makeArray: function(o) {
		try {
			return Array.prototype.slice.call(o);
		} catch(e) {
			var ret = [], length = 0;
			
			for(var prop in o)
				if ($hort.isNumber(parseInt(prop)))
					ret.push(o[prop]);

			return ret;
		}
	},
	
	// playing nice with others out there
	// no secret that it's borrowed from jQuery
	noConflict: function(extreme){
		window.$ = _$;

		if(extreme)
			window.$hort = _$hort;
			
		return $;
	},
	
	// throw error if can be done without halting script
	error: function(e) {
		if(window.console && window.console.log)
			console.log(e);
	},
	
	// returns a unique set of array
	unique: function(array) {
		var ret = [];
		o:for(var i = 0, n = array.length; i < n; i++) {
			for(var x = i + 1 ; x < n; x++) {
				if(array[x]===array[i]) // prevent window == document for DOM comparison
					continue o; 
			}
			ret.push(array[i]);
		}
		return ret;
	},
	
	// default selector if CSS selector not included in package
	selector: function(qry, root) {
		root = root || document;
		if(document.querySelectorAll) {
			if (root.nodeType)
				return root.querySelectorAll(qry);
			else {
				var ret = [];
				root = $hort.makeArray(root);
				for(var i=0; i< root.length; i++) {
					ret = ret.concat(ret, $hort.makeArray(root[0].querySelectorAll(qry)));
				}
				return ret;
			}
		}
		qry = qry.split('#');
		
		if(qry.length == 2)
			return [document.getElementById(qry[1])];
		else
			return document.getElementsByTagName(qry[0]);
	},
	
	// is advanced CSS selector present?
	hasSelector: function(){
		return !!($hort.isFunction($hort.selector.filter));
	},
	
	ready_fns: [], // functions to fire onDOMready
	done: false, // onDOMready functions fired yet?
	
	// add functions to $hort.fns
	ready_queue: function(fn){
		if($.isFunction(fn))
			$.ready_fns.push(fn);
	},
	
	// reliable onDOMready code, thanks to Dean Edwards/Diego Perini/Byron McGregor/John Resig/Matthias Miller et al
	// a piece of onDOMready code that's four years in the making
	ready: function(){
		var init = function() {
			if($.done) return;
			$.done = true;
			var errors = [];
		
			// run all functions that are associated with ready
			for(var i=0; i< $.ready_fns.length; i++) {
				try{ $.ready_fns[i].call(window, $); }
				catch(e){ errors.push(e); }
			}
			
			if (errors.length)
				$.error(errors);
		}
		
		if(document.addEventListener)
			document.addEventListener('DOMContentLoaded', init, false);

		if(window.ActiveXObject && !window.opera && document.documentElement) {
			try {
				document.createElement('div').doScroll('left');
				return init();
			} catch(e) {}
		}
		else if (/loaded|complete/.test(document.readyState)) return init();
		
		// loop every 100 ms is good enough
		if (!$.done) setTimeout(arguments.callee, 100);
	}
});

// run the function wait for onDOMready
$.ready();

})();// end self-executing anon