/*!
 * Karmagination <?=$version?> - Fast and Easy
 * http://www.karmagination.com
 * Released under the MIT, BSD, and GPL Licenses - Choose one that fit your needs
 * Copyright (c) 2009 Kean L. Tan 
 * Start date: 2009-04-01
 * Build Time: <?=$time."\n"?>
 * Build: <?=$build."\n"?>
 *
 * Attribution:
 * onDOMready based on many JS experts' input especially Dean Edwards, see the unminified source code for names
 * Custom events based on Dean Edwards' blog post enlightenment
 * CSS and browser detection copyright Valerio Proietti of Mootools
 * Offsets, dimensions, and extend copyright John Resig of jQuery
 * Selector engine, Sizzle, founded by John Resig, copyright Dojo Foundation
 * Common Feature Test, event support detection copyright Juriy Zaytsev/kangax
 * Animation based loosely on Ryan Morr's FX library
 */
 
//start scope protection
(function karma_anonymous(){ 
		   
// speeding up reference in non-JIT bytecode
var window = this,
	document = this.document,
	_Karma = this.Karma,
	_$ = this.$;

// Constructor Function
var Karma = this.$ = this.Karma = function( query, context ) {
	// note: if Karma has not been instatiated, this === global object, interpreted by most browsers as window
	// I did not use instance of because window instanceof leaks memory in IE, what a shame
	//if (!(this instanceof Karma)) return new Karma( query, context );
	if (this.constructor !== Karma) return new Karma( query, context );
	
	query = query || document;
	this.context = context = context || document;
	
	// the stack to track callee Karma objects
	this.KarmaStack = [];
	
	// result can be empty
	var result = [];
	
	// if a node is passed
	if (query.nodeType || query === window) {
		this[0] = query;
		this.length = 1;
		this.query = query;
		return; // do not return 'this' because it's a constructor, return just to break from function
	}
	
	// string is most used query
	else if(typeof query == "string") {
		this.query = query = Karma.trim(query);
		if(!query.length) {
			this[0] = document;
			this.length = 1;
			this.query = query;
			return; // do not return 'this' because it's a constructor, return just to break from function
		}

		var context = this.context.ownerDocument || this.context;
		
		// if HTML string passed
		result = Karma.isHTML(query) ? Karma.HTMLtoNode(query, context) : Karma.Sizzle(query, context);
	}
	
	// onDOMready
	else if (typeof query == "function") {
		(!Karma.isReady) ? Karma.readyQueue(function readyQueue(){ query(Karma);}) :	query(Karma);
		return;
	}

	// if array, object or Karma object, or some unknown, make it into an array
	else { 
		result = query; 
		if(query.query)	this.query = query.query;
	}
	
	// push all the elements that we have gotten into the Karmagination Instance
	this.populate(result);
};

Karma.fn = Karma.prototype;

// for extend, use no Karmagination syntax (pure js) cause they will fail
Karma.extend = Karma.fn.extend = function() {
	// copy reference to target object
	var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;

	// Handle a deep copy situation
	if ( typeof target == 'boolean' ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target != 'object' && typeof target != 'function' )
		target = {};

	// extend Karma itself if only one argument is passed
	if ( length == i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ )
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null )
			// Extend the base object
			for ( var name in options ) {
				var src = target[ name ], copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy )
					continue;

				// Recurse if we're merging object values
				if ( deep && copy && typeof copy == "object" && !copy.nodeType )
					target[ name ] = Karma.extend( deep, 
						// Never move original objects, clone them
						src || ( copy.length != null ? [ ] : { } )
					, copy );

				// Don't bring in undefined values
				else if ( typeof copy != 'undefined' )
					target[ name ] = copy;
			}

	// Return the modified object
	return target;
};

Karma.fn.extend({
	// populate nodes into Karma, starting from index n
	populate: function(elements ,n) {
		n = n || 0;
		// make a clean array
		this.length = n;
		
		elements = Karma.makeArray(elements);

		// exit if no elements found
		if (!elements.length) return this;
		
		// push elements into Karma, faster way than just just a for loop
		Array.prototype.push.apply(this, elements);
		return this;
	},
	
	// empty all elements store in Karma, starting from index n,
	wipe: function(n){
		n = n || 0;
		
		for(var i=n; i<this.length; i++)
			delete this[i];

		this.length = n;
		
		return this;
	},
	
	// stacking Karma for chainability
	stack: function(o){
		this.query = o.query;
		this.KarmaStack.push(o);
		return this;
	},
	
	// getting into the previous chain
	end: function() {
		return this.KarmaStack[0];
	},
	
	// how many elements in Karma, initially set to 0
	length: 0,
	
	// query that created the current instance of Karma
	query: null,
	
	isKarma: <?=$version?>
	
});

