Karma.extend(Karma.fn, {
			 
	append: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		var fragment;		
		if (els.length > 1) {
			fragment = Karma.temp.fragment.cloneNode(false);
			
			for (var i=0; i< els.length; i++)
				fragment.appendChild(els[i]);
		}
		else 
			fragment = els[0];
		
		if (Karma.isHTML(o)) {
			for (var i=0; i< this.length; i++) 
				this[i].appendChild(fragment.cloneNode(true));
		}
		else 
			this[0].appendChild(fragment);
			
		
		return this;
		
	},
	
	appendTo: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		var fragment;		
		if (this.length > 1) {
			fragment = Karma.temp.fragment.cloneNode(false);
			
			for (var i=0; i< this.length; i++)
				fragment.appendChild(this[i]);
		}
		else 
			fragment = this[0];
			
		if (Karma.isHTML(this.query)) {
			var cloned = [];
			for (var j=0; j< els.length; j++) {
				var newClones = fragment.cloneNode(true);
				
				if(newClones.nodeType == 11)
					for(var i=0; i < newClones.childNodes.length; i++)
						cloned.push(newClones.childNodes[i]);
				else
					cloned.push(newClones);
					
				els[j].appendChild(newClones);
			}
			return Karma(cloned);
		}
		else 
			els[0].appendChild(fragment);
		
		return this;
	},
	
	prepend: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		var fragment;		
		if (els.length > 1) {
			fragment = Karma.temp.fragment.cloneNode(false);
		
			for (var i=0; i< els.length; i++)
				fragment.appendChild(els[i]);
		}
		else
			fragment = els[0];
			
		
		if (Karma.isHTML(o)) {
			for (var i=0; i< this.length; i++)
				this[i].insertBefore(fragment.cloneNode(true), this[i].firstChild);
		}
		else 
			this[0].insertBefore(fragment, this[0].firstChild);
			
		return this;
	},
	
	prependTo: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		var fragment;		
		if (this.length > 1) {
			fragment = Karma.temp.fragment.cloneNode(false);
		
			for (var i=0; i< this.length; i++)
				fragment.appendChild(this[i]);
		}
		else
			fragment = this[0];
		
		if (Karma.isHTML(this.query)) {
			var cloned = [];
			for (var i=0; i< els.length; i++) {
				var newClones = fragment.cloneNode(true);
				
				if(newClones.nodeType == 11)
					for(var j=0; j < newClones.childNodes.length; j++)
						cloned.push(newClones.childNodes[j]);
				else
					cloned.push(newClones);
				
				els[i].insertBefore(newClones, els[i].firstChild);
			}

			return Karma(cloned);
		}
		else 
			els[0].insertBefore(fragment, els[0].firstChild);
		
		return this;
	},
	
	before: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		var fragment;
		if(els.length > 1){
			fragment = Karma.temp.fragment.cloneNode(false);
			for (var i=0; i< els.length; i++)
				fragment.appendChild(els[i]);
		}
		else
			fragment = els[0];
		
		if (Karma.isHTML(o)) {
			for (var i=0; i< this.length; i++) 
				this[i].parentNode.insertBefore(fragment.cloneNode(true), this[i]);
		}
		else 
			this[0].parentNode.insertBefore(fragment, this[0]);
		
		return this;
	},
	
	insertBefore: function(o){
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		var fragment;
		if(this.length > 1){
			fragment = Karma.temp.fragment.cloneNode(false);
			for (var i=0; i< this.length; i++)
				fragment.appendChild(this[i]);
		}
		else
			fragment = this[0];
		
		if (Karma.isHTML(this.query)) {
			var cloned = [];
			for (var i=0; i< els.length; i++) {
				var newClones = fragment.cloneNode(true);
				
				if(newClones.nodeType == 11)
					for(var j=0; j < newClones.childNodes.length; j++)
						cloned.push(newClones.childNodes[j]);
				else
					cloned.push(newClones);
				
				els[i].parentNode.insertBefore(newClones, els[i]);
			}
			return Karma(cloned);
		}
		else 
			els[0].parentNode.insertBefore(fragment, els[0]);
		
		return this;
		
	},
	
	after: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		var fragment;
		if(els.length > 1){
			fragment = Karma.temp.fragment.cloneNode(false);
			for (var i=0; i< els.length; i++)
				fragment.appendChild(els[i]);
		}
		else
			fragment = els[0];
			
		if (Karma.isHTML(o)) {
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
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		var fragment;
		if(this.length > 1){
			fragment = Karma.temp.fragment.cloneNode(false);
		
			for (var i=0; i< this.length; i++)
				fragment.appendChild(this[i]);
		}
		else
			fragment = this[0];
		
		if (Karma.isHTML(this.query)) {
			var cloned = [];
			for (var i=0; i< els.length; i++) {
				var newClones = fragment.cloneNode(true);
				
				if(newClones.nodeType == 11)
					for(var j=0; j < newClones.childNodes.length; j++)
						cloned.push(newClones.childNodes[j]);
				else
					cloned.push(newClones);
					
				els[i].nextSibling ? 
					els[i].parentNode.insertBefore(newClones, els[i].nextSibling):
					els[i].parentNode.appendChild(newClones);
			}
			return Karma(cloned);
		}
		else {
			els[0].nextSibling ?
				els[0].parentNode.insertBefore(fragment, els[0].nextSibling):
				els[0].parentNode.appendChild(fragment);
		}
		return this;
	},
	
	// removes all events attached including current node
	empty: function() {
		for (var i=0; i< this.length; i++) {
			// don't bitch about this, won't break future browser compatibility
			if (Karma.isGecko) {
				var parent = Karma.temp.fragment.cloneNode(false);
				var newEl = this[i].cloneNode(false);
				
				parent.appendChild(newEl);
				
				this[i].parentNode.replaceChild(newEl, this[i]);
				this[i] = newEl;
			}
			
			else {
				this[i].innerHTML = '';
			}
		}
		return this;
	},
	
	html: function(str) {
		if(Karma.isValue(str)) {
			for (var i=0; i< this.length; i++)
				this[i].innerHTML = str;
		
			return this;
		}
		return this.length? this[0].innerHTML: null;
	},
	
	text: function(str) {
		if(Karma.isValue(str)) {
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
		var result = Karma.isString(query) ? Karma.filter(query, this) : this;
		
		for (var i=0; i< result.length; i++)
			result[i].parentNode.removeChild(result[i]);
		
		return this;
	},
	
	clone: function(){
		var $ = this,
			cloned = [];

		for(var i=0;i<$.length;i++) {
			if (Karma.support.outerHTML) {
				var string = $[i].outerHTML;
				cloned.push(Karma.HTMLtoNode(string)[0]);
			}
			else 
				cloned.push($[i].cloneNode(true));
		}

		return Karma(cloned).stack(this);
	},

	wrap: function(str){
		for(var i=0;i<this.length;i++) {
			var	cloned = Karma(str).clone()[0];
				
			this[i].parentNode.replaceChild(cloned, this[i]);
			cloned.appendChild(this[i]);
		}
		return this;
	}

});