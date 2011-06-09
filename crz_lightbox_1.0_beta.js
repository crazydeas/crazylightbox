(function($) {
	
/* -------------------------------------------------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------------------------------------------------- */

	function get_settings(_this, options)
	{				
		if (!_this[0] || _this.selector === undefined)
			_settings = _default_settings;
		else
			_settings = _this.data('crz_lightbox_settings');
		if (!_settings)
			_settings = $.extend({}, defaults, options)
		return (_settings);
	}

	function create_element(attributes) 
	{
		var new_element = document.createElement(attributes.type);				
		
		if (attributes.id)
			new_element.id = attributes.id;
		if (attributes.class)
			new_element.className = attributes.class;
		if (attributes.src)
			new_element.src = attributes.src;		
		if (attributes.style)
			new_element.style.cssText = attributes.style;		
			
		return $(new_element);		
	}

	function preload_pics(element)
	{
		var loaded_pics = [];
		var tmp_pic;
		var i = 0;
		
		if (_settings.href)
		{
			
			if ($.isArray(_settings.href))
			{
				for (i = 0;i < _settings.href.length; i++)
				{
					loaded_pics[i] = new Image();
					loaded_pics[i].src = _settings.href[i];
				}
			}
			else
			{
				loaded_pics[i] = new Image();
				loaded_pics[i].src = href;
			}
		}
		else if (element)
		{
			$('a[rel="' + element.attr('rel') + '"]').each(function (){ 
				tmp_pic = new Image();
				tmp_pic.src = $(this).attr('href');
				loaded_pics.push(tmp_pic); 
			});
		}
		
		return loaded_pics;	
	}


	function size_converter(size, output, w_h)
	{
		var size_unit;
		var size_num_val = 0;

		if (typeof(size) == 'string' && (size.indexOf('%') > 0 || size.indexOf('px') > 0))
		{
			if (size.indexOf('%') > 0 || output == '%')
			{
				if (w_h == 'w')
					w_h = _overlay.width();
				else if (w_h == 'h')
					w_h = _overlay.height();
				else
					return;
			}

			if (size.indexOf('px') >= 0) {size_unit = 'px';size_num_val = parseInt(size);}
			else if (size.indexOf('%') >= 0) {size_unit = '%';size_num_val = (w_h / 100) * parseInt(size);}					
		}
		else
			size_num_val = parseInt(size);

		if (size_unit != output)
		{
			if (output == 'px')
				size = size_num_val + 'px';
			else if (output == '%')
				size = (((w_h / 100) * size_num_val ) + '%');
			else
				size = size_num_val;
		}

		return size;		
	}
	
/* -------------------------------------------------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------------------------------------------------- */

	var defaults	=	{	//'container'			: false,				// true,
							'href'				: false,					// 
							'preload'			: false,					// true,
							'ajax'				: {},
							
							'limit'				: {'top': 20, 'left': 20},	//false,
							//'minSize'			: false, 					//{'width': 0, 'height': 0},
							'maxSize'			: false, 					//{'width': 0, 'height': 0},
							'fixedSize'			: false, 					//{'width': 0, 'height': 0},

							'class'				: false, 					//{'wrap': '', 'overlay': '', 'lightbox': '', 'content': '', 'content_element': '', 'loading': ''},
							'loading'			: 100, 						// false,
							'buttonClose'		: true,						// false,
							'overlayClose'		: true,						// false,
							'overlayOpacity'	: 0.6,						// 0 - 1,							

							'animation'			: false,					//{'width': 0, 'height': 0, 'top': 0, 'left': 0, 'lightboxSpeed': 0, 'overlaySpeed': 0, 'easing': 'easeInOutBack'}
							'animationOut'		: false,					//{'effect': 'size', 'easing': 'easeInOutBack', 'width': 0, 'height': 0, 'top': 0, 'left': 0, 'lightboxSpeed': 0, 'overlaySpeed': 0}
							'transition'		: false,				//{'lightboxSpeed': 500, 'easing': ''},

							//'onOpen'				: false,			//function(){alert('onOpen')}
							//'onLoad'				: false,			//function(){alert('onLoad')}
							//'onComplete'			: false,			//function(){alert('onComplete')}
							//'onClose'				: false				//function(response){alert(response)}
							
							/* -------------------------------------------------------------- */
							'content_element'		: '',
							'next_method'			: 'init',
							/* -------------------------------------------------------------- */		
						},

	_default_settings,
	_settings = false,				
	
	_this = false,
	_container = false,
	
	_wrap = false,
	_overlay = false,
	_lightbox = false,
	_lightbox_content = false,
	_lightbox_content_element = false,
	_button_close = false,
	_loading = false,
	
	_grouped_picture = false;
	_transition = false,
	_old_size = false,
	
		_lightbox_do_something = false,

/* -------------------------------------------------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------------------------------------------------- */

	_default_styles = {
		'wrap':					'display:none;',
		'overlay':				'position:fixed;width:100%;height:100%;top:0;left:0;z-index:8000;opacity:0;',
		'lightbox':				'position:absolute;z-index:9000;opacity:0;',
		'lightbox_content':		'position:absolute;display:none;',
		'button_close':			'position:absolute;z-index:9500;cursor:pointer;',
		'loading':				'display:none;position:absolute;top:0;left:0;z-index:9500;',
	}
	
	methods = {
		
		build :			function (container)
						{							
							if (_wrap)
								_wrap.remove();
							
							if (!container)
								container = $('body');
			
							container.append(
								_wrap = create_element({'type': 'div', 'id': 'crz_lightbox_wrap', 'style': _default_styles.wrap})
							)
							
							_wrap.append(
								_overlay = create_element({'type': 'div', 'id': 'crz_lightbox_overlay', 'style': _default_styles.overlay}),
								_lightbox = create_element({'type': 'div', 'id': 'crz_lightbox', 'style': _default_styles.lightbox}),
								_loading = create_element({'type': 'div', 'id': 'crz_lightbox_loading', 'style': _default_styles.loading})
							)
							
							_lightbox.append(
								_lightbox_content = create_element({'type': 'div', 'id': 'crz_lightbox_content', 'style': _default_styles.lightbox_content})
							)
							
							return true;
						},

		
		init : 			function (options, go_next_method)
						{
							var overlayStyle;
							var href = '';
							var content_mode = '';

							_settings = $.extend({}, defaults, options)

							if (_settings.preload)
								_settings.preload = preload_pics(this);													
																
							if (!this[0] || this.selector === undefined)
							{
								_default_settings = _settings;
								_default_settings.next_method = 'start';
							}
							else
							{
								this.data('crz_lightbox_settings', _settings);
								this.data('crz_lightbox_settings').next_method = 'start';
							}
							
							if (go_next_method)
								methods.start.apply(this, [options, go_next_method]);
						},

		start :			function (options, go_next_method) 
						{							
							var _this, speed, center;
							_this = this;
		
							_settings = get_settings(_this, options);
		
							_wrap.addClass(_settings.class.wrap);
							_overlay.addClass(_settings.class.overlay);
								center = methods.get_center(_lightbox);
							_lightbox.addClass(_settings.class.lightbox).css(center); 
							_lightbox_content.addClass(_settings.class.content);
								center = methods.get_center(_loading);
							_loading.addClass(_settings.class.loading).css(center);

							_wrap.css({'display': 'block'});

							speed = _settings.animation.overlaySpeed || 0;
							_overlay.animate({'opacity': _settings.overlayOpacity}, speed);

							$(window).resize(function() {
								_lightbox.css(methods.get_center(_lightbox));
								_loading.css(methods.get_center(_loading));
							});
							
							if (!_this[0] || _this.selector === undefined)
								_default_settings.next_method = 'load';
							else
								_this.data('crz_lightbox_settings').next_method = 'load';
							
							if (go_next_method)
								methods.load.apply(this, [options, go_next_method]);
								
						},

		load : 			function (options, go_next_method) 
						{
							
							var _this = this;
							var properties;
							var easing;
							var top = 0;
							var left = 0;
							
							_settings = get_settings(_this, options);

							if (_settings.href)
							{
								if ($.isArray(_settings.href))
									href = _settings.href[0];
								else
									href = _settings.href;							
							}
							else if (_settings.ajax.url)
								href = _settings.ajax.url;
							else if (_this.attr('href'))
								href = _this.attr('href');
							else
							{
								alert('Crazy Lightbox : href error'/*MODIFY*/);
								return _this;
							}
								
							if (_settings.loading)	
								loading = setTimeout(function() {_loading.css({'display' : 'block'});}, _settings.loading);							
	
							// INITIATE MODE
							if (/\.(jpg|jpeg|png|gif|bmp)(?:\?([^#]*))?(?:#(\.*))?$/i.test(href))	
							{
								
								_lightbox_content.append(
									_lightbox_content_element = create_element({'type': 'img', 'id': 'crz_lightbox_picture', 'class': _settings.class.content_element, 'style': '', 'src': href,})
								)
								
								// This function is also called at the end of the transition method.
								_lightbox_content_element.load(function () {

									if (($.isArray(_settings.href) && _settings.href.length > 1)  || $('a[rel="' + _this.attr('rel') + '"]').length > 1)
										_grouped_picture = true;
									
									if (go_next_method || _transition)
										methods.open.apply(_this, [options]);		
								});
								
							}
							// LOAD MODE
							else if (href.indexOf('http://') == -1)
							{
								if ($(href).length > 0)
								{
									_lightbox_content.append($(href).clone());
									if (go_next_method)
										methods.open.apply(_this, [options]);	
								}
								else
								{
									var ajax_request = $.extend({}, _settings.ajax, {
										url	: href,
										error : function(XMLHttpRequest) {
											if (XMLHttpRequest.status == 404)
											{
												
											}
										},
										success : function(data, textStatus, XMLHttpRequest) {
											_lightbox_content.html(data);
											
											var img = _lightbox_content.find('img');
											var img_loaded = 0;
											
											if (img.length > 0)
											{
												img.load(function () {
													if (go_next_method && (++img_loaded == img.length))
														methods.open.apply(_this, [options]);
												});
											}
											else
												if (go_next_method)
													methods.open.apply(_this, [options]);
										}
									})
									
									$.ajax(ajax_request);									
								}
							}
							// IFRAME MODE
							else
							{
								_lightbox_content.append(_lightbox_content_element = create_element({'type': 'iframe', 'id': 'crz_lightbox_content_iframe', 'class': _settings.class.content_element, 'src': href}));
								_lightbox_content_element.attr({'frameborder': 0})

								_lightbox_content_element.load(function () {
									if (go_next_method)
										methods.open.apply(_this, [options]);		
								});
							}
							
							if (!_this[0] || _this.selector === undefined)
								_default_settings.next_method = 'open';
							else
								_this.data('crz_lightbox_settings').next_method = 'open';
						},
						

		open : 			function (options)
						{
							_this = this;
							_settings = get_settings(_this, options);
								
							if (_settings.loading)
							{
								clearTimeout(loading);
								_loading.css({'display' : 'none'});
							}

							if (_lightbox_content_element)
							{	
								_lightbox_content_element[0].style.cssText = '';
								_lightbox_content_element.removeAttr('width').removeAttr('height');
								size = methods.check_size.apply(_this, [_lightbox_content_element, options]);
								if (size.width != _lightbox_content_element[0].width)
									_lightbox_content_element.attr({'width': size.width});
								if (size.height != _lightbox_content_element[0].height)
									_lightbox_content_element.attr({'height': size.height});
							}
							
							if (_transition)
								animation = methods.get_anim.apply(_this, ['transition', options])
							else
								animation = methods.get_anim.apply(_this, ['open', options])
							
							_lightbox_content[0].style.cssText = 'width:100%;height:100%;';
							if (_lightbox_content_element)
								_lightbox_content_element[0].style.cssText = 'width:100%;height:100%;';

							if (animation.hideContent)
								_lightbox_content.css({'display': 'none'});	
							_lightbox.css(animation.css).dequeue().animate(animation.properties, animation.speed, animation.easing, function() {
								
								_transition = false;
								if (animation.hideContent)
									_lightbox_content.css({'display': 'block'});	
								
								if (!_button_close && _settings.buttonClose)
								{
									_lightbox.append(_button_close = create_element({'type': 'A', 'id': 'crz_lightbox_button_close', 'style': _default_styles.button_close}));
									_button_close.unbind('click').one("click", function() {
										methods.close.apply(_this, [options]);
									});
								}
								
								if (_settings.overlayClose)
								{
									_overlay.css({'cursor': 'pointer'}).unbind('click').one("click", function() {
										methods.close.apply(_this, [options]);
									});
								}
									
								$(document).keydown(function(e) {
									switch (e.keyCode) {	
										case 27: e.preventDefault(); methods.close.apply(_this, [options]); break;
										case 37 /*|| 100*/: if (_grouped_picture) {e.preventDefault(); $(document).unbind('keydown'); methods.transition.apply(_this,['prev', options]);} break;
										case 100: if (_grouped_picture) {e.preventDefault(); $(document).unbind('keydown'); methods.transition.apply(_this,['prev', options]);} break;
										case 39 /*|| 102*/: if (_grouped_picture) {e.preventDefault(); $(document).unbind('keydown'); methods.transition.apply(_this, ['next', options]);} break;
										case 102: if (_grouped_picture) {e.preventDefault(); $(document).unbind('keydown'); methods.transition.apply(_this, ['next', options]);} break;
									}
								});

								if (_lightbox_content_element)
									_lightbox_content_element.unbind('click').one('click', function () {
										if (_grouped_picture) {methods.transition.apply(_this, ['next', options]);}
									});
	
								if (!_this[0] || _this.selector === undefined)
									_default_settings.next_method = 'close';
								else
									_this.data('crz_lightbox_settings').next_method = 'close';
								
							});
						},
						

		close :			function (options)
						{
							_this = this;
							_settings = get_settings(_this, options);
							
							_button_close.css({'display': 'none'});
							_grouped_picture = false;

							animation = methods.get_anim.apply(_this, ['close', options]);
							
							if (animation.hideContent)
								_lightbox_content.css({'display': 'none'});
							
							_lightbox.dequeue().animate(animation.properties, animation.speed , animation.easing, function() {
								methods.clean();
								_old_size = false;		
							});
							
							speed = _settings.animation.overlaySpeed || 0;
							_overlay.animate({'opacity': 0}, speed);	
							
							if (!_this[0] || _this.selector === undefined)
								_default_settings.next_method = 'init';
							else
								_this.data('crz_lightbox_settings').next_method = 'start';
						},
		
/* -------------------------------------------------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------------------------------------------------- */

		get_anim :		function (type, options) 
						{
							var anim_opt;
							var changed = true;
							var animation = {'css': {}, 'properties': {}, 'speed': 0, 'easing': '', 'hideContent': false};
							
							_this = this;
							_settings = get_settings(_this, options);
							
							content_size = methods.check_size.apply(_this, [_lightbox_content, options]);
							
							if (_old_size && type != 'close')
								changed = (_old_size.width != content_size.width || _old_size.height != content_size.height);
								
							full_size = {
								'width': content_size.width + (_lightbox.innerWidth() - _lightbox.width()),
								'height': content_size.height + (_lightbox.innerHeight() - _lightbox.height())
							}
							center = methods.get_center.apply(_this, [full_size ,options]);

							if (type == 'open' || type == 'transition')
							{
								modify = 'css';
								animation.properties = {'width': content_size.width, 'height': content_size.height, 'top': center.top, 'left': center.left, 'opacity': 1};
								if (type == 'open')
								{
									animation.css = {'width': 0,'height': 0};
									if (_settings.animation)
										anim_opt = _settings.animation;
								}
								else if (type == 'transition' && _settings.transition)
									anim_opt = _settings.transition;
							}
							else if (type == 'close')
							{
								modify = 'properties';
								animation.properties = {'width': 0, 'height': 0, 'opacity': 0};
								if (_settings.animationOut)
									 anim_opt = _settings.animationOut;	
								else if (!_settings.animationOut && _settings.animation)
									 anim_opt = _settings.animation;
							}
							
							if (anim_opt)
							{

								size = {'width': 0,'height': 0};
								
								if (anim_opt.width || anim_opt.width >= 0)
								{
									if (anim_opt.width == 'fit')
										size.width = animation[modify]['width'] = content_size.width;
									else
										size.width = animation[modify]['width'] = anim_opt.width;
								}
								if (anim_opt.height || anim_opt.height >= 0)
								{
									if (anim_opt.height == 'fit')
										size.height = animation[modify]['height'] = content_size.height;
									else
										size.height = animation[modify]['height'] = anim_opt.height;	
								}
								
								full_size = {
									'width': size.width + (_lightbox.innerWidth() - _lightbox.width()),
									'height': size.height + (_lightbox.innerHeight() - _lightbox.height())
								}
								
								center = methods.get_center.apply(_this, [full_size, options]);
								
								if (anim_opt.top >=0)
									animation[modify]['top'] = anim_opt.top;
								else if (type != 'transition' || animation[modify]['height'])
									animation[modify]['top'] = center.top;

								if (anim_opt.left >=0)
									animation[modify]['left'] = anim_opt.left;
								else if (type != 'transition' || animation[modify]['width'])
									animation[modify]['left'] = center.left;
									
								if (anim_opt.fade)
									animation[modify]['opacity'] = 0;
									
								if (anim_opt.easing && $.ui)
									animation.easing = anim_opt.easing;

								if (anim_opt.lightboxSpeed)
									if (changed || anim_opt.fade)
										animation.speed = anim_opt.lightboxSpeed;
									
								if (anim_opt.hideContent)
									animation.hideContent = true;
							}

							_old_size = content_size;
							
							return animation;						
						},

		get_center : 	function (element, options)
						{
							var center, size, limit;
							
							_settings = get_settings(this, options);

							if (element[0])
								size =  {'width': element.width(), 'height': element.height()};
							else
								size =  {'width': element.width, 'height': element.height};

							if (_container)
								center = {'top': ((_container.height() - size.height) / 2), 'left': ((_container.width() - size.width) / 2)};
							else
								center = {'top': ((($(window).height() - size.height) / 2) + $(window).scrollTop()), 'left': (($(window).width() - size.width) / 2)};

							limit = size_converter(_settings.limit.top, null, 'h');
							if (center.top < limit)
								center.top = limit;
							
							limit = size_converter(_settings.limit.left, null, 'w');
							if (center.left < limit)
								center.left = limit;
								
							return center;
						},
						
		check_size :	function (element, options)
						{
							var max_size;
							
							_settings = get_settings(this, options);

							if (element[0])
							{
								if (element[0].tagName == 'IMG')
									var size =  {'width': element[0].width, 'height': element[0].height};
								else	
									var size =  {'width': element.width(), 'height': element.height()};
							}
							else
								var size =  {'width': element.width, 'height': element.height};
								
							if (_settings.fixedSize.width)
								size.width = size_converter(_settings.fixedSize.width, null, 'w');
							else if (_settings.maxSize.width)
							{
								max_size = size_converter(_settings.maxSize.width, null, 'w')
								if (size.width > max_size)
									size.width = max_size;
							}
							
							if (_settings.fixedSize.height)
								size.height = size_converter(_settings.fixedSize.height, null, 'h');
							else if (_settings.maxSize.height)
							{
								max_size = size_converter(_settings.maxSize.height, null, 'h')
								if (size.height > max_size)
									size.height = max_size;		
							}
							
							return size;
						},
		
		transition :	function (direction, options)
						{
							_this = this;
							_settings = get_settings(_this, options);
							
							var current_src = _lightbox_content_element.attr('src');
							var length = 0;
							var pics = [];
							var tmp_src;
					
							if (_settings.preload)
								length = _settings.preload.length;
							else if (_settings.href)
							{
								length = _settings.href.length;
							}
							else if (_this)
							{
								$('a[rel="' + $(_this).attr('rel') + '"]').each(function (){ pics.push($(this).attr('href')); });	
								length = pics.length;
							}
					
							for (i = 0;i < length; i++)
							{
								tmp_src = $(_settings.preload[i]).attr('src') || _settings.href[i] || pics[i];
								if (current_src == tmp_src)
								{
									if (direction == 'next')
									{
										direction = i + 1;
										if (i == length - 1)
										direction = 0;
									}
									else
									{
										direction = i - 1;
										if (i == 0)
										direction = length - 1;
									}

									_button_close.remove();
									_button_close = false;
									_lightbox_content[0].style.cssText = _default_styles.lightbox_content;
										
									if (_settings.loading)	
										loading = setTimeout(function() {_loading.css({'display' : 'block'});}, _settings.loading);	

									_transition = true;
									
									if (_settings.preload)
										_lightbox_content_element[0].src = $(_settings.preload[direction]).attr('src');
									else if (_settings.href)
										_lightbox_content_element[0].src = _settings.href[direction];
									else if (_this)
										_lightbox_content_element[0].src = pics[direction];				
								}
							}
							
							return true;
						},
						
		clean :			function () 
						{
							if (_lightbox_content_element)
								_lightbox_content_element.unbind('click').remove();
							if (_button_close)
							{
								_button_close.unbind('click').remove();	
								_button_close = false;
							}
								
							_wrap[0].style.cssText = _default_styles.wrap;
							_overlay[0].style.cssText = _default_styles.overlay;
							_lightbox[0].style.cssText = _default_styles.lightbox;
							
							_loading[0].style.cssText = _default_styles.loading;
							_lightbox_content[0].style.cssText = _default_styles.lightbox_content;
							_lightbox_content.html('');
							
							$(document).unbind('keydown');

							return true;
						},									

	  };
	  
/* -------------------------------------------------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------------------------------------------------- */
	 
	/* MAIN FUNCTION WITH SELECTOR */
	$.fn.crz_lightbox = function (method) {
		if (!this[0] && this.selector)
		{
			alert('Crazy Lightbox : The selector "' + this.selector + '" does not exist');
			return this;
		}		
		else
		{
			var args = Array.prototype.slice.call(arguments);
			if (args.length == 0)
				args[0] = null;
			args[args.length] = false;
			
			return this.each(function () {
				var _this = $(this);
				
				if ( methods[method] ) 
				{
					args.shift();
				  	methods[method].apply( _this, args);
				} 
				else if ( typeof(method) === 'object' || !method ) 
				{
					args[args.length - 1] = true;
					
					if (_this[0].tagName == 'A')
					{
						_this.click(function(e) {
							e.preventDefault();
							if (_this.data('crz_lightbox_settings'))
								var go_method = _this.data('crz_lightbox_settings').next_method;
							else
								var go_method = 'init';	
													
							methods[go_method].apply(_this, args);
						});
					}
					else
					{
						if (_this.data('crz_lightbox_settings'))
							var go_method = _this.data('crz_lightbox_settings').next_method;
						else
							var go_method = 'init';
						methods[go_method].apply(_this, args);
					}
				} 
				else 
				{
				  $.error('Crazy Lightbox : Method "' +  method + '" does not exist.');
				}
			});
		}
	}
	
	// MAIN FUNCTION WITHOUT SELECTOR 
	$.crz_lightbox = function (method) {
		
		var args = Array.prototype.slice.call(arguments);
		if (args.length == 0)
			args[0] = null; 
		args[args.length] = false;	
	
		if ( methods[method] )
		{
			args.shift();
			return methods[method].apply( null, args);
		}
		else if ( typeof(method) === 'object' || !method ) 
		{	
			if (_default_settings)
				var go_method = _default_settings.next_method;
			else
				var go_method = 'init';
	
			args[args.length - 1] = true;
			return methods[go_method].apply(null, args);
		} 
		else 
			$.error('Crazy Lightbox : Method "' +  method + '" does not exist.');
	}
	
	$(document).ready(function() {
		methods.build.apply(this);
	});
	
})(jQuery);	