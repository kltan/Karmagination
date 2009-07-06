Karma.extend({

	ajax: function(o) {

		o = Karma.extend({
			type: 'GET',
			data: '',
			url: '',
			contentType: null,
			loading: function(){},
			success: function(){},
			error: function(){},
			XHR: window.XMLHttpRequest? new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTP")
		 }, o);

		if (o.XHR === null || o.XHR === undefined) return;
		
		o.XHR.onreadystatechange=function(){
			try {
				if (o.XHR.readyState === 4 && !o.successDone){
					o.success(o.XHR.responseText);
					o.successDone = true;
				}
				
				if (o.XHR.status!=200 && !o.errorDone) {
					o.error(o.XHR.responseText);
					o.successDone = true;
					o.errorDone = true;
				}
			} catch(e) {};
		}
		
		o.loading();
		o.XHR.open(o.type, o.url, true);
		
		if(o.contentType)
			o.XHR.setRequestHeader("Content-Type", o.contentType);
		
		o.XHR.send(null);
	}

});

