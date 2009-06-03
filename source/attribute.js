Karma.extend(Karma.fn, {
			 
	attr: function(prop, val){
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

			try { this[i].removeAttribute(prop); } catch(e){};
		}
			
		return this;
	},
	
	data: function(key, value) {
		// key can be number or string
		// value can be anything except for undefined
		if(Karma.isValue(key) && Karma.isDefined(value)) {
			for (var i=0; i< this.length; i++) {
				this[i].KarmaData = this[i].KarmaData || {};
				this[i].KarmaData[key] = value;
			}
			return this;
		}

		return Karma.isDefined(this[0].KarmaData[key]) ? this[0].KarmaData[key] : null;
	},
	
	removeData: function(key) {
		if(Karma.isValue(key)) {
			for (var i=0; i< this.length; i++) {
				if (this[i].KarmaData)
					this[i].KarmaData[key] = null;
			}
		}
		return this;
	},

	addClass: function(str){
		for(var i=0; i< this.length; i++)
			this[i].className += ' ' + str; // browser will automatically remove duplicates and trim
			
		return this;
	},
	
	removeClass: function(str) {
		if (Karma.isString(str)) {
			for(var i=0; i< this.length; i++)
				this[i].className = this[i].className.replace(str, '');
		}
		return this;
	},
	
	hasClass: function(str) {
		str = ' ' + str + ' ';
		return (this.length) ? !(' ' + this[0].className + ' ').indexOf(str) : false;
	},
	
	toggleClass: function(str) {
		str = ' ' + str + ' ';
		for(var i=0; i< this.length; i++) {
			var classname = ' ' + this[i].className + ' ';
			this[i].className = !classname.indexOf(str) ? classname.replace(str, '') : classname += str;
		}
		return this;
	},
	
	val: function(str){
		// setting values
		if(Karma.isValue(str)) { // if the str passed is a value
			for(var i=0; i< this.length; i++)
				if (Karma.isDefined(this[i].value)) // determine if the value property exists in the current element
					this[i].value = str;

			return this;
		}
		// getting value
		return (this[0] && Karma.isString(this[0].value)) ? this[0].value : null;
	}

});