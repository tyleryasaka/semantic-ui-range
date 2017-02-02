/*!
 * # Range slider for Semantic UI.
 * 
 */
 
;(function ( $, window, document, undefined ) {

"use strict";

$.fn.range = function(parameters) {

	var
		$allModules    = $(this),
		
		offset         = 10,
		
		query          = arguments[0],
    methodInvoked  = (typeof query == 'string'),
    queryArguments = [].slice.call(arguments, 1)
	;
	
  $allModules
    .each(function() {
			var
				settings          = ( $.isPlainObject(parameters) )
					? $.extend(true, {}, $.fn.range.settings, parameters)
					: $.extend({}, $.fn.range.settings),

				namespace       = settings.namespace,
				min             = settings.min,
				max             = settings.max,
				step            = settings.step,
				start           = settings.start,
				input           = settings.input,
				values 			= settings.values,

				eventNamespace  = '.' + namespace,
				moduleNamespace = 'module-' + namespace,

				$module         = $(this),

				element         = this,
				instance        = $module.data(moduleNamespace),
				
				inner,
				thumb,
				rthumb,
				thumbpos,
				rthumbpos,
				thumbval,
				rthumbval,
				trackLeft,
				precision,
				module
			;
			module = {
				
				initialize: function() {
					module.sanitize();
					module.instantiate();
					$(window).resize(function() {
						module.instantiate();
					});
				},
				
				instantiate: function() {
					instance = module;
					$module
						.data(moduleNamespace, module)
					;
					if (settings.values) {
						$(element).html("<div class='inner'><div class='track'></div><div class='track-fill'></div><div class='thumb'></div><div class='thumb'></div></div>");
						inner = $(element).children('.inner')[0];
						thumb = $(element).find('.thumb')[0];
						rthumb = $(element).find('.thumb')[1];
						trackLeft = $(element).find('.track-fill')[0];
						// find precision of step, used in calculating the value
						module.determinePrecision();
						// set start location
						if (settings.start.length) {
							if (settings.start[0] >= settings.values[0] && settings.start[0] <= settings.values[1]
								&& settings.start[1] >= settings.values[0] && settings.start[1] <= settings.values[1]) {
								thumbval = settings.start[0];
								rthumbval = settings.start[1];
							} else {
								thumbval = settings.values[0];
								rthumbval = settings.values[1];
							}
						}
						settings.min = settings.values[0];
						settings.max = settings.values[1];	
						module.setValuePosition(thumbval, thumb);
						module.setValuePosition(rthumbval, rthumb);
						$(thumb).on('mousedown', function(event, originalEvent) {
							module.rangeMousedown(event, false, originalEvent, thumb);
						});
						$(thumb).on('touchstart', function(event, originalEvent) {
							module.rangeMousedown(event, true, originalEvent, thumb);
						});
						$(rthumb).on('mousedown', function(event, originalEvent) {
							module.rangeMousedown(event, false, originalEvent, rthumb);
						});
						$(rthumb).on('touchstart', function(event, originalEvent) {
							module.rangeMousedown(event, true, originalEvent, rthumb);
						});
					} else {
						$(element).html("<div class='inner'><div class='track'></div><div class='track-fill'></div><div class='thumb'></div></div>");
						thumb = $(element).find('.thumb')[0];
						inner = $(element).children('.inner')[0];
						trackLeft = $(element).find('.track-fill')[0];
						// find precision of step, used in calculating the value
						module.determinePrecision();
						// set start location
						module.setValuePosition(settings.start, thumb);
						// event listeners
						$(element).find('.track, .thumb, .inner').on('mousedown', function(event) {
							event.stopImmediatePropagation();
							event.preventDefault();
							$(this).closest(".range").trigger('mousedown', event);
						});
						$(element).find('.track, .thumb, .inner').on('touchstart', function(event) {
							event.stopImmediatePropagation();
							event.preventDefault();
							$(this).closest(".range").trigger('touchstart', event);
						});
						$(element).on('mousedown', function(event, originalEvent) {
							module.rangeMousedown(event, false, originalEvent, thumb);
						});
						$(element).on('touchstart', function(event, originalEvent) {
							module.rangeMousedown(event, true, originalEvent, thumb);
						});
					}
				},

				sanitize: function() {
					//
					if (values) {
						if (typeof settings.values[0] != 'number' || typeof settings.values[1] !== 'number') {
							settings.values[0] = parseInt(settings.values[0]) || false;
							settings.values[1] = parseInt(settings.values[1]) || false;
							if (settings.values[0] === false || settings.values[1] === false) {
								settings.values = false;
								console.log("Invalid value input");
							}
						}
						if (settings.start.length && settings.start[0] !== 'number' ||
								settings.start[1] !== 'number') {
							settings.start[0] = parseInt(settings.start[0]) || settings.values[0];
							settings.start[1] = parseInt(settings.start[1]) || settings.values[1];
							if (settings.start[0] === false || settings.start[1] === false) {
								settings.start = false;
							} else if (settings.start[0] > settings.start[1]) {
								settings.start = false;
								console.log("Invalid start array input");
							}
						}
					} else {
						if (typeof settings.min != 'number') {
							settings.min = parseInt(settings.min) || 0;
						}
						if (typeof settings.max != 'number') {
							settings.max = parseInt(settings.max) || false;
						}
						if (typeof settings.start != 'number') {
							settings.start = parseInt(settings.start) || 0;
						}
					}
				},
 
				determinePrecision: function() {
					var split = String(settings.step).split('.');
					var decimalPlaces;
					if(split.length == 2) {
						decimalPlaces = split[1].length;
					} else {
						decimalPlaces = 0;
					}
					precision = Math.pow(10, decimalPlaces);
				},
				
				determineValue: function(startPos, endPos, currentPos) {
					var ratio = (currentPos - startPos) / (endPos - startPos);
					var range = settings.max - settings.min;

					var difference = Math.round(ratio * range / step) * step;
					// Use precision to avoid ugly Javascript floating point rounding issues
					// (like 35 * .01 = 0.35000000000000003)
					difference = Math.round(difference * precision) / precision;
					return difference + settings.min;
				},

				determinePosition: function(value, ctrl) {
					var ratio = (value - settings.min) / (settings.max - settings.min);
					//Don't bother with trackLeft position when setting position of right thumb
					if (ctrl === rthumb) {
						return Math.round(ratio * $(inner).width());
					} else {
						return Math.round(ratio * $(inner).width()) + $(trackLeft).position().left - offset;
					}
				},

				setValue: function(newValue) {
					if(settings.input) {
						$(settings.input).val(newValue);
					}
					if(settings.onChange && settings.values) {
						settings.onChange(thumbval, rthumbval);
					} else if (settings.onChange) {
						settings.onChange(newValue);
					}
				},

				getValue: function(cb) {
					if (settings.values) {
						cb([thumbval, rthumbval]);
					} else {
						cb(thumbval);
					}
				},

				setPosition: function(value, ctrl) {
					if (settings.values) {
						if (ctrl === rthumb) {
							rthumbpos = value;
						} else {
							thumbpos = value;
						}
						$(ctrl).css({left: String(value) + 'px'});
						$(trackLeft).css({
							left: String(thumbpos + offset) + 'px', 
							width: String(rthumbpos + offset - thumbpos) + 'px'
						});
					} else {
						$(ctrl).css({left: String(value) + 'px'});
						$(trackLeft).css({width: String(value + offset) + 'px'});
					}
				},

				rangeMousedown: function(mdEvent, isTouch, originalEvent, ctrl) {
					if( !$(element).hasClass('disabled') ) {
						mdEvent.preventDefault();
						var left = $(inner).offset().left;
						var right = left + $(inner).width();
						var pageX;
						if(isTouch) {
							pageX = originalEvent.originalEvent.touches[0].pageX;
						} else {
							pageX = (typeof mdEvent.pageX != 'undefined') ? mdEvent.pageX : originalEvent.pageX;
						}
						var value = module.determineValue(left, right, pageX);
						if(pageX >= left && pageX <= right) {
							module.setPosition(pageX - left - offset, ctrl);
							if (ctrl === rthumb) {
								rthumbval = value;
							} else {
								thumbval = value;
							}
							module.setValue(value);
						}
						var rangeMousemove = function(mmEvent) {
							mmEvent.preventDefault();
							if(isTouch) {
								pageX = mmEvent.originalEvent.touches[0].pageX;
							} else {
								pageX = mmEvent.pageX;
							}
							value = module.determineValue(left, right, pageX);
							if(pageX >= left && pageX <= right) {
								if (ctrl === rthumb) {
									rthumbval = value;
								} else {
									thumbval = value;
								}
								module.setPosition(pageX - left - offset, ctrl);
								module.setValue(value);
							} else {
								var pos;
								if (pageX <= left) {
									value = settings.min;
									pos = -offset;
								} else if (pageX >= right) {
									value = settings.max;
									pos = right - left - offset;
								}
								if (ctrl === rthumb) {
									rthumbval = value;
								} else {
									thumbval = value;
								}
								module.setPosition(pos, ctrl);
								module.setValue(value);
							} 
						}
						var rangeMouseup = function(muEvent) {
							if(isTouch) {
								$(document).off('touchmove', rangeMousemove);
								$(document).off('touchend', rangeMouseup);
							} else {
								$(document).off('mousemove', rangeMousemove);
								$(document).off('mouseup', rangeMouseup);
							}
						}
						if(isTouch) {
							$(document).on('touchmove', rangeMousemove);
							$(document).on('touchend', rangeMouseup);
						}
						else {
							$(document).on('mousemove', rangeMousemove);
							$(document).on('mouseup', rangeMouseup);
						}
					}
				},
				
				setValuePosition: function(val, ctrl) {
					var position = module.determinePosition(val, ctrl);
					module.setPosition(position, ctrl);
					module.setValue(val, ctrl);
				},
				
				invoke: function(query) {
					switch(query) {
						case 'set value':
							if(queryArguments.length > 0) {
								instance.setValuePosition(queryArguments[0]);
							}
							break;
						case 'get value':
							if(queryArguments.length > 0) {
								instance.getValue(queryArguments[0]);
							}
							break;
					}
				},
			
			};
			
      if(methodInvoked) {
        if(instance === undefined) {
          module.initialize();
        }
        module.invoke(query);
      }
      else {
        module.initialize();
      }
			
    })
  ;
  
  return this;

};

$.fn.range.settings = {

  name         : 'Range',
  namespace    : 'range',

	min          : 0,
	max          : false,
	step         : 1,
	start        : 0,
	values 		 : false,
	input        : false,
	
	onChange     : function(value){},

};


})( jQuery, window, document );
