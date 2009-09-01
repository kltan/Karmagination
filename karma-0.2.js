/*!
 * Karmagination 0.2 - Fast and Easy
 * http://www.karmagination.com
 * Released under the MIT, BSD, and GPL Licenses - Choose one that fit your needs
 * Copyright (c) 2009 Kean L. Tan 
 * Start date: 2009-04-01
 * Build Time: 2009-09-01 05:48:28 AM
 * Build: 2155
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
	
	isKarma: 0.2	
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
Karma.fn.extend({
			 
	append: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;

		return Karma.temp.manipulate('append', els, this, els.query);
	},
	
	appendTo: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('append', this, els, this.query, true);
	},
	
	prepend: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;

		return Karma.temp.manipulate('prepend', els, this, els.query);
	},
	
	prependTo: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('prepend', this, els, this.query, true);
	},
	
	before: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('before', els, this, els.query);
	},
	
	insertBefore: function(o){
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('before', this, els, this.query, true);
		
	},
	
	after: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('after', els, this, els.query);
	},
	
	insertAfter: function(o){
		var els = Karma(o);
		if(!this.length || !els.length) return this;

		return Karma.temp.manipulate('after', this, els, this.query, true);
	},
	
	// removes all events attached including current node
	empty: function() {
		var isHTML = 'innerHTML' in document.documentElement;
		for (var i=0; i< this.length; i++) {
			if (isHTML) {
				// no garbage collection here, we do it on unload then
				this[i].innerHTML = '';
			}
			else {
				while (this[i].firstChild) {
					// garbage collection, it's not perfect but will reduce memory usage while balancing performance
					if (this[i].firstChild.KarmaMap) Karma.storage[this[i].KarmaMap] = null;
					this[i].removeChild(this[i].firstChild);
				}
			}
		}
		return this;
	},
	
	html: function(value) {
		if(Karma.isValue(value)) {
			for (var i=0; i< this.length; i++)
				this[i].innerHTML = value;
		
			return this;
		}
		return this.length? this[0].innerHTML: null;
	},
	
	text: function(value) {
		if(Karma.isValue(value)) {
			for(var i=0; i< this.length; i++)
				this[i].innerText ?	this[i].innerText = value :	this[i].textContent = value;
			return this;
		}
		
		var text = [];
		for(var i=0; i< this.length; i++) {
			text.push(this[i].innerText || this[i].textContent);
		}
		
		return text.join(' ');
	},
	
	remove: function(query){
		var result = Karma.isString(query) ? Karma.Sizzle.filter(query, this) : this.length ? this : [];
		
		for (var i=0; i< result.length; i++) {
			if (result[i].KarmaMap) Karma.storage[result[i].KarmaMap] = null;
			result[i].parentNode.removeChild(result[i]);
		}
		
		return this;
	},
	
	// TODO: clone events
	clone: function(events){
		var clone = [],
			$child;

		for(var i=0;i<this.length;i++) {
			if (Karma.support.outerHTML) {
				clone.push(Karma(this[i].outerHTML, this[i].ownerDocument||this[i])[0]);
				$child = Karma(clone[i]);
				$child[0].KarmaMap = ++Karma.uniqueId;
				Karma.storage[$child[0].KarmaMap] = {};

				// wow outerHTML will copy even elem.KarmaMap which screwed up my rebindings
				if(events)
				for (var ev in Karma.storage[this[i].KarmaMap].KarmaEvent) {
					Karma.storage[$child[0].KarmaMap][ev] = [];
					for (var fn in Karma.storage[this[i].KarmaMap].KarmaEvent[ev])
						Karma.storage[$child[0].KarmaMap][ev][fn] = Karma.storage[this[i].KarmaMap].KarmaEvent[ev][fn];
				}
			}
			else {
				clone.push(this[i].cloneNode(true));
				$child = Karma(clone[i]);
				
				if(events) {
					for (var ev in Karma.storage[this[i].KarmaMap].KarmaEvent) 
						for (var fn in Karma.storage[this[i].KarmaMap].KarmaEvent[ev]) 
							$child.bind( ev, Karma.storage[this[i].KarmaMap].KarmaEvent[ev][fn] );
				}
			}

		}

		return Karma(clone).stack(this);
	},

	wrap: function(str){
		for(var i=0;i<this.length;i++) {
			var	cloned = Karma(str, this[i].ownerDocument||this[i]).clone()[0];
				
			this[i].parentNode.replaceChild(cloned, this[i]);
			cloned.appendChild(this[i]);
		}
		return this;
	}

});

Karma.extend(Karma.temp, {
	manipulate: function (method, child, parent, query, ret) {
		var fragment = child[0];
		
		if (child.length > 1) {
			fragment = Karma.temp.fragment.cloneNode(false);
			
			for (var i=0; i< child.length; i++)
				fragment.appendChild(child[i]);
		}
		
		if (Karma.isHTML(query)) {
			var cloned = [];
				
			for (var i=0; i< parent.length; i++) {
				var newClones = fragment.cloneNode(true);
				if (ret) {
					 if(newClones.nodeType === 11) {
          				for(var j=0; j < newClones.childNodes.length; j++)
           					 cloned.push(newClones.childNodes[j]);
					 }
       				 else
          				cloned.push(newClones);
				}
				
				if (method == 'append')
					parent[i].appendChild(newClones);
				else if (method == 'prepend')
					parent[i].insertBefore(newClones, parent[i].firstChild);
				else if (method == 'before')
					parent[i].parentNode.insertBefore(newClones, parent[i]);
				else if (method == 'after') {
					parent[i].nextSibling ? 
						parent[i].parentNode.insertBefore(newClones, parent[i].nextSibling):
						parent[i].parentNode.appendChild(newClones);
				}
			}
			
			return ret ? Karma(cloned) : parent;
		}
		else if (method == 'append')
			parent[0].appendChild(fragment);
		else if (method == 'prepend')
			parent[0].insertBefore(fragment, parent[0].firstChild);
		else if (method == 'before')
			parent[0].parentNode.insertBefore(fragment, parent[0]);
		else if (method == 'after') {
			parent[0].nextSibling ? 
				parent[0].parentNode.insertBefore(fragment, parent[0].nextSibling):
				parent[0].parentNode.appendChild(fragment);
		}
		
		return ret ? child : parent;
	}
});


Karma.fn.extend({
	
	// walking the DOM, going forward or backward
	pedal: function(extreme, direction, query) {
		var elements = [];

		for (var i=0; i< this.length; i++) {
			var next=this[i][direction];

			while(next) {
				if (next.nodeType == 1) {
					elements.push(next);
					if (!extreme)
						break;
				}
				next = next[direction];
			}
	
		};
		
		elements = (Karma.isString(query)) ? Karma.Sizzle.filter(query, Karma.unique(elements)) : Karma.unique(elements);
		return Karma(elements).stack(this);
	},

	next: function(query) {
		return this.pedal(false, 'nextSibling' ,query);
	},
	
	nextAll: function(query) {
		return this.pedal(true, 'nextSibling' ,query);
	},

	prev: function(query) {
		return this.pedal(false, 'previousSibling' ,query);
	},
	
	prevAll: function(query) {
		return this.pedal(true, 'previousSibling' ,query);
	},
	
	siblings: function(query) {
		var $ = this, 
			siblings = [];
		
		for (var i=0; i< $.length; i++) {
			var origin = $[i],
				cur = $[i].parentNode;
			for(var j=0; j<cur.childNodes.length; j++) {
				var node = cur.childNodes[j]; 
				if(node.nodeType == 1 && node != origin)
					siblings.push(node);
			}
		}
		
		siblings = (Karma.isString(query)) ? Karma.Sizzle.filter(query, Karma.unique(siblings)) : Karma.unique(siblings);
		
		return Karma(siblings).stack(this);
	},
	
	parent: function(query) {
		var $ = this,
			parent = [];
			
		for (var i=0; i< $.length; i++) {
			if ($[i].parentNode)
				parent.push($[i].parentNode);
		}
	
		parent = (Karma.isString(query)) ? Karma.Sizzle.filter(query, Karma.unique(parent)) : Karma.unique(parent);
			
		return Karma(parent).stack(this);
	},
	
	ancestors: function(query) {
		var $ = this,
			ancestors = [];
		
		for (var i=0; i< $.length; i++) {
			var parent = $[i].parentNode;
			while(parent !== document) {
				ancestors.push(parent);
				parent = parent.parentNode || document;
			}
		}
		ancestors = (Karma.isString(query)) ? Karma.Sizzle.filter(query, Karma.unique(ancestors)) : Karma.unique(ancestorss);

		return Karma(ancestors).stack(this);
	},
	
	children: function(query) {
		var $ = this,
			children = [];
			
		for (var i=0; i< $.length; i++) {
			for(var j=0; j<$[i].childNodes.length; j++)
				if($[i].childNodes[j].nodeType == 1)
					children.push($[i].childNodes[j]);
		}
		
		if (Karma.isString(query))
			children = Karma.Sizzle.filter(query, children);
		
		return Karma(children).stack(this);
		
	},
	
	index: function(o){
		var el = (o.nodeType) ? o : Karma(o)[0];
		return Karma.inArray(el, this);
	},
	
	slice: function(start, end){
		return Karma(Array.prototype.slice.call(this, start, end)).stack(this);
	},
	
	// selecting elements by index, returns the element wrapped in Karma object
	eq: function(num) {
		return this[num] ? Karma(this[num]).stack(this): Karma([]).stack(this);
	},
	
	// get elements as array, return the array
	get: function(num) {
		return Karma.isValue(num) && this.length?
			Karma.makeArray(this) : 
			this[ num ];
	},
	
	// possibly need to make the result unique, will see how people use the find method
	descendents: function(query) {
		var ret = [];
		for(var i=0; i<this.length; i++)
			ret = Karma.merge(ret, Karma.Sizzle(query, this[i]));
		
		return Karma(Karma.unique(ret)).stack(this);
	},
	
	filter: function(query) {
		return query ? Karma(Karma.Sizzle.filter(query, this)).stack(this) : this;
	},
	
	is: function(query) {
		return query ? !!Karma.Sizzle.filter(query, this).length : false;
	},
	
	not: function(query) {
		return query ? Karma(Karma.Sizzle(':not('+query+')', this)).stack(this) : this;
	},
	
	// adding elements
	add: function(query) {
		return query? Karma(this).populate(Karma(query), this.length).stack(this) : this;
	},
	
		// adding self to chain
	andSelf: function() {
		return this.KarmaStack.length ? Karma(this).populate(this.KarmaStack[0], this.length).stack(this): this;
	},
	
	each: function(fn){
		for (var i=0; i< this.length; i++)
			fn.call(this[i], i);
		return this;
	},
	
	map: function(fn) {
		var ret = [];
		for (var i=0; i< this.length; i++)
			ret.push(fn.call(this[i], i));
		return ret;
	},
	
	grep: function(fn) {
		var ret = [];
		for (var i=0; i< this.length; i++) {
			var result = fn.call(this[i], i);
			if (result !== false)
				ret.push(result);
		}
		return this;
	}
});

// for jQuery compatibility
Karma.fn.extend({
	find: Karma.fn.descendents,
	parents: Karma.fn.ancestors
});


Karma.fn.extend({
			 
	attr: function(prop, val){
		if(Karma.isString(prop) && (Karma.isValue(val))) {
			
			for(var i=0; i<this.length; i++) {
				if (Karma.temp.attrMap[prop] && Karma.isDefined(this[i][Karma.temp.attrMap[prop]]))
					this[i][Karma.temp.attrMap[prop]] = val;
				else if (prop == "style" && Karma.support.cssText)
					this[i].style.cssText = val;
				else {
					this[i].setAttribute(prop, val);
				}
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
		return this.length? this[0].getAttribute(prop): null;
	},
	
	removeAttr: function(prop) {
		for(var i=0; i<this.length; i++) {
			if (Karma.temp.attrMap[prop] && Karma.isDefined(this[i][Karma.temp.attrMap[prop]]))
				this[i][Karma.temp.attrMap[prop]] = '';
			else if (prop == "style" && Karma.support.cssText) 
				this[i].style.cssText = '';

			try { this[i].removeAttribute(prop); } catch(e){};
		}
			
		return this;
	},
	
	data: function(key, value) {
		// key can be number or string
		// value can be anything even function except for undefined
		if(Karma.isDefined(value)) {
			for (var i=0; i< this.length; i++)
				Karma.data(this[i], key, value);
			return this;
		}
	
		return this[0] ? Karma.data(this[0], key) : null;
	},
	
	removeData: function(key) {
		if(Karma.isValue(key)) {
			for (var i=0; i< this.length; i++) {
				try { Karma.storage[this[i].KarmaMap].KarmaData[key] = null; } catch(e){}
			}
		}
		return this;
	},
	
	addClass: function(str){
		var _str = ' ' + str + ' ';
		
		for(var i=0; i< this.length; i++) {
			if (this[i].classList)
				this[i].classList.add(str);
			else {
				if( (' ' + this[i].className + ' ').indexOf(_str) < 0) 
					this[i].className.length ? this[i].className += ' ' + str : this[i].className = str;
			}
		}
			
		return this;
	},
	
	removeClass: function(str) {
		for(var i=0; i< this.length; i++)
			this[i].classList ? this[i].classList.remove(str) : this[i].className = Karma.trim(this[i].className.replace(str, ''));

		return this;
	},
	
	hasClass: function(str) {
		var _str = ' ' + str + ' ',
			ret = false;
		
		if(this.length)
			ret = this[0].classList ? this[0].classList.contains(str) : (' ' + this[0].className + ' ').indexOf(_str) >= 0;
		
		return ret;
	},
	
	toggleClass: function(str) {
		var _str = ' ' + str + ' ';
		for(var i=0; i< this.length; i++) {
			if(this[i].classList)
				this[i].classList.toggle(str);
			else {
				var classname = ' ' + this[i].className + ' ';
				this[i].className = classname.indexOf(_str) >= 0 ? classname.replace(_str, '') : classname += _str;
				this[i].className = Karma.trim(this[i].className);
			}
		}
		return this;
	},
	
	val: function(str){
		// setting values
		if(Karma.isValue(str)) { // if the str passed is a value
			for(var i=0; i< this.length; i++)
				if (Karma.isDefined(this[i].value)) // determine if the value property exists in the current element
					this[i].value = str;

			return this;
		}
		// getting value
		return (this[0] && Karma.isString(this[0].value)) ? this[0].value : null;
	},
	
	serialize: function() {
		var ret = '';
		for(var i=0; i< this.length; i++) {
			var name = this[i].getAttribute('name');
			if (name && name.length) {
				var value = this[i].value || '';
				
				if (this[i].nodeName.toLowerCase() == 'input' && this[i].getAttribute('type').toLowerCase() == 'checkbox' && !this[i].checked)
					ret += encodeURIComponent(name) + '=&';
				else
					ret += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
			}
		}
		return ret.length ? ret.substring(0, ret.length-1) : '';
	}

});

Karma.extend({
	data: function(el, key, value) {
		// key can be number or string
		// value can be anything except for undefined
		if(Karma.isDefined(value)) {
			var map = 0;
			if (el !== window) 
				map = el.KarmaMap = el.KarmaMap || ++Karma.uniqueId;
				
			Karma.storage[map] = Karma.storage[map] || {};
			Karma.storage[map].KarmaData = Karma.storage[map].KarmaData || {};
			Karma.storage[map].KarmaData[key] = value;
		}
	
		return Karma.storage && Karma.storage[el.KarmaMap] && Karma.storage[el.KarmaMap].KarmaData && Karma.storage[el.KarmaMap].KarmaData[key] ? Karma.storage[el.KarmaMap].KarmaData[key] : null;
	}
});
Karma.extend({

	ajax: function(o) {

		o = Karma.extend({
			type: 'GET',
			data: null,
			url: '',
			contentType: null,
			cache: false,
			loading: function(){},
			success: function(){},
			error: function(){},
			XHR: window.XMLHttpRequest? new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTP")
		 }, o);

		if (o.XHR === null || typeof o.XHR == "undefined" || !o.url.length) return;
		
		o.XHR.onreadystatechange=function(){
			try {
				if (o.XHR.readyState === 4 && !o.successDone){
					o.success(o.XHR.responseText);
					o.successDone = true;
				}
				
				if (o.XHR.status != 200 && !o.errorDone) {
					o.error(o.XHR.responseText);
					o.successDone = true;
					o.errorDone = true;
				}
			} catch(e) {};
		}
		var _url = o.url;
		if (o.type.toLowerCase() == 'get' && o.data)
			o.cache ? _url += '?karma_ts=' + new Date().getTime() + '&' + o.data : _url += '?' + o.data;
		
		
		o.XHR.open(o.type, _url, true);
		o.loading();
		
		if(o.contentType)
			o.XHR.setRequestHeader("Content-Type", o.contentType);
		
		(o.type.toLowerCase() == 'post' && o.data) ?
			o.XHR.send(o.data) :
			o.XHR.send(null);
	}

});


Karma.extend({

	getScript: function(url, success) {
		var counter = 0,
			script = [],
			isDone = false,
			mylength = url.length || 1;
		
		var callback = function(){
			counter++;
			
			if (!isDone && counter >= mylength) {
				isDone = true;
				success();
			}
		};

		for (var i = 0; i < mylength; i++) {
			script[i] = document.createElement('SCRIPT');
			script[i].type = 'text/javascript';
			script[i].src = url[i] || url;
			
			// prevent KB917927, also document.getElementsByTagName('head') is not always available
			document.documentElement.insertBefore(script[i], document.documentElement.firstChild);
			
			if (script[i].readyState) {
				script[i].onreadystatechange = function() {
					if (script[i].readyState == "loaded" || script[i].readyState == "complete") {
						script[i].onreadystatechange = null;
						callback();
					}
				}
			}
	
			else script[i].onload = callback;
		}
	}
});

Karma.include = Karma.getScript;


Karma.fn.extend({

	bind: function(str, fn, livequery) {
		if (!this.length || !Karma.isString(str) || !Karma.isFunction(fn)) return this;
	
		str = str.split(/\s+/);
		
		// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
		var TAGNAMES = {
			'select':'input',
			'change':'input',
			'submit':'form',
			'reset':'form',
			'error':'img',
			'load':'img',
			'abort':'img',
			'unload': 'window',
			'resize': 'window'
		}
		
		var isEventSupported = function(eventName) {
			var el = TAGNAMES[eventName] ? document.createElement(TAGNAMES[eventName]) : Karma.temp.div;
			var test = el;
			
			if (TAGNAMES[eventName] == 'window')
				test = window;
			
			var onEventName = 'on' + eventName,
				isSupported = !!(onEventName in test);
			
			if (!isSupported) {
				if (test === window)
					test = el;

				test.setAttribute(onEventName, 'return;');
				isSupported = typeof test[onEventName] == 'function';
			}
			
			el = null;
			Karma.event.support = Karma.event.support || {};
			Karma.event.support[eventName] = isSupported;
			return isSupported;
		}

		o:for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			if (Karma.event.special[ns[0]]) {
				var args = [];
				for(var i = 0; i < arguments.length; i++)
					if(Karma.isFunction(arguments[i]))
						args.push(arguments[i]);
						
				Karma.event.special[ns[0]].setup.apply(this, args);
				continue o;
			}
			
			for(var i=0; i< this.length; i++) {
				if (!(this[i].nodeType == 3 || this[i].nodeType == 8)) {
					var map = 0;
					if (this[i] !== window)
						map = this[i].KarmaMap = this[i].KarmaMap || ++Karma.uniqueId;
						
					Karma.storage[map] = Karma.storage[map] || {};
					
					var $ = Karma.storage[map].KarmaEvent = Karma.storage[map].KarmaEvent || {};
					
					$[ns[0]] = $[ns[0]] || [];
					
					if(livequery) {
						var data = Karma.data(this.context, 'KarmaLive') || {};
						data[ns[0]] = data[ns[0]] || {};
						data[ns[0]][livequery] = data[ns[0]][livequery] || [];
						
						if(ns.length == 1)
							data[ns[0]][livequery].push(fn);
						
						else if(ns.length == 2)
							data[ns[0]][livequery][ns[1]] = fn;
							
						Karma.data(this.context, 'KarmaLive', data);
					}
					
					else if (ns.length == 1)
						$[ns[0]].push(fn);
	
					else if (ns.length == 2)
						$[ns[0]][ns[1]] = fn;
						
					if(Karma.event.support[ns[0]] || (Karma.event.support[ns[0]] !== false && isEventSupported(ns[0]))) {
						if(!Karma.isFunction(this[i]['on'+ns[0]]))
							this[i]['on'+ns[0]] = Karma.event.caller;
					}
					// custom event
					else if(document.addEventListener) {
						var total = 0;
						for(var event in $[ns[0]]) {
							total++;
						}
	
						if(!total)
							this[i].addEventListener(ns[0], Karma.event.caller, false);
					}
					// custom/proprietary event for M$
					else {
						this[i].customEvents = 0;
						if(!Karma.isFunction(this[i].onpropertychange))
							this[i].onpropertychange = Karma.event.caller;
					}
				}
			}
		}
		return this;
	},
		
	unbind: function(str, fn, livequery) {
		if (!str || !this.length) return this;
		var token = str.split(/\s+/);
		
		for(var j=0; j< token.length; j++) {
			var ns = token[j].split('.');
			for(var i=0; i< this.length; i++) {
				var map = this === window ? 0 : this[i].KarmaMap;
				var data = Karma.data(this[i], 'KarmaLive');
				if (livequery) {
					if(data && data[ns[0]] && data[ns[0]][livequery]) {
						if (Karma.isFunction(fn)) {
							for (var fn in data[ns[0]][livequery])
								if (data[ns[0]][livequery][fn] == fn)
									delete data[ns[0]][livequery][fn];
						}
						else if (ns.length > 1) {
							delete data[ns[0]][livequery][ns[1]];
						}
						else if(ns.length == 1) {
							delete data[ns[0]][livequery];
						}
					}
				}

				else if (Karma.storage[map] && Karma.storage[map].KarmaEvent) {
					var $ = Karma.storage[map].KarmaEvent;
					if (Karma.isFunction(fn)) {
						for (var prop in $[ns[0]])
							if ($[ns[0]][prop] == fn)
								delete $[ns[0]][prop];
					}
					else if (ns.length > 1 && $[ns[0]]) {
						delete $[ns[0]][ns[1]];
					}
					else if($[ns[0]]) {
						this[i]['on'+ns[0]] = null;
						delete $[ns[0]];
					}
				}
			}
		}
		return this;
	},
	
	one: function(str, fn) {
		this.on(str, fn);
					
		if (this.data('triggerOnce') === null);
			this.data('triggerOnce', []);
		
		this.data('triggerOnce').push(fn);
		
		return this;
		
	},
	
	triggerHandler: function(eventName) {
		this.trigger(eventName, true);
	},
	
	trigger: function(eventName, prevent) {
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
					
					if(prevent) {
						event.stopPropagation();
						event.preventDefault();
					}
					
					element.dispatchEvent(event);
				}
				else {
					var fakeEvent = document.createEvent("UIEvents");
					fakeEvent.initEvent(eventName, false, false);
					
					if(prevent) {
						fakeEvent.stopPropagation();
						fakeEvent.preventDefault();
					}
					
					element.dispatchEvent(fakeEvent);
				}
			}
			// m$ methods
			else if(Karma.support.createEventObject){
				if(Karma.event.support[eventName]) {
					element = (element === document || element === window ) ? document.documentElement : element;
				
					var event = document.createEventObject();
					if(prevent) {
						event.cancelBubble = true;
						event.returnValue = false;
					}
					
					/*for(var property in properties)
						event[property]=properties[property];*/
		
					element.fireEvent("on"+eventName, event);
				}
				else {
					var current = Karma(element).data('fireEvent') || [];
					current.push(eventName);
					
					Karma(element).data('fireEvent', current);
					element.customEvents++;
				}
			}

		} catch(e){};
		
		return this;
	},
	
	// preventDefault and stopPropagation might not be 100% complete for live yet
	live: function(str, fn){
		return Karma(this.context).bind(str, fn, this.query);
	},
	
	die: function(str, fn) {
		return Karma(this.context).unbind(str, fn, this.query);
	}

});

