/*!
 * Karmagination 0.1
 * http://www.karmagination.com
 * JS development simplified 
 * Released under the MIT, BSD, and GPL Licenses
 * Copyright 2009 Kean L. Tan 
 * Start date: 2009-04-01
 * Last build: 2009-05-19 12:59:25 AM
 *
 * CSS functions and browser detection is built upon mootools. Copyright (c) 2006-2008 [Valerio Proietti](http://mad4milk.net/).
 * CFT Copyright Kangax http://yura.thinkweb2.com/cft/ see Karma.support and Karma.temp
 * Karmagination's syntax is inspired by jQuery http://www.jquery.com
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
		
		// if Element is passed
		if (query.nodeType || query === window) {
			this[0] = query;
			this.length = 1;
			this.query = query;
			return;
		}
		
		// string is most used query
		else if(typeof query === "string" && query.length > 0) {
			// if HTML string passed
			if (/^<(.|\s)+>$/.test(query)) {
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
	Karma: 0.1	
});


Karma.extend(Karma, {
		 
	HTMLtoNode: function(query, context) {
		query = Karma.cleanHTML(query);
		var tmp = context.document.createElement('DIV'), 
			ret = [];

		if(/^<(tr)+/i.test(query)) {
			query = '<table>' + query + '</table>';
			tmp = context.document.createElement('DIV');
			tmp.innerHTML=query;
			tmp = tmp.firstChild;
			
		}
		// td or th
		else if(/^<(td|th)+/i.test(query)) {
			query = '<table><tr>' + query + '</tr></table>';
			tmp = context.document.createElement('DIV');
			tmp.innerHTML=query;

			tmp = tmp.firstChild.firstChild.firstChild;
			
		}
		
		else if(!tmp.firstChild){
			tmp = context.document.createElement('DIV');
			tmp.innerHTML = query;
		}
		
		for (var i =0; i < tmp.childNodes.length; i++)
			ret[i] = tmp.childNodes[i];
		
		return ret.length? ret : null;
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
	isHTML: function(o) { return /^<(.|\s)+>$/.test(o) },

	// browser detection
	isIE: !!(window.ActiveXObject && !window.opera),
	isIE6: !!(document.createElement('DIV').style.maxHeight === undefined),
	isIE7: !!(window.ActiveXObject && !window.opera && window.XMLHttpRequest && !document.querySelectorAll),
	isIE8: !!(window.ActiveXObject && !window.opera && document.querySelectorAll),
	isGecko: !(document.getBoxObjectFor === undefined),
	isOpera: !!window.opera,
	isWebkit: !!(!window.opera && !navigator.taintEnable && document.evaluate && document.getBoxObjectFor === undefined),
	
	// trim front/ending whitespaces and newlines so innerHTML won't go crazy
	cleanHTML: function(HTML){ return HTML.replace(/^\s+|[\n\r\t]|\s+$/g, ''); },
	
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

Karma.extend(Karma.fn, {
			 
	append: function(o) {
		
		if(!this.length) return this;
		var els = Karma(o); 
		if(!els.length) return this;
		
		var fragment;		
		if (els.length > 1) {
			var fragment = document.createDocumentFragment();
			
			for (var i=0; i< els.length; i++)
				fragment.appendChild(els[i]);
		}
		else 
			fragment = els[0];
		
		if (Karma.isHTML(o)) {
			for (var i=0; i< this.length; i++) 
				this[i].appendChild(fragment.cloneNode(true));
		}
		else 
			this[0].appendChild(fragment);
			
		
		return this;
		
	},
	
	appendTo: function(o) {
		if(!this.length) return this;
		var els = Karma(o); 
		if(!els.length) return this;
		
		var fragment;		
		if (this.length > 1) {
			var fragment = document.createDocumentFragment();
			
			for (var i=0; i< this.length; i++)
				fragment.appendChild(this[i]);
		}
		else 
			fragment = this[0];
			
		if (Karma.isHTML(this.query)) {
			var cloned = [];
			for (var j=0; j< els.length; j++) {
				var newClones = fragment.cloneNode(true);
				
				if(newClones.nodeType == 11)
					for(var i=0; i < newClones.childNodes.length; i++)
						cloned.push(newClones.childNodes[i]);
				else
					cloned.push(newClones);
					
				els[j].appendChild(newClones);
			}
			return Karma(cloned);
		}
		else 
			els[0].appendChild(fragment);
		
		return this;
	},
	
	prepend: function(o) {
		if(!this.length) return this;
		var els = Karma(o); 
		if(!els.length) return this;
		
		var fragment;		
		if (els.length > 1) {
			var fragment = document.createDocumentFragment();
		
			for (var i=0; i< els.length; i++)
				fragment.appendChild(els[i]);
		}
		else 
			fragment = els[0];
			
		
		if (Karma.isHTML(o)) {
			for (var i=0; i< this.length; i++)
				this[i].insertBefore(fragment.cloneNode(true), this[i].firstChild);
		}
		else 
			this[0].insertBefore(fragment, this[0].firstChild);
			
		return this;
	},
	
	prependTo: function(o) {
		if(!this.length) return this;
		var els = Karma(o); 
		if(!els.length) return this;
		
		var fragment;		
		if (this.length > 1) {
			var fragment = document.createDocumentFragment();
		
			for (var i=0; i< this.length; i++)
				fragment.appendChild(this[i]);
		}
		else
			fragment = this[0];
		
		if (Karma.isHTML(this.query)) {
			var cloned = [];
			for (var i=0; i< els.length; i++) {
				var newClones = fragment.cloneNode(true);
				
				if(newClones.nodeType == 11)
					for(var j=0; j < newClones.childNodes.length; j++)
						cloned.push(newClones.childNodes[j]);
				else
					cloned.push(newClones);
				
				els[i].insertBefore(newClones, els[i].firstChild);
			}

			return Karma(cloned);
		}
		else 
			els[0].insertBefore(fragment, els[0].firstChild);
		
		return this;
	},
	
	before: function(o) {
		if(!this.length) return this;
		var els = Karma(o); 
		if(!els.length) return this;
		
		var fragment;
		if(els.length > 1){
			fragment = document.createDocumentFragment();
			for (var i=0; i< els.length; i++)
				fragment.appendChild(els[i]);
		}
		else
			fragment = els[0];
		
		if (Karma.isHTML(o)) {
			for (var i=0; i< this.length; i++) 
				this[i].parentNode.insertBefore(fragment.cloneNode(true), this[i]);
		}
		else 
			this[0].parentNode.insertBefore(fragment, this[0]);
		
		return this;
	},
	
	insertBefore: function(o){
		if(!this.length) return this;
		var els = Karma(o); 
		if(!els.length) return this;
		
		var fragment;
		if(this.length > 1){
			fragment = document.createDocumentFragment();
			for (var i=0; i< this.length; i++)
				fragment.appendChild(this[i]);
		}
		else
			fragment = this[0];
		
		if (Karma.isHTML(this.query)) {
			var cloned = [];
			for (var i=0; i< els.length; i++) {
				var newClones = fragment.cloneNode(true);
				
				if(newClones.nodeType == 11)
					for(var j=0; j < newClones.childNodes.length; j++)
						cloned.push(newClones.childNodes[j]);
				else
					cloned.push(newClones);
				
				els[i].parentNode.insertBefore(newClones, els[i]);
			}
			return Karma(cloned);
		}
		else 
			els[0].parentNode.insertBefore(fragment, els[0]);
		
		return this;
		
	},
	
	after: function(o) {
		if(!this.length) return this;
		var els = Karma(o); 
		if(!els.length) return this;
		
		var fragment;
		if(els.length > 1){
			fragment = document.createDocumentFragment();
			for (var i=0; i< els.length; i++)
				fragment.appendChild(els[i]);
		}
		else
			fragment = els[0];
			
		if (Karma.isHTML(o)) {
			for (var i=0; i< this.length; i++) {
				this[i].nextSibling ? 
					this[i].parentNode.insertBefore(fragment.cloneNode(true), this[i].nextSibling):
					this[i].parentNode.appendChild(fragment.cloneNode(true));
			}
		}
		else {
			this[0].nextSibling ?
				this[0].parentNode.insertBefore(fragment, this[0].nextSibling):
				this[0].parentNode.appendChild(fragment);
		}
		return this;
	},
	
	insertAfter: function(o){
		if(!this.length) return this;
		var els = Karma(o); 
		if(!els.length) return this;
		
		var fragment;
		if(this.length > 1){
			fragment = document.createDocumentFragment();
		
			for (var i=0; i< this.length; i++)
				fragment.appendChild(this[i]);
		}
		else
			fragment = this[0];
		
		if (Karma.isHTML(this.query)) {
			var cloned = [];
			for (var i=0; i< els.length; i++) {
				var newClones = fragment.cloneNode(true);
				
				if(newClones.nodeType == 11)
					for(var j=0; j < newClones.childNodes.length; j++)
						cloned.push(newClones.childNodes[j]);
				else
					cloned.push(newClones);
					
				els[i].nextSibling ? 
					els[i].parentNode.insertBefore(newClones, els[i].nextSibling):
					els[i].parentNode.appendChild(newClones);
			}
			return Karma(cloned);
		}
		else {
			els[0].nextSibling ?
				els[0].parentNode.insertBefore(fragment, els[0].nextSibling):
				els[0].parentNode.appendChild(fragment);
		}
		return this;
	},
	
	// 0 and removes all events attached including current node
	empty: function() {
		for (var i=0; i< this.length; i++) {
			// don't bitch about this, won't break future browser compatibility
			if (Karma.isWebkit || Karma.isIE || Karma.isOpera) {
				this[i].innerHTML = '';
			}
			else {
				var parent = document.createElement('DIV');
				var newEl = this[i].cloneNode(false);
				
				parent.appendChild(newEl);
				newEl.innerHTML = '';
				
				this[i].parentNode.replaceChild(newEl, this[i]);
				this[i] = newEl;
			}
		}
		return this;
	},
	
	html: function(str) {
		if(Karma.isValue(str)) {
			for (var i=0; i< this.length; i++)
				this[i].innerHTML = str;
		
			return this;
		}
		return this.length? this[0].innerHTML: null;
	},
	
	text: function(str) {
		if(Karma.isValue(str)) {
			for(var i=0; i< this.length; i++) {
				if(this[i].innerText)
					this[i].innerText = str;
				else
					this[i].textContent = str;
			}
			return this;
		}
		
		var text = [];
		for(var i=0; i< this.length; i++) {
			text.push(this[i].innerText || this[i].textContent);
		}
		
		return text.join(' ');
	},
	
	remove: function(query){
		var result = this;
		if (Karma.isString(query))
			result = Karma.filter(query, this);
		
		for (var i=0; i< result.length; i++)
			result[i].parentNode.removeChild(result[i]);
		
		return this;
	},
	
	clone: function(){
		var $ = this,
			cloned = [];

		for(var i=0;i<$.length;i++) {
			if (Karma.support.outerHTML) {
				var string = $[i].outerHTML;
				cloned.push(Karma(string)[0]);
			}
			else 
				cloned.push($[i].cloneNode(true));
		}

		return Karma(cloned).stack(this);
	},
	
	wrap: function(str){
		for(var i=0;i<this.length;i++) {
			var $tmp = Karma(str),
				cloned = $tmp.clone()[0];
				
			this[i].parentNode.replaceChild(cloned, this[i]);
			cloned.appendChild(this[i]);
		}
		return this;
	}

});
Karma.extend(Karma.fn, {
	
	// walking the DOM, going forward or backward
	pedal: function(extreme, direction) {
		var $ = this, 
			elements = [];

		for (var i=0; i< $.length; i++) {
			var next=$[i][direction];

			while(next) {
				if (next.nodeType == 1) {
					elements.push(next);
					if (!extreme)
						break;
				}
				next = next[direction];
			}
	
		};
		
		return Karma(elements).stack($);
	},

	next: function() {
		return this.pedal(false, 'nextSibling');
	},
	
	nextAll: function() {
		return this.pedal(true, 'nextSibling');
	},

	prev: function() {
		return this.pedal(false, 'previousSibling');
	},
	
	prevAll: function() {
		return this.pedal(true, 'previousSibling');
	},
	
	siblings: function(includeSelf) {
		var $ = this, 
			siblings = [];
		
		for (var i=0; i< $.length; i++) {
			var origin = $[i],
				cur = $[i].parentNode;
			for(var j=0; j<cur.childNodes.length; j++) {
				var node = cur.childNodes[j]; 
				if(node.nodeType == 1 && (includeSelf || node != origin))
					siblings.push(node);
			}
		}
		
		return Karma(Karma.unique(siblings)).stack(this);
	},
	
	parent: function() {
		var $ = this,
			parent = [];
			
		for (var i=0; i< $.length; i++)
			parent.push($[i].parentNode);
			
		return Karma(Karma.unique(parent)).stack(this);
	},
	
	ancestors: function(str) {
		var $ = this,
			ancestors = [];
		
		for (var i=0; i< $.length; i++) {
			var parent = $[i].parentNode;
			while(parent != document) {
				ancestors.push(parent);
				parent = parent.parentNode;
			}
		}
		
		ancestors = Karma.unique(ancestors);
		
		if(str && Karma.hasSelector())
			ancestors = Karma.filter(str, ancestors)

		return Karma(ancestors).stack(this);
	},
	
	children: function() {
		var $ = this,
			children = [];
			
		for (var i=0; i< $.length; i++) {
			for(var j=0; j<$[i].childNodes.length; j++)
				if($[i].childNodes[j].nodeType == 1)
					children.push($[i].childNodes[j]);
		}
		
		return Karma(children).stack(this);
		
	},
	
	index: function(o){
		return Karma.inArray(Karma(o)[0], this);
	},
	
	slice: function(start, end){
		return Karma(Array.prototype.slice.call(this, start, end)).stack(this);
	},
	
	// selecting elements by index, returns the element wrapped in Karma object
	eq: function(num) {
		return this[num] ? Karma(this[num]).stack(this): Karma([]).stack(this);
	},
	
	// get elements as array or get individual element, return the array
	get: function(num) {
		return (num === undefined)? Array.prototype.slice.call(this): (this.length && this[num])? this[num]: null;
	},
	
	// adding elements
	add: function(query) {
		return query? Karma(this).populate(Karma(query), this.length).stack(this) : Karma(this).stack(this);
	},
	
	each: function(fn){
		for (var i=0; i< this.length; i++)
			fn.apply(this[i], arguments);
		return this;
	},

	find: function(query) {
		var ret = [];
		for(var i=0; i<this.length; i++)
			ret = Karma.merge(ret, Karma.selector(query, this[i]));
		
		return ret.length? Karma(ret).stack(this): Karma([]).stack(this);
	},
	
	filter: function(query) {
		return query? Karma(Karma.filter(query, this)).stack(this): Karma(this).stack(this);
	},
	
	is: function(query) {
		return query? !!Karma.filter(query, this).length: false;
	},
	
	not: function(query) {
		return query? Karma(Karma.selector(':not('+query+')', this)).stack(this) : Karma(this).stack(this);
	}
});
Karma.extend(Karma.fn, {
			 
	attr: function(prop, val){
		// document.expando = true;
		
		// does not support events
		// setting one property
		if(Karma.isString(prop) && (Karma.isValue(val))) {
			for(var i=0; i<this.length; i++) {
				if (/id|href|name|dir|title/.test(prop))
					this[i][prop] = val;		  
				else if (prop==="class") 
					this[i]['className'] = val;
				else if (prop==="style" && Karma.support.cssText) 
					this[i].style.cssText = val;
				else 
					this[i].setAttribute(prop, val);
			}
					
			return this;
		}
		// setting multiple property
		else if(Karma.isObject(prop)) {
			for (property in prop)
				this.attr(property, prop[property]);
			return this;
		}
		
		// getting property of first element
		return this.length? this[0].getAttribute(val): null;
	},
	
	removeAttr: function(prop) {
		for(var i=0; i<this.length; i++) {
			if (prop==="class")
				this[i]['className'] = '';
			else if (prop==="style" && Karma.support.cssText) 
				this[i].style.cssText = '';

			this[i].removeAttribute(prop);
		}
			
		return this;
	},
	
	addClass: function(str){
		for(var i=0; i< this.length; i++)
			this[i].className += ' ' + str; // browser will automatically remove duplicates and trim
			
		return this;
	},
	
	removeClass: function(str) {
		for(var i=0; i< this.length; i++)
			this[i].className = this[i].className.replace(str, '');
			
		return this;
	},
	
	hasClass: function(str) {
		return this.length ? !!(this[0].className.indexOf(str) >= 0): false;
	},
	
	toggleClass: function(str) {
		for(var i=0; i< this.length; i++) {
			if(this[i].className.indexOf(str) >= 0)
				this[i].className = this[i].className.replace(str, '');
			else
				this[i].className += str;
		}
			
		return this;
	},
	
	val: function(str){
		// setting values
		if(Karma.isValue(str)) { // if the str passed is a value
			for(var i=0; i< this.length; i++)
				if (Karma.isString(this[i].value)) // determine if the value property exists in the current element
					this[i].value = str;

			return this;
		}
		// getting value
		return (this[0] && Karma.isString(this[0].value)) ? this[0].value : null;
	}

});
Karma.extend(Karma, {

	ajax: function(o) {
		
		o = Karma.extend({
			type: 'GET',
			data: '',
			url: '',
			loading: function(){},
			success: function(){},
			error: function(){}
		 }, o);
	
		var oXHR = window.XMLHttpRequest? new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTP");
		
		if (oXHR === null || oXHR === undefined)
			return;
		
		oXHR.onreadystatechange=function(){
			try {
				if (oXHR.readyState==4 && !o.successDone){
					o.success.call(window, oXHR.responseText);
					o.successDone = true;
				}
				
				if (oXHR.status!=200 && !o.errorDone) {
					o.error.call(window, oXHR.responseText);
					o.successDone = true;
					o.errorDone = true;
				}
			}
			catch(e) {};
		}
		
		o.loading();
		oXHR.open(o.type, o.url, true);
		oXHR.send(null);
	}

});
Karma.extend(Karma.fn, {

	on: function(str, fn) {
		str = str.split(/\s+/);
	
		for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			for(var i=0; i< this.length; i++) {
				
				var $ = this[i];
				var first = false;

				$.KarmaEvent = $.KarmaEvent || {};
				
				if(!$.KarmaEvent[ns[0]]) {
					$.KarmaEvent[ns[0]] = [];
					first = true;
				}
					
				if (ns.length == 1)
					$.KarmaEvent[ns[0]].push(fn);

				else if (ns.length == 2)
					$.KarmaEvent[ns[0]][ns[1]] = fn;

				try {
					$['on'+ns[0]] = Karma.event.caller;
				} catch(e){};
			}
		}
		Karma.event.functions.push(fn);
		return this;
	},
		
	un: function(str, fn) {
		token = str.split(/\s+/);
		
		for(var j=0; j< token.length; j++) {
			var ns = token[j].split('.');
			for(var i=0; i< this.length; i++) {
				var $ = this[i];
				
				if ($.KarmaEvent) {
					if (Karma.trim(str).length == 0) {
						delete $['KarmaEvent'];
					}
					
					else if (Karma.isFunction(fn)) {
						for (var prop in $.KarmaEvent[ns[0]])
							if ($.KarmaEvent[ns[0]][prop] == fn)
								delete $.KarmaEvent[ns[0]][prop];
					}
					else if (ns.length>1 && $.KarmaEvent[ns[0]]) {
						delete $.KarmaEvent[ns[0]][ns[1]];
					}
					else if($.KarmaEvent[ns[0]]) {
						try {
							Karma.support.addEventListener ? $['removeEventListener'](ns[0], contextScoper, false): $['detachEvent']('on'+ns[0], contextScoper);
						} catch(e){};
						delete $['KarmaEvent'][ns[0]];
					}
				}
			}
		}
		return this;
	},
	
	
	
	fire: function(eventName) {
		
		try {
			for(var i=0; i<this.length; i++)
				var element = this[i];

			// W3C compatible browsers
			if(Karma.support.createEvent){
				
				// Safari 3 doesn't have window.dispatchEvent()
				if(!element.dispatchEvent)
					element=document; 
				
				var curEvent= Karma.event[eventName];
				
				if(curEvent){
					var event = document.createEvent(curEvent.type);
					curEvent.init(event, {});
					element.dispatchEvent(event);
					return true;
				}
			}
			// m$, wow easier! one of the odd moments in javascript
			else if(Karma.support.createEventObject){
				element = (element === document || element === window ) ? document.documentElement : element;
			
				var event = document.createEventObject();
				
				for(var property in properties)
					event[property]=properties[property];
	
				element.fireEvent("on"+eventName, event);
				
				return true;
			}

		}
		catch (e){ return false; }
		return this;
	},
	
	live: function(str, fn){
		Karma(document).on(str, function(e){
			var ancestors = [], cur = e.target;
			while(cur !== window) {
				ancestors.push(cur);
				cur = cur.parentNode;
			}
			
			if(Karma(cur).filter(this.query).length > 0){
				fn.call(e.target, e);				
			}
		});	
	},
	
	die: function(str, fn){
		Karma().un(str, fn);
	}
});

Karma.extend(Karma.fn, {
	bind: Karma.fn.on,
	unbind: Karma.fn.un
});

// create events for w3c browser
if(Karma.support.createEvent) {
	Karma.event = {
		load:{
			type:"HTMLEvents",
			init: function(e){
				e.initEvent("load",false,false);
			}
		},
		
		unload:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("unload",false,false);
			}
		},
		
		select:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("select",true,false);
			}
		},
		
		change:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("change",true,false);
			}
		},
		
		submit:{
			type:"HTMLEvents",
			init:function(e,p){
				e.initEvent("submit",true,true);
			}
		},
		
		reset:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("reset",true,false);
			}
		},
		
		resize:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("resize",true,false);
			}
		},
		
		scroll:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("scroll",true,false);
			}
		},
		
		click:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("click",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		dblclick:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("click",true,true,window,2,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		mousedown:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("mousedown",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		mouseup:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("mouseup",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		mouseover:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("mouseover",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		mousemove:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("mousemove",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		mouseout:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("mouseout",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		focusin:{
			type:"UIEvents",
			init:function(e){
				e.initUIEvent("focusin",true,false,window,1);
			}
		},
		
		focusout:{
			type:"UIEvents",
			init:function(e){
				e.initUIEvent("focusout",true,false,window,1);
			}
		},
		
		activate:{
			type:"UIEvents",
			init:function(e){
				e.initUIEvent("activate",true,true,window,1);
			}
		},
		
		focus:{
			type:"UIEvents",
			init:function(e){
				e.initUIEvent("focus",false,false,window,1);
			}
		},
		
		blur:{
			type:"UIEvents",
			init:function(e){
				e.initUIEvent("blur",false,false,window,1);
			}
		}
	};
}

Karma.event = Karma.event || {};
Karma.event.functions = [];
Karma.event.caller = function(e) {
	cur = this;
	e = window.event || e;
	e.target ? e.srcElement = e.target: e.target = e.srcElement;

	if(!e.stopPropagation && window.event) 
		e.stopPropagation = function(){ window.event.cancelBubble = true; };
	
	if(!Karma.support.preventDefault && window.event)
		e.preventDefault = function(){ window.event.returnValue = false; };
		
	
	if(cur && cur.KarmaEvent && cur.KarmaEvent[e.type]) {
		for(var functions in cur.KarmaEvent[e.type]) {
			if(cur.KarmaEvent[e.type][functions].call(cur, e) === false) {
				e.stopPropagation();
				e.preventDefault();	
			}
		}
	}
}

// cleaning up all functions that have been attached to a node
Karma(window).on('unload', function(){
	Karma.event.caller = null;
	delete Karma.event.caller;
});
Karma.extend(Karma.fn, {
			 
	css: function(property, value) {
		if (property && value)
			return this.setStyle(property, value);
			
		if (Karma.isObject(property)) {
			for(var current in property)
				this.setStyle(current, property[current]);
			return this;
		}

		return this.getStyle(property);
	},

	setStyle: function(property, value){
		if(!this.length) return this;
		
		if (property == 'opacity') {
			for (var i=0; i < this.length; i++) {
				if(Karma.support.filter) this[i].style.filter = (parseFloat(value) == 1) ? '' : 'alpha(opacity=' + value * 100 + ')';
				else if (Karma.support.opacity) this[i].style.opacity = value;
			}
			return this;
		}
		
		if (property.match(/scrollTop|scrollLeft/)) {
			for (var i=0; i < this.length; i++) {
				this[i][property] = value;
			}
		}
		
		else if (property == 'float') {
			property = Karma.support.styleFloat ? 'styleFloat' : 'cssFloat';
		}
		else
			property = Karma.camelCase(property);
		
		// convert integers to strings;
		if (Karma.isNumber(value)) value += 'px';
		
		else if(Karma.isString(value))
			for (var i=0; i < this.length; i++)
				this[i].style[property] = value;
		
		return this;
	},
	
	getStyle: function(property) {
		if(!this.length) return null;
		
		if (property == 'float')
			property = Karma.support.styleFloat ? 'styleFloat' : 'cssFloat';

		else
			property = Karma.camelCase(property);
			
		if (this[0].currentStyle) 
			return this[0].currentStyle[property];
			
		var computed = document.defaultView.getComputedStyle(this[0], null)[property],
			color = (computed + '').match(/rgba?\([\d\s,]+\)/);
			
		if (color) {
			var rgb = color[0].match(/\d{1,3}/g);
			computed = Karma.rgbToHex(rgb);
		}
		
		return computed;
	},
	
	dimension: function(type){
		if(!this.length) return null;

		// special case, these should not be 0
		if (this[0] === window || this[0] === document || this[0] === document.documentElement)
			return (this[0]['client'+type] || window['client'+type] || document.documentElement['client'+type] || document.body['client'+type]);
		
		return this[0]['offset'+type];
	},
	
	width: function(){
		return this.dimension('Width');
	},
	
	height: function(){
		return this.dimension('Height');
	}
});

Karma.extend(Karma, {
	// calculates current window viewport
	/*
	viewport: function(){
		var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
			w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
			left = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
			top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
		
		return {
			top: top,
			left: left,
			right: left + w,
			bottom: top + h
		};
	},
	*/
	
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
	
	camelCase: function(property){
		return property.replace(/\-(\w)/g, function(all, letter){ return letter.toUpperCase();	});
	}
	
});
Karma.extend(Karma.fn, {
			 
	stop: function(){
		for(var i=0; i<this.length; i++)
			if(this[i]['KarmaFX']) delete this[i]['KarmaFX'];
		
		return this;
	},

	animate: function(attributes, duration, callback, easing){
		if (!Karma.isObject(attributes) || !this.length) return this;
		
		// do this for scoping issues with internal functions
		var $$  = this;
		
		// default values
		duration = duration || 500;
		easing = easing || Karma.easing.global;
		callback = callback || function(){};
		
		for(var i=0; i<this.length; i++) {
			// setup initial values
			this[i]['KarmaFX'] = this[i]['KarmaFX'] || [];
			this[i]['KarmaFX']['animating'] = true;
			
			var FX = {};
			FX['start'] = {};
			FX['end'] = {};
			FX['duration'] = duration;
			FX['callback'] = callback;
			FX['easing'] = easing;
			
			// get starting/ending attributes
			// we need to calculate end cause we are converting values like em, etc to px
			for (var prop in attributes) {
				// convert all numerical to pixels
				if (Karma.isNumber(attributes[prop])) attributes[prop] += 'px';
				// get the current unanimated attribute
				FX['start'][prop] = Karma(this[i]).getStyle(prop);
				// set the final attribute and try to get the value usually in px
				FX['end'][prop] = Karma(this[i]).setStyle(prop, attributes[prop]).getStyle(prop);
				// revert to start value
				Karma(this[i]).setStyle(prop, FX['start'][prop]);
			}
			
			this[i]['KarmaFX'].push(FX); // pushing and increase counter

		}
		
		// if first iteration in a an animation que then run, the function will look for subsequent queues that have been added after it has been run
		if (this[0]['KarmaFX'].length === 1) {
			var iter = 0;
			var startTimer = (new Date()).getTime();
		
			// start looping and setting value at every frame that we arrive
			var timer = setInterval(function(){
				var curTime = (new Date()).getTime();
				
				// a frame value between start and end
				if(curTime < (startTimer + duration)){
					if($$[0]['KarmaFX'])
						setCurrentFrameAttr(curTime - startTimer, $$[0]['KarmaFX'][iter]['end']);
				}
				// last frame
				else { 
					completeAnimation();
				}
			}, 10);
			
			var setCurrentFrameAttr = function(elapsed, attributes){
				for(var i=0; i<$$.length; i++) {
					if ($$[i]['KarmaFX'] && $$[i]['KarmaFX']['animating'])
						for (var prop in attributes) {
							// using the current easing function, put in (start value, end value, elapsed time, and the total duration)
							var curval = $$[i]['KarmaFX'][iter]['easing'](parseInt($$[i]['KarmaFX'][iter]['start'][prop]), parseInt($$[i]['KarmaFX'][iter]['end'][prop]), elapsed, $$[i]['KarmaFX'][iter]['duration']);
							if (prop != 'opacity') curval += 'px';
							Karma($$[i]).setStyle(prop, curval);
						}
				}
			}
			
			var completeAnimation = function(){
				clearInterval(timer);
				
				// set all the css properties to the end attributes
				for(var i=0; i<$$.length; i++) {
					if($$[0]['KarmaFX'])
						$$.css($$[i]['KarmaFX'][iter]['end']);
				}
				
				// if there's a callback, call now with scope as window
				if ($$[0]['KarmaFX'] && $$[0]['KarmaFX'][iter]['callback']) $$[0]['KarmaFX'][iter].callback.call(window);
				
				// up the next item in the queue
				iter++;
				
				// if there's no next item				
				if($$[0]['KarmaFX'] && !$$[0]['KarmaFX'][iter]) {
					for(var i=0; i<$$.length; i++) {
						if($$[i]['KarmaFX']); delete $$[i]['KarmaFX'];
					}
				}
				else {
					var startTimer = (new Date()).getTime();
					
					// get current style
					for(var i=0; i<$$.length; i++) {
						if ($$[i]['KarmaFX'])
							for (var prop in $$[i]['KarmaFX'][iter]['end']) {
								$$[i]['KarmaFX'][iter]['start'][prop] = Karma($$[i]).getStyle(prop);
							}
					}
					
					timer = setInterval(function(){
						var curTime = (new Date()).getTime();
						
						// a frame value between start and end
						if(curTime < (startTimer + duration)){
							if($$[0]['KarmaFX'])
								setCurrentFrameAttr(curTime - startTimer, $$[0]['KarmaFX'][iter]['end']);
						}
						// last frame
						else { 
							completeAnimation();
						}
					}, 10);
					
				}
				
				
			}
				
		}

		return this;
	}
});

