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
		sliding: 'karmic_flow_sliding',
		slide_selected: 'karmic_flow_slide_selected',
		slide_overflow: 'karmic_flow_slide_overflow',
		controller: 'karmic_flow_controller',
		controller_selected: 'karmic_flow_controller_selected',
		next: 'karmic_flow_next_controller',
		prev: 'karmic_flow_prev_controller',
		play: 'karmic_flow_play_controller',
		pause: 'karmic_flow_pause_controller',
		timer: 500,
		auto: false
	}, opts);
	
	var interval;
	
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
		
		var $controller_target = $('[href*=#'+ $allSlides.eq(index).attr('name') + ']'),
			$controller_siblings = $('[target=' + $controller_target.attr('target') + ']');
		
		$controller_siblings.removeClass(opts.controller_selected);
		$controller_target.addClass(opts.controller_selected);
		
		$slider.addClass(opts.sliding);
			
		$slider.stop().animate({
			marginLeft: -1 * $current_selected.width() * index
		}, 300, function(){
			$slider.removeClass(opts.sliding);	
		});		
	}
	
	for(var i=0; i < this.length; i++) {
		$(this[i]).find('.'+ opts.slides).each(function(j){
			var $div = $('<div></div>');
			while(this.childNodes.length)
				$div[0].appendChild(this.firstChild);
			
			$div
			 .appendTo(this)
			 .addClass(opts.slide_overflow)
			 .css('height', $(this).parent().parent().height());
			 
		});
	}

	// first time init, we want delegate all those controllers with different class name so they know their purpose
	// we do not want to delegate twice
	var $doc = $();
	if (!$doc.data('karmic_flow_init_controller')) {
		$doc.data('karmic_flow_init_controller', 1);

		$doc.bind('click', function(e){
			var el = e.target,
				$el = $(el),
				target_container = $(el).attr('target');
			
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

				$slider.stop().animate({
					marginLeft: -1 * $found_slide.width() * index
				}, 300, function(){
					$slider.removeClass(opts.sliding);	
				});
				return false;
			}
			// next button, flawed, should use current selected or will be off
			else if ($el.hasClass(opts.next) || $el.hasClass(opts.prev)) {
				playSlide(el);
				return false;
			}
			
			// play button
			else if ($el.hasClass(opts.play)) {
				interval = setInterval(function(){
					playSlide(el, true);
				}, opts.timer);
				return false;
			}
			// pause button
			else if ($el.hasClass(opts.pause)) {
				clearInterval(interval);
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