// create events for w3c browser
if(Karma.support.createEvent)
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
}

else Karma.event = {};

Karma.event.support = {};
Karma.event.special = {
	hover: {
		setup: function(){
			var args = arguments;
			this.bind('mouseover', function(e){ 
				e.stopPropagation();
				return args[0].call(this, e); 
			}).bind('mouseout', function(e){ 
				e.stopPropagation();
				return args[1].call(this, e); 
			});
		},
		teardown: function(){
			this.unbind('mouseover').unbind('mouseout');
		}
	}
}

// caller the determines how events are fired, also normalizes events
// hardest freakin bitch function to code in Karmagination
Karma.event.caller = function(e) {
	var cur_map = this === window ? 0 : this.KarmaMap;
	e = window.event || e;
	
	// some basic normalization of event
	if(!e.stopPropagation && window.event) 
		e.stopPropagation = function(){ window.event.cancelBubble = true; };
	
	if(!e.preventDefault && window.event)
		e.preventDefault = function(){ window.event.returnValue = false; };
		
	if(!e.target && e.srcElement)
		e.target = e.srcElement || document;
	
	try {
		if(e.type == 'mouseover' && !('relatedTarget' in e))
			 e.relatedTarget = e.fromElement;
	
		else if(e.type == 'mouseout' && !('relatedTarget' in e))
			e.relatedTarget = e.toElement;
			
		if(e.wheelDelta) {
			e.wheelDiff = e.wheelDelta/120;
			if(Karma.isOpera)
				e.wheelDiff = -e.wheelDiff;
		}
		else if (e.detail)
			e.wheelDiff = -e.detail/3;
			
		// fix for safari textnode
		if (e.target.nodeType == 3)
			e.target = e.target.parentNode;

		// Calculate pageX/Y if missing and clientX/Y available
		if ( e.pageX == null && e.clientX != null ) {
			var doc = document.documentElement, body = document.body;
			e.pageX = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
			e.pageY = e.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
		}
	
		// Add which for key events
		if ( !e.which && ((e.charCode || e.charCode === 0) ? e.charCode : e.keyCode) )
			e.which = e.charCode || e.keyCode;
	
		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !e.metaKey && e.ctrlKey )
			e.metaKey = e.ctrlKey;
	
		// Add which for click: 1 == left; 2 == middle; 3 == right
		// Note: button is not normalized, so don't use it
		if ( !e.which && e.button )
			e.which = (e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) ));
		
	} catch(e){}
	
	var live = Karma.data(this.ownerDocument || document, 'KarmaLive');
	if (live && live[e.type]) {
		var passed = [],
			node = [],
			ancestors = [],
			cur = e.target;
		
		// get a list of ancestors e.target including e.target
		while(cur) {
			ancestors.push(cur);
			cur = cur.parentNode;
		}

		// see which live query is more specific to the e.target
		for(var query in live[e.type]) {
			var result = Karma.Sizzle.filter(query, ancestors);
			if (result.length) {
				for(var i = 0; i < ancestors.length; i++) {
					if (ancestors[i] === result[0]) {
						passed[i] = query;
						node[i] = result[0];
					}
				}
			}
		}
		
		// stop event done 99% right, WOOT
		for(var i=0; i < passed.length; i++) {
			if (passed[i] && live[e.type][passed[i]]) {
				var stopped = 0;
				for(var stacked in live[e.type][passed[i]]) {
					if(live[e.type][passed[i]][stacked].call(node[i], e) === false) {
						e.preventDefault();
						e.stopPropagation();
						stopped++;
					}
				}
				if (stopped) break;
			}
		}
	}
		
	if(e.propertyName == "customEvents") {
		var events = $(this).data('fireEvent');
		
		for(var index in events) {
			try {
				for(var functions in Karma.storage[cur_map].KarmaEvent[events[index]]) {
					if(Karma.storage[cur_map].KarmaEvent[events[index]][functions].call(this, e) === false) {
						e.stopPropagation();
						e.preventDefault();	
					}	
				}
				events[index] = null;
			} 
			catch(e){};
		}
		$(this).data('fireEvent', events);
	}
	
	else if(Karma.storage[cur_map] && Karma.storage[cur_map].KarmaEvent && Karma.storage[cur_map].KarmaEvent[e.type]) {
		for(var functions in Karma.storage[cur_map].KarmaEvent[e.type]) {
			if(Karma.storage[cur_map].KarmaEvent[e.type][functions].call(this, e) === false) {
				e.stopPropagation();
				e.preventDefault();	
			}
			
			var once = Karma(this).data('triggerOnce');
			if(once) {
				for (var i = 0; i < once.length; i++) {
					if(once[i] === Karma.storage[cur_map].KarmaEvent[e.type][functions]) {
						Karma.storage[cur_map].KarmaEvent[e.type][functions] = null;
						delete Karma.storage[cur_map].KarmaEvent[e.type][functions];
					}
				}
			}
			
		}
	}
}


