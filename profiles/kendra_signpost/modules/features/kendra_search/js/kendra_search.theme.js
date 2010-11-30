(function($) {

	AjaxSolr.theme.prototype.result = function(doc, snippet) {
		var output = '<div><h2 class="title">' + doc.title + '</h2>';
		output += '<p id="links_' + doc.id + '" class="links"></p>';
		output += '<p>' + snippet + '</p></div>';
		return output;
	};

	AjaxSolr.theme.prototype.snippet = function(doc) {
		var output = '';
		if (doc.body && doc.body.length > 300) {
			if (doc.dateline) output += doc.dateline + ' ';
			output += doc.body.substring(0, 300);
			output += '<span style="display:none;">' + doc.body.substring(300);
			output += '</span> <a href="#" class="more">more</a>';
		} else {
			if (doc.dateline) output += doc.dateline + ' ';
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
