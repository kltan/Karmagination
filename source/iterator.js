Karma.fn.extend({
	each: function(fn){
		for (var i=0; i< this.length; i++)
			fn(this[i], i);
		return this;
	},
	
	map: function(fn) {
		var ret = [];
		for (var i=0; i< this.length; i++)
			ret.push(fn(this[i], i));
		return ret;
	},
	
	grep: function(fn) {
		var ret = [];
		for (var i=0; i< this.length; i++) {
			var result = fn(this[i], i);
			if (result !== false)
				ret.push(result);
		}
		return this;
	}
});

