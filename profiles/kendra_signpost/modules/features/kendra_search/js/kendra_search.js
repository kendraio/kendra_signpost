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
var Kendra = Kendra || {};
(function ($) {
  $(function () {
    Manager = new AjaxSolr.Manager({
      solrUrl: Kendra.solrUrl || ''
    });
    Manager.init();
    Manager.store.addByValue('q', '*:*');
    Manager.doRequest();
    });
})(jQuery);
