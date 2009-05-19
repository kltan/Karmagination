Karma.extend(Karma.fn, {
			 
	attr: function(prop, val){
		// document.expando = true;
		
		// does not support events
		// setting one property
		if(Karma.isString(prop) && (Karma.isValue(val))) {
			for(var i=0; i<this.length; i++) {
				if (/id|href|name|dir|title/.test(prop))
					this[i][prop] = val;		  
				else if (prop==="class") 
					this[i]['className'] = val;
				else if (prop==="style" && Karma.support.cssText) 
					this[i].style.cssText = val;
				else 
					this[i].setAttribute(prop, val);
			}
					
			return this;
		}
		// setting multiple property
		else if(Karma.isObject(prop)) {
			for (property in prop)
				this.attr(property, prop[property]);
			return this;
		}
		
		// getting property of first element
		return this.length? this[0].getAttribute(val): null;
	},
	
	removeAttr: function(prop) {
		for(var i=0; i<this.length; i++) {
			if (prop==="class")
				this[i]['className'] = '';
			else if (prop==="style" && Karma.support.cssText) 
				this[i].style.cssText = '';

			this[i].removeAttribute(prop);
		}
			
		return this;
	},
	
	addClass: function(str){
		for(var i=0; i< this.length; i++)
			this[i].className += ' ' + str; // browser will automatically remove duplicates and trim
			
		return this;
	},
	
	removeClass: function(str) {
		for(var i=0; i< this.length; i++)
			this[i].className = this[i].className.replace(str, '');
			
		return this;
	},
	
	hasClass: function(str) {
		return this.length ? !!(this[0].className.indexOf(str) >= 0): false;
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
		// setting values
		if(Karma.isValue(str)) { // if the str passed is a value
			for(var i=0; i< this.length; i++)
				if (Karma.isString(this[i].value)) // determine if the value property exists in the current element
					this[i].value = str;

			return this;
		}
		// getting value
		return (this[0] && Karma.isString(this[0].value)) ? this[0].value : null;
	}

});