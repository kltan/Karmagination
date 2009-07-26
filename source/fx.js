// I have to fucking rewrite the whole FX module cause it's quite buggy

Karma.fn.extend({
	/*
	// visibility hidden ? BAH, I won't support, 
	// why? Not that I can't, just that using this piece of junk 
	// introduces terrible inefficiencies if done reliably
	// sometimes it's best that coders know what they are doing
	show: function(){
		var hidden = Karma.filter(':hidden', this);
		for(var i=0; i<hidden.length; i++)
			$(hidden).css('display', 'block');

		return this;
	},
	// visibility visible ?
	hide: function(){
		var visible = Karma.filter(':visible', this);
		for(var i=0; i<visible.length; i++)
			$(visible).css('display', 'none');
		return this;
	},
	*/		 
	stop: function(){
		for(var i=0; i<this.length; i++)
			if(this[i].KarmaFX) this[i].KarmaFX = null;
		
		return this;
	},
	
	// FX can be done faster, parse out a cssText and set it instead of setting css on every property (to reduce reflow)
	// have to test if my conjecture is true or not
	// eww it might be ugly and expensive to turn camelCase into hyphenated-form
	// if I implement a hash table, it will bloat the code quite a bit as there are A LOT of CSS properties
	// I guess this idea is dead for now until I figure out a way
	// FX does not use Karma.Storage for 1 reason, it cleans itself after animation
	// TODO: 
	// YES! I found a way to parse out CSS text (reducing the reflow) and also make camelCasing and hyphenated-form coexists without heavy processing
	// by using caching mechenism so I don't have to do it every time. Will implement this concept on version 0.2
	animate: function(attributes, duration, callback, easing, step){
		if (!Karma.isObject(attributes) || !this.length) return this;
		
		// ok, here's where Karmagination differs a lot from jQuery, we don't unhide things, 
		// you have to manually do that, that's just our philosophy
		
		// do this for scoping issues with internal functions
		var els = this; //Karma.filter(':visible', this);
		
		// default values
		duration = duration || 500;
		easing = easing || Karma.easing.global;
		callback = callback || function(){};
		step = step || function(){};
		
		for(var i=0; i<els.length; i++) {
			// setup initial values
			els[i].KarmaFX = els[i].KarmaFX || [];
			
			var FX = {
				start: {},
				end: {},
				duration: duration,
				callback: callback,
				easing: easing,
				step: step
			};
			
			var $curEl = Karma(els[i]);
			
			// get starting/ending attributes
			// we need to calculate end cause we are converting values like em, etc to px
			for (var prop in attributes) {
				// get the current unanimated attribute
				FX.start[prop] = $curEl.getStyle(prop);
				if (Karma.isString(FX.start[prop]) && FX.start[prop].indexOf('px') > 0) {
					FX.start[prop] = parseInt(FX.start[prop], 10);
				}
				// set the final attribute if they are in NUMBERS
				if (Karma.isNumber(attributes[prop]))
					FX.end[prop] = attributes[prop];
				
				// else we have to detemine it
				else {
					// these are strings
					var val = Karma.trim(attributes[prop]);
					
					if(/opacity|scrollLeft|scrollTop/.test(prop)) {
						FX.end[prop] = parseInt(FX.start[prop], 10) + parseFloat(attributes[prop]);
					}

					else if (val.indexOf('+=') == 0)
						FX.end[prop] = parseInt(FX.start[prop], 10) + parseInt($curEl.setStyle(prop, val.substr(2)).getStyle(prop), 10);

					else if (val.indexOf('-=') == 0)
						FX.end[prop] = parseInt(FX.start[prop], 10) - parseInt($curEl.setStyle(prop, val.substr(2)).getStyle(prop), 10);

					// set the final attribute if they are in PIXELS, no calculation
					else if (attributes[prop].indexOf('px') > 0) {
						FX.end[prop] = attributes[prop];
					}

					else 
						FX.end[prop] = $curEl.setStyle(prop, attributes[prop]).getStyle(prop);
				
					$curEl.setStyle(prop, FX.start[prop]); // revert to start value
				}
			}
			els[i].KarmaFX.push(FX); // pushing and increase counter
		}
		
		// if first iteration in a an animation que then run, the function will look for subsequent queues that have been added after it has been run
		if (els[0].KarmaFX.length === 1) {
			var iter = 0,
				startTimer = (new Date()).getTime(),
				endTimer = els[0].KarmaFX ? startTimer + els[0].KarmaFX[iter].duration : 0,
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
					if (els[i].KarmaFX) {
						// just executing on every step
						els[i].KarmaFX[iter].step();
						for (var prop in attributes) {
							var startVal = (prop == 'opacity') ? parseFloat(els[i].KarmaFX[iter].start[prop]) : parseInt(els[i].KarmaFX[iter].start[prop], 10),
								endVal = (prop == 'opacity') ? parseFloat(els[i].KarmaFX[iter].end[prop]) : parseInt(els[i].KarmaFX[iter].end[prop], 10),
								duration = els[0].KarmaFX[iter].duration,
								// using the current easing function, put in (start value, end value, elapsed time, and the total duration)
								curval = els[i].KarmaFX[iter].easing(startVal, endVal, elapsed, duration);
							Karma(els[i]).setStyle(prop, curval);
						}
					}
				}
			}
			
			var completeAnimation = function(){
				clearInterval(timer);
				
				// set all the css properties to the end attributes
				for(var i=0; i<els.length; i++) {
					if(els[i].KarmaFX)
						Karma(els[i]).css(els[i].KarmaFX[iter].end);
				}
				
				// if there's a callback
				try { els[0].KarmaFX[iter].callback(); } catch(e){};
				
				// up the next item in the animation queue
				iter++;
				
				// if there's no next item, do a clean up
				if(els[0].KarmaFX && !els[0].KarmaFX[iter]) {
					for(var i=0; i<els.length; i++) 
						els[i].KarmaFX = null;
				}
				// start the next animation queue in stack
				else {
					var startTimer = (new Date()).getTime(),
						endTimer = els[0].KarmaFX ? startTimer + els[0].KarmaFX[iter].duration : 0;
					
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
					}, 25);
					
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

