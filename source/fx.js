Karma.extend(Karma.fn, {
			 
	stop: function(){
		for(var i=0; i<this.length; i++)
			if(this[i]['KarmaFX']) delete this[i]['KarmaFX'];
		
		return this;
	},

	animate: function(attributes, duration, callback, easing){
		if (!Karma.isObject(attributes) || !this.length) return this;
		
		// do this for scoping issues with internal functions
		var $$  = this;
		
		// default values
		duration = duration || 500;
		easing = easing || Karma.easing.global;
		callback = callback || function(){};
		
		for(var i=0; i<this.length; i++) {
			// setup initial values
			this[i]['KarmaFX'] = this[i]['KarmaFX'] || [];
			this[i]['KarmaFX']['animating'] = true;
			
			var FX = {};
			FX['start'] = {};
			FX['end'] = {};
			FX['duration'] = duration;
			FX['callback'] = callback;
			FX['easing'] = easing;
			
			// get starting/ending attributes
			// we need to calculate end cause we are converting values like em, etc to px
			for (var prop in attributes) {
				// convert all numerical to pixels
				if (Karma.isNumber(attributes[prop])) attributes[prop] += 'px';
				// get the current unanimated attribute
				FX['start'][prop] = Karma(this[i]).getStyle(prop);
				// set the final attribute and try to get the value usually in px
				FX['end'][prop] = Karma(this[i]).setStyle(prop, attributes[prop]).getStyle(prop);
				// revert to start value
				Karma(this[i]).setStyle(prop, FX['start'][prop]);
			}
			
			this[i]['KarmaFX'].push(FX); // pushing and increase counter

		}
		
		// if first iteration in a an animation que then run, the function will look for subsequent queues that have been added after it has been run
		if (this[0]['KarmaFX'].length === 1) {
			var iter = 0;
			var startTimer = (new Date()).getTime();
		
			// start looping and setting value at every frame that we arrive
			var timer = setInterval(function(){
				var curTime = (new Date()).getTime();
				
				// a frame value between start and end
				if(curTime < (startTimer + duration)){
					if($$[0]['KarmaFX'])
						setCurrentFrameAttr(curTime - startTimer, $$[0]['KarmaFX'][iter]['end']);
				}
				// last frame
				else { 
					completeAnimation();
				}
			}, 10);
			
			var setCurrentFrameAttr = function(elapsed, attributes){
				for(var i=0; i<$$.length; i++) {
					if ($$[i]['KarmaFX'] && $$[i]['KarmaFX']['animating'])
						for (var prop in attributes) {
							// using the current easing function, put in (start value, end value, elapsed time, and the total duration)
							var curval = $$[i]['KarmaFX'][iter]['easing'](parseInt($$[i]['KarmaFX'][iter]['start'][prop]), parseInt($$[i]['KarmaFX'][iter]['end'][prop]), elapsed, $$[i]['KarmaFX'][iter]['duration']);
							if (prop != 'opacity') curval += 'px';
							Karma($$[i]).setStyle(prop, curval);
						}
				}
			}
			
			var completeAnimation = function(){
				clearInterval(timer);
				
				// set all the css properties to the end attributes
				for(var i=0; i<$$.length; i++) {
					if($$[0]['KarmaFX'])
						$$.css($$[i]['KarmaFX'][iter]['end']);
				}
				
				// if there's a callback, call now with scope as window
				if ($$[0]['KarmaFX'] && $$[0]['KarmaFX'][iter]['callback']) $$[0]['KarmaFX'][iter].callback.call(window);
				
				// up the next item in the queue
				iter++;
				
				// if there's no next item				
				if($$[0]['KarmaFX'] && !$$[0]['KarmaFX'][iter]) {
					for(var i=0; i<$$.length; i++) {
						if($$[i]['KarmaFX']); delete $$[i]['KarmaFX'];
					}
				}
				else {
					var startTimer = (new Date()).getTime();
					
					// get current style
					for(var i=0; i<$$.length; i++) {
						if ($$[i]['KarmaFX'])
							for (var prop in $$[i]['KarmaFX'][iter]['end']) {
								$$[i]['KarmaFX'][iter]['start'][prop] = Karma($$[i]).getStyle(prop);
							}
					}
					
					timer = setInterval(function(){
						var curTime = (new Date()).getTime();
						
						// a frame value between start and end
						if(curTime < (startTimer + duration)){
							if($$[0]['KarmaFX'])
								setCurrentFrameAttr(curTime - startTimer, $$[0]['KarmaFX'][iter]['end']);
						}
						// last frame
						else { 
							completeAnimation();
						}
					}, 10);
					
				}
				
				
			}
				
		}

		return this;
	}
});

Karma.easing = {
	linear: function(start, end, elapsed, duration) {
		return  (end - start)*elapsed/duration + start;
	}
};
Karma.easing.global = Karma.easing.linear;