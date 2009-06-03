Karma.extend(Karma, {

	get: function(opts) {
		
		opts = Karma.extend({
			type: 'script',
			callback: function(){}					
		}, opts);
	
		var counter = 0;
		
		// getting the scripts after onDOMready
		// reason: if you want to insert the script before onDOMready, please use HTML instead because you are not loading it on use
		// another reason: IE bombs if before onDOMready
		Karma(function(){ //onDOMready
			// loop through all the urls
			for (var i = 0; i < opts.url.length; i++) {
				// is it CSS or SCRIPT??
				var html = (/css|style|link/.test(opts.type)) ? '<link type="text/css" href="'+opts.url[i]+'">' : '<script type="text/javascript" src="'+opts.url[i]+'"></script>';
				// we append to document.documentElement to make it XML safe
				var $el = Karma(html).appendTo(document.documentElement);
				
				// cross-browser compatibiilty with exception of Safari 2, which I don't support :-|)
				// this will fire the callback after all the URLs have been completely loaded
				$el[0].onreadystatechange = $el[0].onload = function(){
					counter++;
					if (counter == opts.url.length)
						opts.callback();
				};
			}
		});
	}
});
		