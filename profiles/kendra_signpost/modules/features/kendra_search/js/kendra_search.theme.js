(function($) {

	var props = {
		"title" : {
			"label" : "Title"
		},
		"ss_cck_field_cat_album" : {
			"label" : "Album"
		},
		"ss_cck_field_cat_artist" : {
			"label" : "Artist"
		},
		"ss_cck_field_cat_date" : {
			"label" : "Date"
		},
		"ss_cck_field_cat_isrc" : {
			"label" : "ISRC"
		},
		"ss_cck_field_cat_no" : {
			"label" : "Catalogue #"
		},
		"ss_cck_field_cat_publisher" : {
			"label" : "Publisher"
		},
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
		var output = '';
		if (doc.body && doc.body.length > 300) {
			if (doc.dateline)
				output += doc.dateline + ' ';
			// output += doc.body.substring(0, 300);

			output += '<dl class="dict">';
			for ( var prop in props) {
				if (typeof doc[prop] != 'undefined') {
					output += '<dt class="' + prop + '">' + props[prop].label + '</dt>';
					if (typeof props[prop].format != 'undefined') {
						output += '<dd class="' + prop + '">' + props[prop].format.replace(/__VALUE__/g, doc[prop]) + '</dd>';
					} else {
						output += '<dd class="' + prop + '">' + doc[prop] + '</dd>';
					}
				}
			}
			output += '</dl> ';
			output += '<span style="display:none;">' + doc.body + '</span> ';
			output += '<a href="#" class="more">more</a>';
		} else {
			if (doc.dateline)
				output += doc.dateline + ' ';
			output += doc.body;
		}
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
