Karma.extend(Karma.fn, {
			 
	stop: function(){
		for(var i=0; i<this.length; i++)
			if(this[i].KarmaFX) this[i].KarmaFX = null;
		
		return this;
	},

	animate: function(attributes, duration, callback, easing){
		if (!Karma.isObject(attributes) || !this.length) return this;
		
		// do this for scoping issues with internal functions
		var $els  = this;
		
		// default values
		duration = duration || 500;
		easing = easing || Karma.easing.global;
		callback = callback || null;
		
		for(var i=0; i<this.length; i++) {
			// setup initial values
			$els[i].KarmaFX = $els[i].KarmaFX || [];
			
			var FX = {
				start: {},
				end: {},
				duration: duration,
				callback: callback,
				easing: easing
			};
			
			// get starting/ending attributes
			// we need to calculate end cause we are converting values like em, etc to px
			for (var prop in attributes) {
				// convert all numerical to pixels except for opacity scrollTop and scrollLeft
				if (Karma.isNumber(attributes[prop]) && !(prop == 'opacity' || prop == 'scrollTop' || prop == 'scrollLeft')) attributes[prop] += 'px';
				// get the current unanimated attribute
				FX.start[prop] = Karma(this[i]).getStyle(prop);
				// set the final attribute and try to get the value usually in px
				if (!(prop == 'opacity' || prop == 'scrollTop' || prop == 'scrollLeft'))
					FX.end[prop] = Karma(this[i]).setStyle(prop, attributes[prop]).getStyle(prop);
				else
					FX.end[prop] = attributes[prop];

				// revert to start value
				Karma(this[i]).setStyle(prop, FX.start[prop]);
			}
			
			this[i].KarmaFX.push(FX); // pushing and increase counter

		}
		
		// if first iteration in a an animation que then run, the function will look for subsequent queues that have been added after it has been run
		if (this[0].KarmaFX.length === 1) {
			var iter = 0;
			var startTimer = (new Date()).getTime();
		
			// start looping and setting value at every frame that we arrive at
			var timer = setInterval(function(){
				var curTime = (new Date()).getTime();
				
				// a frame value between start and end
				if(curTime < (startTimer + duration)){
					if($els[0].KarmaFX)
						setCurrentFrameAttr(curTime - startTimer, $els[0].KarmaFX[iter].end);
						// $els[0].KarmaFX[iter].end not used as values, 
						// we get the property name cause they are all set the same
				}
				// last frame
				else { 
					completeAnimation();
				}
			}, 13);
			
			var setCurrentFrameAttr = function(elapsed, attributes){
				for(var i=0; i<$els.length; i++) {
					if ($els[i].KarmaFX)
						for (var prop in attributes) {
							var curEase = $els[i].KarmaFX[iter].easing,
								startVal = parseInt($els[i].KarmaFX[iter].start[prop]),
								endVal = parseInt($els[i].KarmaFX[iter].end[prop]),
								duration = $els[i].KarmaFX[iter].duration;

							// using the current easing function, put in (start value, end value, elapsed time, and the total duration)
							var curval = curEase(startVal, endVal, elapsed, duration);
							if (!(prop == 'opacity' || prop == 'scrollTop' || prop == 'scrollLeft')) curval += 'px';
							$els.setStyle(prop, curval);
						}
				}
			}
			
			var completeAnimation = function(){
				clearInterval(timer);
				
				// set all the css properties to the end attributes
				for(var i=0; i<$els.length; i++) {
					if($els[i].KarmaFX)
						$els.css($els[i].KarmaFX[iter].end);
				}
				
				// iter is the current KarmaFX stack pointer
				// if there's a callback, call now with scope as window
				if ($els[0].KarmaFX && $els[0].KarmaFX[iter].callback) $els[0].KarmaFX[iter].callback();
				
				// up the next item in the queue
				iter++;
				
				// if there's no next item				
				if($els[0].KarmaFX && !$els[0].KarmaFX[iter]) {
					for(var i=0; i<$els.length; i++) {
						if($els[i].KarmaFX) $els[i].KarmaFX = null;
					}
				}
				else {
					var startTimer = (new Date()).getTime();
					
					// get current style, remember we just changed the style from previous animation so we must recalculate
					for(var i=0; i<$els.length; i++) {
						if ($els[i].KarmaFX)
							for (var prop in $els[i].KarmaFX[iter].end) {
								$els[i].KarmaFX[iter].start[prop] = Karma($els[i]).getStyle(prop);
							}
					}
					
					timer = setInterval(function(){
						var curTime = (new Date()).getTime();
						
						// a frame value between start and end
						if(curTime < (startTimer + duration)){
							if($els[0].KarmaFX)
								setCurrentFrameAttr(curTime - startTimer, $els[0].KarmaFX[iter].end);
						}
						// last frame
						else { 
							completeAnimation();
						}
					}, 13);
					
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