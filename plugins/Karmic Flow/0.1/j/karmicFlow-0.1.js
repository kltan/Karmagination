/*!
 * Karmic Flow 0.1
 * http://www.karmagination.com
 * Released under the MIT, BSD, and GPL Licenses - Choose one that fit your needs
 * Copyright (c) 2009 Kean L. Tan 
 * Build date: 2009-07-20
*/
 
(function($){$.fn.karmicFlow = function(opts){
	// default options
	opts = $.extend({
		container: 'karmic_flow_container',
		slider: 'karmic_flow_slider',
		slides: 'karmic_flow_slides',
		slide_selected: 'karmic_flow_slide_selected',
		controller: 'karmic_flow_controller',
		controller_selected: 'karmic_flow_controller_selected',
		next: 'karmic_flow_next_controller',
		prev: 'karmic_flow_prev_controller',
		play: 'karmic_flow_play_controller',
		pause: 'karmic_flow_pause_controller',
		timer: 0,
		auto: false
	}, opts);
	
	var $window = $(window);
	
	// first time init, we want delegate all those controllers with different class name so they know their purpose
	// we do not want to delegate twice
	if (!$window.data('karmic_flow_init_controller')) {
		$window.data('karmic_flow_init_controller', 1);
	
		$().bind('click', function(e){
			var el = e.target;
			
			// slide controller
			if ($(el).hasClass(opts.controller)) {
				var $found_slide = $('[name='+ el.hash.substring(1, el.hash.length) + ']'),
					index = $found_slide.parent().children().index($found_slide[0]);
				
				$found_slide.parent().stop().animate({
					marginLeft: -1 * parseInt($found_slide.width() * index, 10)
				}, 300);
				
				return false;
			}
			// next button, flawed, should use current selected or will be off
			else if ($(el).hasClass(opts.next)) {
				var $container = $('#'+el.hash.substring(1, el.hash.length)),
					$slider = $container.children(),
					$slides = $slider.children(),
					marginLeft = parseInt($slider.css('marginLeft'), 10) || 0,
					sliderWidth = $slider.width(),
					slideWidth = $slides.width();
				
				$slider.stop().animate({
					marginLeft: (marginLeft - slideWidth) * -1 >= sliderWidth ? 0 : marginLeft - slideWidth
				}, 300);
				
				return false;
			}
			// prev button, flawed, should use current selected or will be off
			else if ($(el).hasClass(opts.prev)) {
				var $container = $('#'+el.hash.substring(1, el.hash.length)),
					$slider = $container.children(),
					$slides = $slider.children(),
					marginLeft = parseInt($slider.css('marginLeft'), 10) || 0,
					sliderWidth = $slider.width(),
					slideWidth = $slides.width();
				
				$slider.stop().animate({
					marginLeft: (marginLeft + slideWidth) <= 0 ? marginLeft + slideWidth : -1 * sliderWidth + slideWidth
				}, 300);
				
				return false;
			}
			// play button
			else if ($(el).hasClass(opts.play)) {
				
				return false;
			}
			// pause button
			else if ($(el).hasClass(opts.pause)) {
				
				return false;
			}
			
			// other normal anchors should not be affected and behave normally
		});
	}
	
	for (var i=0; i < this.length; i++) {
		var $container = $(this[i]),
			$slider = $container.children(),
			$slides = $slider.height($container.height()).children();
		
		$slider.width($slides.length * $container.width());
		$slides.width($container.width());
	}
	
	// make this plugin chainable
	return this; 

}})(this.jQuery||this.Karma);