Karma.fn.extend({
	style: function(property, value) {
		if (Karma.isString(property) && Karma.isValue(value))
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
		
		property = Karma.camelCase(property);		

		if (property == 'opacity') {
			for (var i=0; i < this.length; i++) {
				// webkit and opera support filter, which is BS
				// lesson learnt: feature test W3C standard before proprietary standard 
				if(Karma.support.opacity) this[i].style.opacity = value;
				// if we have full opacity, better to remove it to restore the antialiasing ability of IE
				else if(Karma.support.filter) {
					// OMFG, MS needs hasLayout for opacity, or it will just work on body
					this[i].style.zoom = 1;
					this[i].style.filter = (parseInt(value, 10) == 1) ? '' : 'alpha(opacity=' + (value * 100) + ')';
				}
			}
			
			return this;
		}
		
		if (property == 'scrollTop' || property == 'scrollLeft') {
			for (var i=0; i < this.length; i++) {
				if (this[i] === document.documentElement || this[i] === document || this[i] === document.body || this[i] === window) {
					document.body[property] = value;
					document.documentElement[property] = value;
				}
				else
					this[i][property] = value;
			}
			return this;
		}
		
		if (property == 'float')
			property = Karma.support.styleFloat ? 'styleFloat' : 'cssFloat';
		
		// concat integers/integer-like strings with px;
		var curval = +value;
		if ( curval || curval === 0 ) value = curval + 'px';
		
		
		if(Karma.isString(value)) // just to be safe
		for (var i=0; i < this.length; i++)
			this[i].style[property] = value;
		
		return this;
	},
	
	getStyle: function(property) {
		if(!this.length) return null;
		
		property = Karma.camelCase(property);
		
		if (property == 'scrollTop' || property == 'scrollLeft')
			return (this[0]===document || this[0]===document.documentElement || this[0]===window)? document.body[property]: this[0][property];
		
		if (property == 'float')
			property = Karma.support.styleFloat ? 'styleFloat' : 'cssFloat';
		
		else if (property == 'opacity' && this[0].filters) {
			try { 
				var opacity = this[0].filters('alpha').opacity;
			}
			catch(e){ 
				return 1; 
			}
			return opacity/100;
		}
		
		// check if the current node is stylable or not, i.e. window cannot be styled
		if(this[0].style) {
			if (this[0].currentStyle) {
				if (this[0].currentStyle[property] == 'auto' && this[0].style[property] == '') {
					if(/width|height/i.test(property)) return this.width();
					if(/left|top|right|bottom/i.test(property)) return 0;
				}

				return this[0].currentStyle[property] ? this[0].currentStyle[property] : this[0].style[property];
			}
			else if ( "getComputedStyle" in document.defaultView ) {
				var computed = document.defaultView.getComputedStyle(this[0], null)[property];
				
				if (!computed || !computed.length) computed = this[0].style[property];
							
				if (property.toLowerCase().indexOf('color') >= 0) {
					var color = computed.match(/rgba?\([\d\s,]+\)/);
					if (color)
						computed = Karma.rgbToHex(color[0].match(/\d{1,3}/g));
				}
				return computed;
			}
		}
		return '';
	},
	
	dimension: function(name, border){
		if(!this.length) return null;
		return this[0] === window ?
			// use document.documentElement or document.body depending on Quirks vs Standards mode
			document.compatMode == "CSS1Compat" && document.documentElement[ "client" + name ] || document.body[ "client" + name ] :
			// Get document width or height
			this[0] === document ?
				// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
				Math.max(
					document.documentElement["client" + name],
					document.body["scroll" + name], document.documentElement["scroll" + name],
					document.body["offset" + name], document.documentElement["offset" + name]
				) :
				border ?
					this[0]['offset'+name]:
					this[0]['client'+name];
	},
	
	width: function(val){
		var paddingLeft = parseInt(this.getStyle('paddingLeft'), 10) || 0,
			paddingRight = parseInt(this.getStyle('paddingRight'), 10) || 0;
		return Karma.isValue(val) ? this.setStyle('width', val) : this.dimension('Width') - paddingLeft - paddingRight;
	},
	
	height: function(val){
		var paddingTop = parseInt(this.getStyle('paddingTop'), 10) || 0,
			paddingBottom  = parseInt(this.getStyle('paddingBottom'), 10) || 0;
		return Karma.isValue(val) ? this.setStyle('height', val) : this.dimension('Height') - paddingTop - paddingBottom;
	},
	
	innerWidth: function(){
		return this.dimension('Width');
	},
	
	innerHeight: function(val){
		return this.dimension('Height');
	},
	
	outerWidth: function(val, margin){
		var marginLeft = margin ? parseInt(this.css('marginLeft'), 10) || 0 : 0,
			marginRight = margin ? parseInt(this.css('marginRight'), 10) || 0 : 0;
		return this.dimension('Width', 1) + marginLeft + marginRight;
	},
	
	outerHeight: function(val, margin){
		var marginTop = margin ? parseInt(this.css('marginTop'), 10) || 0 : 0,
			marginBottom = margin ? parseInt(this.css('marginBottom'), 10) || 0 : 0;
		return this.dimension('Height', 1) + marginTop + marginBottom;
	},

	offset: function() {
		if (!this[0]) return null;
		// w3c
		Karma.calculateOffset();
		if (document.documentElement.getBoundingClientRect) {
			if ( this[0] === (this[0].ownerDocument||this[0]).body ) {
				var top = this[0].offsetTop, left = this[0].offsetLeft;
				if ( Karma.support.offsetDoesNotIncludeMarginInBodyOffset )
					top  += parseInt(this.css('marginTop'), 10) || 0,
					left += parseInt(this.css('marginLeft'), 10 ) || 0;
				return { top: top, left: left };
			}
			
			var box  = this[0].getBoundingClientRect(), 
				doc = this[0].ownerDocument || doc, 
				body = doc.body, 
				docElem = doc.documentElement,
				clientTop = docElem.clientTop || body.clientTop || 0, 
				clientLeft = docElem.clientLeft || body.clientLeft || 0,
				top  = box.top  + (self.pageYOffset || Karma.support.boxModel && docElem.scrollTop || body.scrollTop) - clientTop,
				left = box.left + (self.pageXOffset || Karma.support.boxModel && docElem.scrollTop || body.scrollLeft) - clientLeft;
			
			return { top: top, left: left };
		}
		// m$
		else {
			var elem = this[0], 
				offsetParent = elem.offsetParent, 
				prevOffsetParent = elem,
				doc = elem.ownerDocument || elem, 
				computedStyle, 
				docElem = doc.documentElement,
				body = doc.body, 
				defaultView = doc.defaultView,
				prevComputedStyle = defaultView.getComputedStyle(elem, null),
				top = elem.offsetTop, 
				left = elem.offsetLeft;
	
			while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
				computedStyle = defaultView.getComputedStyle(elem, null);
				top -= elem.scrollTop, 
				left -= elem.scrollLeft;
				
				if ( elem === offsetParent ) {
					top += elem.offsetTop, 
					left += elem.offsetLeft;
					if ( Karma.support.offsetDoesNotAddBorder && !(Karma.support.offsetDoesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(elem.tagName)) )
						top  += parseInt( computedStyle.borderTopWidth,  10) || 0,
						left += parseInt( computedStyle.borderLeftWidth, 10) || 0;
					prevOffsetParent = offsetParent, offsetParent = elem.offsetParent;
				}
				
				if ( Karma.support.offsetSubtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" )
					top  += parseInt( computedStyle.borderTopWidth,  10) || 0,
					left += parseInt( computedStyle.borderLeftWidth, 10) || 0;
				prevComputedStyle = computedStyle;
			}
	
			if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" )
				top  += body.offsetTop,
				left += body.offsetLeft;
	
			if ( prevComputedStyle.position === "fixed" )
				top  += Math.max(docElem.scrollTop, body.scrollTop),
				left += Math.max(docElem.scrollLeft, body.scrollLeft);
	
			return { top: top, left: left };			
			
		}
	},
	
	position: function() {
		var left = 0, top = 0, results = null;

		if ( this[0] ) {
			// Get *real* offsetParent
			var offsetParent = this.offsetParent(),
				offsetDoc = offsetParent.ownerDocument || offsetParent,

			// Get correct offsets
			offset       = this.offset(),
			parentOffset = (offsetDoc.documentElement === offsetParent || offsetDoc.body === offsetParent) ? { top: 0, left: 0 } : offsetParent.offset();

			// Subtract element margins
			// note: when an element has margin: auto the offsetLeft and marginLeft 
			// are the same in Safari causing offset.left to incorrectly be 0
			offset.top  -= parseInt( this.css('marginTop'), 10 ) ||  0;
			offset.left -= parseInt( this.css('marginLeft'), 10 ) ||  0;

			// Add offsetParent borders
			parentOffset.top  += parseInt( Karma(offsetParent).css('borderTopWidth'), 10 ) || 0;
			parentOffset.left += parseInt( Karma(offsetParent).css('borderLeftWidth'), 10 ) || 0;

			// Subtract the two offsets
			results = {
				top:  offset.top  - parentOffset.top,
				left: offset.left - parentOffset.left
			};
		}

		return results;
	},
	
	offsetParent: function() {
		var offsetParent = this[0].offsetParent || document.body,
			offsetDoc = offsetParent.ownerDocument || offsetParent;
		while ( offsetParent && offsetParent !== offsetDoc.documentElement && offsetParent !== offsetDoc.body && Karma(offsetParent).css('position') == 'static')
			offsetParent = offsetParent.offsetParent;
		return Karma(offsetParent);
	},
	
	scrollTop: function() {
		return this.css('scrollTop');
	},
	
	scrollLeft: function() {
		return this.css('scrollLeft');
	}	
});

