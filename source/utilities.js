$hort.extend($hort, {
			 
	// method to namespace function, taking a chapter from YUI
	namespace: function(name, root) {
		if ($hort.isString(name)) {
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
				
				// determine if created namespace is valid or not;
				if (i == name.length-1) {
					if (!($.isGenericObject(ns) || $.isFunction(ns)))
						$hort.error(error); 
					return ns;
				}

			}
		}
	},
	
	trim: function(str){
		return str.replace(/^\s+|\s+$/g, '');
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
		var arry = [];
		for ( var i = 0; i < o.length; i++ ) 
			arry.push(fn.call(o[i], o[i], i));

		return arry;
	},
	
	// merge all arrays
	merge: function(){
		return Array.prototype.concat.apply([], arguments);
	}
});