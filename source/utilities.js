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
			fn.call(o[i], i);
		}
	},
	
	trim: function(str){
		/* Thanks to Steven Levithan's benchmark on string trimming */
		// unicode friendly string trim for older browsers that don't catch all whitespaces
		// string.trim() is in JS 1.8.1, supported by FF 3.5
		// Using Luca Guidi's string trim for non native trim method
		if(str.trim)
		   return str.trim();
		
		if(!str.replace)
			return str;
		
		var ws = /\s/, _start = 0, end = str.length;
		while(ws.test(str.charAt(_start++)));
		while(ws.test(str.charAt(--end)));
		return str.slice(_start - 1, end + 1);
	},
			 
	grep: function(o, fn) {
		var ret = [];
		// Go through the array, only saving the items that pass the validator function
		for (var i = 0; i < o.length; i++)
			if (fn.call(o[i], i) !== false)
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
			array.push(fn.call(o[i], i));

		return array;
	},
	
	// merge all arrays
	merge: function(){
		return Array.prototype.concat.apply([], arguments);
	}
});

