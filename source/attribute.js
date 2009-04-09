$hort.extend($.fn, {
			 
	attr: function(prop, val){
		if($hort.isString(prop) && $hort.isString(val)) {
			for(var i=0; i<this.length; i++)
				this[i].setAttribute(prop, val);
			return this;
		}
		else if($hort.isObject(prop)) {
			for(var i=0; i<this.length; i++)
				for (prop in val)
					this[i].setAttribute(prop, val[prop]);
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
			this[i].className += str;
			
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
	
	html: function(str) {
		if($hort.isString(str) || $hort.isNumber(str)) {
			for(var i=0; i< this.length; i++)
				this[i].innerHTML = str;
			return this;
		}
		return this.length? this[0].innerHTML: null;
	},
	
	text: function(str) {
		if($hort.isString(str) || $hort.isNumber(str)) {
			for(var i=0; i< this.length; i++) {
				if(this[i].innerText)
					this[i].innerText = str;
				else
					this[i].textContent = str;
			}
			return this;
		}
		
		var text = [];
		for(var i=0; i< this.length; i++) {
			text.push(this[i].innerText || this[i].textContent);
		}
		
		return text.join(' ');
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