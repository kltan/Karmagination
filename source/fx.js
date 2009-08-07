Karma.fn.extend({
	stop: function(){
		return this.data('KarmaFX', null);
	},
	
	// do not calculate and store upfront, calculate on animating iteration hit
	// reason, css props can change in the middle
	animate: function(attributes, duration, callback, easing, step){
		if (!Karma.isGenericObject(attributes) || !this.length) return this;
		
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
				attributes: attributes,
				easing: easing,
				step: step
			};

			var $cur = Karma(els[i]),
				KarmaFX = $cur.data('KarmaFX', $cur.data('KarmaFX') || []).data('KarmaFX');

			// get starting/ending attributes
			// we need to calculate end cause we are converting values like em, etc to px
			KarmaFX.push(Karma.temp.populateStartEndValues($cur, FX, attributes));
			Karma.temp.animate($cur);
		}

		return this;
	}
});

Karma.temp.populateStartEndValues = function($curEl, FX, attributes) {
	for (var prop in attributes) {
		// get the current unanimated attribute
		FX.start[prop] = $curEl.getStyle(prop);
		FX.start[prop] = +FX.start[prop] || parseInt(FX.start[prop], 10);
		
		var cur_prop = +attributes[prop];

		// get start properties and convert to integer or float
		// set the final attribute if they are in numbers, no calculation
		if (cur_prop || cur_prop === 0) {
			FX.end[prop] = cur_prop;
		}
		
		// else we have to detemine the end attributes, ie 1.6 em = how many px
		else {
			// these are strings
			//var val = Karma.trim(attributes[prop]);
			var val = attributes[prop];
			
			// need to add or substract determined from original value
			if (val.indexOf('+=') >= 0 || val.indexOf('-=') >= 0) {
			
				var cur_val = val.replace('+=','').replace('-=',''),
					temp_val = +cur_val;
				
				// number looks like strings, means all digits /\d/ or has a unit of pixel
				if (temp_val || val.indexOf('px') > 0)
					cur_val = temp_val || parseInt(cur_val, 10);
				
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
			// using parseInt cause returned value by browser is px
			else {
				FX.end[prop] = parseInt($curEl.setStyle(prop, val).getStyle(prop), 10);
				$curEl.setStyle(prop, FX.start[prop]); // revert to start value
			}
		}
	}
		
	return FX;
}

Karma.temp.animate = function($cur) {
	var KarmaFX = $cur.data('KarmaFX');
	if (KarmaFX.length == 1) {
		var iter = 0,
			startTimer = new Date().getTime(),
			endTimer = startTimer + (KarmaFX[iter].duration || 0),
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

		}, 13); // try to run every 13ms
		
		var currentFrame = function(elapsed, attr){
			for (var prop in attr) {
				var start = KarmaFX[iter].start[prop],
					end = KarmaFX[iter].end[prop],
					duration = KarmaFX[iter].duration,					
					curval = KarmaFX[iter].easing(elapsed, start, end-start, duration);
				
				$cur.setStyle(prop, curval);
			}
			// just executing on every step
			if (KarmaFX && KarmaFX[iter] && KarmaFX[iter].step)	KarmaFX[iter].step();
		}
		
		var completeAnimation = function(){
			clearInterval(timer);
			
			// set to end values;
			if(KarmaFX && KarmaFX[iter]) {
				if (KarmaFX[iter].callback)
					KarmaFX[iter].callback();
			
				$cur.css(KarmaFX[iter].end);
			}

			iter++;
			
			// if there's no next item, do a clean up
			if(KarmaFX && !KarmaFX[iter])
				KarmaFX = null;
			
			// start the next animation queue in stack
			else {
				var startTimer = new Date().getTime(),
					endTimer = startTimer + KarmaFX[iter].duration;
					
				for (var prop in KarmaFX[iter].end)
					Karma.temp.populateStartEndValues($cur, KarmaFX[iter], KarmaFX[iter].attributes);

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
				}, 13); // try to run every 13ms
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
