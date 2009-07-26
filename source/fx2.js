Karma.fn.extend({
	stop: function(){
		return this.data('KarmaFX', null);
	},
	
	// YES! I found a way to parse out CSS text (reducing the reflow) and also make camelCasing and hyphenated-form coexists without heavy processing
	// by using caching mechenism so I don't have to do it every time. Will implement this concept on version 0.2
	animate: function(attributes, duration, callback, easing, step){
		if (!Karma.isObject(attributes) || !this.length) return this;
		
		// do this for scoping issues with internal functions
		var els = this;
		
		// default values
		duration = duration || 300;
		easing = easing || Karma.easing.global;
		callback = callback || null;
		step = step || null;
		
		// setup initial KarmaFX data structure
		
		
		for(var i=0; i<els.length; i++) {
	
			var FX = {
				start: {},
				end: {},
				duration: duration,
				callback: callback,
				easing: easing,
				step: step
			};
			
			var $curEl = Karma(els[i]);
			var KarmaFX = $curEl.data('KarmaFX', $curEl.data('KarmaFX') || []).data('KarmaFX');

			// get starting/ending attributes
			// we need to calculate end cause we are converting values like em, etc to px
			for (var prop in attributes) {
				// get the current unanimated attribute
				FX.start[prop] = $curEl.getStyle(prop);
				
				// get start properties and convert to integer or float
				// set the final attribute if they are in numbers, no calculation
				if (Karma.isNumber(attributes[prop] - 0)) {
					FX.start[prop] = (prop == 'opacity') ? parseFloat(FX.start[prop]) : parseInt(FX.start[prop], 10);
					FX.end[prop] = attributes[prop] - 0;
				}
				
				// else we have to detemine the end attributes, ie 1.6 em ??? px
				else {
					// these are strings
					var val = Karma.trim(attributes[prop]);
					// process the start value
					FX.start[prop] = FX.start[prop] - 0 || parseFloat(FX.start[prop], 10);
					
					// need to add or substract determined from original value
					if (val.indexOf('+=') == 0 || val.indexOf('-=') == 0) {
					
						var cur_val = val.substr(2);
						
						// number looks like strings, means all digits /\d/
						if (Karma.isNumber(cur_val-0))
							cur_val = cur_val-0;
						
						// pixels
						else if (val.indexOf('px') > 0)
							cur_val = parseInt(cur_val, 10);
						
						// other units, opacity, will not hit this so no problem to parseInt
						else {
							cur_val = parseInt($curEl.setStyle(prop, cur_val).getStyle(prop), 10);
							$curEl.setStyle(prop, FX.start[prop]); // revert to start value
						}
						
						FX.end[prop] = (val.indexOf('+=') == 0) ? FX.start[prop] + cur_val : FX.start[prop] - cur_val;
					}

					// set the final attribute if they are in pixels, no calculation
					else if (val.indexOf('px') > 0) {
						FX.end[prop] = parseInt(val, 10);
					}
					
					// all other units like em, pt
					else {
						FX.end[prop] = parseInt($curEl.setStyle(prop, val).getStyle(prop), 10);
						$curEl.setStyle(prop, FX.start[prop]); // revert to start value
					}
				}
			}
			KarmaFX.push(FX);
			Karma.animate($curEl);
		}
		

		
		return this;
	}
});

Karma.animate = function($el) {
	var KarmaFX = $el.data('KarmaFX');
	// first one on queue runs immediately. The rest have to wait for the complete animation to fire next in queue
	if (KarmaFX.length == 1) {
		var iter = 0,
			startTimer = new Date().getTime(),
			endTimer = startTimer + KarmaFX[iter].duration || 0,
			timer;
			
		timer = setInterval(function(){
			var curTime = new Date().getTime();
			
			if (!KarmaFX)
				clearInterval(timer);
				
			// a frame value between start and end
			else if(curTime < endTimer)
				currentFrame(curTime - startTimer, KarmaFX[iter].end);
			
			// last frame
			else 
				completeAnimation();

		}, 17); // try to run every 17ms
		
		var currentFrame = function(elapsed, attr){
			for (var prop in attr) {
				var start = KarmaFX[iter].start[prop],
					end = KarmaFX[iter].end[prop],
					duration = KarmaFX[iter].duration,					
					curval = KarmaFX[iter].easing(elapsed, start, end-start, duration);
				
				$el.setStyle(prop, curval);
			}
			// just executing on every step
			if (KarmaFX && KarmaFX[iter] && KarmaFX[iter].step)	KarmaFX[iter].step();
		}
		
		var completeAnimation = function(){
			clearInterval(timer);
			
			// set to end values;
			if(KarmaFX && KarmaFX[iter] && KarmaFX[iter].end) 
				$el.css(KarmaFX[iter].end);

			// if there's a call back
			if(KarmaFX && KarmaFX[iter] && KarmaFX[iter].callback) 
				KarmaFX[iter].callback();

			iter++;
			
			// if there's no next item, do a clean up
			if(KarmaFX && !KarmaFX[iter])
				KarmaFX = null;
			
			// start the next animation queue in stack
			else {
				var startTimer = new Date().getTime(),
					endTimer = startTimer + KarmaFX[iter].duration || 0;
					
				if (KarmaFX && KarmaFX[iter]) {
					for (var prop in KarmaFX[iter].end) {
						// we assume if it has not been animated, the value stay the same
						KarmaFX[iter].start[prop] = Karma.isNumber(KarmaFX[iter-1].end[prop]-0) ? KarmaFX[iter-1].end[prop]-0 : KarmaFX[iter].start[prop];
					}
				}
				
				timer = setInterval(function(){
					var curTime = new Date().getTime();
					
					if(!KarmaFX)
						clearInterval(timer);

					// a frame value between start and end
					else if(curTime < endTimer){
						currentFrame(curTime - startTimer, KarmaFX[iter].end);
					}
					// last frame
					else { 
						completeAnimation();
					}
				}, 17); // try to run every 17ms
			}
		}
	}
}

Karma.easing = {
	linear: function (t, b, c, d) {
    	return c*t/d + b;
    }
};

Karma.easing.global = Karma.easing.linear;
