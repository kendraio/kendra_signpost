(function($) {

	AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend( {
		beforeRequest : function() {
			$(this.target).html($('<img/>').attr('src', '/profiles/kendra_signpost/themes/kendra_tao/images/ajax-loader.gif'));
		},

		facetLinks : function(facet_field, facet_values) {
			var links = [];
			if (facet_values) {
				for ( var i = 0, l = facet_values.length; i < l; i++) {
					links.push(AjaxSolr.theme('facet_link', facet_values[i], this.facetHandler(facet_field, facet_values[i])));
				}
			}
			return links;
		},

		facetHandler : function(facet_field, facet_value) {
			var self = this;
			return function() {
				self.manager.store.remove('fq');
				self.manager.store.addByValue('fq', facet_field + ':' + facet_value);
				self.manager.doRequest(0);
				return false;
			};
		},

		afterRequest : function() {
			$(this.target).empty();
			for ( var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
				var doc = this.manager.response.response.docs[i];
				$(this.target).append(AjaxSolr.theme('result', doc, AjaxSolr.theme('snippet', doc)));

				var items = [];

				for ( var key in [ 'ss_cck_field_cat_album', 'ss_cck_field_cat_artist', 'ss_cck_field_cat_date' ]) {

					if (typeof doc[key] != 'undefined') {
						items = items.concat(this.facetLinks(key, '<span class="' + key + '">' + doc[key] + '</span>'));
					}
				}

				AjaxSolr.theme('list_items', '#links_' + doc.id, items);
			}
		},

		init : function() {

			$('a.more').live('click', function() {
				$(this).toggle(function() {
					$(this).parent().find('span').show();
					$(this).text('less');
					return false;
				}, function() {
					$(this).parent().find('span').hide();
					$(this).text('more');
					return false;
				});
			});
		}
	});

})(jQuery);