Karma.extend({
	
	/* special thanks to jQuery's cases so I don't have to manually hunt down the special cases myself */	 
	HTMLtoNode: function(query, context) {
		context = context || document;
		var query = Karma.cleanHTML(query);
		
		var tmp = (context === window) ? Karma.temp.div.cloneNode(false) : context.createElement('DIV'), 
			subquery = query.substring(0, 8).toLowerCase();

		// lesson learned again and again never use Regex when indexOf can replace the job.
		// td
		if(!subquery.indexOf('<tr')) {
			query = '<table>' + query + '</table>';
			tmp.innerHTML=query;
			tmp = tmp.firstChild.firstChild;
		}
		// td or th
		else if(!subquery.indexOf("<td") || !subquery.indexOf("<th")) {
			query = '<table><tr>' + query + '</tr></table>';
			tmp.innerHTML=query;
			tmp = tmp.firstChild.firstChild.firstChild;
		}
		// legend
		else if(!subquery.indexOf("<legend")) {
			query = '<fieldset>' + query + '</fieldset>';
			tmp.innerHTML=query;
			tmp = tmp.firstChild;
		}
		// option
		else if(!subquery.indexOf("<option")) {
			query = '<select multiple="multiple">' + query + '</select>';
			tmp.innerHTML=query;
			tmp = tmp.firstChild;
		}
		
		// thead etc, well we made subquery soooo short it should not be a problem
		else if(/^<thead|tbody|tfoot|colg|capt/.test(subquery)) {
			query = '<table>' + query + '</table>';
			tmp.innerHTML=query;
			tmp = tmp.firstChild;
		}
		
		// col
		else if(!subquery.indexOf("<col")) {
			query = '<table><colgroup>' + query + '</colgroup></table>';
			tmp.innerHTML=query;
			tmp = tmp.firstChild.firstChild.firstChild;
		}
		// script and link
		else if (!subquery.indexOf("<script") || !subquery.indexOf("<link") ) {
			query = 'div<div>' + query + '</div>';
			tmp.innerHTML=query;
			tmp = tmp.lastChild;
		}

		// others
		else {
			tmp.innerHTML = query;
		}
		
		return tmp.childNodes.length ? Karma.makeArray(tmp.childNodes) : null;
	},
	 
	// type detection, Miller method for those special cases otherwise typeof is faster, 
	isArray: function(o){ return Object.prototype.toString.call(o) == "[object Array]" },
	isObject: function(o){ return Object.prototype.toString.call(o) == "[object Object]" },
	isDate: function(o){ return Object.prototype.toString.call(o) == "[object Date]" },
	isGenericObject: function(o) { return typeof o == "object" },
	isFunction: function(o) { return typeof o == "function" },
	isString: function(o) { return typeof o == "string" },
	isNumber: function(o){ return typeof o == "number" },
	isValue: function(o){ return typeof o == "number" || typeof o == "string" },
	isBoolean: function(o){ return typeof o == "boolean" },
	// undefined munging is slower in all modern browser, use is not recommended
	isDefined: function(o) { return typeof o != "undefined" },
	// isXML: function(o) { return 'innerHTML' in (o || o.ownerDocument).documentElement },
	// unreliable detection, using documentation to prevent mistake instead
	isHTML: function(o) { return Karma.isString(o) ? /^<.+/.test(o.substring(0,3)) : false; },
	isKarma: function(o) { return o.constructor === Karma },

	
	// browser detection, TAKEN FROM MOOTOOLS with modifications, if you are new to JS, !! mean cast as boolean type
	// learned something new today from BING, a new-old IE feature detection that's probably better
	// old method !!(window.ActiveXObject && !window.opera) 
	// new method !window.addEventListener, we used that for feature detection but it turns out to be an IE detector too
	isIE: !!(!window.addEventListener && window.ActiveXObject),
	isIE6: typeof document.createElement('DIV').style.maxHeight == "undefined",
	isIE7: !!(!window.addEventListener && window.XMLHttpRequest && !document.querySelectorAll),
	isIE8: !!(!window.addEventListener && document.querySelectorAll),
	isGecko: navigator.product == 'Gecko',
	isOpera: !!window.opera,
	isWebkit: !!(!window.opera && !navigator.taintEnable && document.evaluate && navigator.product != 'Gecko'),
	
	// trim front/ending whitespaces and newlines so innerHTML won't go crazy
	cleanHTML: function(HTML){ return HTML.replace ? HTML.replace(/[\n\r]/g, ' ') : HTML; },
	
	// used internally, only works for array-like objects
	makeArray: function(o) {
		if (Karma.isArray(o)) return o; // makes sense, doesn't it?
		if (Karma.support.nodeListToArray) return Array.prototype.slice.call(o);
		
		var ret = [];
		
		// some array-like objects will have length
		if (o.length) {
			for(var i=0; i<o.length; i++)
				ret.push(o[i]);
		}
		else {
			var length = 0;
			
			for(var prop in o) {
				ret[prop] = o[prop];
				length++;
			}
			
			ret.length = length;
		}
		return ret;
	},
	
	noConflict: function(extreme){
		window.$ = _$;
		if (extreme)
			window.Karma = _Karma;
		return Karma;
	},
	
	// returns a unique set of array
	unique: function(array) {
		var ret = [];
		o:for(var i = 0, n = array.length; i < n; i++) {
			for(var x = i + 1 ; x < n; x++) {
				if(array[x] === array[i])
					continue o; 
			}
			ret.push(array[i]);
		}
		return ret;
	},
	
	// functions to fire onDOMready
	readyFunctions: [],
	
	// onDOMready yet?
	isReady: false, 
	
	// add functions to Karma.fns
	readyQueue: function(fn){
		if(Karma.isFunction(fn))
			Karma.readyFunctions.push(fn);
	},
	
	// reliable onDOMready code, thanks to Dean Edwards/Diego Perini/Byron McGregor/John Resig/Matthias Miller et al
	// view the contributors here, http://dean.edwards.name/weblog/2006/06/again/
	// modified so that onDOMready runs once for each frame it's being used, speeds up when you have multiple onDOMready statements
	ready: function(){
		var init = function() {
			if(Karma.isReady) return;
			Karma.isReady = true;
			
			// run all functions that are associated with ready
			for(var i=0; i< Karma.readyFunctions.length; i++) {
				Karma.readyFunctions[i](Karma);
			}
		}
		
		if(Karma.support.addEventListener)
			document.addEventListener('DOMContentLoaded', init, false);

		else if(document.documentElement.doScroll) {
			try {
				document.createElement('div').doScroll('left');
				return init();
			} catch(e) {}
		}
		else if (/loaded|complete/.test(document.readyState)) return init();
		 
		// loop every 88 ms is good enough
		if (!Karma.isReady) setTimeout(arguments.callee, 88);
	}
});