Karma.fn.css = Karma.fn.style;

Karma.extend({
	camelCase: function(property) {
		if (Karma.temp.camelCase[property]) {
			property = Karma.temp.camelCase[property];
		}
		else {
			property = Karma.temp.camelCase[property] = property.replace(/\-(\w)/g, function(all, letter){ return letter.toUpperCase(); });
		}
		
		return property;
	},
	
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
	
	calculateOffset: function(){
		if (Karma.temp.calculatedOffsets) return;
		
		var offset = new Karma.temp.offsets();
		Karma.extend(Karma.support, {
			offsetDoesNotAddBorder: offset.doesNotAddBorder,
			offsetDoesAddBorderForTableAndCells: offset.doesAddBorderForTableAndCells,
			offsetSubtractsBorderForOverflowNotVisible: offset.subtractsBorderForOverflowNotVisible,
			offsetDoesNotIncludeMarginInBodyOffset: offset.doesNotIncludeMarginInBodyOffset
		});
		
		Karma.temp.calculatedOffsets = true;
	}
});


Karma.fn.extend({
	stop: function(){
		for(var i = 0; i < this.length; i++) {
			var KarmaFX = Karma.data(this[i], 'KarmaFX');
			for(var iter in KarmaFX)
				clearInterval(KarmaFX[iter].timer);
		}
		
		return this.data('KarmaFX', null);
	},
	
	// do not calculate and store upfront, calculate on animating iteration hit
	// reason, css props can change in the middle
	animate: function(attributes, duration, callback, easing, step){
		if (!Karma.isGenericObject(attributes) || !this.length) return this;
		
		// do this for scoping issues with internal functions
		var els = this;
		
		// default values
		duration = duration || 500;
		easing = easing || Karma.easing.global;
		callback = callback || null;
		step = step || null;
		
		// setup initial KarmaFX data structure
		
		
		for(var i=0; i<els.length; i++) {
			var FX = {
				start: {},
				end: {},
				duration: duration,
				callback: callback,
				attributes: attributes,
				easing: easing,
				step: step
			};

			var $cur = Karma(els[i]),
				KarmaFX = $cur.data('KarmaFX', $cur.data('KarmaFX') || []).data('KarmaFX');

			// get starting/ending attributes
			// we need to calculate end cause we are converting values like em, etc to px
			KarmaFX.push(Karma.temp.populateStartEndValues($cur, FX, attributes));
			Karma.temp.animate($cur);
		}

		return this;
	}
});

