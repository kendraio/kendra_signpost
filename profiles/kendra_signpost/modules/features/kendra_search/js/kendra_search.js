// $Id$
/**
 * Requires ajaxsolr.
 */
/**
 * kendra_search.js
 * 
 * <p>
 * connect to the Apache Solr instance
 * </p>
 */
var Kendra = Kendra || {};
jQuery.extend(Kendra, {
	search : {},

	log : function(obj) {
		if (typeof console != 'undefined') {
			console.log(obj);
		}
	},
	
	getMappings : function() {
		/**
		 * fetch mappings
		 */
		Drupal.service('kendra_search.get_mappings_array', {
		// api_key : "123461823762348756293",
				// sessid : "sdfjahsldjfhlaksuertybsi",
				// extra_parameter : "asdfasdf",
				// other_parameter : [ "nodes", "are", "good" ]
				}, function(status, data) {
					if (status == false) {
						Kendra.log("services: FATAL ERROR");
					} else {
						jQuery.extend(Kendra.mapping.mappings, data);
						Kendra.log('services:merged mappings');
						Kendra.log(Kendra.mapping);

						Kendra.solrQuery('*:*');
					}
				});
	},

	/**
	 * set up ApacheSolr query
	 * 
	 * @param query
	 */
	solrQuery : function(query) {
		Kendra.Manager = new AjaxSolr.Manager( {
			solrUrl : Kendra.search.solrUrl || ''
		});
		Kendra.Manager.init();
		Kendra.Manager.store.addByValue('q', query);
		Kendra.Manager.doRequest();
	}
});

// document ready:
(function($) {
	$(function() {
		Kendra.getMappings();
	});
})(jQuery);
