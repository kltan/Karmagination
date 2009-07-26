Karma.selector = Sizzle;
Karma.filter = Sizzle.filter;
Karma.pseudo = Sizzle.selectors.filters;

// 2 filters below from the jQuery project
Karma.pseudo.visible = function(el){
	return el.offsetWidth > 0 || el.offsetHeight > 0;
};

Karma.pseudo.hidden = function(el){
	return el.offsetWidth === 0 && el.offsetHeight === 0;
};

Karma.pseudo.animated = function(el){
	return el.KarmaFX;
};

})();