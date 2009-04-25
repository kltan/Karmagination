$hort.extend($hort.fn, {

	on: function(str, fn) {
		str = str.split(/\s+/);
		
		for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			for(var i=0; i< this.length; i++) {
				var $ = this[i];
				var first = false;
				$['$hortEvent'] = $['$hortEvent'] || {};
				if(!$['$hortEvent'][ns[0]]) {
					$['$hortEvent'][ns[0]] = [];
					first = true;
				}
				
				var caller = function(e){
					alert($['$hortEvent'][ns[0]].length);
					for (var fnStack in $['$hortEvent'][ns[0]])
						if (fnStack != 0 || fnStack != '0')
							$['$hortEvent'][ns[0]][fnStack].call($, e);
				};
				
				if(first)
					$['$hortEvent'][ns[0]].push(caller);
				
				if (ns.length == 1) {
					$['$hortEvent'][ns[0]].push(fn);
				}
				else if (ns.length == 2) {
					$['$hortEvent'][ns[0]][ns[1]] = fn;
				}
				
				if (first) {
					if($.addEventListener)
						$.addEventListener(ns[0], caller, false);
						
					else if($.attachEvent)
						$.attachEvent('on'+ns[0], caller);
				}
			}
		}

		return this;
	},
	
	un: function(str, fn) {
		str = str.split(' ');
		
		for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			for(var i=0; i< this.length; i++) {
				var $ = this[i];
				
				$['$hortEvent'] = $['$hortEvent'] || {};
				$['$hortEvent'][ns[0]] = $['$hortEvent'][ns[0]] || [];

				if ($hort.isFunction(fn)) {
					for (var prop in $['$hortEvent'][ns[0]])
						if ($['$hortEvent'][ns[0]][prop] == fn)
							delete $['$hortEvent'][ns[0]][prop];
				}
				else if (ns.length>1) 
					delete $['$hortEvent'][ns[0]][ns[1]];
				else {
					$.removeEventListener ? $['removeEventListener'](ns[0], $['$hortEvent'][ns[0]][0], false):	$['detachEvent']('on'+ns[0], $['$hortEvent'][ns[0]][0]);
					delete $['$hortEvent'][ns[0]];
				}
			}
		}

		return this;
	},
	
	fire: function(eventName, properties) {
		properties = properties || {};
		
		try {
			for(var i=0; i<this.length; i++)
				var element = this[i];

			// W3C compatible browsers
			if(document.createEvent){
				
				if(!element.dispatchEvent)
					element=document; // Safari3 doesn't have window.dispatchEvent()
				
				var curEvent= $hort.event[eventName];
				if(curEvent){
					var event = document.createEvent(curEvent.eventGroup);
					curEvent.init(event,properties);
					element.dispatchEvent(event);
					return true;
				}
			}
			// m$, wow easier! one of the odd moments in javascript
			else if(document.createEventObject){
				element = (element===document || element===window )? document.documentElement : element;
			
				var event = document.createEventObject();
				
				for(var property in properties)
					event[property]=properties[property];
	
				element.fireEvent("on"+eventName, event);
				
				return true;
			}

		}
		catch (e){ return false; }
		return this;
	}
});

// for w3c browser, we can create events
$hort.event = {}; $hort.extend($hort.event, {
	focusin:{eventGroup:"UIEvents",init:function(e,p){e.initUIEvent("focusin",true,false,window,1);}},
	focusout:{eventGroup:"UIEvents",init:function(e,p){e.initUIEvent("focusout",true,false,window,1);}},
	activate:{eventGroup:"UIEvents",init:function(e,p){e.initUIEvent("activate",true,true,window,1);}},
	focus:{eventGroup:"UIEvents",init:function(e,p){e.initUIEvent("focus",false,false,window,1);}},
	blur:{eventGroup:"UIEvents",init:function(e,p){e.initUIEvent("blur",false,false,window,1);}},
	click:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("click",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
	dblclick:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("click",true,true,window,2,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
	mousedown:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("mousedown",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
	mouseup:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("mouseup",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
	mouseover:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("mouseover",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
	mousemove:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("mousemove",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
	mouseout:{eventGroup:"MouseEvents",init:function(e,p){e.initMouseEvent("mousemove",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);}},
	load:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("load",false,false);}},
	unload:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("unload",false,false);}},
	select:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("select",true,false);}},
	change:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("change",true,false);}},
	submit:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("submit",true,true);}},
	reset:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("reset",true,false);}},
	resize:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("resize",true,false);}},
	scroll:{eventGroup:"HTMLEvents",init:function(e,p){e.initEvent("scroll",true,false);}}
});