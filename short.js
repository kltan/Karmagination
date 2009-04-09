/*!
 * $hort 0.1
 * http://github.com/kltan/short/tree/master
 * JS library development simplified 
 * Released under the MIT, BSD, and GPL Licenses.
 * Copyright 2009 Kean L. Tan 
 * Start date: 2009-04-01
 * Last build: 2009-04-09 03:12:25 PM
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
	$hort: 0.1});


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
$hort.extend($.fn, {
	appendTo: function(o) {
		var tmp = $hort(o)[0],
			fragment = document.createDocumentFragment();

		if (tmp) {
			for (var i=0; i< this.length; i++)
				fragment.appendChild(this[i]);
			tmp.appendChild(fragment);
		}

		return this;
	},
	
	prependTo: function(o) {
		var tmp = $hort(o)[0],
			fragment = document.createDocumentFragment();
			
		if (tmp) {
			for (var i=0; i< this.length; i++) {
				fragment.appendChild(this[i]);
			};
			var first = tmp.firstChild;
			tmp.insertBefore(fragment, first);
		}
		return this;
	},
	
	insertBefore: function(o){
		var tmp = $hort(o)[0],
			fragment = document.createDocumentFragment();

		if (tmp) {
			for (var i=0; i< this.length; i++) {
				fragment.appendChild(this[i]);
			};
			var parent = tmp.parentNode;
			parent.insertBefore(fragment, tmp);
		}
		return this;
	},
	
	insertAfter: function(o){
		var tmp = $hort(o)[0],
			fragment = document.createDocumentFragment();
		
		if (tmp) {
			for (var i=0; i< this.length; i++) {
				fragment.appendChild(this[i]);
			};
			
			var parent = tmp.parentNode,
				next = $hort(tmp).next()[0];
			parent.insertBefore(fragment, next);
		}
		return this;
	},
	
	empty: function() {
		for (var i=0; i< this.length; i++) {
			var newEl = this[i].cloneNode(false);
			newEl.innerHTML = '';
			this[i].parentNode.replaceChild(newEl, this[i]);
		}
		return this;
	},
	
	remove: function(query){
		var result = this;
		if ($short.isString(query))
			result = $hort.filter(query, this);
		
		for (var i=0; i< result.length; i++)
			result[i].parentNode.removeChild(result[i]);
		
		return this;
	},
	
	clone: function(){
		var $ = this,
			cloned = [];

		for(var i=0;i<$.length;i++) {
			if ($[i].outerHTML && $[i] != document.body && $[i] != document.documentElement && $[i] != document.head) {
				var string = $[i].outerHTML;
				cloned.push($hort(string)[0]);
			}
			else 
				cloned.push($[i].cloneNode(true));
		}

		return $hort(cloned).stack(this);
	},
	
	wrap: function(str){
		for(var i=0;i<this.length;i++) {
			var $tmp = $hort($hort.cleanHTML(str));
			this[i].parentNode.replaceChild($tmp[0], this[i]);
			$tmp[0].appendChild(this[i]);
		}
			
		return this;
	}

});
$hort.extend($.fn, {
	
	// walking the DOM
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
		
		return $hort(elements).stack($);
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
		
		return $hort(siblings).stack(this);
	},
	
	parent: function() {
		var $ = this,
			parent = [];
			
		for (var i=0; i< $.length; i++)
			parent.push($[i].parentNode);
			
		return $hort($hort.unique(parent)).stack(this);
	},
	
	ancestors: function() {
		var $ = this,
			ancestors = [];
		
		for (var i=0; i< $.length; i++) {
			var parent = $[i].parentNode;
			while(parent != document) {
				ancestors.push(parent);
				parent = parent.parentNode;
			}
		}

		return $hort(ancestors).stack(this);
	},
	
	children: function() {
		var $ = this,
			children = [];
			
		for (var i=0; i< $.length; i++) {
			for(var j=0; j<$[i].childNodes.length; j++)
				if($[i].childNodes[j].nodeType == 1)
					children.push($[i].childNodes[j]);
		}
		
		return $hort(children).stack(this);
		
	},
	
	// selecting elements by index
	eq: function(num) {
		return this[num] ? $hort(this[num]).stack(this): $hort([]).stack(this);
	},
	
	get: function() {
		return this.length? Array.prototype.slice.call(this): [];
	},
	
	// adding elements
	add: function(query) {
		return query? $hort(this).populate($hort(query), this.length).stack(this) : $hort(this).stack(this);
	}
});

// selector engine dependent
if($hort.hasSelector()) $hort.extend($.fn, {
	// finding additional decendants
	find: function(query) {
		return this.length? $hort($hort.selector(query, this[0])).stack(this): $hort.selector(query).stack(this);
	},
	
	filter: function(query) {
		return query? $hort($hort.filter(query, this)).stack(this): $hort(this).stack(this);
	},
	
	is: function(query) {
		return query? !!$hort.filter(query, this).length: false;
	},
	
	not: function(query) {
		return query? $hort($hort.selector(':not('+query+')', this)).stack(this) : $hort(this).stack(this);
	}
});
$hort.extend($.fn, {
			 
	attr: function(prop, val){
		if($hort.isString(prop) && $hort.isString(val)) {
			for(var i=0; i<this.length; i++)
				this[i].setAttribute(prop, val);
			return this;
		}
		else if($hort.isObject(prop)) {
			for(var i=0; i<this.length; i++)
				for (prop in val)
					this[i].setAttribute(prop, val[prop]);
			return this;
		}

		return this.length? this[0].getAttribute(val): null;
	},
	
	removeAttr: function(prop) {
		for(var i=0; i<this.length; i++)
			this[i].removeAttribute(prop);
			
		return this;
	},
	
	addClass: function(str){
		for(var i=0; i< this.length; i++)
			this[i].className += str;
			
		return this;
	},
	
	removeClass: function(str) {
		for(var i=0; i< this.length; i++)
			this[i].className = this[i].className.replace(str, '');
			
		return this;
	},
	
	hasClass: function(str) {
		return this.length? !!(this[0].className.indexOf(str) >= 0): false;
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
	
	html: function(str) {
		if($hort.isString(str) || $hort.isNumber(str)) {
			for(var i=0; i< this.length; i++)
				this[i].innerHTML = str;
			return this;
		}
		return this.length? this[0].innerHTML: null;
	},
	
	text: function(str) {
		if($hort.isString(str) || $hort.isNumber(str)) {
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
	
	val: function(str){
		if($hort.isString(str) || $hort.isNumber(str)) {
			for(var i=0; i< this.length; i++)
				this[i].value = str;

			return this;
		}
		return this.length? this[0].value: null;
	}

});
$hort.extend($hort, {

	ajax: function(o) {
		
		o = $hort.extend({
			type: 'GET',
			data: '',
			url: '',
			loading: function(){alert('loading')},
			success: function(){alert('success')},
			error: function(){ alert('error')}
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
		oXHR.open("GET",o.url,true);
		oXHR.send(null);
	}

});
$hort.extend($hort.fn, {

	on: function(str, fn) {
		str = str.split(' ');
		
		for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			for(var i=0; i< this.length; i++) {
				var $ = this[i];
				$['$hortEvent'] = $['$hortEvent'] || [];
				$['$hortEvent'][ns[0]] = $['$hortEvent'][ns[0]] || [];
				
				if (ns.length == 1) {
					$['$hortEvent'][ns[0]].push(fn);
				}
				else if (ns.length == 2) {
					$['$hortEvent'][ns[0]][ns[1]] = fn;
				}
				if($.addEventListener)
					$.addEventListener(ns[0], fn, false);
				else if($.attachEvent)
					$.attachEvent('on'+ns[0], function(e){
						fn.call($, e);
					});
			}
		}

		return this;
	},
	
	un: function(str, fn) {
		str = str.split(' ');
		
		for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			for(var i=0; i< this.length; i++) {
				var $ = this[i];
				
				$['$hortEvent'] = $['$hortEvent'] || {};
				$['$hortEvent'][ns[0]] = $['$hortEvent'][ns[0]] || {};
				
				var cur = $['$hortEvent'][ns[0]];
				var detach = $.removeEventListener ? 'removeEventListener' : 'detachEvent';
				
				if(ns.length>1) {
					$[detach](ns[0], cur[ns[1]], false);
					delete $['$hortEvent'][ns[0]][ns[1]];
				}
				else {
					for(var prop in cur)
						$[detach](ns[0], cur[prop], false);
					$['$hortEvent'][ns[0]] = [];
				}

			}
		}

		return this;
	},
	
	// document.createEvent, lazy work for now
	trigger: function(str) {
		for(var i=0; i< this.length; i++) {
			if(this[0]['$hortEvent'] && this[0]['$hortEvent'][str]) {
				var fn = this[0]['$hortEvent'][str];
				for(var prop in fn) {
					fn[prop].call(this[0]);
				}
			}
		}
		return this;
	}
});

$hort.extend($hort.fn, {
	bind: $hort.fn.on,
	unbind: $hort.fn.un
});
$hort.extend($hort.fn, {
			 
	css: function(property, value) {
		if (property && value)
			return this.setStyle(property, value);
			
		if ($hort.isObject(property))
			for(var current in property)
				this.setStyle(current, property[current]);
		
		else
			this.getStyle(property);
		
		return this;
	},

	setStyle: function(property, value){
		if (property == 'opacity') {
			for (var i=0; i < this.length; i++) {
				if ($hort.isIE) this[i].style.filter = (parseFloat(value) == 1) ? '' : 'alpha(opacity=' + value * 100 + ')';
				this[i].style.opacity = value;
			}
			return this;
		}
		
		if (property == 'float')
			property = $hort.isIE ? 'styleFloat' : 'cssFloat';
		else
			property = $hort.camelCase(property)
		
		if($hort.isString(value) || $hort.isNumber(value))
			for (var i=0; i < this.length; i++)
				this[i].style[property] = value;
		
		return this;
	},
	
	getStyle: function(property) {
		if(!this.length) return null;
		
		(property == 'float')?	property = $hort.isIE ? 'styleFloat' : 'cssFloat':	property = $hort.camelCase(property);
		
		if (this[0].currentStyle) 
			return this[0].currentStyle[property];
			
		var computed = document.defaultView.getComputedStyle(this[0], null)[property],
			color = String(computed).match(/rgba?\([\d\s,]+\)/);
			
		if (color) {
			var rgb = color[0].match(/\d{1,3}/g);
			computed = $hort.rgbToHex(rgb);
		}
		
		return computed;
	},
	
	dimension: function(type){
		if(!this.length) return null;
		
		// special case, these should not be 0
		if (this[0] === window || this[0] === document || this[0] === document.documentElement)
			return this[0]['inner'+type] || window['inner'+type] || document.documentElement['client'+type] || document.body['client'+type];
			
		return this[0]['client'+type];
	},
	
	width: function(){
		return this.dimension('Width');
	},
	
	height: function(){
		return this.dimension('Height');
	}
});

$hort.extend($hort, {
	// calculates current window viewport
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
	}
});
