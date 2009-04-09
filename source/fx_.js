/*
 * FX
 * Copyright (c) 2009 Ryan Morr (ryanmorr.com)
 * Licensed under the MIT license.
 */

(function(){
	
	/**
	 * Constructor - initiate with the new operator
	 * @param {Element} el The element to which the animation will be performed against
	 * @param {Object} attributes Object containing all the attributes to be animated and the values
	 * @param {Number} duration How long should the animation take in seconds (optional)
	 * @param {Function} callback The function to be executed after the animation is complete (optional)
	 * @param {Object} ctx The context for which the callback will be executed in (optional)
	 */
	this.FX = function(el, attributes, duration, callback, ctx){
		this.el = DOM.get(el);
		this.attributes = attributes;
		this.duration = duration || 0.7;
		this.callback = callback || function(){};
		this.ctx = ctx || window;
	};
	
	this.FX.prototype = {
		
		/**
		 * The object to carry the current values for each frame
		 * @type Object
		 */
		frame: {},
		
		/**
		 * The object containing all the ending values for each attribute
		 * @type Object
		 */
		endAttr: {},
		
		/**
		 * The object containing all the starting values for each attribute
		 * @type Object
		 */
		startAttr: {},
		
		/**
		 * start the animation
		 */
		start: function(){
			var fx = this;
			this.getAttributes();
			this.duration = this.duration * 1000;
			this.time = new Date().getTime();
			this.animating = true;
			this.timer = setInterval(function(){
				var time = new Date().getTime();
				if(time < (fx.time + fx.duration)){
					fx.elapsed = time - fx.time;
					fx.setCurrentFrame();
				}else{
					fx.frame = fx.endAttr;
					fx.complete();
				}
				fx.setAttributes();
			}, 1)
		},
		
		/**
		 * Perform a transitional ease to keep the animation smooth
		 * @param {Number} start The starting value for the attribute
		 * @param {Number} end The ending value for the attribute
		 * @return {Number} Calculated percentage for the frame of the attribute
		 */
		ease: function(start, end){
			return start + ((1-Math.cos((this.elapsed/this.duration)*Math.PI)) / 2) * (end - start);
		},
		
		/**
		 * Complete the animation by clearing the interval and nulling out the timer,
		 * set the animating property to false, and execute the callback
		 */
		complete: function(){
			clearInterval(this.timer);
			this.timer = null;
			this.animating = false;
			this.callback.call(this.ctx);
		},
		
		/**
		 * Set the current frame for each attribute by calculating the ease and setting the new value
		 */
		setCurrentFrame: function(){
			for(attr in this.startAttr){ 
				if(this.startAttr[attr] instanceof Array){
					this.frame[attr] = [];
					for(var i=0; i < this.startAttr[attr].length; i++){
						this.frame[attr][i] = this.ease(this.startAttr[attr][i], this.endAttr[attr][i]);
					}
				}else{
					this.frame[attr] = this.ease(this.startAttr[attr], this.endAttr[attr]);
				}
			}
		},
		
		/**
		 * Get all starting and ending values for each attribute
		 */
		getAttributes: function(){
			for(var attr in this.attributes){
				switch(attr){
					case 'color':	
					case 'background-color':
						this.startAttr[attr] = parseColor(this.attributes[attr].from || DOM.getStyle(this.el, attr));
						this.endAttr[attr] = parseColor(this.attributes[attr].to);
						break;
					case 'scrollTop':
					case 'scrollLeft':
						var el = (this.el == document.body) ? (document.documentElement || document.body) : this.el;
						this.startAttr[attr] = this.attributes[attr].from || el[attr];
						this.endAttr[attr] = this.attributes[attr].to;
						break;
					default:
						this.startAttr[attr] = this.attributes[attr].from || (parseFloat(DOM.getStyle(this.el, attr)) || 0);
						this.endAttr[attr] = this.attributes[attr].to;
						break;
				}  		
			}
		},
		
		/**
		 * Set the current value for each attribute for every frame
		 */
		setAttributes: function(){
			for(var attr in this.frame){
				switch(attr){
					case 'opacity':
						DOM.setStyle(this.el, attr, this.frame[attr]);
						break;
					case 'scrollLeft':
					case 'scrollTop':
						var el = (this.el == document.body) ? (document.documentElement || document.body) : this.el;
						el[attr] = this.frame[attr];
						break;
					case 'color':	
					case 'background-color':
						var rgb = 'rgb('+Math.floor(this.frame[attr][0])+','+Math.floor(this.frame[attr][1])+','+Math.floor(this.frame[attr][2])+')';
						DOM.setStyle(this.el, attr, rgb);
						break;
					default:
						DOM.setStyle(this.el, attr, this.frame[attr] + 'px');
						break;
				}
			}
		}
	};
	
	var DOM = {
		
		/**
		 * Get a dom node
		 * @param {String} id The id of the element to get or the element itself
		 * @return {Element} The element found
		 */
		get: function(id){
			return (typeof id == "string") ? document.getElementById(id) : id;
		},
		
		/**
		 * Get a style of an element
		 * @param {Element} el The element for the style to be retrieved from
		 * @param {String} prop The property or style that is to be found
		 * @return {Number} The value of the property
		 */
		getStyle: function(el, prop){
			prop = toCamelCase(prop);
			var view = document.defaultView;
			if(view && view.getComputedStyle){
				return el.style[prop] || view.getComputedStyle(el, "")[prop] || null;
			}else{
				if(prop == 'opacity'){
					var opacity = el.filters('alpha').opacity;
					return isNaN(opacity) ? 1 : (opacity ? opacity / 100 : 0);
				}
				return el.style[prop] || el.currentStyle[prop] || null;
			}
		},
		
		/**
		 * Set a style for an element
		 * @param {Element} el The element the new value will be applied to
		 * @param {String} prop The property or style that will be set
		 * @param {String} value The value of the property to be set
		 */
		setStyle: function(el, prop, value){
			if(prop == 'opacity'){
				el.style.filter = "alpha(opacity=" + value * 100 + ")";
				el.style.opacity = value;
			}else{
				prop = toCamelCase(prop);
				el.style[prop] = value;
			}
		}
	};
	
	/**
	 * Convert a CSS property to camel case (font-size to fontSize)
	 * @param {String} str The property that requires conversion to camel case
	 * @return {String} The camel cased property string
	 */
	var toCamelCase = (function(){
		var cache = {};
		return function(str){
			if(!cache[str]){
				return cache[str] = str.replace( /-([a-z])/g, function($0,$1){
					return $1.toUpperCase();
				});
			}else{
				return cache[str];
			}
		}
	})();
	
	/**
	 * parse a color to be handled by the animation, supports hex and rgb (#FFFFFF, #FFF, rgb(255, 0, 0))
	 * @param {String} str The string value of an elements color
	 * @return {Array} The rgb values of the color contained in an array
	 */
	var parseColor = function(str){
		var rgb = str.match(/^#?(\w{2})(\w{2})(\w{2})$/);
		if(rgb && rgb.length == 4){
			return [parseInt(rgb[1], 16), parseInt(rgb[2], 16), parseInt(rgb[3], 16)];
		}
		
		rgb = str.match(/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/);
		if(rgb && rgb.length == 4){
			return [parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10)];
		}
	
		rgb = str.match(/^#?(\w{1})(\w{1})(\w{1})$/);
		if(rgb && rgb.length == 4){
			return [parseInt(rgb[1] + rgb[1], 16), parseInt(rgb[2] + rgb[2], 16), parseInt(rgb[3] + rgb[3], 16)];
		}
	};

})();