Karma.temp.populateStartEndValues = function($curEl, FX, attributes) {
	for (var prop in attributes) {
		// get the current unanimated attribute
		FX.start[prop] = $curEl.getStyle(prop);
		FX.start[prop] = +FX.start[prop] || parseInt(FX.start[prop], 10);
		
		var cur_prop = +attributes[prop];

		// get start properties and convert to integer or float
		// set the final attribute if they are in numbers, no calculation
		if (cur_prop || cur_prop === 0) {
			FX.end[prop] = cur_prop;
		}
		
		// else we have to detemine the end attributes, ie 1.6 em = how many px
		else {
			// these are strings
			//var val = Karma.trim(attributes[prop]);
			var val = attributes[prop];
			
			// need to add or substract determined from original value
			if (val.indexOf('+=') >= 0 || val.indexOf('-=') >= 0) {
			
				var cur_val = val.replace('+=','').replace('-=',''),
					temp_val = +cur_val;
				
				// number looks like strings, means all digits /\d/ or has a unit of pixel
				if (temp_val || temp_val === 0 || val.indexOf('px') > 0)
					cur_val = temp_val || parseInt(cur_val, 10);
				
				// other units, opacity, will not hit this so no problem to parseInt
				else {
					cur_val = parseInt($curEl.setStyle(prop, cur_val).getStyle(prop), 10);
					$curEl.setStyle(prop, FX.start[prop]); // revert to start value
				}
				
				FX.end[prop] = (val.indexOf('+=') == 0) ? FX.start[prop] + cur_val : FX.start[prop] - cur_val;
			}
	
			// set the final attribute if they are in pixels, no calculation
			else if (val.indexOf('px') > 0) {
				FX.end[prop] = parseInt(val, 10);
			}
			
			// all other units like em, pt
			// using parseInt cause returned value by browser is px
			else {
				FX.end[prop] = parseInt($curEl.setStyle(prop, val).getStyle(prop), 10);
				$curEl.setStyle(prop, FX.start[prop]); // revert to start value
			}
		}
	}
		
	return FX;
}

