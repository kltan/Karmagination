// Karma.filter = Sizzle.filter;
// We have Karma.selector.filter (used to be Karma.filter)
// We have Karma.selector.selectors.filters  (used to be Karma.pseudo)
// Karma.pseudo = Sizzle.selectors.filters;

Karma.selector = Sizzle;

// 2 filters below from the jQuery project
Karma.selector.selectors.filters.visible = function(el){
	return el.offsetWidth > 0 || el.offsetHeight > 0;
};

Karma.selector.selectors.filters.hidden = function(el){
	return el.offsetWidth === 0 && el.offsetHeight === 0;
};

Karma.selector.selectors.filters.animated = function(el){
	return Karma(el).data('KarmaFX');
};

})();