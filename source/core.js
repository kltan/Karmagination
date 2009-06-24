/*!
 * Karmagination <?=$version?> - Fast and Easy
 * http://www.karmagination.com
 * Released under the MIT, BSD, and GPL Licenses - Choose one that fit your needs
 * Copyright (c) 2009 Kean L. Tan 
 * Start date: 2009-04-01
 * Last build: <?=$time."\n"?>
 *
 * Attribution:
 * CSS and browser detection copyright Valerio Proietti of Mootools
 * Selector engine, Sizzle, founded by John Resig, copyright Dojo Foundation
 * Common Feature Test copyright Juriy Zaytsev
 * onDOMready based on many JS experts' input, see the unminified source code for names
 */
 
 //start scope protection
(function(){ 
		   
// speeding up reference in non-JIT bytecode
var window = this,
	document = this.document,
	undefined,
	_Karma = window.Karma;

// Constructor Function
var Karma = this.$ = this.Karma = function( query, context ) {
	if (!(this instanceof Karma)) return new Karma( query, context ); // if Karma has not been instatiated, this === window
	
	query = query || document;
	context = context || window;
	
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
	else if(typeof query == "string" && query.length > 0) {
		this.query = query;
		if (context.document) context = context.document;
		// if HTML string passed
		result = Karma.isHTML(query) ?	Karma.HTMLtoNode(query, context) : Karma.selector(query, context);
	}
	
	// onDOMready
	else if (typeof query == "function") {
		(!Karma.isReady) ? Karma.ready_queue(function(){ query(Karma);}) :	query(Karma);
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

Karma.extend = function(o) {
	var ret = (arguments.length == 1) ? Karma : (typeof o == 'object' || typeof o == 'function') ? o : {},
		i = (arguments.length == 1) ? 0 : 1;	
	
	for (; i < arguments.length; i++ ) 
		for ( var key in arguments[i] ) 
			if (arguments[i][key] !== undefined)
				ret[key] = arguments[i][key]; 
	
	return ret;
};

// create an alias
Karma.fn = Karma.prototype;

Karma.fn.extend = function(o) {
	Karma.extend(Karma.prototype, o);
}

Karma.fn.extend({
	// populate nodes into Karma, starting from index n
	populate: function(elements ,n) {
		n = n || 0;
		// make a clean array
		this.length = n;
		
		// if(!Karma.isArray(elements)) not needed as makeArray use early detection of Array to skip, saved some bytes
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
		query = Karma.cleanHTML(query);
		var tmp = (context === window) ? Karma.temp.div.cloneNode(false) : context.createElement('DIV'), 
			subquery = query.substring(0, 8).toLowerCase();

		// lesson learned again and again never use Regex when indexOf can replace the job.
		// td
		if(!subquery.indexOf('<tr')) {
			query = '<table>' + query + '</table>';
			tmp.innerHTML=query;
			tmp = tmp.firstChild;
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
			tmp = tmp.firstChild.firstChild;
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
	 
	// type detection, Miller method for those special cases otherwise typeof is faster
	isArray: function(o){ return Object.prototype.toString.call(o) == "[object Array]" },
	isObject: function(o){ return Object.prototype.toString.call(o) == "[object Object]" },
	isDate: function(o){ return Object.prototype.toString.call(o) == "[object Date]" },
	isGenericObject: function(o) { return typeof o == "object" },
	isFunction: function(o) { return typeof o == "function" },
	isString: function(o) { return typeof o == "string" },
	isNumber: function(o){ return typeof o == "number" },
	isValue: function(o){ return typeof o == "number" || typeof o == "string" },
	isBoolean: function(o){ return typeof o == "boolean" },
	isDefined: function(o) { return o !== undefined },
	// unreliable detection, using documentation to prevent mistake instead
	isHTML: function(o) { return /^<.+/.test(Karma.trim(o).substring(0,3).toLowerCase()) },
	isKarma: function(o) { return !!o.isKarma },

	
	// browser detection, TAKEN FROM MOOTOOLS with modifications, if you are new to JS, !! mean cast as boolean type
	// learned something new today from BING, a new-old IE feature detection that's probably better
	// old method !!(window.ActiveXObject && !window.opera) 
	// new method !window.addEventListener, we used that for feature detection but it turns out to be an IE detector too
	isIE: !window.addEventListener,
	isIE6: !!(document.createElement('DIV').style.maxHeight === undefined),
	isIE7: !!(!window.addEventListener && window.XMLHttpRequest && !document.querySelectorAll),
	isIE8: !!(!window.addEventListener && document.querySelectorAll),
	isGecko: !(document.getBoxObjectFor === undefined),
	isOpera: !!window.opera,
	isWebkit: !!(!window.opera && !navigator.taintEnable && document.evaluate && document.getBoxObjectFor === undefined),
	
	// trim front/ending whitespaces and newlines so innerHTML won't go crazy
	cleanHTML: function(HTML){ return Karma.trim(HTML).replace(/[\n\r]/g, ' '); },
	
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
	
	playNice: function(){
		window.Karma = _Karma;
		return Karma;
	},
	
	// returns a unique set of array
	unique: function(array) {
		var ret = [];
		o:for(var i = 0, n = array.length; i < n; i++) {
			for(var x = i + 1 ; x < n; x++) {
				if(array[x] === array[i]) // prevent window == document for DOM comparison
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
	ready_queue: function(fn){
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
				Karma.readyFunctions[i]();
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

Karma.temp = {
	div: document.createElement('DIV'),
	fragment: document.createDocumentFragment(),
	
	nodeListToArray: function(){
		try { return Array.prototype.slice.call(document.forms, 0) instanceof Array; } catch (e) { return false; }
	},
	
	contextMenu: function() {
		if (Karma.temp.div && Karma.temp.div.setAttribute)
			  Karma.temp.div.setAttribute("oncontextmenu", "");
		return Karma.isFunction(Karma.temp.oncontextmenu);
	},
	
	event: function() {
		Karma.temp.event.IS_EVENT_PREVENTDEFAULT_PRESENT = null;
		Karma.temp.event.IS_EVENT_SRCELEMENT_PRESENT = null;
		if (document.createElement) {
			var i = document.createElement("input"), root = document.documentElement;
			if (i && i.style && i.click && root && root.appendChild && root.removeChild) {
				i.type = "checkbox";
				i.style.display = "none";
				i.onclick = function (e) {e = e || window.event;Karma.temp.event.IS_EVENT_PREVENTDEFAULT_PRESENT = "preventDefault" in e;Karma.temp.event.IS_EVENT_SRCELEMENT_PRESENT = "srcElement" in e;};
				root.appendChild(i);
				i.click();
				root.removeChild(i);
				i.onclick = null;
				i = null;
			}
		}
	}
}

Karma.temp.event();

// know the current browser's capabilities, we calculate here and use everywhere without recalculating
// why isDefined is reliable here, REASON: we just created the ELEMENT and can be sure they are not polluted
Karma.support = {
	cssText: Karma.isDefined(Karma.temp.div.style.cssText),
	cssFloat: Karma.isDefined(Karma.temp.div.style.cssFloat),
	styleFloat: Karma.isDefined(Karma.temp.div.style.styleFloat),
	opacity: Karma.isDefined(Karma.temp.div.style.opacity),
	filter: Karma.isDefined(Karma.temp.div.style.filter),
	outerHTML: Karma.isDefined(Karma.temp.div.outerHTML),
	addEventListener: Karma.isDefined(Karma.temp.div.addEventListener),
	attachEvent: Karma.isDefined(Karma.temp.div.attachEvent),
	dispatchEvent: Karma.isDefined(Karma.temp.div.dispatchEvent),
	fireEvent : Karma.isDefined(Karma.temp.div.fireEvent),
	createEvent: Karma.isDefined(document.createEvent),
	createEventObject: Karma.isDefined(document.createEventObject),
	nodeListToArray: Karma.temp.nodeListToArray(),
	contextMenu: Karma.temp.contextMenu(),
	preventDefault: Karma.temp.event.IS_EVENT_PREVENTDEFAULT_PRESENT,
	srcElement: Karma.temp.event.IS_EVENT_SRCELEMENT_PRESENT
};

// run the function to wait for onDOMready
Karma.ready();
