Karma.Class = function(opts){
	
	opts.construct = opts.construct || function(){};
	
	opts.construct.adds = function(option){
		for (var prop in option)
			if (prop !== 'construct') 
				opts.construct.prototype[prop] = option[prop];
	};
	
	opts.construct.inherits = function(parent){
   		opts.construct.prototype.__proto__ = parent.prototype;
		opts.construct.prototype.parent = parent;
	}
	
	for (var prop in opts)
		if (prop !== 'construct') 
			opts.construct.prototype[prop] = opts[prop];
	
	return opts.construct;
};

