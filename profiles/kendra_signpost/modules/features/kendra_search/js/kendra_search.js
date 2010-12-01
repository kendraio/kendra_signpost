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
					$('body').addClass('big-bottom').append(
							[ '<div id="search-log">', '<div class="main"><div class="header">', '<a class="close" href="#" onclick="', "$('#search-log').fadeOut();return false", '">[x]</a><h5>', 'log:', '</h5>', '</div></div></div>' ].join(''));
				}
				$('#search-log .main').append($msg).stop().animate( {
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
		},

		/**
		 * mungeString
		 * 
		 * URI encode a string, replacing percent signs with underscores and
		 * prefixing it with ss_kendra_
		 * 
		 * @param str
		 *            String
		 */
		mungeString : function(str) {
			// str = 'ss_kendra_' + str;
		return encodeURIComponent(str).replace(/\./g, '_2E').replace(/%/g, '_');
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
		 * build the top of the smart filter editor
		 */
		buildQueryFormHeader : function() {
			var html = '';
			html += '<table id="kendra-smart-filters" class="kendra-filter-rule views-table">';
			return html;
		},

		/**
		 * buildQueryFormFooter
		 * 
		 * build the bottom of the smart filter editor
		 */
		buildQueryFormFooter : function() {
			var html = '';
			html += '</table>';
			return html;
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
		 * buildQueryFormRow
		 * 
		 * builds one row of the smart filter form
		 * 
		 * @param rule
		 *            Object
		 */
		buildQueryFormRow : function(rule) {
			var html = '', dataType = 'default';

			html += '<tr class="draggable">';

			html += '<td>';
			html += '<input type="hidden" class="hidden_nid" name="hidden_nid" value=""/>';
			html += '<input type="hidden" class="field_filter_parent_nid" value="0" id="edit-field-field-filter-parent-nid" name="field_filter_parent_nid_3"/>';

			// html += '<a class="tabledrag-handle" href="#" title="Drag to
		// re-order"><div class="handle">&nbsp;</div></a>';
		//

		html += '</td>';

		/**
		 * operator 1: transform the Kendra.mapping.mappings array into an HTML
		 * select element
		 */
		html += '<td class="kendra-filter-op1-wrapper">';
		html += '<select class="kendra-filter-op1" name="op1">';
		for ( var key in Kendra.mapping.mappings) {
			html += '<option value="' + key + '"';
			if (rule && typeof rule.op1 != 'undefined' && rule.op1 != '' && key == rule.op1)
				html += ' selected="selected"';
			html += '>' + (typeof Kendra.mapping.mappings[key].label != 'undefined' ? Kendra.mapping.mappings[key].label : key) + '</option>';
		}
		html += '</select>';
		html += '</td>';

		/**
		 * operand
		 */
		html += '<td class="kendra-filter-op2-wrapper">';
		html += '<select class="kendra-filter-op2" name="op2">';

		if (rule && rule.op2 && rule.op2.dataType) {
			dataType = rule.op2.dataType;
		}
		html += Kendra.service.buildQueryMappingTypes(dataType, rule);

		html += '</select>';
		html += '</td>';

		/**
		 * operator 2: text field
		 */
		html += '<td class="kendra-filter-op3-wrapper">';
		html += '<input class="kendra-filter-op3 form-text" name="op3" type="text" value="';
		if (rule && typeof rule.op3 != 'undefined')
			html += rule.op3;
		html += '" />';
		html += '</td>';

		html += '<td class="kendra-filter-button-wrapper">';
		html += '<div class="smart-filter-add-rule-wrapper">' + '<a class="smart-filter-add-rule" title="Add a rule" href="#" onclick="' + "return !Kendra.service.buildQueryFormAddRule(this);" + '">' + '+' + '</a>'
				+ '<a class="smart-filter-remove-rule" title="Remove this rule" href="#" onclick="' + "return !Kendra.service.buildQueryFormRemoveRule(this);" + '">' + '-' + '</a>' + '</div>';
		html += '</td>';

		html += '</tr>';

		return html;
	},

	/**
	 * buildQueryMappingTypes
	 * 
	 * @param datatype
	 *            String optional
	 * @param rule
	 *            Object optional returns an HTML string with a list of search
	 *            options depending on the data type provided
	 */
	buildQueryMappingTypes : function(datatype, rule) {
		var html = '', datatype = datatype ? datatype.toLowerCase() : 'default', operands = {
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
					'selected' : 'selected'
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
					'selected' : 'selected'
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
					'selected' : 'selected'
				},
				'&gt;' : {
					'label' : 'after'
				}
			}
		};

		for ( var key in operands[datatype]) {
			html += '<option value="' + key + '"';
			if (typeof rule != 'undefined' && typeof rule.op2 != 'undefined' && rule.op2 != '') {
				if (key == rule.op2) {
					html += ' selected="selected"';
				}
			} else if (operands[datatype][key].selected) {
				html += ' selected="selected"';
			}
			html += '>' + (typeof operands[datatype][key].label != 'undefined' ? operands[datatype][key].label : key) + '</option>';
		}
		return html;
	},

	/**
	 * buildQueryForm
	 * 
	 * using the current list of mappings, create and render a form for querying
	 * Solr
	 */
	buildQueryForm : function(jsonFilter) {
		var jsonFilter = jsonFilter ? jsonFilter : {
			'rules' : [ {
				'op1' : '',
				'op2' : '',
				'op3' : ''
			} ]
		};

		var html = '';

		html += Kendra.service.buildQueryFormHeader();

		for ( var i in jsonFilter.rules) {
			var rule = jsonFilter.rules[i];
			if (rule.op1 || rule.op2 || rule.op3)
				Kendra.util.log(rule, 'buildQueryForm:deserializing rule #' + (1 + i / 1));
			html += Kendra.service.buildQueryFormRow(rule);
		}

		html += Kendra.service.buildQueryFormFooter();

		return html;
	},

	/**
	 * buildQueryResponseContainer
	 * 
	 * returns HTML for the AjaxSolr response widgets
	 */
	buildQueryResponseContainer : function() {
		var html = '';
		html += '<div class="right">';
		html += '<div id="kendra-search-result">';
		html += '<div id="kendra-search-navigation">';
		html += '<ul id="kendra-search-pager"></ul>';
		html += '<div id="kendra-search-pager-header"></div>';
		html += '</div>';
		html += '<div id="kendra-search-docs"></div>';
		html += '</div>';
		html += '</div>';

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
		Kendra.service.buildQueryFormToggleRemoveLinks($form);

		/**
		 * form onsubmit : serialize the form values into a smart filter
		 */
		$form.submit(function() {
			Kendra.service.buildQueryFormSerialize($form);
			return true;

		}).find('.kendra-filter-op1,.kendra-filter-op2,.kendra-filter-op3').change(function() {
			var filter = Kendra.service.buildQueryFormSerialize($form);
			Kendra.service.solrQuery(filter.rules);
			return true;

		}).filter('.kendra-filter-op1').change(function() {
			var $this = $(this), key = $this.val();

			if (typeof Kendra.mapping.mappings[key] != 'undefined' && Kendra.mapping.mappings[key].dataType) {
				var dataType = Kendra.mapping.mappings[key].dataType.split('#').pop(), options = Kendra.service.buildQueryMappingTypes(dataType);
				$this.parents('tr.draggable:eq(0)').find('.kendra-filter-op2').html(options);
				Kendra.util.log(Kendra.mapping.mappings[key].dataType, Kendra.mapping.mappings[key].dataType.split('#').pop());
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
		params = $.extend(params, Kendra.service.buildSolrQuery(query));

		for ( var name in params) {
			var val = params[name];

			if (typeof val == 'object') {
				if (val.length > 0) {
					val = val.join(',');
				} else {
					Kendra.util.log(val, "Kendra.service.solrQuery: skipping object parameter");
					continue;
				}
			}

			Kendra.Manager.store.addByValue(name, val);
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
	 * @TODO add cases for number & datetime
	 * @TODO add query grouping
	 * @TODO add support for AND vs OR subqueries
	 */
	buildSolrQuery : function(query) {
		var i = {}, key = '', val = '', dataType = '', params = {
			'q' : [],
			'fq' : []
		};
		for ( var i in query) {
			key = query[i].op1;
			val = query[i].op3; // encodeURIComponent(query[i].op3);

		/**
		 * format the operand according to data type
		 */
		if (typeof Kendra.mapping.mappings[key] != 'undefined' && Kendra.mapping.mappings[key].dataType) {
			dataType = Kendra.mapping.mappings[key].dataType.split('#').pop();
			switch (dataType) {
			case 'number':
			case 'datetime':
				break;
			case 'string':
			default:
				val = '"' + val + '"';
			}
		}

		params.fq.push(Kendra.util.mungeString(key) + ':' + val);
	}
	return params;
}
	}
});

// document ready:
(function($) {
	$(function() {
		if ($('body.node-type-smart-filter').length > 0) {
			var $form = $('form#node-form'), html = '';

			$form.find('.body-field-wrapper').hide().before('<div id="kendra-query-builder"><h3>' + 'Loading&hellip;' + '</h3></div>');

			var success = function(selector) {
				var jsonFilter = $form.find('textarea#edit-body').val() || $('.node-smart_filter .node-content').text();

				if (jsonFilter != '') {
					jsonFilter = JSON.parse(jsonFilter);
					Kendra.util.log(jsonFilter, 'parsed JSON');

					/**
					 * run a test query
					 */
					if (jsonFilter && jsonFilter.rules && jsonFilter.rules.length > 0) {
						Kendra.service.solrQuery(jsonFilter.rules);
					}
				}

				if ($form.length > 0) {
					/**
					 * build the query form
					 */
					html = Kendra.service.buildQueryForm(jsonFilter);
					html += Kendra.service.buildQueryResponseContainer();
	
					$(selector).html(html);
	
					Kendra.service.buildQueryFormPostProcess($form);
				}
			}, failure = function() {
				$('#kendra-query-builder').html('No mappings were found. Please <a href="/node/add/kendra-import">import a catalogue</a> first.');
			};

			Kendra.service.getMappings(function() {
				success('#kendra-query-builder');
			}, function() {
				failure();
			});
		}
	});
})(jQuery);
