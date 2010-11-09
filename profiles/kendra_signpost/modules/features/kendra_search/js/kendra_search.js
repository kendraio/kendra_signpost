// $Id$
/**
 * Requires ajaxsolr.
 */
/**
 * kendra_search.js
 * 
 * <p>connect to the Apache Solr instance</p>
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
		Manager.doRequest();
	});
})(jQuery);
