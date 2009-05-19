Karma.extend($.fn, {
			 
	stop: function(){
		for(var i=0; i<this.length; i++)
			delete this[i]['KarmaFX'];
		
		return this;
	},

	animate: function(attributes, duration, callback, easing){
		if (!Karma.isObject(attributes) || !this.length) return this;
		
		// do this for scoping issues with internal functions
		var $$  = this;
		
		// default values
		duration = duration || 1000;
		easing = easing || Karma.easing.easeNone;
		
		for(var i=0; i<this.length; i++) {
			// setup initial values
			this[i]['KarmaFX'] = this[i]['KarmaFX'] || [];
			
			var FX = {};
			this[i]['KarmaFX'].push(FX); // pushing and increase counter
			
			FX['start'] = {};
			FX['end'] = {};
			FX['duration'] = duration;
			FX['callback'] = callback;
			FX['easing'] = easing;
			FX['counter'] = this[i]['KarmaFX'].length - 1; // current index
			
			// get starting/ending attributes
			// we need to calculate end cause we are converting values like em, etc to px
			for (var prop in attributes) {
				// get the current unanimated attribute
				FX['start'][prop] = Karma(this[i]).getStyle(prop);
				// set the final attribute and try to get the value usually in px
				FX['end'][prop] = Karma(this[i]).setStyle(prop, attributes[prop]).getStyle(prop);
				// revert to start value
				Karma(this[i]).setStyle(prop, FX['start'][prop]);
			}
			
			// if first iteration in a queue
			if (!this[i]['KarmaFX']['animating']) {
				this[i]['KarmaFX']['animating'] = true;
				
				
			}

			/*		
			this[i]['KarmaFX']['animating'] = true;
			this[i]['KarmaFX']['start'] = {};
			this[i]['KarmaFX']['end'] = {};
			
			// get starting/ending attributes
			// we need to calculate end cause we are converting values like em, etc to px
			for (var prop in attributes) {
				this[i]['KarmaFX']['start'][prop] = Karma(this[i]).getStyle(prop);
				this[i]['KarmaFX']['end'][prop] = Karma(this[i]).setStyle(prop, attributes[prop]).getStyle(prop);
				Karma(this[i]).setStyle(prop, this[i]['KarmaFX']['start'][prop]);
			}*/
			
			
		}
		
		var startTimer = (new Date()).getTime();
		
		// start looping and setting value at every frame that we arrive
		var timer = setInterval(function(){
			var curTime = (new Date()).getTime();
			
			// a frame value between start and end
			if(curTime < (startTimer + duration)){
				setCurrentFrameAttr(curTime - startTimer, attributes);
			}
			// last frame
			else { 
				completeAnimation();
			}
		}, 10);
		
		var setCurrentFrameAttr = function(elapsed, attributes){
			//alert($$.length);
			for(var i=0; i<$$.length; i++) {
				if ($$[i]['KarmaFX'] && $$[i]['KarmaFX']['animating'])
					for (var prop in attributes)
						Karma($$[i]).setStyle(prop, Karma.easing.easeNone($$[i]['KarmaFX']['start'][prop], $$[i]['KarmaFX']['end'][prop], elapsed, duration) + 'px');
			}
		}
		
		var completeAnimation = function(){
			clearInterval(timer);
			for(var i=0; i<$$.length; i++) {
				if($$[i]['KarmaFX']); delete $$[i]['KarmaFX'];
			}
			$$.css(attributes);
			
			if (callback) callback.call(window);
		}
		
		return this;
	}
});

Karma.easing = {};
Karma.extend(Karma.easing, {
	easeNone: function(start, end, elapsed, duration) {
		start = parseFloat(start);
		end = parseFloat(end);
		return parseFloat(start + ((1-Math.cos((elapsed/duration)*Math.PI)) / 2) * (end - start));
	}
});
