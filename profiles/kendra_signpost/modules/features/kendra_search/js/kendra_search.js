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

	/**
	 * utility functions
	 */
	util : {
		/**
		 * console message logging function
		 */
		log : function(obj, label) {
			if (typeof console != 'undefined') {
				console.log(obj);
			}

			if (typeof label == 'undefined' && (typeof obj).toLowerCase() == 'string') {
				label = obj;
			}
			if (label) {
				if ($('#search-log').length == 0) {
					$('body').append('<div id="search-log"><h5>log:</h5></div>');
				}
				$('#search-log').append('<div class="row">' + label + '</div>');
			}
		},

		/**
		 * arrayLength utility function to compute length of an associative
		 * array
		 * 
		 * @param arr
		 *            Array
		 */
		arrayLength : function(arr) {
			var len = 0;
			for (name in arr)
				++len;
			return len;
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
				// other_parameter : [ "nodes", "are",
				// "good" ]
				}, function(status, data) {
					if (status == false) {
						Kendra.util.log("services: FATAL ERROR");
					} else if (data['#error'] == true) {
						Kendra.util.log("services: error: "+data['#message']);
					} else {
						Kendra.mapping.mappings = jQuery.extend(Kendra.mapping.mappings, data);
						Kendra.util.log(data, 'Kendra.getMappings: merged ' + Kendra.util
								.arrayLength(Kendra.mapping.mappings) + ' mappings');

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
			solrUrl : Kendra.search.solrUrl || '',

			/**
			 * override AbstractManager.handleResponse
			 */
			handleResponse : function(data) {
				this.response = data;
				Kendra.util
						.log(this.response, 'Kendra.solrQuery: got response: ' + data.response.numFound + ' records');

				for ( var widgetId in this.widgets) {
					this.widgets[widgetId].afterRequest();
				}
			}
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
