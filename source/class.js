
Karma['Class'] = function(opts){

	opts.constructor = opts.constructor || function(){};
	opts.constructor.extend = function(opts){
		for (var prop in opts)
			opts.constructor.prototype[prop] = opts[prop];
	};
	
	opts.constructor.inherits = function(base){
   		opts.constructor.prototype.__proto__ = base.prototype;
		opts.constructor.prototype.base = base;
	}
	
	for (var prop in opts)
		if (prop != 'constructor')
			opts.constructor.prototype[prop] = opts[prop];
	
	return opts.constructor;
};
