Karma.extend(Karma.fn, {

	on: function(str, fn) {
		str = str.split(/\s+/);
	
		for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			for(var i=0; i< this.length; i++) {
				
				var $ = this[i];
				var first = false;

				$.KarmaEvent = $.KarmaEvent || {};
				
				if(!$.KarmaEvent[ns[0]]) {
					$.KarmaEvent[ns[0]] = [];
					first = true;
				}
					
				if (ns.length == 1)
					$.KarmaEvent[ns[0]].push(fn);

				else if (ns.length == 2)
					$.KarmaEvent[ns[0]][ns[1]] = fn;

				try {
					$['on'+ns[0]] = Karma.event.caller;
				} catch(e){};
			}
		}
		Karma.event.functions.push(fn);
		return this;
	},
		
	un: function(str, fn) {
		token = str.split(/\s+/);
		
		for(var j=0; j< token.length; j++) {
			var ns = token[j].split('.');
			for(var i=0; i< this.length; i++) {
				var $ = this[i];
				
				if ($.KarmaEvent) {
					if (Karma.trim(str).length == 0) {
						delete $['KarmaEvent'];
					}
					
					else if (Karma.isFunction(fn)) {
						for (var prop in $.KarmaEvent[ns[0]])
							if ($.KarmaEvent[ns[0]][prop] == fn)
								delete $.KarmaEvent[ns[0]][prop];
					}
					else if (ns.length>1 && $.KarmaEvent[ns[0]]) {
						delete $.KarmaEvent[ns[0]][ns[1]];
					}
					else if($.KarmaEvent[ns[0]]) {
						try {
							Karma.support.addEventListener ? $['removeEventListener'](ns[0], contextScoper, false): $['detachEvent']('on'+ns[0], contextScoper);
						} catch(e){};
						delete $['KarmaEvent'][ns[0]];
					}
				}
			}
		}
		return this;
	},
	
	
	
	fire: function(eventName) {
		
		try {
			for(var i=0; i<this.length; i++)
				var element = this[i];

			// W3C compatible browsers
			if(Karma.support.createEvent){
				
				// Safari 3 doesn't have window.dispatchEvent()
				if(!element.dispatchEvent)
					element=document; 
				
				var curEvent= Karma.event[eventName];
				
				if(curEvent){
					var event = document.createEvent(curEvent.type);
					curEvent.init(event, {});
					element.dispatchEvent(event);
					return true;
				}
			}
			// m$, wow easier! one of the odd moments in javascript
			else if(Karma.support.createEventObject){
				element = (element === document || element === window ) ? document.documentElement : element;
			
				var event = document.createEventObject();
				
				for(var property in properties)
					event[property]=properties[property];
	
				element.fireEvent("on"+eventName, event);
				
				return true;
			}

		}
		catch (e){ return false; }
		return this;
	},
	
	live: function(str, fn){
		Karma(document).on(str, function(e){
			var ancestors = [], cur = e.target;
			while(cur !== window) {
				ancestors.push(cur);
				cur = cur.parentNode;
			}
			
			if(Karma(cur).filter(this.query).length > 0){
				fn.call(e.target, e);				
			}
		});	
	},
	
	die: function(str, fn){
		Karma().un(str, fn);
	}
});

Karma.extend(Karma.fn, {
	bind: Karma.fn.on,
	unbind: Karma.fn.un
});

// create events for w3c browser
if(Karma.support.createEvent) {
	Karma.event = {
		load:{
			type:"HTMLEvents",
			init: function(e){
				e.initEvent("load",false,false);
			}
		},
		
		unload:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("unload",false,false);
			}
		},
		
		select:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("select",true,false);
			}
		},
		
		change:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("change",true,false);
			}
		},
		
		submit:{
			type:"HTMLEvents",
			init:function(e,p){
				e.initEvent("submit",true,true);
			}
		},
		
		reset:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("reset",true,false);
			}
		},
		
		resize:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("resize",true,false);
			}
		},
		
		scroll:{
			type:"HTMLEvents",
			init:function(e){
				e.initEvent("scroll",true,false);
			}
		},
		
		click:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("click",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		dblclick:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("click",true,true,window,2,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		mousedown:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("mousedown",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		mouseup:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("mouseup",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		mouseover:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("mouseover",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		mousemove:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("mousemove",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		mouseout:{
			type:"MouseEvents",
			init:function(e,p){
				e.initMouseEvent("mouseout",true,true,window,1,p.screenX||0,p.screenY||0,p.clientX||0,p.clientY||0,p.ctrlKey||false,p.altKey||false,p.shiftKey||false,p.metaKey||false,p.button||0,p.relatedTarget||null);
			}
		},
		
		focusin:{
			type:"UIEvents",
			init:function(e){
				e.initUIEvent("focusin",true,false,window,1);
			}
		},
		
		focusout:{
			type:"UIEvents",
			init:function(e){
				e.initUIEvent("focusout",true,false,window,1);
			}
		},
		
		activate:{
			type:"UIEvents",
			init:function(e){
				e.initUIEvent("activate",true,true,window,1);
			}
		},
		
		focus:{
			type:"UIEvents",
			init:function(e){
				e.initUIEvent("focus",false,false,window,1);
			}
		},
		
		blur:{
			type:"UIEvents",
			init:function(e){
				e.initUIEvent("blur",false,false,window,1);
			}
		}
	};
}

Karma.event = Karma.event || {};
Karma.event.functions = [];
Karma.event.caller = function(e) {
	cur = this;
	e = window.event || e;
	e.target ? e.srcElement = e.target: e.target = e.srcElement;

	if(!e.stopPropagation && window.event) 
		e.stopPropagation = function(){ window.event.cancelBubble = true; };
	
	if(!Karma.support.preventDefault && window.event)
		e.preventDefault = function(){ window.event.returnValue = false; };
		
	
	if(cur && cur.KarmaEvent && cur.KarmaEvent[e.type]) {
		for(var functions in cur.KarmaEvent[e.type]) {
			if(cur.KarmaEvent[e.type][functions].call(cur, e) === false) {
				e.stopPropagation();
				e.preventDefault();	
			}
		}
	}
}

// cleaning up all functions that have been attached to a node
Karma(window).on('unload', function(){
	Karma.event.caller = null;
	delete Karma.event.caller;
});