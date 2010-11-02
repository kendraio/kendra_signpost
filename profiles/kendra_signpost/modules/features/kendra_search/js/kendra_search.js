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
(function ($) {
  $(function () {
    Manager = new AjaxSolr.Manager({
      solrUrl: 'http://dev.signpost.kendra.org.uk:8983/solr/'
    });
    Manager.init();
    Manager.store.addByValue('q', '*:*');
    Manager.doRequest();
    });
})(jQuery);
