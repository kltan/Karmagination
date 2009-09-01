// Remember Karma.Sizzle = Sizzle;

// 2 filters below from the jQuery project
Karma.Sizzle.selectors.filters.visible = function(el){
	return el.offsetWidth > 0 || el.offsetHeight > 0;
};

Karma.Sizzle.selectors.filters.hidden = function(el){
	return el.offsetWidth === 0 && el.offsetHeight === 0;
};

Karma.Sizzle.selectors.filters.animated = function(el){
	return Karma(el).data('KarmaFX');
};

})();