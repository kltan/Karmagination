Karma.fn.extend({

	on: function(str, fn) {
		if (!this.length || !Karma.isString(str) || !Karma.isFunction(fn)) return this;
		
		str = str.split(/\s+/);
	
		for(var j=0; j< str.length; j++) {
			var ns = str[j].split('.');
			for(var i=0; i< this.length; i++) {
				
				this[i].KarmaMap = this[i].KarmaMap || ++Karma.uniqueId;
				Karma.storage[this[i].KarmaMap] = Karma.storage[this[i].KarmaMap] || {};
				
				var $ = Karma.storage[this[i].KarmaMap].KarmaEvent = Karma.storage[this[i].KarmaMap].KarmaEvent || {};
				
				$[ns[0]] = $[ns[0]] || [];

				if (ns.length == 1)
					$[ns[0]].push(fn);

				else if (ns.length == 2)
					$[ns[0]][ns[1]] = fn;

				this[i]['on'+ns[0]] = Karma.event.caller;
			}
		}
		return this;
	},
		
	un: function(str, fn) {
		if (!str || !this.length) return this;
		token = str.split(/\s+/);
		for(var j=0; j< token.length; j++) {
			var ns = token[j].split('.');
			for(var i=0; i< this.length; i++) {

				if (this[i].KarmaMap && Karma.storage[this[i].KarmaMap] && Karma.storage[this[i].KarmaMap].KarmaEvent) {
					var $ = Karma.storage[this[i].KarmaMap].KarmaEvent;
					if (Karma.isFunction(fn)) {
						for (var prop in $[ns[0]])
							if ($[ns[0]][prop] == fn)
								delete $[ns[0]][prop];
					}
					else if (ns.length > 1 && $[ns[0]]) {
						delete $[ns[0]][ns[1]];
					}
					else if($[ns[0]]) {
						this[i]['on'+ns[0]] = null;
						delete $[ns[0]];
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
				}
			}
			// m$ methods
			else if(Karma.support.createEventObject){
				element = (element === document || element === window ) ? document.documentElement : element;
			
				var event = document.createEventObject();
				
				for(var property in properties)
					event[property]=properties[property];
	
				element.fireEvent("on"+eventName, event);
				
			}

		} catch(e){};
		
		return this;
	},
	
	// preventDefault and stopPropagation is not complete for live yet
	// need help on this
	live: function(str, fn){
		var query = this.query;
		var context = this.context.document || this.context;

		return Karma(context).on(str, function(e, el){
			
			var ancestors = [], cur = e.target;
			while(cur !== document) {
				ancestors.push(cur);
				cur = cur.parentNode;
			}
			
			var $ancestors = Karma(ancestors).filter(query);

			if($ancestors.length > 0)
				return fn(e, el);
		});	
	},
	
	die: function(str, fn){
		var context = this.context.document || this.context;
		return Karma().un(str, fn);
	}
});

Karma.extend(Karma.fn, {
	bind: Karma.fn.on,
	unbind: Karma.fn.un,
	trigger: Karma.fn.fire
});

// create events for w3c browser
if(Karma.support.createEvent)
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
}

else
	Karma.event = {};
	
Karma.event.caller = function(e) {
	e = window.event || e;
	
	// some basic normalization of event
	if(!e.stopPropagation && window.event) 
		e.stopPropagation = function(){ window.event.cancelBubble = true; };
	
	if(!e.preventDefault && window.event)
		e.preventDefault = function(){ window.event.returnValue = false; };
		
	if(!e.target && e.srcElement)
		e.target = e.srcElement;
		
	if(e.type == 'mouseover' && !e.relatedTarget)
         e.relatedTarget = e.fromElement;

	else if(e.type == 'mouseout' && !e.relatedTarget)
		e.relatedTarget = e.toElement;
		
	if(!e.keyCode && e.charCode)
		e.keyCode = e.charCode;
		
	if(e.wheelDelta) {
		e.wheelDiff = e.wheelDelta/120;
		if(window.opera)
			e.wheelDiff = -e.wheelDiff;
	}
	else if (e.detail)
		e.wheelDiff = -e.detail/3;
		
		
	if(this.KarmaMap && Karma.storage[this.KarmaMap].KarmaEvent && Karma.storage[this.KarmaMap].KarmaEvent[e.type]) {
		for(var functions in Karma.storage[this.KarmaMap].KarmaEvent[e.type]) {
			if(Karma.storage[this.KarmaMap].KarmaEvent[e.type][functions](e, this) === false) {
				e.stopPropagation();
				e.preventDefault();	
			}
		}
	}
}