Karma.temp.animate = function($cur) {
	var KarmaFX = $cur.data('KarmaFX');
	if (KarmaFX.length == 1) {
		var iter = 0,
			startTimer = new Date().getTime(),
			endTimer = startTimer + (KarmaFX[iter].duration || 0),
			timer;
			
		KarmaFX[iter].timer = timer = setInterval(function FX_first(){
			var curTime = new Date().getTime();
			
			if (!KarmaFX)
				clearInterval(timer);
				
			// a frame value between start and end
			else if(curTime < endTimer)
				currentFrame(curTime - startTimer, KarmaFX[iter].end);
			
			// last frame
			else 
				completeAnimation();

		}, 13); // try to run every 13ms
		
		var currentFrame = function(elapsed, attr){
			for (var prop in attr) {
				var start = KarmaFX[iter].start[prop],
					end = KarmaFX[iter].end[prop],
					duration = KarmaFX[iter].duration,					
					curval = KarmaFX[iter].easing(elapsed, start, end-start, duration);
				
				$cur.setStyle(prop, curval);
			}
			// just executing on every step
			if (KarmaFX && KarmaFX[iter] && KarmaFX[iter].step)	KarmaFX[iter].step();
		}
		
		var completeAnimation = function(){
			clearInterval(timer);
			
			// set to end values;
			if(KarmaFX && KarmaFX[iter]) {
				if (KarmaFX[iter].callback)
					KarmaFX[iter].callback();
			
				$cur.css(KarmaFX[iter].end);
			}
			
			KarmaFX[iter] = null;
			iter++;
			
			// if there's no next item, do a clean up
			if(KarmaFX.length && !KarmaFX[iter]) {
				$cur.data('KarmaFX', null);
			}
			
			// start the next animation queue in stack
			else {
				var startTimer = new Date().getTime(),
					endTimer = startTimer + KarmaFX[iter].duration;
					
				for (var prop in KarmaFX[iter].end)
					Karma.temp.populateStartEndValues($cur, KarmaFX[iter], KarmaFX[iter].attributes);

				KarmaFX[iter].timer = timer = setInterval(function FX_next(){
					var curTime = new Date().getTime();
					
					if(!KarmaFX)
						clearInterval(timer);

					// a frame value between start and end
					else if(curTime < endTimer){
						currentFrame(curTime - startTimer, KarmaFX[iter].end);
					}
					// last frame
					else { 
						completeAnimation();
					}
				}, 13); // try to run every 13ms
			}
		}
	}
}

