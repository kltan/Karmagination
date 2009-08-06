Karma.fn.extend({
			 
	attr: function(prop, val){
		if(Karma.isString(prop) && (Karma.isValue(val))) {
			
			for(var i=0; i<this.length; i++) {
				if (Karma.temp.attrMap[prop] && Karma.isDefined(this[i][Karma.temp.attrMap[prop]]))
					this[i][Karma.temp.attrMap[prop]] = val;
				else if (prop == "style" && Karma.support.cssText)
					this[i].style.cssText = val;
				else {
					this[i].setAttribute(prop, val);
				}
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
		return this.length? this[0].getAttribute(prop): null;
	},
	
	removeAttr: function(prop) {
		for(var i=0; i<this.length; i++) {
			if (Karma.temp.attrMap[prop] && Karma.isDefined(this[i][Karma.temp.attrMap[prop]]))
				this[i][Karma.temp.attrMap[prop]] = '';
			else if (prop == "style" && Karma.support.cssText) 
				this[i].style.cssText = '';

			try { this[i].removeAttribute(prop); } catch(e){};
		}
			
		return this;
	},
	
	data: function(key, value) {
		// key can be number or string
		// value can be anything except for undefined
		if(Karma.isDefined(value)) {
			for (var i=0; i< this.length; i++) {
				this[i].KarmaMap = this[i].KarmaMap || ++Karma.uniqueId;
				var map = this[i].KarmaMap;
				Karma.storage[map] = Karma.storage[map] || {};
				Karma.storage[map].KarmaData = Karma.storage[map].KarmaData || {};
				Karma.storage[map].KarmaData[key] = value;
			}
			return this;
		}
	
		return Karma.storage && Karma.storage[this[0].KarmaMap] && Karma.storage[this[0].KarmaMap].KarmaData && Karma.storage[this[0].KarmaMap].KarmaData[key] ? Karma.storage[this[0].KarmaMap].KarmaData[key] : null;
	},
	
	removeData: function(key) {
		if(Karma.isValue(key)) {
			for (var i=0; i< this.length; i++) {
				try { Karma.storage[this[i].KarmaMap].KarmaData[key] = null; } catch(e){}
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
		for(var i=0; i< this.length; i++)
			this[i].className = this[i].className.replace(str, '');

		return this;
	},
	
	hasClass: function(str) {
		str = ' ' + str + ' ';
		return (this.length) ? (' ' + this[0].className + ' ').indexOf(str) >= 0 : false;
	},
	
	toggleClass: function(str) {
		str = ' ' + str + ' ';
		for(var i=0; i< this.length; i++) {
			var classname = ' ' + this[i].className + ' ';
			this[i].className = classname.indexOf(str) >= 0 ? classname.replace(str, '') : classname += str;
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
	},
	
	serialize: function() {
		var ret = '';
		for(var i=0; i< this.length; i++) {
			var name = this[i].getAttribute('name');
			if (name && name.length) {
				var value = this[i].getAttribute('value') || '';
				ret += name + '=' + value + '&';
			}
		}
		return ret.length ? ret.substring(0, ret.length-1) : '';
	}

});

