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
		return query? Karma(Karma.filter(query, this)).stack(this): this;
	},
	
	is: function(query) {
		return query? !!Karma.filter(query, this).length: false;
	},
	
	not: function(query) {
		return query? Karma(Karma.selector(':not('+query+')', this)).stack(this) : this;
	}
});