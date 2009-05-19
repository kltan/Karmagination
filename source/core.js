/*!
 * Karmagination <?=$version."\n"?>
 * http://www.karmagination.com
 * JS development simplified 
 * Released under the MIT, BSD, and GPL Licenses
 * Copyright 2009 Kean L. Tan 
 * Start date: 2009-04-01
 * Last build: <?=$time."\n"?>
 *
 * CSS functions and browser detection is built upon mootools. Copyright (c) 2006-2008 [Valerio Proietti](http://mad4milk.net/).
 * CFT Copyright Juriy Zaytsev http://yura.thinkweb2.com/cft/
 * grep, each, inArray and map taken from jQuery http://www.jquery.com , Copyright (c) John Resig
 */

;(function(){ //start anon

var window = this,
	document = this.document,
	undefined; // undefine munging
	
var _$ = window.$, _Karma = window.Karma; // backup current pointer

var Karma = window.$ = window.Karma = function( query, context ) {
	return new Karma.prototype.init( query, context );	// Constructor
};

Karma.prototype = {
	init: function(query, context) {
		query = query || document;
		context = context || window;
		
		// the stack to track callee Karma objects
		this.KarmaStack = [];
		
		var result = [];
		
		// if Element/Node is passed
		if (query.nodeType || query === window) {
			this[0] = query;
			this.length = 1;
			this.query = query;
			return;
		}
		
		// string is most used query
		else if(typeof query === "string" && query.length > 0) {
			// if HTML string passed
			if (Karma.isHTML(query)) {
				result = Karma.HTMLtoNode(query, context);
				this.query = query;
			}
			// if CSS query
			else {
				result = Karma.selector(query, context.document);
				this.query = query;
			}
		}
		
		// onDOMready
		else if (typeof query === "function") {
			this[0] = context.document;
			if(!Karma.isReady) {
				Karma.ready_queue(function(){
					query.call(context, $);
				});
			}
			else
				query.call(context, $);
				
			return;
		}

		// if array, object or Karma object
		else { 
			result = query; 
			if(query.query)
				this.query = query.query;
		}
		
		this.populate(result);
	}
}

Karma.fn = Karma.prototype.init.prototype;

// define extend (o,o2,o3,o4,o5 .......) make stiching prototypes easy
Karma.extend = function(o) {
	var ret = (typeof o === 'object' || typeof o === 'function')? o : {};
	
	for ( var i = 1; i < arguments.length; i++ ) 
		for ( var key in arguments[i] ) 
			ret[key] = arguments[i][key]; 
			
	return ret;
};

Karma.extend(Karma.fn, {

	// populate nodes into Karma
	populate: function(elements ,n) {
		n = n || 0;
		// make a clean array
		this.length = n;
		if(!Karma.isArray(elements))
			elements = Array.prototype.slice.call(elements);

		// exit if no elements found
		if (!elements.length) return this;
		
		// push elements into Karma
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
	
	// adding self to chain
	andSelf: function() {
		return this.KarmaStack.length ? Karma(this).populate(this.KarmaStack[0], this.length).stack(this): Karma(this).stack(this);
	},
	
	// getting into the previous chain
	end: function() {
		return this.KarmaStack[0];
	},
	
	// how many elements in Karma
	length: 0,
	
	// the query that was passed into the first unchained instance of Karma
	query: null,
	
	// Karma version
	Karma: <?=$version?>
	
});


Karma.extend(Karma, {
	/* special thanks to jQuery's code so I don't have to manully hunt down the special cases myself */	 
	HTMLtoNode: function(query, context) {
		query = Karma.cleanHTML(query);
		var tmp = context.document.createElement('DIV'), 
			ret = [],
			subquery = query.substring(0, 10).toLowerCase();;
		
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
		
		else if(!subquery.indexOf("<option")) {
			query = '<select multiple="multiple">' + query + '</select>';
			tmp.innerHTML=query;
			tmp = tmp.firstChild;
		}
		
		// thead etc
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
		
		// others
		else if(!tmp.firstChild){
			tmp.innerHTML = query;
		}
		
		for (var i =0; i < tmp.childNodes.length; i++)
			ret.push(tmp.childNodes[i]);
		
		return ret.length ? ret : null;
	},
	
	createElement: function(tagName, attr, html, i, scope) {
		if(!Karma.isNumber(parseInt(i)) || i===0) i = 1;
		scope = scope || window;
				
		var ret = [],
			el = scope.document.createElement(tagName.toUpperCase());
			
		for(var j=0; j<i; j++) {
			ret.push(el.cloneNode(false));
			if(Karma.isValue(html)) {
				ret[j].innerHTML = html; 
			}
		}
		
		return Karma(ret).attr(attr).get();
	},
		 
	// type detection
	isArray: function(o){ return Object.prototype.toString.call(o) === "[object Array]" },
	isObject: function(o){ return Object.prototype.toString.call(o) === "[object Object]" },
	isDate: function(o){ return Object.prototype.toString.call(o) === "[object Date]" },
	isGenericObject: function(o) { return typeof o === "object" },
	isFunction: function(o) { return typeof o === "function" },
	isString: function(o) { return typeof o === "string" },
	isNumber: function(o){ return typeof o === "number" },
	isValue: function(o){ return typeof o === "number" || typeof o === "string" },
	isBoolean: function(o){ return typeof o === "boolean" },
	isDefined: function(o) { return o !== undefined },
	isHTML: function(o) { return /^<.+/.test(Karma.trim(o).substring(0,3).toLowerCase()) },
	// browser detection
	isIE: !!(window.ActiveXObject && !window.opera),
	isIE6: !!(document.createElement('DIV').style.maxHeight === undefined),
	isIE7: !!(window.ActiveXObject && !window.opera && window.XMLHttpRequest && !document.querySelectorAll),
	isIE8: !!(window.ActiveXObject && !window.opera && document.querySelectorAll),
	isGecko: !(document.getBoxObjectFor === undefined),
	isOpera: !!window.opera,
	isWebkit: !!(!window.opera && !navigator.taintEnable && document.evaluate && document.getBoxObjectFor === undefined),
	
	// trim front/ending whitespaces and newlines so innerHTML won't go crazy
	cleanHTML: function(HTML){ return HTML.replace(/^\s+[\n\r\t]+$/g, ''); },
	
	// only works for array-like object like querynodelist
	makeArray: function(o) {
		if (Karma.support.nodeListToArray)
			return Array.prototype.slice.call(o);
		
		else {
			var ret = [], length = 0;
			
			for(var prop in o) {
				ret[prop] = o[prop];
				length++;
			}
			
			ret.length = length;

			return ret;
		}
	},
	
	// playing nice with others out there
	noConflict: function(extreme){
		window.$ = _$;

		if(extreme)
			window.Karma = _Karma;
			
		return $;
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
	ready: function(){
		var init = function() {
			if(Karma.isReady) return;
			Karma.isReady = true;
		
			// run all functions that are associated with ready
			for(var i=0; i< Karma.readyFunctions.length; i++) {
				try{ Karma.readyFunctions[i].call(window, Karma); } catch(e){}
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
		 
		// loop every 80 ms is good enough
		if (!Karma.isReady) setTimeout(arguments.callee, 88);
	}
});

if(Karma.isIE && !Karma.isIE7){ try{ document.execCommand("BackgroundImageCache", false, true); }catch(e){}}

Karma.temp = {
	div: document.createElement('DIV'),
	
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

// clean up
delete Karma.temp;

// run the function to wait for onDOMready
Karma.ready();
