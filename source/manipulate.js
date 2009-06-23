Karma.fn.extend({
			 
	append: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		Karma.temp.manipulate('append', els, this, o);
		return this;
	},
	
	appendTo: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('append', this, els, this.query, true);
	},
	
	prepend: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		Karma.temp.manipulate('prepend', els, this, o);
		return this;
	},
	
	prependTo: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('prepend', this, els, this.query, true);
	},
	
	before: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		Karma.temp.manipulate('before', els, this, o);
		return this;
	},
	
	insertBefore: function(o){
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('before', this, els, this.query, true);
		
	},
	
	after: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		Karma.temp.manipulate('after', els, this, o);
		return this;
	},
	
	insertAfter: function(o){
		var els = Karma(o);
		if(!this.length || !els.length) return this;

		return Karma.temp.manipulate('after', this, els, this.query, true);
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
	
	html: function(value) {
		if(Karma.isValue(value)) {
			for (var i=0; i< this.length; i++)
				this[i].innerHTML = value;
		
			return this;
		}
		return this.length? this[0].innerHTML: null;
	},
	
	text: function(value) {
		if(Karma.isValue(value)) {
			for(var i=0; i< this.length; i++) {
				if(this[i].innerText)
					this[i].innerText = value;
				else
					this[i].textContent = value;
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
	
	// TODO: clone events
	clone: function(){
		var $ = this,
			cloned = [];

		for(var i=0;i<$.length;i++) {
			if (Karma.support.outerHTML) {
				var string = $[i].outerHTML;
				cloned.push(Karma(string, this[i].ownerDocument)[0]);
			}
			else 
				cloned.push($[i].cloneNode(true));
		}

		return Karma(cloned).stack(this);
	},

	wrap: function(str){
		for(var i=0;i<this.length;i++) {
			var	cloned = Karma(str, this[i].ownerDocument).clone()[0];
				
			this[i].parentNode.replaceChild(cloned, this[i]);
			cloned.appendChild(this[i]);
		}
		return this;
	}

});

Karma.extend(Karma.temp, {
	manipulate: function (method, child, parent, query, ret) {
		var fragment = child[0];
		
		if (child.length > 1) {
			fragment = Karma.temp.fragment.cloneNode(false);
			
			for (var i=0; i< child.length; i++)
				fragment.appendChild(child[i]);
		}
	
		if (Karma.isHTML(query)) {
			var cloned = [];
				
			for (var i=0; i< parent.length; i++) {
				var newClones = fragment.cloneNode(true);
				if (ret) {
					 if(newClones.nodeType === 11) {
          				for(var j=0; j < newClones.childNodes.length; j++)
           					 cloned.push(newClones.childNodes[j]);
					 }
       				 else
          				cloned.push(newClones);
				}
				
				if (method == 'append')
					parent[i].appendChild(newClones);
				else if (method == 'prepend')
					parent[i].insertBefore(newClones, parent[i].firstChild);
				else if (method == 'before')
					parent[i].parentNode.insertBefore(newClones, parent[i]);
				else if (method == 'after') {
					parent[i].nextSibling ? 
						parent[i].parentNode.insertBefore(newClones, parent[i].nextSibling):
						parent[i].parentNode.appendChild(newClones);
				}
			}
			if (ret)
				return Karma(cloned);
		}
		else if (method == 'append')
			parent[0].appendChild(newClones);
		else if (method == 'prepend')
			parent[0].insertBefore(newClones, parent[0].firstChild);
		else if (method == 'before')
			parent[0].parentNode.insertBefore(newClones, parent[0]);
		else if (method == 'after') {
			parent[0].nextSibling ? 
				parent[0].parentNode.insertBefore(newClones, parent[0].nextSibling):
				parent[0].parentNode.appendChild(newClones);
		}
	}
});

