/*!
 * # Range slider for SemanticUI.
 * 
 */
 
;(function ( $, window, document, undefined ) {

"use strict";

$.fn.range = function(parameters) {

	var offsetCenter = 10; // should be half of the size of the slider thumb

	var determineValue = function(startPos, endPos, currentPos, options) {
		var ratio = (currentPos - startPos) / (endPos - startPos);
		var range = options.max - options.min;
		return Math.round(ratio * range) + options.min;
	}

	var determinePosition = function(range, options) {
		var ratio = (options.start - options.min) / (options.max - options.min);
		return Math.round(ratio * range) + options.min;
	}

	var setValue = function(options, value) {
		if(options.input) {
			$(options.input).val(value);
		} else {
			options.callback(value);
		}
	}

	var setPosition = function(element, value) {
		$(element).find('.thumb').css({left: String(value) + 'px'});
		$(element).find('.track-left').css({width: String(value) + 'px'});
	}

	var rangeMousedown = function(mdEvent, isTouch, options, originalEvent) {
		mdEvent.preventDefault();
		var dimensions = mdEvent.target.getBoundingClientRect();
		var pageX;
		if(isTouch) {
			pageX = originalEvent.originalEvent.touches[0].pageX;
		} else {
			pageX = (typeof mdEvent.pageX != 'undefined') ? mdEvent.pageX : originalEvent.pageX;
		}
		var value = determineValue(dimensions.left, dimensions.right, pageX, options);
		if(value >= options.min && value <= options.max) {
			setPosition(mdEvent.target, pageX - dimensions.left - offsetCenter);
			$(document).css({cursor: 'pointer'});
			setValue(options, value);
			var rangeMousemove = function(mmEvent) {
				mmEvent.preventDefault();
				if(isTouch) {
					pageX = mmEvent.originalEvent.touches[0].pageX;
				} else {
					pageX = mmEvent.pageX;
				}
				value = determineValue(dimensions.left, dimensions.right, pageX, options);
				if( pageX >= dimensions.left && pageX <= dimensions.right) {
					if(value >= options.min && value <= options.max) {
						setPosition(mdEvent.target, pageX - dimensions.left - offsetCenter);
						setValue(options, value);
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

	var initialize = function(options) {
		var range = options.range;
		delete options.range;
		$(range).html("<div class='inner'><div class='track'></div><div class='track-left'></div><div class='thumb'></div></div>");
		if(typeof options.start != 'undefined') {
			var position = determinePosition($(range).width() - offsetCenter, options);
			setPosition(range, position);
			setValue(options, options.start);
		}
		$(range).find('.track, .thumb, .inner').on('mousedown', function(event) {
			event.stopImmediatePropagation();
			event.preventDefault();
			$(this).closest(".range").trigger('mousedown', event);
		});
		$(range).find('.track, .thumb, .inner').on('touchstart', function(event) {
			event.stopImmediatePropagation();
			event.preventDefault();
			$(this).closest(".range").trigger('touchstart', event);
		});
		$(range).on('mousedown', function(event, originalEvent) {
			rangeMousedown(event, false, options, originalEvent);
		});
		$(range).on('touchstart', function(event, originalEvent) {
			rangeMousedown(event, true, options, originalEvent);
		});
	}

};

})( jQuery, window, document );
