Karma.fn.extend({
	style: function(property, value) {
		if (Karma.isString(property) && Karma.isValue(value))
			return this.setStyle(property, value);
			
		if (Karma.isObject(property)) {
			for(var current in property)
				this.setStyle(current, property[current]);
			return this;
		}

		return this.getStyle(property);
	},

	setStyle: function(property, value){
		if(!this.length) return this;

		if (property == 'opacity') {
			for (var i=0; i < this.length; i++) {
				// webkit and opera support filter, which is BS
				if(Karma.support.opacity) this[i].style.opacity = value;
				// if we have full opacity, better to remove it to restore the antialiasing ablity of IE
				else if(Karma.support.filter) this[i].style.filter = (parseInt(value, 10) == 1) ? '' : 'alpha(opacity=' + (value * 100) + ')';
				
			}
			
			return this;
		}
		
		if (property === 'scrollTop' || property === 'scrollLeft') {
			for (var i=0; i < this.length; i++) {
				if (this[i]===document.documentElement || this[i]===document || this[i]===document.body || this[i]===window) {
					document.body[property] = value;
					document.documentElement[property] = value;
				}
				else
					this[i][property] = value;
			}
			return this;
		}
		
		if (property === 'float')
			property = Karma.support.styleFloat ? 'styleFloat' : 'cssFloat';
		
		// I did some profiling, camelCase is dead evil and expensive
		// else property = Karma.camelCase(property);
		
		// convert integers to strings;
		if (Karma.isNumber(value)) value += 'px';
		
		if(Karma.isString(value))
			for (var i=0; i < this.length; i++)
				this[i].style[property] = value;
		
		return this;
	},
	
	getStyle: function(property) {
		if(!this.length) return null;
		
		if (property === 'scrollTop' || property === 'scrollLeft')
			return (this[0]===document || this[0]===document.body || this[0]===window)? document.documentElement[property]: this[0][property];
		
		if (property == 'float')
			property = Karma.support.styleFloat ? 'styleFloat' : 'cssFloat';
		
		else if (property == 'opacity' && this[0].filters) {
			try { var opacity = this[0].filters('alpha').opacity; }	catch(e){ return 1; }
			return opacity/100;
		}
		else if (property == 'borderWidth') {
			property = 'borderTopWidth';
		}
		
		else if (property == 'margin') {
			property = 'marginTop';
		}
		
		else if (property == 'padding') {
			property = 'paddingTop';
		}
		
		// I did some profiling, camelCase is dead evil and expensive
		// else property = Karma.camelCase(property);
		
		if (this[0].currentStyle) 
			return this[0].currentStyle[property];
			
		var computed = document.defaultView.getComputedStyle(this[0], null)[property];
		
		if (!computed.length)
			computed = this[0].style[property];
			
		if (property.toLowerCase().indexOf('color') >= 0) {
			var color = computed.match(/rgba?\([\d\s,]+\)/);
			if (color)
				computed = Karma.rgbToHex(color[0].match(/\d{1,3}/g));
		}
		
		return computed;
	},
	
	dimension: function(type){
		if(!this.length) return null;

		if (this[0] === window)
			return (this[0]['client'+type] || this[0]['offset'+type] || window['client'+type] || document.documentElement['client'+type] || document.body['client'+type]);
			
		if (this[0] === document.documentElement || this[0] === document) {
			var val = document.documentElement['offset'+type] || document.documentElement['client'+type];
			return val < document.body['offset'+type] ? document.body['offset'+type] : val;
		}
		
		return this[0]['offset'+type];
	},
	
	width: function(val){
		return Karma.isValue(val) ? this.setStyle('width', val) : this.dimension('Width');
	},
	
	height: function(val){
		return Karma.isValue(val) ? this.setStyle('height', val) : this.dimension('Height');
	}
});

Karma.fn.css = Karma.fn.style;

Karma.extend(Karma, {
	rgbToHex: function(array){
		if (array.length < 3) return null;
		if (array.length == 4 && array[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (array[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return '#' + hex.join('');
	}
	
	/*,
	camelCase: function(property){
		return property.replace(/\-(\w)/g, function(all, letter){ return letter.toUpperCase();	});
	}*/
	
});