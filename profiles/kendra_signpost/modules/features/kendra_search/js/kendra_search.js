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
var Manager;
var Kendra = Kendra || {
	search : {}
};
(function($) {
	$(function() {
		Manager = new AjaxSolr.Manager( {
			solrUrl : Kendra.search.solrUrl || ''
		});
		Manager.init();
		Manager.store.addByValue('q', '*:*');
		// Manager.doRequest();

		Drupal.service('kendra_search.get_mappings_array', {
			//api_key : "123461823762348756293",
			//sessid : "sdfjahsldjfhlaksuertybsi",
			//extra_parameter : "asdfasdf",
			//other_parameter : [ "nodes", "are", "good" ]
		}, function(status, data) {
			if (status == false) {
				log("services: FATAL ERROR!!!!!");
			} else {
				jQuery.extend(Kendra.mapping.mappings, data);
				log('services:merged mappings');
				log(Kendra.mapping);
			}
		});

	});
})(jQuery);

if (typeof log == 'undefined') {
	function log(obj) {
		if (typeof console != 'undefined') {
			console.log(obj);
		}
	}
}
