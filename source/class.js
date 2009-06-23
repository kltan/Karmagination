Karma.Class = function(opts){
	
	opts.constructor = opts.constructor || function(){};
	
	opts.constructor.add = function(option){
		for (var prop in option)
			if (prop !== 'constructor') 
				opts.constructor.prototype[prop] = option[prop];
	};
	
	opts.constructor.inherit = function(parent){
   		opts.constructor.prototype.__proto__ = parent.prototype;
		opts.constructor.prototype.parent = parent;
	}
	
	for (var prop in opts)
		if (prop !== 'constructor') 
			opts.constructor.prototype[prop] = opts[prop];
	
	return opts.constructor;
};