Karma.easing = {
	easeIn: function (t, b, c, d) {
    	return c*(t/=d)*t + b;
    }
};

Karma.easing.global = Karma.easing.easeIn;

Karma.extend({
			 
	// method to namespace function, taking a chapter from YUI,
	// Ariel Flesler created this function, during a discussion in jQuery mailing list when I was a n00b using eval
	// http://groups.google.com/group/jquery-en/browse_thread/thread/95d1ceabe4bda4eb/c6fd0c270f91426e?q=#c6fd0c270f91426e
	namespace: function(name, root) {
		if (Karma.isString(name)) {
			// explode namespace with delimiter
		    name = name.split(".");
			// root is defaulted to window obj
		    var ns = root || window;
			// loop through each level of the namespace
		    for (var i =0; i<name.length; i++) {
				// nm is current level name
		    	var nm = name[i];
				// if not exist, add current name as obj to parent level, assign ns (parent) to current
				ns = ns[nm] || ( ns[nm] = {} ); 
				
				if (i == name.length-1) 
					return (typeof ns == 'function' || typeof ns == 'object') ? ns: false;
			}
		}
	},
	
	each: function(o, fn){
		for (var i = 0; i < o.length; i++) {
			fn.call(o[i], i, o[i]);
		}
	},
	
	trim: function(str){
		/* Thanks to Steven Levithan's benchmark on string trimming */
		// unicode friendly string trim for older browsers that don't catch all whitespaces
		// string.trim() is in JS 1.8.1, supported by FF 3.5
		// Using Luca Guidi's string trim for non native trim method
		if(str.trim)
		   return str.trim();
		
		if(!str.charAt)
			return str;
		
		var ws = /[\s\xA0]/, _start = 0, end = str.length;
		while(ws.test(str.charAt(_start++)));
		while(ws.test(str.charAt(--end)));
		return str.slice(_start - 1, end + 1);
	},
			 
	grep: function(o, fn) {
		var ret = [];
		// Go through the array, only saving the items that pass the validator function
		for (var i = 0; i < o.length; i++)
			if (fn.call(o[i], i, o[i]) !== false)
				ret.push( o[i] );

		return ret;
	},

	inArray: function(el, o){
		for (var i = 0; i < o.length; i++)
			if (o[i] === el)
				return i;
		return -1;
	},
	
	map: function(o, fn) {
		var array = [];
		for ( var i = 0; i < o.length; i++ ) 
			array.push(fn.call(o[i], i, o[i]));

		return array;
	},
	
	// merge all arrays
	merge: function(){
		return Array.prototype.concat.apply([], arguments);
	}
});

