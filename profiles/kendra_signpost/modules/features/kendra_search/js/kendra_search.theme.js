(function($) {
	/**
	 * define fields to be displayed
	 */
	var output_formats = {
		"Url" : {
			"format" : "url"
		},
		"Mpeg File" : {
			"format" : "url"
		},
		"Release Date" : {
			"format" : "date"
		}
	};

	AjaxSolr.theme.prototype.result = function(doc, snippet) {
		var output = '<div class="doc">';
		//output += '<p id="links_' + doc.id + '" class="links"></p>';
		output += '<div>' + snippet + '</div></div>';
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

			output += '<dd class="' + key + '">';

			if (typeof output_formats[label] != 'undefined' && typeof output_formats[label].format != 'undefined') {

				switch (output_formats[label].format) {
				case 'url':
					output += '<a href="' + doc[key] + '" title="' + doc[key] + '">' + doc[key] + '</a>';
					break;
				case 'date':
					var timestamp = Date.parse(doc[key]), d = doc[key];

					if (isNaN(timestamp) == false) {
						d = new Date(timestamp).toLocaleDateString();
					}
					output += '<abbr class="date" title="' + doc[key] + '">' + d + '</abbr>';
					break;
				default:
					output += doc[key];
				}
			} else {
				output += doc[key];
			}

			output += '</dd>';
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
