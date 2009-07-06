Karma.extend({

	include: function(opts) {
		
		opts = Karma.extend({
			success: function(){}					
		}, opts);
	
		var counter = 0;
		
		// getting the scripts after onDOMready
		// reason: if you want to insert the script before onDOMready, please use HTML instead because you are not loading it on use
		// another reason: IE bombs if before onDOMready
		Karma(function(){ //onDOMready
			
			var callback = function(){
				counter++;
				if (counter == opts.url.length)
					setTimeout(function(){ opts.success(); }, 40); // weird hack, opera fails if no timeout 
			};
			
			for (var i = 0; i < opts.url.length; i++) {
				var $script = document.createElement('SCRIPT');
				$script.type = 'text/javascript';
				$script.src = opts.url[i];
				document.documentElement.appendChild($script);
				
				if ($script.readyState)
					$script.onreadystatechange = function() {
						if ($script.readyState == "loaded" || $script.readyState == "complete")
							callback();
					};

				else script.onload = function(){
					callback();
				};
			}
		});
	}
});