Karma.Class = function(opts){
	
	opts.construct = opts.construct || function(){};
	
	opts.construct.adds = function(option){
		for (var prop in option)
			if (prop !== 'construct') 
				opts.construct.prototype[prop] = option[prop];
	};
	
	opts.construct.inherits = function(parent){
   		opts.construct.prototype.__proto__ = parent.prototype;
		opts.construct.prototype.parent = parent;
	}
	
	for (var prop in opts)
		if (prop !== 'construct') 
			opts.construct.prototype[prop] = opts[prop];
	
	return opts.construct;
};


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

			if ( !/\W/.test(part) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
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
				if ( chunker.exec(match[3]).length > 1 || /^\w/.test(match[3]) ) {
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

				for ( i = 0, l = not.length; i < l; i++ ) {
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
					while ( (node = node.previousSibling) )  {
						if ( node.nodeType === 1 ) return false;
					}
					if ( type == 'first') return true;
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )  {
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
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 );

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
	return elem.nodeType === 9 && elem.innerHTML
	/*return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
		!!elem.ownerDocument && elem.ownerDocument.documentElement.nodeName !== "HTML";*/
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

Karma.Sizzle = Sizzle;

})();

Karma.each( ("blur,focus,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave,change,select,submit,keydown,keypress,keyup,error,hover").split(","), function(i, name){
	// Handle event binding
	Karma.fn[name] = function(fn){
		var args = [name].concat(Karma.makeArray(arguments));
		return arguments.length ? this.bind.apply(this, args) : this.trigger(name);
	};
});

Karma(function first_onload(){ 
	// predetermine boxModel
	if (document.body) {
		var div = document.createElement("div");
		div.style.width = div.style.paddingLeft = "1px";
		document.body.appendChild( div );
		Karma.support.boxModel = div.offsetWidth == 2;
		document.body.removeChild( div ).style.display = 'none';
	}
	// cleaning up the mess	
	Karma(window).bind('unload', function(){ Karma.storage = Karma.event.caller = null });
});
// Remember Karma.Sizzle = Sizzle;

// 2 filters below from the jQuery project
Karma.Sizzle.selectors.filters.visible = function(el){
	return el.offsetWidth > 0 || el.offsetHeight > 0;
};

Karma.Sizzle.selectors.filters.hidden = function(el){
	return el.offsetWidth === 0 && el.offsetHeight === 0;
};

Karma.Sizzle.selectors.filters.animated = function(el){
	return Karma(el).data('KarmaFX');
};

})();
