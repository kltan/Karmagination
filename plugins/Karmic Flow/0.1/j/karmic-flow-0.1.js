/*!
 * Karmic Flow 0.1
 * http://www.karmagination.com
 * Released under the MIT, BSD, and GPL Licenses - Choose one that fit your needs
 * Copyright (c) 2009 Kean L. Tan 
 * Build date: 2009-07-20
*/
 
(function karmicFlow($){$.fn.karmicFlow = function(opts){
	// default options
	opts = $.extend({
		container: 'karmic_flow_container',
		slider: 'karmic_flow_slider',
		slides: 'karmic_flow_slides',
		sliding: 'karmic_flow_sliding',
		slide_selected: 'karmic_flow_slide_selected',
		slide_overflow: 'karmic_flow_slide_overflow',
		controller: 'karmic_flow_controller',
		controller_selected: 'karmic_flow_controller_selected',
		next: 'karmic_flow_next_controller',
		prev: 'karmic_flow_prev_controller',
		play: 'karmic_flow_play_controller',
		pause: 'karmic_flow_pause_controller',
		duration: 400,
		timer: 2500,
		auto: false
	}, opts || {});
	
	var interval = null;
	
	var playSlide = function(el, auto){
		var $el = $(el),
			target_container = $(el).attr('target'),
			$container = $('#'+target_container),
			$slider = $container.children(),
			$current_selected = $container.find('.'+opts.slide_selected),
			$allSlides = $current_selected.parent().children(),
			index = $allSlides.index($current_selected),
			total = $allSlides.length;
		
		if (index == -1) return false;
		
		if (auto || $el.hasClass(opts.next))
			index = (index + 1 == total) ? 0 : index + 1;
		else if ($el.hasClass(opts.prev))
			index = (index == 0) ? total - 1 : index - 1;
		
		$allSlides.removeClass(opts.slide_selected);
		$allSlides.eq(index).addClass(opts.slide_selected);
		
		var $controller_target = $('[href=#'+ $allSlides.eq(index).attr('name') + ']'),
			$controller_siblings = $('[target=' + $controller_target.attr('target') + ']');
		
		$controller_siblings.removeClass(opts.controller_selected);
		$controller_target.addClass(opts.controller_selected);
		
		$slider.addClass(opts.sliding);
			
		$slider.stop().animate({
			marginLeft: -1 * $current_selected.width() * index
		}, opts.duration, function(){
			$slider.removeClass(opts.sliding);	
		});
		
		return $controller_target[0];
	}

	for(var i=0; i < this.length; i++) {
		$(this[i]).find('.'+ opts.slides).each(function(){
			var $div = $('<div></div>');
			$div
			 .append(this.childNodes)
			 .appendTo(this)
			 .addClass(opts.slide_overflow)
			 .css('height', $(this).parent().parent().height());
		});
	}
	
	// first time init, we want delegate all those controllers with different class name so they know their purpose
	// we do not want to delegate twice
	var $doc = $();
	if (!$doc.data('karmic_flow_init')) {
		$doc.data('karmic_flow_init', 1);

		$doc.bind('click', function(e){
			var el = e.target,
				$el = $(el),
				target_container = $el.attr('target');
			
			// slide controller
			if ($el.hasClass(opts.controller)) {
				var $found_slide = $('#' + target_container + ' [name=' + el.hash.substring(1, el.hash.length) + ']'),
					index = $found_slide.parent().children().index($found_slide[0]),
					$slider = $found_slide.parent();
					
				$('[target=' + target_container + ']').removeClass(opts.controller_selected);
				$el.addClass(opts.controller_selected);
				$slider.children().removeClass(opts.slide_selected);
				$found_slide.addClass(opts.slide_selected);
				$slider.addClass(opts.sliding);
				
				var marginLeft = -1 * $found_slide.width() * index;

				$slider.stop().animate({ marginLeft: -1 * $found_slide.width() * index }, opts.duration, function(){
					$slider.removeClass(opts.sliding);	
				});
				// prevent default and stop propagation
				return false;
			}
			// next button, flawed, should use current selected or will be off
			else if ($el.hasClass(opts.next) || $el.hasClass(opts.prev)) {
				playSlide(el);
				// prevent default and stop propagation
				return false;
			}
			
			// play button
			else if ($el.hasClass(opts.play)) {
				var curEl = el;
				
				if(interval !== null) {
					clearInterval(interval);
					interval = null;
					$el.removeClass(opts.pause);
				}
				else {
					$el.addClass(opts.pause);
					interval = setInterval(function(){
						curEl =playSlide(curEl, true);
					}, opts.timer);
				}
				// prevent default and stop propagation
				return false;
			}

			// other normal anchors should not be affected and behave normally so no return false here
		});
	}
	
	for (var i=0; i < this.length; i++) {
		var $container = $(this[i]),
			$slider = $container.children(),
			$slides = $slider.height($container.height()).children();
		
		$slider.width($slides.length * $container.width());
		$slides.width($container.width());

		if (opts.auto) {
			// find the play button for current container
			var $play_button = $('.'+opts.play).filter('[target=' + this[i].id + ']')
			
			// if not found, create one and hide it, we use fake play button to simulate a true button action
			if(!$play_button.length)
				$play_button = $('<a href="#" target="' + this[i].id + '" class="' + opts.next + '">&nbsp;</a>');
			
			var curEl = $play_button[0];
			
			// loop the slides
			interval = setInterval(function(){
				curEl =playSlide(curEl, true);
			}, opts.timer);
		}
	}
	
	// make this plugin chainable
	return this; 

}})(this.jQuery||this.Karma);