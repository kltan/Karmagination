$hort.extend($.fn, {
	appendTo: function(o) {
		var tmp = $hort(o)[0],
			fragment = document.createDocumentFragment();

		if (tmp) {
			for (var i=0; i< this.length; i++)
				fragment.appendChild(this[i]);
			tmp.appendChild(fragment);
		}

		return this;
	},
	
	prependTo: function(o) {
		var tmp = $hort(o)[0],
			fragment = document.createDocumentFragment();
			
		if (tmp) {
			for (var i=0; i< this.length; i++) {
				fragment.appendChild(this[i]);
			};
			var first = tmp.firstChild;
			tmp.insertBefore(fragment, first);
		}
		return this;
	},
	
	insertBefore: function(o){
		var tmp = $hort(o)[0],
			fragment = document.createDocumentFragment();

		if (tmp) {
			for (var i=0; i< this.length; i++) {
				fragment.appendChild(this[i]);
			};
			var parent = tmp.parentNode;
			parent.insertBefore(fragment, tmp);
		}
		return this;
	},
	
	insertAfter: function(o){
		var tmp = $hort(o)[0],
			fragment = document.createDocumentFragment();
		
		if (tmp) {
			for (var i=0; i< this.length; i++) {
				fragment.appendChild(this[i]);
			};
			
			var parent = tmp.parentNode,
				next = $hort(tmp).next()[0];
			parent.insertBefore(fragment, next);
		}
		return this;
	},
	
	empty: function() {
		for (var i=0; i< this.length; i++) {
			var newEl = this[i].cloneNode(false);
			newEl.innerHTML = '';
			this[i].parentNode.replaceChild(newEl, this[i]);
		}
		return this;
	},
	
	remove: function(query){
		var result = this;
		if ($short.isString(query))
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
			var $tmp = $hort($hort.cleanHTML(str));
			this[i].parentNode.replaceChild($tmp[0], this[i]);
			$tmp[0].appendChild(this[i]);
		}
			
		return this;
	}

});