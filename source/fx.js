Karma.extend(Karma.fn, {
			 
	stop: function(){
		for(var i=0; i<this.length; i++)
			if(this[i].KarmaFX) this[i].KarmaFX = null;
		
		return this;
	},

	animate: function(attributes, duration, callback, easing){
		if (!Karma.isObject(attributes) || !this.length) return this;
		
		// do this for scoping issues with internal functions
		var els  = this;
		
		// default values
		duration = duration || 500;
		easing = easing || Karma.easing.global;
		callback = callback || function(){};
		
		for(var i=0; i<this.length; i++) {
			// setup initial values
			els[i].KarmaFX = els[i].KarmaFX || [];
			
			var FX = {
				start: {},
				end: {},
				duration: duration,
				callback: callback,
				easing: easing
			};
			
			var $curEl = Karma(els[i]);
			
			// get starting/ending attributes
			// we need to calculate end cause we are converting values like em, etc to px
			for (var prop in attributes) {
				// get the current unanimated attribute
				FX.start[prop] = $curEl.getStyle(prop);
				
				// set the final attribute if they are in NUMBERS or PX
				if (Karma.isNumber(attributes[prop]))
					FX.end[prop] = attributes[prop];
				
				// else we have to detemine it
				else {
					// these are strings
					var val = Karma.trim(attributes[prop]);
					
					if(/opacity|scrollLeft|scrollTop/.test(prop)) {
						FX.end[prop] = (FX.start[prop] - 0) + parseFloat(attributes[prop]);
					}

					else if (val.indexOf('+') === 0)
						FX.end[prop] = (FX.start[prop] - 0) + ($curEl.setStyle(prop, val.substr(1)).getStyle(prop) - 0); // using - 0 to cast into numbers

					else if (val.indexOf('-') === 0)
						FX.end[prop] = FX.start[prop] - $curEl.setStyle(prop, val.substr(1)).getStyle(prop);

					else if (attributes[prop].indexOf('px') > 0)
						FX.end[prop] = attributes[prop];

					else 
						FX.end[prop] = $curEl.setStyle(prop, attributes[prop]).getStyle(prop);
				
					$curEl.setStyle(prop, FX.start[prop]); // revert to start value
				}
			}
			els[i].KarmaFX.push(FX); // pushing and increase counter
		}
		
		// if first iteration in a an animation que then run, the function will look for subsequent queues that have been added after it has been run
		if (this[0].KarmaFX.length === 1) {
			var iter = 0,
				startTimer = (new Date()).getTime(),
				endTimer = startTimer + els[0].KarmaFX[iter].duration,
				timer;
			
		
			// start looping and setting value at every frame that we arrive
			timer = setInterval(function(){
				var curTime = (new Date()).getTime();
				
				// a frame value between start and end
				if(curTime < (endTimer)){
					if(els[0].KarmaFX)
						setCurrentFrameAttr(curTime - startTimer, els[0].KarmaFX[iter].end);
				}
				// last frame
				else { 
					completeAnimation();
				}
			}, 20);
			
			var setCurrentFrameAttr = function(elapsed, attributes){
				for(var i=0; i<els.length; i++) {
					if (els[i].KarmaFX)
						for (var prop in attributes) {
							var startVal = (prop == 'opacity') ? parseFloat(els[i].KarmaFX[iter].start[prop]) : parseInt(els[i].KarmaFX[iter].start[prop]),
								endVal = (prop == 'opacity') ? parseFloat(els[i].KarmaFX[iter].end[prop]) : parseInt(els[i].KarmaFX[iter].end[prop]),
								duration = els[0].KarmaFX[iter].duration,
								// using the current easing function, put in (start value, end value, elapsed time, and the total duration)
								curval = els[i].KarmaFX[iter].easing(startVal, endVal, elapsed, duration);
							
							Karma(els[i]).setStyle(prop, curval);
						}
				}
			}
			
			var completeAnimation = function(){
				clearInterval(timer);
				
				// set all the css properties to the end attributes
				for(var i=0; i<els.length; i++) {
					if(els[0].KarmaFX)
						Karma(els[i]).css(els[i].KarmaFX[iter].end);
				}
				
				// if there's a callback, call now with scope as window
				if (els[0].KarmaFX && els[0].KarmaFX[iter].callback) els[0].KarmaFX[iter].callback(Karma.makeArray(els));
				
				// up the next item in the queue
				iter++;
				
				// if there's no next item				
				if(els[0].KarmaFX && !els[0].KarmaFX[iter]) {
					for(var i=0; i<els.length; i++) {
						if(els[i].KarmaFX); els[i].KarmaFX = null;
					}
				}
				// start the next animation queue in stack
				else {
					var startTimer = (new Date()).getTime(),
						endTimer = startTimer + els[0].KarmaFX[iter].duration;
					
					// get current style
					for(var i=0; i<els.length; i++) {
						if (els[i].KarmaFX)
							for (var prop in els[i].KarmaFX[iter].end) {
								els[i].KarmaFX[iter].start[prop] = els[i].KarmaFX[iter-1].end[prop] || Karma(els[i]).getStyle(prop);
							}
					}
					
					timer = setInterval(function(){
						var curTime = (new Date()).getTime();
						
						// a frame value between start and end
						if(curTime < (endTimer)){
							if(els[0].KarmaFX)
								setCurrentFrameAttr(curTime - startTimer, els[0].KarmaFX[iter].end);
						}
						// last frame
						else { 
							completeAnimation();
						}
					}, 20);
					
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
