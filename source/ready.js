Karma.each( ("blur,focus,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave,change,select,submit,keydown,keypress,keyup,error,hover").split(","), function(i, name){
	// Handle event binding
	Karma.fn[name] = function(fn){
		var args = [name].concat(Karma.makeArray(arguments));
		return arguments.length ? this.bind.apply(this, args) : this.trigger(name);
	};
});

Karma(function first_onload(){ 
	// predetermine boxModel
	if (document.body) {
		var div = document.createElement("div");
		div.style.width = div.style.paddingLeft = "1px";
		document.body.appendChild( div );
		Karma.support.boxModel = div.offsetWidth == 2;
		document.body.removeChild( div ).style.display = 'none';
	}
	// cleaning up the mess	
	Karma(window).bind('unload', function(){ Karma.storage = Karma.event.caller = null });
});