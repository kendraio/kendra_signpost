// $Id$
/**
 * kendra_search.js
 * @author Klokie <klokie@kendra.org.uk>
 * @package kendra_search
 * 
 * @requires ajaxsolr
 * @requires drupal.org/services
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
					$msg.append( [ '&nbsp;', '<a href="#" class="toggle" onclick="', '$(this).hide().next().fadeIn();return false', '">show</a>', '<pre>', JSON.stringify(obj), '</pre>' ].join(''));

				if ($('#search-log').length == 0) {
					$('body').append( [ '<div id="search-log">', '<a class="close" href="#" onclick="', "$('#search-log').fadeOut();return false", '">[x]</a><h5>', 'log:', '</h5></div>' ].join(''));
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
		 * getMappings
		 * 
		 * fetch CSV mappings
		 * 
		 * @param success
		 *            Function callback
		 * @param failure
		 *            Function callback
		 */
		getMappings : function(success, failure) {
			var success = success || function() {
			}, failure = failure || function() {
			};

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
								failure();
							} else if (data['#error'] == true) {
								Kendra.util.log("Kendra.service.getMappings: error: " + data['#message']);
								failure();
							} else {
								Kendra.mapping.mappings = $.extend(Kendra.mapping.mappings, data);
								Kendra.util.log(data, 'Kendra.service.getMappings: merged ' + Kendra.util.arrayLength(Kendra.mapping.mappings) + ' mappings');

								success();
							}
						});
			});
		},

		/**
		 * buildQueryFormHeader
		 * 
		 * build the top of the portable filter editor
		 */
		buildQueryFormHeader : function(selector) {
			var html = '';
			html += '<table id="kendra-portable-filters" class="kendra-filter-rule views-table">';
			return html;
		},

		/**
		 * buildQueryFormFooter
		 * 
		 * build the bottom of the portable filter editor
		 */
		buildQueryFormFooter : function(selector) {
			var html = '';
			html += '</table>';
			return html;
		},

		/**
		 * buildQueryFormAddRule
		 * 
		 * add a new row to the portable filter editor
		 * 
		 * @param el
		 *            calling link
		 * @returns true upon success, false upon failure
		 */
		buildQueryFormAddRule : function(el) {
			var $row = $(el).parents('tr.draggable:eq(0)');
			if ($row.length != 1) {
				return false;
			}

			$row.clone(true).insertAfter($row);

			Kendra.service.buildQueryFormToggleRemoveLinks();

			return true;
		},

		/**
		 * buildQueryFormRemoveRule
		 * 
		 * remove the selected row to the portable filter editor
		 * 
		 * @param el
		 *            calling link
		 * @returns true upon success, false upon failure
		 */
		buildQueryFormRemoveRule : function(el) {
			var $row = $(el).parents('tr.draggable:eq(0)');
			if ($row.length != 1 || $(el).hasClass('disabled')) {
				return false;
			}

			$row.remove();

			Kendra.service.buildQueryFormToggleRemoveLinks();

			return true;
		},

		/**
		 * buildQueryFormToggleRemoveLinks
		 * 
		 * enable all 'remove rule' links unless there's only one rule
		 */
		buildQueryFormToggleRemoveLinks : function($el) {
			var $links = $('a.portable-filter-remove-rule', ($el ? $el : '#kendra-portable-filters'));

			if ($links.length > 1) {
				$links.removeClass('disabled');
			} else {
				$links.addClass('disabled');
			}
		},

		/**
		 * buildQueryFormRow
		 */
		buildQueryFormRow : function(selector) {
			var html = '', operands = {
				'^=' : {
					'label' : 'starts with'
				},
				'*=' : {
					'label' : 'contains',
					'selected' : 'selected'
				},
				'$=' : {
					'label' : 'ends with'
				}
			};

			html += '<tr class="draggable">';

			html += '<td>';
			html += '<input type="hidden" class="hidden_nid" name="hidden_nid" value=""/>';
			html += '<input type="hidden" class="field_filter_parent_nid" value="0" id="edit-field-field-filter-parent-nid" name="field_filter_parent_nid_3"/>';
			// html += '<a class="tabledrag-handle" href="#" title="Drag to
			// re-order"><div class="handle">&nbsp;</div></a>';
			html += '</td>';

			/**
			 * operator 1: transform the Kendra.mapping.mappings array into an
			 * HTML select element
			 */
			html += '<td class="kendra-filter-op1-wrapper">';
			html += '<select class="kendra-filter-op1" name="op1">';
			for ( var key in Kendra.mapping.mappings) {
				html += '<option value="' + key + '">' + Kendra.mapping.mappings[key] + '</option>';
			}
			html += '</select>';
			html += '</td>';

			/**
			 * operand
			 */
			html += '<td class="kendra-filter-op2-wrapper">';
			html += '<select class="kendra-filter-op2" name="op2">';
			for ( var key in operands) {
				html += '<option value="' + key + (operands[key].selected ? '" selected="selected">' : '">') + operands[key].label + '</option>';
			}
			html += '</select>';
			html += '</td>';

			/**
			 * operator 2: text field
			 */
			html += '<td class="kendra-filter-op3-wrapper">';
			html += '<input class="kendra-filter-op3 form-text" name="op3" type="text" value="" />';
			html += '</td>';

			html += '<td class="kendra-filter-button-wrapper">';
			html += '<div class="portable-filter-add-rule-wrapper">' + '<a class="portable-filter-add-rule" title="Add a rule" href="#" onclick="' + "return !Kendra.service.buildQueryFormAddRule(this);" + '">' + '+' + '</a>'
					+ '<a class="portable-filter-remove-rule" title="Remove this rule" href="#" onclick="' + "return !Kendra.service.buildQueryFormRemoveRule(this);" + '">' + '-' + '</a>' + '</div>';
			html += '</td>';

			html += '</tr>';

			return html;
		},

		/**
		 * buildQueryForm
		 * 
		 * using the current list of mappings, create and render a form for
		 * querying Solr
		 */
		buildQueryForm : function(selector) {
			if (!selector || $(selector).length == 0) {
				return false;
			}
			Kendra.util.log('Kendra.service.buildQueryForm');

			var html = '';

			html += Kendra.service.buildQueryFormHeader(selector);

			html += Kendra.service.buildQueryFormRow(selector);

			html += Kendra.service.buildQueryFormFooter(selector);

			return html;
		},

		/**
		 * buildQueryFormPostProcess
		 * 
		 * @param $form
		 *            JQuery object
		 */
		buildQueryFormPostProcess : function($form) {
			Kendra.service.buildQueryFormToggleRemoveLinks($form);

			/**
			 * form onsubmit : serialize the form values into a portable filter
			 */
			$form.submit(function() {
				var filter = {
					rules : []
				}, $rule = {}, jsonFilter = '';

				$form.find('tr.draggable').each(function() {
					var temp = {};
					$(this).find('.kendra-filter-op1,.kendra-filter-op2,.kendra-filter-op3').each(function() {
						var $this = $(this), key = $this.attr('class').replace(/.*kendra-filter-(op\d).*/, '$1'), value = $this.val();
						temp[key] = value;
					});
					filter.rules.push(temp);
				});

				jsonFilter = JSON.stringify(filter);
				Kendra.util.log(jsonFilter, 'serialized portable filter');
				$form.find('textarea#edit-body').val(jsonFilter);

				// testing -- return false to abort form submission
					// return false;
					return true;
				});

			/**
			 * // skip the next hack
			 */
			return;

			/**
			 * make the search form rows draggable
			 * 
			 * @hack this should probably be triggered via a sub-module?
			 */
			if (typeof Drupal.behaviors.draggableviewsLoad == 'function') {
				Drupal.settings = $.extend(Drupal.settings, {
					'draggableviews' : {
						// table_id:
						'kendra-portable-filters' : {
							'parent' : null
						}
					}
				});
				Kendra.util.log(Drupal.settings.draggableviews, 'initializing draggableviews');
				Drupal.behaviors.draggableviewsLoad();
			}
		},

		/**
		 * set up ApacheSolr query
		 * 
		 * @param query
		 */
		solrQuery : function(query, params) {
			var params = params || {};
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

			for ( var name in params) {
				Kendra.Manager.store.addByValue(name, params[name]);
			}
			Kendra.Manager.doRequest();
		}
	}
});

// document ready:
(function($) {
	$(function() {
		var $form = $('form#node-form'), html = '';

		if ($form.length > 0 && $form.find('input[name=form_id]#edit-portable-filter-node-form').length > 0) {
			$form.find('.body-field-wrapper').hide().before('<div id="kendra-query-builder"><h3>' + 'Loading&hellip;' + '</h3></div>');

			var success = function(selector) {
				/**
				 * build the query form
				 */
				html = Kendra.service.buildQueryForm(selector);

				$(selector).html(html);

				Kendra.service.buildQueryFormPostProcess($form);

				/**
				 * test: do it again html =
				 * Kendra.service.buildQueryFormRow(selector); $('table',
				 * selector).append(html);
				 */

				/**
				 * run a test query
				 */
				var params = {
					facet : true,
					'json.nl' : 'map'
				};

				Kendra.service.solrQuery('*:*', params);

			}, failure = function() {
				$('#kendra-query-builder').html('No mappings were found. Please <a href="kendra-import">import a catalogue</a> first.');
			};

			Kendra.service.getMappings(function() {
				success('#kendra-query-builder');
			}, function() {
				failure();
			});
		}
	});
})(jQuery);
