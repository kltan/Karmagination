Karma.extend(Karma, {

	ajax: function(o) {
		
		o = Karma.extend({
			type: 'GET',
			data: '',
			url: '',
			loading: function(){},
			success: function(){},
			error: function(){}
		 }, o);
	
		var oXHR = window.XMLHttpRequest? new XMLHttpRequest(): new ActiveXObject("Microsoft.XMLHTTP");
		
		if (oXHR === null || oXHR === undefined)
			return;
		
		oXHR.onreadystatechange=function(){
			try {
				if (oXHR.readyState==4 && !o.successDone){
					o.success.call(window, oXHR.responseText);
					o.successDone = true;
				}
				
				if (oXHR.status!=200 && !o.errorDone) {
					o.error.call(window, oXHR.responseText);
					o.successDone = true;
					o.errorDone = true;
				}
			}
			catch(e) {};
		}
		
		o.loading();
		oXHR.open(o.type, o.url, true);
		oXHR.send(null);
	}

});