// added this for jQuery compatibility
Karma.browser = {
	safari: Karma.isWebkit,
	opera: Karma.isOpera,
	mozilla: Karma.isGecko,
	msie: Karma.isIE
}
// some simulations below to feature test the capabilities of the current browser
// also populates known attribute names that are problematic
// values are stored for future use
Karma.temp = {
	div: document.createElement('DIV'),
	fragment: document.createDocumentFragment(),
	camelCase: {},
	nodeListToArray: function(){
		try { return Array.prototype.slice.call(document.forms, 0) instanceof Array; } catch (e) { return false; }
	},
	
	attrMap: {
		'for': 'htmlFor',
		'class': 'className',
		maxlength: 'maxLength',
		readonly: 'readOnly',
		rowspan: 'rowSpan',
		colspan: 'colSpan',
		codebase: 'codeBase',
		ismap: 'isMap',
		accesskey: 'accessKey',
		longdesc: 'longDesc',
		tabindex: 'tabIndex',
		valign: 'vAlign',
		cellspacing: 'cellSpacing',
		cellpadding: 'cellPadding',
		id: 'id',
		href: 'href',
		dir: 'dir',
		src: 'src',
		title: 'title',
		type: 'type'
	},
	
	offsets: function(){
		var body = document.body,
			container = document.createElement('div'), 
			innerDiv,
			checkDiv,
			table,
			td,
			rules,
			cur_prop,
			bodyMarginTop = document.body.style.marginTop,
			html = '<div style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;"><div></div></div><table style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>';

		var rules = { position: 'absolute', top: 0, left: 0, margin: 0, border: 0, width: '1px', height: '1px', visibility: 'hidden' };
		for ( cur_prop in rules ) container.style[cur_prop] = rules[cur_prop];

		container.innerHTML = html;
		body.insertBefore(container, body.firstChild);
		innerDiv = container.firstChild, checkDiv = innerDiv.firstChild, td = innerDiv.nextSibling.firstChild.firstChild;

		this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
		this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

		innerDiv.style.overflow = 'hidden', innerDiv.style.position = 'relative';
		this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

		body.style.marginTop = '1px';
		this.doesNotIncludeMarginInBodyOffset = (body.offsetTop === 0);
		body.style.marginTop = bodyMarginTop;

		body.removeChild(container);
	
	},
	
	calculatedOffsets: false
}

Karma.uniqueId = 0;
Karma.storage = {};

// know the current browser's capabilities, we calculate here and use everywhere without recalculating
// why isDefined is reliable here, REASON: we just created the ELEMENT and can be sure they are not polluted
Karma.support = {
	cssText: 'cssText' in Karma.temp.div.style,
	cssFloat: 'cssFloat' in Karma.temp.div.style,
	styleFloat: 'styleFloat' in Karma.temp.div.style,
	opacity: 'opacity' in Karma.temp.div.style,
	filter: 'filter' in Karma.temp.div.style,
	outerHTML: 'outerHTML' in Karma.temp.div,
	addEventListener: 'addEventListener' in Karma.temp.div,
	attachEvent: 'attachEvent' in Karma.temp.div,
	dispatchEvent: 'dispatchEvent' in Karma.temp.div,
	fireEvent : 'fireEvent' in Karma.temp.div,
	createEvent: 'createEvent' in document,
	createEventObject: 'createEventObject' in document,
	nodeListToArray: Karma.temp.nodeListToArray()
};

// run the function to wait for onDOMready
Karma.ready();