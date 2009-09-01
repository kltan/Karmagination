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
		// value can be anything even function except for undefined
		if(Karma.isDefined(value)) {
			for (var i=0; i< this.length; i++)
				Karma.data(this[i], key, value);
			return this;
		}
	
		return this[0] ? Karma.data(this[0], key) : null;
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
		var _str = ' ' + str + ' ';
		
		for(var i=0; i< this.length; i++) {
			if (this[i].classList)
				this[i].classList.add(str);
			else {
				if( (' ' + this[i].className + ' ').indexOf(_str) < 0) 
					this[i].className.length ? this[i].className += ' ' + str : this[i].className = str;
			}
		}
			
		return this;
	},
	
	removeClass: function(str) {
		for(var i=0; i< this.length; i++)
			this[i].classList ? this[i].classList.remove(str) : this[i].className = Karma.trim(this[i].className.replace(str, ''));

		return this;
	},
	
	hasClass: function(str) {
		var _str = ' ' + str + ' ',
			ret = false;
		
		if(this.length)
			ret = this[0].classList ? this[0].classList.contains(str) : (' ' + this[0].className + ' ').indexOf(_str) >= 0;
		
		return ret;
	},
	
	toggleClass: function(str) {
		var _str = ' ' + str + ' ';
		for(var i=0; i< this.length; i++) {
			if(this[i].classList)
				this[i].classList.toggle(str);
			else {
				var classname = ' ' + this[i].className + ' ';
				this[i].className = classname.indexOf(_str) >= 0 ? classname.replace(_str, '') : classname += _str;
				this[i].className = Karma.trim(this[i].className);
			}
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
				var value = this[i].value || '';
				
				if (this[i].nodeName.toLowerCase() == 'input' && this[i].getAttribute('type').toLowerCase() == 'checkbox' && !this[i].checked)
					ret += encodeURIComponent(name) + '=&';
				else
					ret += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
			}
		}
		return ret.length ? ret.substring(0, ret.length-1) : '';
	}

});

Karma.extend({
	data: function(el, key, value) {
		// key can be number or string
		// value can be anything except for undefined
		if(Karma.isDefined(value)) {
			var map = 0;
			if (el !== window) 
				map = el.KarmaMap = el.KarmaMap || ++Karma.uniqueId;
				
			Karma.storage[map] = Karma.storage[map] || {};
			Karma.storage[map].KarmaData = Karma.storage[map].KarmaData || {};
			Karma.storage[map].KarmaData[key] = value;
		}
	
		return Karma.storage && Karma.storage[el.KarmaMap] && Karma.storage[el.KarmaMap].KarmaData && Karma.storage[el.KarmaMap].KarmaData[key] ? Karma.storage[el.KarmaMap].KarmaData[key] : null;
	}
});