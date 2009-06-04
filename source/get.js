Karma.extend(Karma, {

	getScript: function(opts) {
		
		opts = Karma.extend({
			type: 'script',
			callback: function(){}					
		}, opts);
	
		var counter = 0;
		
		// getting the scripts after onDOMready
		// reason: if you want to insert the script before onDOMready, please use HTML instead because you are not loading it on use
		// another reason: IE bombs if before onDOMready
		// why not stick in <HEAD>? Won't work in XML but also cause the bomb in IE above
		Karma(function(){ //onDOMready
			// loop through all the urls
			var $el,
				rand = Math.floor(Math.random()*100000);
			
			for (var i = 0; i < opts.url.length; i++) {
				
				// is it CSS or SCRIPT??
				if (opts.type.toLowerCase() == 'script') {
					$el = document.createElement('SCRIPT');
					$el.type = 'text/javascript';
					$el.src = opts.url[i];
					document.documentElement.appendChild($el);
					$el.onreadystatechange = $el.onload = function(){
						counter++;
						if (counter == opts.url.length) {
							setTimeout(function(){ opts.callback(); }, 40); // weird hack, opera fails if no timeout 
						}
					};
				}
				// we populate all the linked styles first
				/*else if (opts.type.toLowerCase() == 'style') {
					// we use the knowledge the CSS blocks scripts
					$el = Karma('<link type="text/css" rel="stylesheet" href="'+opts.url[i]+'"></link>')[0];
					document.documentElement.appendChild($el);
					$($el).on('load', function(){
						var timer = setInterval(function(){
							if (Karma.temp[rand]) {
								opts.callback();
								clearInterval(timer);
							}
						}, 88);
					
					});
				}*/
			}
			// then we add a script, once the script fires, it means the linked style has been loaded
			/*if (opts.type.toLowerCase() == 'style') {
				$el = document.createElement('SCRIPT');
				$el.innerHTML = 'Karma.temp['+rand+'] = true;';
				document.documentElement.appendChild($el);
					
				var timer = setInterval(function(){
					if (Karma.temp[rand]) {
						opts.callback();
						clearInterval(timer);
					}
				}, 88);
			}*/
		});
	}
});
		