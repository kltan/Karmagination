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

