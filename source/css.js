Karma.fn.extend({
	style: function(property, value) {
		if (Karma.isString(property) && Karma.isValue(value))
			return this.setStyle(property, value);
			
		if (Karma.isObject(property)) {
			for(var current in property)
				this.setStyle(current, property[current]);
			return this;
		}

		return this.getStyle(property);
	},

	setStyle: function(property, value){
		if(!this.length) return this;
		
		property = Karma.camelCase(property);		

		if (property == 'opacity') {
			for (var i=0; i < this.length; i++) {
				// webkit and opera support filter, which is BS
				// lesson learnt: feature test W3C standard before proprietary standard 
				if(Karma.support.opacity) this[i].style.opacity = value;
				// if we have full opacity, better to remove it to restore the antialiasing ability of IE
				else if(Karma.support.filter) {
					// OMFG, MS needs hasLayout for opacity, or it will just work on body
					this[i].style.zoom = 1;
					this[i].style.filter = (parseInt(value, 10) == 1) ? '' : 'alpha(opacity=' + (value * 100) + ')';
				}
			}
			
			return this;
		}
		
		if (property == 'scrollTop' || property == 'scrollLeft') {
			for (var i=0; i < this.length; i++) {
				if (this[i] === document.documentElement || this[i] === document || this[i] === document.body || this[i] === window) {
					document.body[property] = value;
					document.documentElement[property] = value;
				}
				else
					this[i][property] = value;
			}
			return this;
		}
		
		if (property == 'float')
			property = Karma.support.styleFloat ? 'styleFloat' : 'cssFloat';
		
		// concat integers/integer-like strings with px;
		var curval = +value;
		if ( curval || curval === 0 ) value = curval + 'px';
		
		
		if(Karma.isString(value)) // just to be safe
		for (var i=0; i < this.length; i++)
			this[i].style[property] = value;
		
		return this;
	},
	
	getStyle: function(property) {
		if(!this.length) return null;
		
		property = Karma.camelCase(property);
		
		if (property == 'scrollTop' || property == 'scrollLeft')
			return (this[0]===document || this[0]===document.documentElement || this[0]===window)? document.body[property]: this[0][property];
		
		if (property == 'float')
			property = Karma.support.styleFloat ? 'styleFloat' : 'cssFloat';
		
		else if (property == 'opacity' && this[0].filters) {
			try { 
				var opacity = this[0].filters('alpha').opacity;
			}
			catch(e){ 
				return 1; 
			}
			return opacity/100;
		}
		
		// check if the current node is stylable or not, i.e. window cannot be styled
		if(this[0].style) {
			if (this[0].currentStyle) {
				if (this[0].currentStyle[property] == 'auto' && this[0].style[property] == '') {
					if(/width|height/i.test(property)) return this.width();
					if(/left|top|right|bottom/i.test(property)) return 0;
				}

				return this[0].currentStyle[property] ? this[0].currentStyle[property] : this[0].style[property];
			}
			else if ( "getComputedStyle" in document.defaultView ) {
				var computed = document.defaultView.getComputedStyle(this[0], null)[property];
				
				if (!computed || !computed.length) computed = this[0].style[property];
							
				if (property.toLowerCase().indexOf('color') >= 0) {
					var color = computed.match(/rgba?\([\d\s,]+\)/);
					if (color)
						computed = Karma.rgbToHex(color[0].match(/\d{1,3}/g));
				}
				return computed;
			}
		}
		return '';
	},
	
	dimension: function(name, border){
		if(!this.length) return null;
		return this[0] === window ?
			// use document.documentElement or document.body depending on Quirks vs Standards mode
			document.compatMode == "CSS1Compat" && document.documentElement[ "client" + name ] || document.body[ "client" + name ] :
			// Get document width or height
			this[0] === document ?
				// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
				Math.max(
					document.documentElement["client" + name],
					document.body["scroll" + name], document.documentElement["scroll" + name],
					document.body["offset" + name], document.documentElement["offset" + name]
				) :
				border ?
					this[0]['offset'+name]:
					this[0]['client'+name];
	},
	
	width: function(val){
		var paddingLeft = parseInt(this.getStyle('paddingLeft'), 10) || 0,
			paddingRight = parseInt(this.getStyle('paddingRight'), 10) || 0;
		return Karma.isValue(val) ? this.setStyle('width', val) : this.dimension('Width') - paddingLeft - paddingRight;
	},
	
	height: function(val){
		var paddingTop = parseInt(this.getStyle('paddingTop'), 10) || 0,
			paddingBottom  = parseInt(this.getStyle('paddingBottom'), 10) || 0;
		return Karma.isValue(val) ? this.setStyle('height', val) : this.dimension('Height') - paddingTop - paddingBottom;
	},
	
	innerWidth: function(){
		return this.dimension('Width');
	},
	
	innerHeight: function(val){
		return this.dimension('Height');
	},
	
	outerWidth: function(val, margin){
		var marginLeft = margin ? parseInt(this.css('marginLeft'), 10) || 0 : 0,
			marginRight = margin ? parseInt(this.css('marginRight'), 10) || 0 : 0;
		return this.dimension('Width', 1) + marginLeft + marginRight;
	},
	
	outerHeight: function(val, margin){
		var marginTop = margin ? parseInt(this.css('marginTop'), 10) || 0 : 0,
			marginBottom = margin ? parseInt(this.css('marginBottom'), 10) || 0 : 0;
		return this.dimension('Height', 1) + marginTop + marginBottom;
	},

	offset: function() {
		if (!this[0]) return null;
		// w3c
		Karma.calculateOffset();
		if (document.documentElement.getBoundingClientRect) {
			if ( this[0] === (this[0].ownerDocument||this[0]).body ) {
				var top = this[0].offsetTop, left = this[0].offsetLeft;
				if ( Karma.support.offsetDoesNotIncludeMarginInBodyOffset )
					top  += parseInt(this.css('marginTop'), 10) || 0,
					left += parseInt(this.css('marginLeft'), 10 ) || 0;
				return { top: top, left: left };
			}
			
			var box  = this[0].getBoundingClientRect(), 
				doc = this[0].ownerDocument || doc, 
				body = doc.body, 
				docElem = doc.documentElement,
				clientTop = docElem.clientTop || body.clientTop || 0, 
				clientLeft = docElem.clientLeft || body.clientLeft || 0,
				top  = box.top  + (self.pageYOffset || Karma.support.boxModel && docElem.scrollTop || body.scrollTop) - clientTop,
				left = box.left + (self.pageXOffset || Karma.support.boxModel && docElem.scrollTop || body.scrollLeft) - clientLeft;
			
			return { top: top, left: left };
		}
		// m$
		else {
			var elem = this[0], 
				offsetParent = elem.offsetParent, 
				prevOffsetParent = elem,
				doc = elem.ownerDocument || elem, 
				computedStyle, 
				docElem = doc.documentElement,
				body = doc.body, 
				defaultView = doc.defaultView,
				prevComputedStyle = defaultView.getComputedStyle(elem, null),
				top = elem.offsetTop, 
				left = elem.offsetLeft;
	
			while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
				computedStyle = defaultView.getComputedStyle(elem, null);
				top -= elem.scrollTop, 
				left -= elem.scrollLeft;
				
				if ( elem === offsetParent ) {
					top += elem.offsetTop, 
					left += elem.offsetLeft;
					if ( Karma.support.offsetDoesNotAddBorder && !(Karma.support.offsetDoesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(elem.tagName)) )
						top  += parseInt( computedStyle.borderTopWidth,  10) || 0,
						left += parseInt( computedStyle.borderLeftWidth, 10) || 0;
					prevOffsetParent = offsetParent, offsetParent = elem.offsetParent;
				}
				
				if ( Karma.support.offsetSubtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" )
					top  += parseInt( computedStyle.borderTopWidth,  10) || 0,
					left += parseInt( computedStyle.borderLeftWidth, 10) || 0;
				prevComputedStyle = computedStyle;
			}
	
			if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" )
				top  += body.offsetTop,
				left += body.offsetLeft;
	
			if ( prevComputedStyle.position === "fixed" )
				top  += Math.max(docElem.scrollTop, body.scrollTop),
				left += Math.max(docElem.scrollLeft, body.scrollLeft);
	
			return { top: top, left: left };			
			
		}
	},
	
	position: function() {
		var left = 0, top = 0, results = null;

		if ( this[0] ) {
			// Get *real* offsetParent
			var offsetParent = this.offsetParent(),
				offsetDoc = offsetParent.ownerDocument || offsetParent,

			// Get correct offsets
			offset       = this.offset(),
			parentOffset = (offsetDoc.documentElement === offsetParent || offsetDoc.body === offsetParent) ? { top: 0, left: 0 } : offsetParent.offset();

			// Subtract element margins
			// note: when an element has margin: auto the offsetLeft and marginLeft 
			// are the same in Safari causing offset.left to incorrectly be 0
			offset.top  -= parseInt( this.css('marginTop'), 10 ) ||  0;
			offset.left -= parseInt( this.css('marginLeft'), 10 ) ||  0;

			// Add offsetParent borders
			parentOffset.top  += parseInt( Karma(offsetParent).css('borderTopWidth'), 10 ) || 0;
			parentOffset.left += parseInt( Karma(offsetParent).css('borderLeftWidth'), 10 ) || 0;

			// Subtract the two offsets
			results = {
				top:  offset.top  - parentOffset.top,
				left: offset.left - parentOffset.left
			};
		}

		return results;
	},
	
	offsetParent: function() {
		var offsetParent = this[0].offsetParent || document.body,
			offsetDoc = offsetParent.ownerDocument || offsetParent;
		while ( offsetParent && offsetParent !== offsetDoc.documentElement && offsetParent !== offsetDoc.body && Karma(offsetParent).css('position') == 'static')
			offsetParent = offsetParent.offsetParent;
		return Karma(offsetParent);
	},
	
	scrollTop: function() {
		return this.css('scrollTop');
	},
	
	scrollLeft: function() {
		return this.css('scrollLeft');
	}	
});

Karma.fn.css = Karma.fn.style;

Karma.extend({
	camelCase: function(property) {
		if (Karma.temp.camelCase[property]) {
			property = Karma.temp.camelCase[property];
		}
		else {
			property = Karma.temp.camelCase[property] = property.replace(/\-(\w)/g, function(all, letter){ return letter.toUpperCase(); });
		}
		
		return property;
	},
	
	rgbToHex: function(array){
		if (array.length < 3) return null;
		if (array.length == 4 && array[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (array[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return '#' + hex.join('');
	},
	
	calculateOffset: function(){
		if (Karma.temp.calculatedOffsets) return;
		
		var offset = new Karma.temp.offsets();
		Karma.extend(Karma.support, {
			offsetDoesNotAddBorder: offset.doesNotAddBorder,
			offsetDoesAddBorderForTableAndCells: offset.doesAddBorderForTableAndCells,
			offsetSubtractsBorderForOverflowNotVisible: offset.subtractsBorderForOverflowNotVisible,
			offsetDoesNotIncludeMarginInBodyOffset: offset.doesNotIncludeMarginInBodyOffset
		});
		
		Karma.temp.calculatedOffsets = true;
	}
});