Karma.easing = {
	linear: function(start, end, elapsed, duration) {
		return  (end - start)*elapsed/duration + start;
	}
};
Karma.easing.global = Karma.easing.linear;
Karma.extend(Karma, {
			 
	// method to namespace function, taking a chapter from YUI
	namespace: function(name, root) {
		if (Karma.isString(name)) {
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
				
				if (i == name.length-1) 
					return ns;

			}
		}
	},
	
	trim: function(str){
		// unicode friendly string trim for older browsers that don't catch all whitespaces
		return str.replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, ''); 
	},
			 
	grep: function(o, fn) {
		var arry = [];
		// Go through the array, only saving the items that pass the validator function
		for ( var i = 0; i < o.length; i++ )
			if (!fn.call(o[i], o[i], i) === false)
				arry.push( o[i] );

		return arry;
	},

	inArray: function(el, o){
		// prevent ie's window == document problem
		for ( var i = 0; i < o.length; i++ )
			if ( o[i] === el )
				return i;
		return -1;
	},
	
	map: function(o, fn) {
		var array = [];
		for ( var i = 0; i < o.length; i++ ) 
			array.push(fn.call(o[i], i));

		return array;
	},
	
	// merge all arrays
	merge: function(){
		return Array.prototype.concat.apply([], arguments);
	}
});


