$hort.extend($hort.fn, {
			 
	css: function(property, value) {
		if (property && value)
			return this.setStyle(property, value);
			
		if ($hort.isObject(property)) {
			for(var current in property)
				this.setStyle(current, property[current]);
			return this;
		}

		return this.getStyle(property);
	},

	setStyle: function(property, value){
		if (property == 'opacity') {
			for (var i=0; i < this.length; i++) {
				// safer code, we use isString cause '0' can be intepreted as false
				if ($hort.isString(this[i].style.filter)) this[i].style.filter = (parseFloat(value) == 1) ? '' : 'alpha(opacity=' + value * 100 + ')';
				else this[i].style.opacity = value;
			}
			return this;
		}
		
		if (property == 'float') {
			var tmp = document.createElement('DIV');
			property = $hort.isString(tmp.style.styleFloat) ? 'styleFloat' : 'cssFloat';
		}
		else
			property = $hort.camelCase(property);
		
		if($hort.isString(value) || $hort.isNumber(value))
			for (var i=0; i < this.length; i++)
				this[i].style[property] = value;
		
		return this;
	},
	
	getStyle: function(property) {
		if(!this.length) return null;
		
		if (property == 'float') {
			var tmp = document.createElement('DIV');
			// safer code, we use isString cause '0' can be intepreted as false
			property = $hort.isString(tmp.style.styleFloat) ? 'styleFloat' : 'cssFloat';
		}
		else
			property = $hort.camelCase(property);
			
		if (this[0].currentStyle) 
			return this[0].currentStyle[property];
			
		var computed = document.defaultView.getComputedStyle(this[0], null)[property],
			color = String(computed).match(/rgba?\([\d\s,]+\)/);
			
		if (color) {
			var rgb = color[0].match(/\d{1,3}/g);
			computed = $hort.rgbToHex(rgb);
		}
		
		return computed;
	},
	
	dimension: function(type){
		if(!this.length) return null;

		// special case, these should not be 0
		if (this[0] === window || this[0] === document || this[0] === document.documentElement)
			return this[0]['inner'+type] || window['inner'+type] || document.documentElement['client'+type] || document.body['client'+type];
			
		return this[0]['client'+type];
	},
	
	width: function(){
		return this.dimension('Width');
	},
	
	height: function(){
		return this.dimension('Height');
	}
});

$hort.extend($hort, {
	// calculates current window viewport
	
	// probably not too useful for people, can be a plugin
	/*
	viewport: function(){
		var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
			w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
			left = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
			top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
		
		return {
			top: top,
			left: left,
			right: left + w,
			bottom: top + h
		};
	},
	*/
	rgbToHex: function(array){
		if (array.length < 3) return null;
		if (array.length == 4 && array[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (array[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return '#' + hex.join('');
	},
	
	camelCase: function(property){
		return property.replace(/\-(\w)/g, function(all, letter){ return letter.toUpperCase();	});
	}
	
});