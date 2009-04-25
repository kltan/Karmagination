$hort.extend($.fn, {
			 
	attr: function(prop, val){
		document.expando = true;
		// does not support style and events
		if($hort.isString(prop) && $hort.isString(val)) {

			for(var i=0; i<this.length; i++)
				(prop==="class") ? this[i]['className'] = val: this[i].setAttribute(prop, val);
					
			return this;
		}
		else if($hort.isObject(prop)) {
			for(var i=0; i<this.length; i++)
				for (property in prop)
					(property==="class") ? this[i]['className'] = prop[property]: this[i].setAttribute(property, prop[property]);

			return this;
		}

		return this.length? this[0].getAttribute(val): null;
	},
	
	removeAttr: function(prop) {
		for(var i=0; i<this.length; i++)
			this[i].removeAttribute(prop);
			
		return this;
	},
	
	addClass: function(str){
		for(var i=0; i< this.length; i++)
			this[i].className += ' ' + str;
			
		return this;
	},
	
	removeClass: function(str) {
		for(var i=0; i< this.length; i++)
			this[i].className = this[i].className.replace(str, '');
			
		return this;
	},
	
	hasClass: function(str) {
		return this.length? !!(this[0].className.indexOf(str) >= 0): false;
	},
	
	toggleClass: function(str) {
		for(var i=0; i< this.length; i++) {
			if(this[i].className.indexOf(str) >= 0)
				this[i].className = this[i].className.replace(str, '');
			else
				this[i].className += str;
		}
			
		return this;
	},
	
	val: function(str){
		if($hort.isString(str) || $hort.isNumber(str)) {
			for(var i=0; i< this.length; i++)
				this[i].value = str;

			return this;
		}
		return this.length? this[0].value: null;
	}

});