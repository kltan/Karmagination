

// 2 filters below from the jQuery project
Karma.pseudo.visible = function(el){
	return el.offsetWidth > 0 || el.offsetHeight > 0;
};

Karma.pseudo.hidden = function(el){
	return el.offsetWidth === 0 && el.offsetHeight === 0;
};

})();