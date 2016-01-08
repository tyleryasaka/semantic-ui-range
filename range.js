/*!
 * # Range slider for Semantic UI.
 * 
 */
 
;(function ( $, window, document, undefined ) {

"use strict";

$.fn.range = function(parameters) {

	var
		$allModules    = $(this),
		
		offsetCenter   = 10 // should be half of the size of the slider thumb
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
				start           = settings.start,
				input           = settings.input,

				eventNamespace  = '.' + namespace,
				moduleNamespace = 'module-' + namespace,

				$module         = $(this),

				element         = this,
				instance        = $module.data(moduleNamespace),
				
				module
			;
			
			module = {
				
				initialize: function() {
					module.instantiate();
				},
				
				instantiate: function() {
					instance = module;
					$module
						.data(moduleNamespace, module)
					;
					$(element).html("<div class='inner'><div class='track'></div><div class='track-left'></div><div class='thumb'></div></div>");
					// set start location
					var position = module.determinePosition($(element).width() - offsetCenter);
					module.setPosition(position);
					module.setValue(settings.start);
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
						module.rangeMousedown(event, false, originalEvent);
					});
					$(range).on('touchstart', function(event, originalEvent) {
						module.rangeMousedown(event, true, originalEvent);
					});
				},
				
				determineValue: function(startPos, endPos, currentPos) {
					var ratio = (currentPos - startPos) / (endPos - startPos);
					var range = settings.max - settings.min;
					return Math.round(ratio * range) + settings.min;
				},

				determinePosition: function(range) {
					var ratio = (settings.start - settings.min) / (settings.max - settings.min);
					return Math.round(ratio * range) + settings.min;
				},

				setValue: function(value) {
					if(settings.input) {
						$(settings.input).val(value);
					} else {
						settings.onChange(value);
					}
				},

				setPosition: function(value) {
					$(element).find('.thumb').css({left: String(value) + 'px'});
					$(element).find('.track-left').css({width: String(value) + 'px'});
				},

				rangeMousedown: function(mdEvent, isTouch, originalEvent) {
					mdEvent.preventDefault();
					var dimensions = mdEvent.target.getBoundingClientRect();
					var pageX;
					if(isTouch) {
						pageX = originalEvent.originalEvent.touches[0].pageX;
					} else {
						pageX = (typeof mdEvent.pageX != 'undefined') ? mdEvent.pageX : originalEvent.pageX;
					}
					var value = module.determineValue(dimensions.left, dimensions.right, pageX);
					if(value >= settings.min && value <= settings.max) {
						module.setPosition(pageX - dimensions.left - offsetCenter);
						$(document).css({cursor: 'pointer'});
						module.setValue(value);
						var rangeMousemove = function(mmEvent) {
							mmEvent.preventDefault();
							if(isTouch) {
								pageX = mmEvent.originalEvent.touches[0].pageX;
							} else {
								pageX = mmEvent.pageX;
							}
							value = module.determineValue(dimensions.left, dimensions.right, pageX);
							if( pageX >= dimensions.left && pageX <= dimensions.right) {
								if(value >= settings.min && value <= settings.max) {
									module.setPosition(pageX - dimensions.left - offsetCenter);
									module.setValue(value);
								}
							}
						}
						var rangeMouseup = function(muEvent) {
							$(document).css({cursor: 'auto'});
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
				}
			
			};

			module.initialize();
			
    })
  ;
  
  return this;

};

$.fn.range.settings = {

  name         : 'Range',
  namespace    : 'range',

	min          : 0,
	max          : false,
	start        : 0,
	input        : false,
	
	onChange     : function(value){},

};


})( jQuery, window, document );
