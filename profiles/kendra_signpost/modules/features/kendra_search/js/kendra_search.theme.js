(function($) {
	/**
	 * define fields to be displayed
	 */
	var output_formats = {
		"url" : {
			"label" : "URL",
			"format" : '<a href="__VALUE__">__VALUE__</a>'
		}
	};

	AjaxSolr.theme.prototype.result = function(doc, snippet) {
		var output = '<div><h2 class="title">' + doc.title + '</h2>';
		output += '<p id="links_' + doc.id + '" class="links"></p>';
		output += '<p>' + snippet + '</p></div>';
		return output;
	};

	AjaxSolr.theme.prototype.snippet = function(doc) {
		var output = '', parentDoc = doc.ss_cck_field_cat_rowuri, labels = [], dict = {};

		if (typeof parentDoc != 'undefined')
			parentDoc = parentDoc.replace(/\/rows#\d*$/, '');

		if (doc.dateline)
			output += doc.dateline + ' ';

		/**
		 * parse the labels
		 */
		for ( var key in doc) {

			if (key.indexOf('_kendra_') === 2) {

				var unmangled_key = decodeURIComponent(key.substring(10).replace(/_/g, '%'));

				if (unmangled_key.indexOf(parentDoc) === 0) {

					// extract the field label from the URL fragment identifier
					var label = decodeURIComponent(unmangled_key.substr(parentDoc.length + '/relation#'.length));

					// convert +pluses+ and _underscores_ to spaces and CamelCase the label
					label = label.replace(/_/g, ' ').replace(/\++/g, ' ').replace(/\b([a-z])/g, function(t, word) {
						return word.toUpperCase();
					});

					dict[label] = key;
					labels.push(label);
				}
			}
		}

		labels.sort();
		
		/**
		 * output
		 */
		output += '<dl class="dict">';

		for ( var i in labels) {
			var label = labels[i], key = dict[label];
			output += '<dt class="' + key + '">' + label + '</dt>';

			if (typeof output_formats[key] != 'undefined' && typeof output_formats[key].format != 'undefined') {
				output += '<dd class="' + key + '">' + output_formats[key].format.replace(/__VALUE__/g, doc[key]) + '</dd>';
			} else {
				output += '<dd class="' + key + '">' + doc[key] + '</dd>';
			}
		}
		
		output += '</dl> ';

		/*
		 * output += '<span style="display:none;">' + doc.body + '</span> ';
		 * output += '<a href="#" class="more">more</a>';
		 */

		return output;
	};

	AjaxSolr.theme.prototype.tag = function(value, weight, handler) {
		return $('<a href="#" class="tagcloud_item"/>').text(value).addClass('tagcloud_size_' + weight).click(handler);
	};

	AjaxSolr.theme.prototype.facet_link = function(value, handler) {
		return $('<a href="#"/>').text(value).click(handler);
	};

	AjaxSolr.theme.prototype.no_items_found = function() {
		return 'no items found in current selection';
	};

})(jQuery);
