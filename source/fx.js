/*
 * Original code Copyright (c) 2009 Ryan Morr (ryanmorr.com)
 * Modification Copyright (c) by Kean L. Tan
*/
$hort.extend($.fn, {

	animate: function(attributes, duration, callback, easing){
		if (!$hort.isObject(attributes) || !this.length) return this;
		
		// do this for scoping issues with internal functions
		var $$  = this;
		
		// default values
		duration = duration || 1000;
		easing = easing || $hort.easing.easeNone;
		
		for(var i=0; i<this.length; i++) {
			// setup initial values
			this[i]['$hortFX'] = this[i]['$hortFX'] || {};
			this[i]['$hortFX']['animating'] = true;
			this[i]['$hortFX']['start'] = {};
			this[i]['$hortFX']['end'] = {};
			
			// get starting/ending attributes
			// we need to calculate end cause we are converting values like em, etc to px
			for (var prop in attributes) {
				this[i]['$hortFX']['start'][prop] = $hort(this[i]).getStyle(prop);
				this[i]['$hortFX']['end'][prop] = $hort(this[i]).setStyle(prop, attributes[prop]).getStyle(prop);
				$hort(this[i]).setStyle(prop, this[i]['$hortFX']['start'][prop]);
			}
		}
		
		var startTimer = (new Date()).getTime();
		
		// start looping and setting value at every frame that we arrive
		var timer = setInterval(function(){
			var curTime = new Date().getTime();
			
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
				if ($$[i]['$hortFX'] && $$[i]['$hortFX']['animating'])
					for (var prop in attributes)
						$hort($$[i]).setStyle(prop, $hort.easing.easeNone($$[i]['$hortFX']['start'][prop], $$[i]['$hortFX']['end'][prop], elapsed, duration) + 'px');
			}
		}
		
		var completeAnimation = function(){
			clearInterval(timer);
			for(var i=0; i<$$.length; i++) {
				$$[i]['$hortFX']['animating'] = false;
				delete this[i]['$hortFX'];
			}
			$$.css(attributes);
			
			if (callback) callback.call(window);
		}
	}
});

$hort.easing = {};
$hort.extend($hort.easing, {
	easeNone: function(start, end, elapsed, duration) {
		start = parseFloat(start);
		end = parseFloat(end);
		return start + ((1-Math.cos((elapsed/duration)*Math.PI)) / 2) * (end - start);
	}
});
