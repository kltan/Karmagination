Karma.fn.extend({
			 
	append: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;

		return Karma.temp.manipulate('append', els, this, els.query);
	},
	
	appendTo: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('append', this, els, this.query, 1);
	},
	
	prepend: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;

		return Karma.temp.manipulate('prepend', els, this, els.query);
	},
	
	prependTo: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('prepend', this, els, this.query, 1);
	},
	
	before: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('before', els, this, els.query);
	},
	
	insertBefore: function(o){
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('before', this, els, this.query, 1);
		
	},
	
	after: function(o) {
		var els = Karma(o);
		if(!this.length || !els.length) return this;
		
		return Karma.temp.manipulate('after', els, this, els.query);
	},
	
	insertAfter: function(o){
		var els = Karma(o);
		if(!this.length || !els.length) return this;

		return Karma.temp.manipulate('after', this, els, this.query, 1);
	},
	
	// removes all events attached including current node
	empty: function() {
		for (var i=0; i< this.length; i++) {
			if (Karma.support.currentDocIsHTML) {
				// no garbage collection here, we do it on unload then
				// performance comes first vs pseudo leak
				this[i].innerHTML = '';
			}
			// if is XML document
			else {
				while (this[i].firstChild) {
					// garbage collection, it's not perfect but will reduce memory usage while balancing performance
					if (this[i].firstChild.KarmaMap) Karma.storage[this[i].KarmaMap] = null;
					this[i].removeChild(this[i].firstChild);
				}
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
			for(var i=0; i< this.length; i++)
				this[i].innerText ?	this[i].innerText = value :	this[i].textContent = value;
			return this;
		}
		
		var text = [];
		for(var i=0; i< this.length; i++) {
			text.push(this[i].innerText || this[i].textContent);
		}
		
		return text.join(' ');
	},
	
	remove: function(query){
		var result = Karma.isString(query) ? Karma.Sizzle.filter(query, this) : this.length ? this : [];
		
		for (var i=0; i< result.length; i++) {
			if (result[i].KarmaMap) Karma.storage[result[i].KarmaMap] = null;
			result[i].parentNode.removeChild(result[i]);
		}
		
		return this;
	},
	
	// TODO: clone events
	clone: function(events){
		var clone = [],
			$child;

		for(var i=0;i<this.length;i++) {
			if (Karma.support.outerHTML) {
				clone.push(Karma(this[i].outerHTML, this[i].ownerDocument||this[i])[0]);
				$child = Karma(clone[i]);
				$child[0].KarmaMap = ++Karma.uniqueId;
				Karma.storage[$child[0].KarmaMap] = {};

				// wow outerHTML will copy even elem.KarmaMap which screwed up my rebindings
				if(events) {
					for (var ev in Karma.storage[this[i].KarmaMap].KarmaEvent) {
						Karma.storage[$child[0].KarmaMap][ev] = [];
						for (var fn in Karma.storage[this[i].KarmaMap].KarmaEvent[ev])
							Karma.storage[$child[0].KarmaMap][ev][fn] = Karma.storage[this[i].KarmaMap].KarmaEvent[ev][fn];
					}
				}
			}
			else {
				clone.push(this[i].cloneNode(true));
				$child = Karma(clone[i]);
				
				if(events) {
					for (var ev in Karma.storage[this[i].KarmaMap].KarmaEvent) 
						for (var fn in Karma.storage[this[i].KarmaMap].KarmaEvent[ev]) 
							$child.bind( ev, Karma.storage[this[i].KarmaMap].KarmaEvent[ev][fn] );
				}
			}

		}

		return Karma(clone).stack(this);
	},

	wrap: function(str){
		for(var i=0;i<this.length;i++) {
			var	cloned = Karma(str, this[i].ownerDocument||this[i]).clone()[0];
				
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
				var newClones = parent.length > 1 ? fragment.cloneNode(true) : fragment;
				if (ret) {
					 if(newClones.nodeType === 11) {
						var children = Karma.makeArray(newClones.childNodes);
          				for(var j=0; j < children.length; j++)
           					 cloned.push(children[j]);
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
			
			return ret ? Karma(cloned) : parent;
		}
		else if (method == 'append')
			parent[0].appendChild(fragment);
		else if (method == 'prepend')
			parent[0].insertBefore(fragment, parent[0].firstChild);
		else if (method == 'before')
			parent[0].parentNode.insertBefore(fragment, parent[0]);
		else if (method == 'after') {
			parent[0].nextSibling ? 
				parent[0].parentNode.insertBefore(fragment, parent[0].nextSibling):
				parent[0].parentNode.appendChild(fragment);
		}
		
		return ret ? child : parent;
	}
});

