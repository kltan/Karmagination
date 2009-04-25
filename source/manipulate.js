$hort.extend($.fn, {
			 
	append: function(o) {
		
		if(!this.length) return this;
		var els = $hort(o); 
		if(!els.length) return this;
		
		var fragment = document.createDocumentFragment();
		
		for (var i=0; i< els.length; i++)
			fragment.appendChild(els[i]);
		
		if ($hort.isHTML(o)) {
			for (var i=0; i< this.length; i++) 
				this[i].appendChild(fragment.cloneNode(true));
		}
		else 
			this[0].appendChild(fragment);
			
		
		return this;
		
	},
	
	appendTo: function(o) {
		if(!this.length) return this;
		var els = $hort(o); 
		if(!els.length) return this;
		
		var fragment = document.createDocumentFragment();
		
		for (var i=0; i< this.length; i++)
			fragment.appendChild(this[i]);

		if ($hort.isHTML(this.query)) {
			for (var j=0; j< els.length; j++) {
				els[j].appendChild(fragment.cloneNode(true));
			}
		}
		else 
			els[0].appendChild(fragment);
		
		return this;
	},
	
	prepend: function(o) {
		if(!this.length) return this;
		var els = $hort(o); 
		if(!els.length) return this;
		
		var fragment = document.createDocumentFragment();
		
		for (var i=0; i< els.length; i++)
			fragment.appendChild(els[i]);
		
		if ($hort.isHTML(o)) {
			for (var i=0; i< this.length; i++)
				this[i].insertBefore(fragment.cloneNode(true), this[i].firstChild);
		}
		else 
			this[0].insertBefore(fragment, this[0].firstChild);
			
		return this;
	},
	
	prependTo: function(o) {
		if(!this.length) return this;
		var els = $hort(o); 
		if(!els.length) return this;
		
		var fragment = document.createDocumentFragment();
		for (var i=0; i< this.length; i++)
			fragment.appendChild(this[i]);
		
		if ($hort.isHTML(this.query)) {
			for (var i=0; i< els.length; i++) 
				els[i].insertBefore(fragment.cloneNode(true), els[i].firstChild);
		}
		else 
			els[0].insertBefore(fragment, els[0].firstChild);
		
		return this;
	},
	
	before: function(o) {
		if(!this.length) return this;
		var els = $hort(o); 
		if(!els.length) return this;
		
		var fragment = document.createDocumentFragment();
		for (var i=0; i< els.length; i++)
			fragment.appendChild(els[i]);
		
		if ($hort.isHTML(o)) {
			for (var i=0; i< this.length; i++) 
				this[i].parentNode.insertBefore(fragment.cloneNode(true), this[i]);
		}
		else 
			this[0].parentNode.insertBefore(fragment, this[0]);
		
		return this;
	},
	
	insertBefore: function(o){
		if(!this.length) return this;
		var els = $hort(o); 
		if(!els.length) return this;
		
		var fragment = document.createDocumentFragment();
		for (var i=0; i< this.length; i++)
			fragment.appendChild(this[i]);
		
		if ($hort.isHTML(this.query)) {
			for (var i=0; i< els.length; i++) 
				els[i].parentNode.insertBefore(fragment.cloneNode(true), els[i]);
		}
		else 
			els[0].parentNode.insertBefore(fragment, els[0]);
		
		return this;
		
	},
	
	after: function(o) {
		if(!this.length) return this;
		var els = $hort(o); 
		if(!els.length) return this;
		
		var fragment = document.createDocumentFragment();
		
		for (var i=0; i< els.length; i++)
			fragment.appendChild(els[i]);
		
		if ($hort.isHTML(o)) {
			for (var i=0; i< this.length; i++) {
				this[i].nextSibling ? 
					this[i].parentNode.insertBefore(fragment.cloneNode(true), this[i].nextSibling):
					this[i].parentNode.appendChild(fragment.cloneNode(true));
			}
		}
		else {
			this[0].nextSibling ?
				this[0].parentNode.insertBefore(fragment, this[0].nextSibling):
				this[0].parentNode.appendChild(fragment);
		}
		return this;
	},
	
	insertAfter: function(o){
		if(!this.length) return this;
		var els = $hort(o); 
		if(!els.length) return this;
		
		var fragment = document.createDocumentFragment();
		
		for (var i=0; i< this.length; i++)
			fragment.appendChild(this[i]);
		
		if ($hort.isHTML(this.query)) {
			for (var i=0; i< els.length; i++) {
				els[i].nextSibling ? 
					els[i].parentNode.insertBefore(fragment.cloneNode(true), els[i].nextSibling):
					els[i].parentNode.appendChild(fragment.cloneNode(true));
			}
		}
		else {
			els[0].nextSibling ?
				els[0].parentNode.insertBefore(fragment, els[0].nextSibling):
				els[0].parentNode.appendChild(fragment);
		}
		return this;
	},
	
	// empty and removes all events attached including current node
	empty: function() {
		for (var i=0; i< this.length; i++) {
			var parent = document.createElement('DIV');
			var newEl = this[i].cloneNode(false);
			
			parent.appendChild(newEl);
			newEl.innerHTML = '';
			
			this[i].parentNode.replaceChild(newEl, this[i]);
			if(this[i].outerHTML)this[i].innerHTML = ''; // prevent pseudo-leak
			this[i] = newEl;
		}
		return this;
	},
	
	html: function(str) {
		if(str>0 || str.length) {
			for (var i=0; i< this.length; i++)
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
	
	remove: function(query){
		var result = this;
		if ($hort.isString(query))
			result = $hort.filter(query, this);
		
		for (var i=0; i< result.length; i++)
			result[i].parentNode.removeChild(result[i]);
		
		return this;
	},
	
	clone: function(){
		var $ = this,
			cloned = [];

		for(var i=0;i<$.length;i++) {
			if ($[i].outerHTML && $[i] != document.body && $[i] != document.documentElement && $[i] != document.head) {
				var string = $[i].outerHTML;
				cloned.push($hort(string)[0]);
			}
			else 
				cloned.push($[i].cloneNode(true));
		}

		return $hort(cloned).stack(this);
	},
	
	wrap: function(str){
		for(var i=0;i<this.length;i++) {
			var $tmp = $hort(str);
			this[i].parentNode.replaceChild($tmp[0], this[i]);
			$tmp[0].appendChild(this[i]);
		}
		return this;
	}

});