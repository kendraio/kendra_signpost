// $Id$
/**
 * kendra_search.js
 * @author Klokie <klokie@kendra.org.uk>
 * @package kendra_search
 * 
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
				var $msg = $('<div class="row">' + label + '</div>');
				if (label != obj)
					$msg.append('&nbsp;<a href="#" class="toggle" onclick="$(this).hide().next().fadeIn();return false">show</a>' + '<pre>' + Drupal.toJson(obj) + '</pre>');

				if ($('#search-log').length == 0) {
					$('body').append('<div id="search-log"><a class="close" href="#" onclick="$(\'#search-log\').fadeOut();return false">[x]</a><h5>log:</h5></div>');
				}
				$('#search-log').append($msg).stop().animate( {
					scrollTop : $('#search-log').attr("scrollHeight")
				}, 2500);
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

	/**
	 * container for services
	 */
	service : {
		sessid : 0,

		/**
		 * connect to the services module to get a valid session ID
		 * 
		 * @param success
		 *            Function callback
		 * @param failure
		 *            Function callback
		 */
		connect : function(success, failure) {
			var success = success || function() {
			}, failure = failure || function() {
			};

			if (Kendra.service.sessid) {
				success();
			} else {
				Drupal.service('system.connect', {}, function(status, data) {
					if (status == false) {
						Kendra.util.log("Kendra.service.connect: failed");
						failure();
					} else {
						Kendra.util.log("Kendra.service.connect: succeeded");
						Kendra.service.sessid = data.sessid;
						success(data);
					}
				});
			}
		},

		/**
		 * fetch CSV mappings
		 */
		getMappings : function() {
			Kendra.service.connect(function() {
				Drupal.service('kendra_search.get_mappings_array', {
					sessid : Kendra.service.sessid
				// api_key : "123461823762348756293",
						// extra_parameter : "asdfasdf",
						// other_parameter : [ "nodes", "are",
						// "good" ]
						}, function(status, data) {
							if (status == false) {
								Kendra.util.log("Kendra.service.getMappings: FATAL ERROR");
							} else if (data['#error'] == true) {
								Kendra.util.log("Kendra.service.getMappings: error: " + data['#message']);
							} else {
								Kendra.mapping.mappings = jQuery.extend(Kendra.mapping.mappings, data);
								Kendra.util.log(data, 'Kendra.service.getMappings: merged ' + Kendra.util.arrayLength(Kendra.mapping.mappings) + ' mappings');

								Kendra.service.solrQuery('*:*');
							}
						});
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
					Kendra.util.log(this.response, 'Kendra.service.solrQuery: got response: ' + data.response.numFound + ' records');

					for ( var widgetId in this.widgets) {
						this.widgets[widgetId].afterRequest();
					}
				}
			});
			Kendra.Manager.init();
			Kendra.Manager.store.addByValue('q', query);
			Kendra.Manager.doRequest();
		}
	}
});

// document ready:
(function($) {
	$(function() {
		Kendra.service.getMappings();
	});
})(jQuery);
