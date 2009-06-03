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
		/* Thanks to Steven Levithan's benchmark on string trimming */
		// unicode friendly string trim for older browsers that don't catch all whitespaces
		return str.replace(/^[\s\xA0]+/, '').replace(/[\s\xA0]+$/, ''); 
	},
			 
	grep: function(o, fn) {
		var array = [];
		// Go through the array, only saving the items that pass the validator function
		for ( var i = 0; i < o.length; i++ )
			if (!fn(o[i], i) === false)
				array.push( o[i] );

		return array;
	},

	inArray: function(el, o){
		for (var i = 0; i < o.length; i++ )
			if (o[i] === el)
				return i;
		return -1;
	},
	
	map: function(o, fn) {
		var array = [];
		for ( var i = 0; i < o.length; i++ ) 
			array.push(fn(o[i], i));

		return array;
	},
	
	// merge all arrays
	merge: function(){
		return Array.prototype.concat.apply([], arguments);
	}
});