/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false;

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	var origContext = context = context || document;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, check, mode, extra, prune = true, contextXML = isXML(context);
	
	// Reset the position of the chunker regexp (start from head)
	chunker.lastIndex = 0;
	
	while ( (m = chunker.exec(selector)) !== null ) {
		parts.push( m[1] );
		
		if ( m[2] ) {
			extra = RegExp.rightContext;
			break;
		}
	}

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] )
					selector += parts.shift();

				set = posProcess( selector, set );
			}
		}
	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			var ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			var ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				var cur = parts.pop(), pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		throw "Syntax error, unrecognized expression: " + (cur || selector);
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = false;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set, match;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.match[ type ].exec( expr )) ) {
			var left = RegExp.leftContext;

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.match[ type ].exec( expr )) != null ) {
				var filter = Expr.filter[ type ], found, item;
				anyFound = false;

				if ( curLoop == result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr == old ) {
			if ( anyFound == null ) {
				throw "Syntax error, unrecognized expression: " + expr;
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
	},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag && !isXML ) {
				part = part.toUpperCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string";

			if ( isPartStr && !/\W/.test(part) ) {
				part = isXML ? part : part.toUpperCase();

				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName === part ? parent : false;
					}
				}
			} else {
				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( !part.match(/\W/) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !part.match(/\W/) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context, isXML){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").indexOf(match) >= 0) ) {
						if ( !inplace )
							result.push( elem );
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			for ( var i = 0; curLoop[i] === false; i++ ){}
			return curLoop[i] && isXML(curLoop[i]) ? match[1] : match[1].toUpperCase();
		},
		CHILD: function(match){
			if ( match[1] == "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] == "even" && "2n" || match[2] == "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( match[3].match(chunker).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return /h\d/i.test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toUpperCase() === "BUTTON";
		},
		input: function(elem){
			return /input|select|textarea|button/i.test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 == i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 == i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var i = 0, l = not.length; i < l; i++ ) {
					if ( not[i] === elem ) {
						return false;
					}
				}

				return true;
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while (node = node.previousSibling)  {
						if ( node.nodeType === 1 ) return false;
					}
					if ( type == 'first') return true;
					node = elem;
				case 'last':
					while (node = node.nextSibling)  {
						if ( node.nodeType === 1 ) return false;
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first == 1 && last == 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first == 0 ) {
						return diff == 0;
					} else {
						return ( diff % first == 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value != check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS;

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
try {
	Array.prototype.slice.call( document.documentElement.childNodes );

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var i = 0, l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( var i = 0; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.selectNode(a);
		aRange.collapse(true);
		bRange.selectNode(b);
		bRange.collapse(true);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( !!document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) (function(){
	var oldSizzle = Sizzle, div = document.createElement("div");
	div.innerHTML = "<p class='TEST'></p>";

	// Safari can't handle uppercase or unicode characters when
	// in quirks mode.
	if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
		return;
	}
	
	Sizzle = function(query, context, extra, seed){
		context = context || document;

		// Only use querySelectorAll on non-XML documents
		// (ID selectors don't work in non-HTML documents)
		if ( !seed && context.nodeType === 9 && !isXML(context) ) {
			try {
				return makeArray( context.querySelectorAll(query), extra );
			} catch(e){}
		}
		
		return oldSizzle(query, context, extra, seed);
	};

	for ( var prop in oldSizzle ) {
		Sizzle[ prop ] = oldSizzle[ prop ];
	}

	div = null; // release memory in IE
})();

if ( document.getElementsByClassName && document.documentElement.getElementsByClassName ) (function(){
	var div = document.createElement("div");
	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	if ( div.getElementsByClassName("e").length === 0 )
		return;

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 )
		return;

	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ){
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ) {
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var contains = document.compareDocumentPosition ?  function(a, b){
	return a.compareDocumentPosition(b) & 16;
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

var isXML = function(elem){
	return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
		!!elem.ownerDocument && elem.ownerDocument.documentElement.nodeName !== "HTML";
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE

window.Sizzle = Sizzle;

})();


if (window.Sizzle) {
	Karma.selector = Sizzle;
	Karma.filter = Sizzle.filter;
	Karma.selector.pseudo = Sizzle.selectors.filters;
}
else if (window.Sly) {
	Karma.selector = Sly.search;
	Karma.filter = Sly.filter;
}
})();// end self-executing anon