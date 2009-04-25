$hort.extend($.fn, {
	
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
		
		return $hort($hort.unique(siblings)).stack(this);
	},
	
	parent: function() {
		var $ = this,
			parent = [];
			
		for (var i=0; i< $.length; i++)
			parent.push($[i].parentNode);
			
		return $hort($hort.unique(parent)).stack(this);
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
		
		ancestors = $hort.unique(ancestors);
		
		if(str && $hort.hasSelector())
			ancestors = $hort.filter(str, ancestors)

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
	
	// selecting elements by index, returns the element wrapped in $hort object
	eq: function(num) {
		return this[num] ? $hort(this[num]).stack(this): $hort([]).stack(this);
	},
	
	// get elements as array or get individual element, return the array
	get: function(num) {
		return (num === undefined)? Array.prototype.slice.call(this): (this.length && this[num])? this[num]: null;
	},
	
	// adding elements
	add: function(query) {
		return query? $hort(this).populate($hort(query), this.length).stack(this) : $hort(this).stack(this);
	},
	
	each: function(fn){
		for (var i=0; i< this.length; i++)
			fn.apply(this[i], arguments);
		return this;
	}
	
});

// selector engine dependent, only extend if CSS selector engine is detected
if($hort.hasSelector()) $hort.extend($.fn, {
	// finding additional decendants
	find: function(query) {
		var ret = [];
		for(var i=0; i<this.length; i++)
			ret = $hort.merge(ret, $hort.selector(query, this[i]));
		
		return ret.length? $hort(ret).stack(this): $hort([]).stack(this);
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