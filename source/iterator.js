Karma.fn.extend({
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

