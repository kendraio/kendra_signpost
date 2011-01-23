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
				console.log(typeof label != 'undefined' ? label : '', obj);
			}
			return;

			if (typeof label == 'undefined' && (typeof obj).toLowerCase() == 'string') {
				label = obj;
			}
			if (label) {
				var $msg = $('<div class="row">' + label + '</div>');
				if (label != obj)
					$msg.append( [ '&nbsp;', '<a href="#" class="toggle" onclick="', '$(this).hide().next().fadeIn();return false', '">show</a>', '<pre>', JSON.stringify(obj), '</pre>' ].join(''));

				if ($('#search-log').length == 0) {
					$('body').addClass('big-bottom').append(
							[ '<div id="search-log">', '<div class="main"><div class="header">', '<a class="close" href="#" onclick="', "$('#search-log').fadeOut();return false", '">[x]</a><h5>', 'log:', '</h5>', '</div></div></div>' ].join(''));
				}
				$('#search-log .main').append($msg).stop().animate( {
					scrollTop : $('#search-log').attr("scrollHeight")
				}, 2500);
			}
		},

		/**
		 * 
		 */
		debugEach : function(index, value) {
			Kendra.util.log(value, 'debugEach:' + index);
			return value || '';
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
		},

		/**
		 * mungeKey
		 * 
		 * URI encode a string, replacing percent signs with underscores and
		 * prefixing it with ss_kendra_
		 * 
		 * @param key
		 *            String
		 */
		mungeKey : function(key) {
			var dataType = Kendra.util.dataTypeForKey(key), str = encodeURIComponent(key).replace(/\./g, '_2E').replace(/%/g, '_');
			switch (dataType) {
			case 'number':
				str = str.replace(/^[dfs]s_/, 'fs_');
				break;
			case 'datetime':
				str = str.replace(/^[dfs]s_/, 'ds_');
				break;
			case 'string':
			default:
				str = str.replace(/^[dfs]s_/, 'ss_');
				break;
			}
			return str;
		},

		/**
		 * dataTypeForKey
		 * 
		 * @param key
		 *            String munged URI key for a mapping item
		 * @returns String 'string'|'number'|'datetime'
		 */
		dataTypeForKey : function(key) {
			return (!Kendra.mapping.mappings[key] || !Kendra.mapping.mappings[key].dataType) ? null : Kendra.mapping.mappings[key].dataType.split('#').pop();
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
				}, function(status, data) {
					if (status == false) {
						Kendra.util.log("Kendra.service.getMappings: FATAL ERROR");
						failure(status, data);
					} else if (data['#error'] == true) {
						Kendra.util.log("Kendra.service.getMappings: error: " + data['#message']);
						failure(status, data);
					} else {
						// Kendra.mapping.mappings =
						// $.extend(Kendra.mapping.mappings, data);
						Kendra.mapping.mappings = data;
						Kendra.util.log(data, 'Kendra.service.getMappings: merged ' + Kendra.util.arrayLength(Kendra.mapping.mappings) + ' mappings');

						success();
					}
				});
			});
		},

		/**
		 * getTemplate
		 * 
		 * fetch and compile a JQuery template
		 * 
		 * @param success
		 *            Function callback
		 * @param failure
		 *            Function callback
		 */
		getTemplate : function(tmplName, success, failure) {
			var success = success || function() {
			}, failure = failure || function() {
			};

			if (typeof $.template[tmplName] != 'undefined') {
				/**
				 * template has already been compiled
				 */
				success();
			} else if ($('#' + tmplName).length > 0) {
				/**
				 * template already loaded into page but not yet compiled
				 */
				$.template(tmplName, $('#' + tmplName));
				success();
			} else {
				/**
				 * fetch and compile the template on demand
				 * 
				 * @todo get URL prefix from module configuration
				 */
				var prefix = '/profiles/kendra_signpost/modules/features/kendra_search/js/tmpl/';
				$.get(prefix + tmplName, function(html) {

					$.template(tmplName, html);
					Kendra.util.log(tmplName, 'compiled template');
					success();
				});

			}
		},

		/**
		 * applyTemplate
		 * 
		 * apply a JQuery template to a data object fetching the template first
		 * if necessary
		 */
		applyTemplate : function(tmplName, data, success, failure) {
			var success = success || function() {
			}, failure = failure || function() {
			};

			Kendra.service.getTemplate(tmplName, function() {
				Kendra.util.log(tmplName, 'rendering template');
				var result = $.tmpl(tmplName, data);
				Kendra.util.log(result, 'rendered template');

				success(result);

			}, failure);
		},

		/**
		 * buildQueryFormAddRule
		 * 
		 * add a new row to the smart filter editor
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
		 * remove the selected row to the smart filter editor
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
			var $links = $('a.smart-filter-remove-rule', ($el ? $el : '#kendra-smart-filters'));

			if ($links.length > 1) {
				$links.removeClass('disabled');
			} else {
				$links.addClass('disabled');
			}
		},

		/**
		 * buildQueryMappingTypes
		 * 
		 * @param dataType
		 *            String optional
		 * @param op2
		 *            String optional
		 * 
		 * returns an HTML string with a list of search options depending on the
		 * data type provided
		 */
		buildQueryMappingTypes : function(dataType, op2) {
			var html = '', dataType = dataType ? dataType.toLowerCase() : 'default', operands = {
				'default' : {
					'==' : {
						'label' : 'is'
					}
				},
				'string' : {
					'==' : {
						'label' : 'is'
					},
					'^=' : {
						'label' : 'starts with'
					},
					'*=' : {
						'label' : 'contains',
						'isDefault' : true
					},
					'$=' : {
						'label' : 'ends with'
					}

				},
				'number' : {
					'&lt;' : {
						'label' : 'less than'
					},
					'==' : {
						'label' : 'is',
						'isDefault' : true
					},
					'&gt;' : {
						'label' : 'greater than'
					}
				},
				'datetime' : {
					'&lt;' : {
						'label' : 'before'
					},
					'==' : {
						'label' : 'is',
						'isDefault' : true
					},
					'&gt;' : {
						'label' : 'after'
					}
				}
			};

			Kendra.util.log('buildQueryMappingTypes:type=' + dataType + ';op2=' + (op2 || ''));

			for ( var key in operands[dataType]) {
				html += '<option value="' + key + '"';
				if (op2) {
					if (key == op2) {
						html += ' selected="selected"';
					}
				} else if (operands[dataType][key].isDefault) {
					html += ' selected="selected"';
				}
				html += '>' + (typeof operands[dataType][key].label != 'undefined' ? operands[dataType][key].label : key) + '</option>';
			}
			return html;
		},

		/**
		 * buildQueryFormSerialize
		 */
		buildQueryFormSerialize : function($form) {
			var filter = {
				rules : []
			}, $rule = {}, jsonFilter = '';

			$form.find('tr.draggable').each(function() {
				var temp = {};
				$fields = $(this).find('.kendra-filter-op1,.kendra-filter-op2,.kendra-filter-op3');

				$fields.each(function() {
					var $this = $(this), key = $this.attr('class').replace(/.*kendra-filter-(op\d).*/, '$1'), value = $this.val();
					temp[key] = value;
				});
				filter.rules.push(temp);
			});

			jsonFilter = JSON.stringify(filter);
			Kendra.util.log(jsonFilter, 'serialized smart filter');
			$form.find('textarea#edit-body').val(jsonFilter);
			return filter;
		},

		/**
		 * buildQueryFormPostProcess
		 * 
		 * @param $form
		 *            JQuery object
		 */
		buildQueryFormPostProcess : function($form) {
			if ($form.length == 0)
				return;

			Kendra.service.buildQueryFormToggleRemoveLinks($form);

			/**
			 * form onsubmit : serialize the form values into a smart filter
			 */
			$form.submit(function() {
				Kendra.service.buildQueryFormSerialize($form);
				return true;

			}).find('.kendra-filter-op1,.kendra-filter-op2,.kendra-filter-op3').change(function() {
				Kendra.util.log('change');
				var filter = Kendra.service.buildQueryFormSerialize($form);
				Kendra.service.solrQuery(filter.rules);
				return true;

			}).filter('.kendra-filter-op1').change(function() {
				var $this = $(this), key = $this.val();

				if (typeof Kendra.mapping.mappings[key] != 'undefined' && Kendra.mapping.mappings[key].dataType) {
					var dataType = Kendra.util.dataTypeForKey(key), options = Kendra.service.buildQueryMappingTypes(dataType);
					$this.parents('tr.draggable:eq(0)').find('.kendra-filter-op2').html(options);
				}

				return true;
			});

			/**
			 * make the search form rows draggable // skip the next hack
			 * 
			 * @hack this should probably be triggered via a sub-module?
			 */
			if (false && typeof Drupal.behaviors.draggableviewsLoad == 'function') {
				Drupal.settings = $.extend(Drupal.settings, {
					'draggableviews' : {
						// table_id:
						'kendra-smart-filters' : {
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
		 *            Object hash of query facets => values
		 * @param params
		 *            Object hash of Solr parameters
		 */
		solrQuery : function(query) {
			var query = query || {}, params = {
				'facet' : true,
				'facet.missing' : true,
				'json.nl' : 'map'
			};
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

			Kendra.Manager.addWidget(new AjaxSolr.ResultWidget( {
				id : 'kendra-search-result',
				target : '#kendra-search-docs'
			}));
			Kendra.Manager.addWidget(new AjaxSolr.PagerWidget( {
				id : 'kendra-search-pager',
				target : '#kendra-search-pager',
				prevLabel : '&lt;',
				nextLabel : '&gt;',
				innerWindow : 1,
				renderHeader : function(perPage, offset, total) {
					var text = '';
					if (total > 0) {
						text = 'displaying ' + Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + total;
					} else {
						text = 'no results match your query';
					}
					$('#kendra-search-pager-header').html($('<span/>').text(text));
				}
			}));

			Kendra.Manager.init();

			// set the solr query here
		// Kendra.Manager.store.addByValue('q', '*:*');
		Kendra.Manager.store.addByValue('q.alt', '*:*');
		Kendra.Manager.store.addByValue('fq', 'type:kendra_cat');

		/**
		 * now, build the actual query strings
		 */
		Kendra.service.buildSolrQuery(query);

		for ( var name in params) {
			var val = params[name], multivariate_facets = [ 'fq', 'facet.field', 'facet.query' ];

			if (typeof val == 'object') {
				if ($.inArray(name, multivariate_facets) >= 0) {
					for ( var i in val) {
						Kendra.Manager.store.addByValue(name, val[i]);
					}
				} else if (val.length > 0) {
					Kendra.Manager.store.addByValue(name, val.join(','));
				} else {
					Kendra.util.log(val, "Kendra.service.solrQuery: skipping object parameter");
				}
			} else {
				Kendra.Manager.store.addByValue(name, val);
			}
		}
		Kendra.Manager.doRequest();
	},

	/**
	 * buildSolrQuery
	 * 
	 * group together the parameters necessary for doing a faceted search
	 * against Apache Solr
	 * 
	 * @param query
	 *            Object
	 * @returns Object
	 * 
	 * @TODO inspect the condition (op2); use it to determine the facet
	 *       operation
	 * @TODO add query grouping
	 * @TODO add support for AND vs OR subqueries
	 */
	buildSolrQuery : function(query) {
		var i = {}, key = '', val = '', dataType = '';
		for ( var i in query) {
			key = query[i].op1;
			val = query[i].op3;
			condition = query[i].op2;

			/**
			 * format the operand according to data type
			 */
			dataType = Kendra.util.dataTypeForKey(key);
			switch (dataType) {
			case 'number':
				switch (condition) {
				case '&lt;':
					var objKey = key + '.facet.range.end';
					Kendra.Manager.store.addByValue(objKey, val);
					Kendra.Manager.store.addByValue('facet.range', key);
					break;
				case '&gt;':
					var objKey = key + '.facet.range.start';
					Kendra.Manager.store.addByValue(objKey, val);
					Kendra.Manager.store.addByValue('facet.range', key);
					break;
				case '==':
					var val = Kendra.util.mungeKey(key) + ':' + val;
					Kendra.Manager.store.addByValue('fq', val);
					break;
				}
				break;
			case 'datetime':
				switch (condition) {
				case '&lt;':
					var objKey = key + '.facet.date.end';
					Kendra.Manager.store.addByValue(objKey, '"' + val + '"');
					Kendra.Manager.store.addByValue('facet.date', key);
					break;
				case '&gt;':
					var objKey = key + '.facet.date.start';
					Kendra.Manager.store.addByValue(objKey, '"' + val + '"');
					Kendra.Manager.store.addByValue('facet.date', key);
					break;
				case '==':
					var val = Kendra.util.mungeKey(key) + ':' + '"' + val + '"';
					Kendra.Manager.store.addByValue('fq', val);
					break;
				}
				break;
			case 'string':
			default:
				var fq = Kendra.util.mungeKey(key) + ':' + '"' + val + '"';
				Kendra.Manager.store.addByValue('fq', fq);
			}

		}
	}
	}
});

// document ready:
(function($) {
	$(function() {
		if ($('body.node-type-smart-filter').length > 0 || $('#edit-smart-filter-node-form').length > 0) {
			var $form = $('form#node-form'), container = '<div id="kendra-query-builder"><h3>' + 'Loading&hellip;' + '</h3></div>';

			if ($form.length > 0) {
				// smart filter editor page
				$form.find('.body-field-wrapper').hide().before(container);
			} else {
				// smart filter view page
				$('.node-smart_filter .node-content').append(container);
			}

			/**
			 * render output using JQuery templates
			 */
			var success = function(selector) {
				// load an existing smart filter from the page content
				var jsonFilter = $form.find('textarea#edit-body').val() || $('.node-smart_filter .node-content p').text();

				if (jsonFilter != '') {
					jsonFilter = JSON.parse(jsonFilter);
					Kendra.util.log(jsonFilter, 'parsed JSON');
				}

				if (jsonFilter && $form.length > 0) {

					Kendra.service.getTemplate('smart_filter_row.tmpl.html', function() {
						Kendra.service.applyTemplate('smart_filter_wrapper.tmpl.html', jsonFilter, function(html) {

							Kendra.util.log(html, 'success:html=');
							$(selector).html(html);

							Kendra.service.buildQueryFormPostProcess($form);

						});
					});

					/**
					 * run the query
					 */
					if (jsonFilter.rules && jsonFilter.rules.length > 0) {
						// Kendra.service.solrQuery(jsonFilter.rules);
					}
				}

			}, failure = function(status, data) {
				var html = '';
				if (data && data['#message'] && data['#message'] == "Access denied") {
					html = 'Access denied. Please <a href="/user">log in</a> first.';
					$('#page #content .content-wrapper').html(html);
				} else {
					html = 'No mappings were found. Please <a href="/node/add/kendra-import">import a catalogue</a> first.';
					$('#kendra-query-builder').html(html);
				}
			};

			Kendra.service.getMappings(function() {
				success('#kendra-query-builder');
			}, function(status, data) {
				failure(status, data);
			});
		}
	});
})(jQuery);
