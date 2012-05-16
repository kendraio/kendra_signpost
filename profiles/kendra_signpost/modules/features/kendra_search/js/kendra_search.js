// $Id$
/**
 * kendra_search.js
 * 
 * @author Klokie <klokie@kendra.org.uk>
 * @package kendra_search
 * @requires ajaxsolr
 * @requires drupal.org/services
 */
/**
 * kendra_search.js
 * <p>
 * connect to the Apache Solr instance
 * </p>
 */
var Kendra = Kendra || {};
jQuery.extend(Kendra, {
    search: {},

    /**
	 * utility functions
	 */
    util: {
        /**
		 * console message logging function
		 */
        log: function(obj, label) {
            if (typeof console != 'undefined') {
                console.log(typeof label != 'undefined' ? label: '', obj);
            }
            return;

            if (typeof label == 'undefined' && (typeof obj).toLowerCase() == 'string') {
                label = obj;
            }
            if (label) {
                var $msg = $('<div class="row">' + label + '</div>');
                if (label != obj)
                $msg.append(['&nbsp;', '<a href="#" class="toggle" onclick="', '$(this).hide().next().fadeIn();return false', '">show</a>', '<pre>', JSON.stringify(obj), '</pre>'].join(''));

                if ($('#search-log').length == 0) {
                    $('body').addClass('big-bottom').append(
                    ['<div id="search-log">', '<div class="main"><div class="header">', '<a class="close" href="#" onclick="', "$('#search-log').fadeOut();return false", '">[x]</a><h5>', 'log:', '</h5>', '</div></div></div>'].join(''));
                }
                $('#search-log .main').append($msg).stop().animate({
                    scrollTop: $('#search-log').attr("scrollHeight")
                },
                2500);
            }
        },

        /**
		 * 
		 */
        debugEach: function(index, value) {
            Kendra.util.log(value, 'debugEach:' + index);
            return value || '';
        },

        /**
		 * arrayLength utility function to compute length of an associative
		 * array
		 * 
		 * @param arr Array
		 */
        arrayLength: function(arr) {
            var len = 0;
            for (name in arr)
            ++len;
            return len;
        },

        /**
		 * dataTypeForKey
		 * 
		 * @param key String munged URI key for a mapping item
		 * @returns String 'string'|'number'|'datetime' (default 'string')
		 */
        dataTypeForKey: function(key) {
            return (!Kendra.mapping.mappings[key] || !Kendra.mapping.mappings[key].dataType) ? 'string': Kendra.mapping.mappings[key].dataType.split('#').pop();
        }

    },

    /**
	 * container for services
	 */
    service: {
        sessid: null,
        require_connection: true,

        /**
		 * connect to the services module to get a valid session ID
		 * 
		 * @param success Function callback
		 * @param failure Function callback
		 */
        connect: function(success, failure) {
            var success = success ||
            function() {
                },
            failure = failure ||
            function() {
                };

            if (Kendra.service.sessid) {
                success();
            } else if (!Kendra.service.require_connection) {
                success();
            } else {
                Kendra.util.log('ready to connect');
                Drupal.service('endpoint', 'system.connect', {},
                function(status, data) {
                    Kendra.util.log('connected');
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
		 * getMappings fetch CSV mappings
		 * 
		 * @param success Function callback
		 * @param failure Function callback
		 */
        getMappings: function(success, failure) {
            var success = success ||
            function() {
                },
            failure = failure ||
            function() {
                },
            args = {};

            Kendra.util.log('getMappings');
            Kendra.service.connect(function() {
                Kendra.util.log('connected OK');
                Drupal.service('endpoint', 'kendra_search.get_mappings_array', args,
                function(status, data) {
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
		 * getTemplate fetch and compile a JQuery template
		 * 
		 * @param success Function callback
		 * @param failure Function callback
		 */
        getTemplate: function(tmplName, success, failure) {
            var success = success ||
            function() {
                },
            failure = failure ||
            function() {
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
                $.get(prefix + tmplName,
                function(html) {

                    $.template(tmplName, html);
                    Kendra.util.log(tmplName, 'compiled template');
                    success();
                });

            }
        },

        /**
		 * applyTemplate apply a JQuery template to a data object fetching the
		 * template first if necessary
		 */
        applyTemplate: function(tmplName, data, success, failure) {
            var success = success ||
            function() {
                },
            failure = failure ||
            function() {
                },
            data = data || {};

            Kendra.service.getTemplate(tmplName,
            function() {
                var result = $.tmpl(tmplName, data);

                success(result);

            },
            failure);
        },

        /**
		 * buildQueryFormAddRule add a new row to the smart filter editor
		 * 
		 * @param el calling link
		 * @returns true upon success, false upon failure
		 */
        buildQueryFormAddRule: function(el) {
            var $row = $(el).parents('tr.draggable:eq(0)'),
            $form = $row.parents('form#node-form'),
            index = 0;
            if ($row.length != 1) {
                return false;
            }

            var $op1 = $row.find('.kendra-filter-op1'),
            key = $op1.val(),
            dataType = Kendra.util.dataTypeForKey(key);

            $copy = $row.clone(true);

            /**
			 * reset the datePicker
			 * 
			 * @todo find a better hack
			 */
            var ts = new Date().getTime();
            $copy.find('[id]').each(function() {
                $(this).attr('id', $(this).attr('id') + ts);
            });

            $copy.find('.kendra-filter-op3').each(function() {
                Kendra.service.initDatepicker(this, dataType);
            });

            /**
			 * try to preserve the currently selected option
			 * 
			 * @todo find a better hack
			 */
            $copy.find('option[selected=selected]').removeAttr('selected');
            index = $op1.get(0).selectedIndex;
            $copy.insertAfter($row).find('.kendra-filter-op1').get(0).selectedIndex = index;

            Kendra.service.filterUpdate($form);

            Kendra.service.buildQueryFormToggleRemoveLinks();

            return true;
        },

        /**
		 * buildQueryFormRemoveRule remove the selected row to the smart filter
		 * editor
		 * 
		 * @param el calling link
		 * @returns true upon success, false upon failure
		 */
        buildQueryFormRemoveRule: function(el) {
            var $row = $(el).parents('tr.draggable:eq(0)'),
            $form = $row.parents('form#node-form');
            if ($row.length != 1 || $(el).hasClass('disabled')) {
                return false;
            }

            $row.remove();

            Kendra.service.filterUpdate($form);

            Kendra.service.buildQueryFormToggleRemoveLinks();

            return true;
        },

        /**
		 * buildQueryFormToggleRemoveLinks enable all 'remove rule' links unless
		 * there's only one rule
		 */
        buildQueryFormToggleRemoveLinks: function($el) {
            var $links = $('a.smart-filter-remove-rule', ($el ? $el: '#kendra-smart-filters'));

            if ($links.length > 1) {
                $links.removeClass('disabled');
            } else {
                $links.addClass('disabled');
            }
        },

        /**
		 * buildQueryMappingTypes
		 * 
		 * @param dataType String optional
		 * @param op2 String optional returns an HTML string with a list of
		 *            search options depending on the data type provided
		 */
        buildQueryMappingTypes: function(dataType, op2) {
            var html = '',
            dataType = dataType ? dataType.toLowerCase() : 'string',
            operands = {
                'string': {
                    '==': {
                        'label': 'is'
                    },
                    '^=': {
                        'label': 'starts with'
                    },
                    '*=': {
                        'label': 'contains',
                        'isDefault': true
                    },
                    '$=': {
                        'label': 'ends with'
                    }

                },
                'number': {
                    'lt': {
                        'label': 'less than'
                    },
                    '==': {
                        'label': 'is',
                        'isDefault': true
                    },
                    'gt': {
                        'label': 'greater than'
                    }
                },
                'datetime': {
                    'lt': {
                        'label': 'before'
                    },
                    '==': {
                        'label': 'is',
                        'isDefault': true
                    },
                    'gt': {
                        'label': 'after'
                    }
                }
            };

            Kendra.util.log('buildQueryMappingTypes:' + (operands[dataType] && operands[dataType][op2] ? operands[dataType][op2].label: operands[dataType] + '/' + op2));

            for (var key in operands[dataType]) {
                html += '<option value="' + key + '"';
                if (op2) {
                    if (key == op2) {
                        html += ' selected="selected"';
                    }
                } else if (operands[dataType][key].isDefault) {
                    html += ' selected="selected"';
                }
                html += '>' + (typeof operands[dataType][key].label != 'undefined' ? operands[dataType][key].label: key) + '</option>';
            }
            return html;
        },

        /**
		 * buildQueryFormSerialize: given an HTML table of draggable rows,
		 * construct an array of triples, each in the form {op1:subject-value,
		 * op2:predicate-value, op3:object-value}
		 * 
		 * @param $form JQuery object
		 * @return Array of Objects
		 * @todo transform rows within rows into sub-queries
		 */
        buildQueryFormSerialize: function($form) {
            var filter = {
                rules: []
            },
            $rule = {},
            jsonFilter = '';

            $form.find('tr.draggable').each(function() {
                var temp = {};
                $fields = $(this).find('.kendra-filter-op1,.kendra-filter-op2,.kendra-filter-op3');

                $fields.each(function() {
                    var $this = $(this),
                    key = $this.attr('class').replace(/.*kendra-filter-(op\d).*/, '$1'),
                    value = $this.val();
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
		 * filterUpdate serialize the filter from the given form fields and run
		 * it against Solr
		 * 
		 * @param $form JQuery object
		 */
        filterUpdate: function($form) {
            if ($form.length == 0)
            return;
            var filter = Kendra.service.buildQueryFormSerialize($form);
            Kendra.service.solrQuery(filter.rules);
        },

        /**
		 * buildQueryFormPostProcess
		 * 
		 * @param $form JQuery object
		 */
        buildQueryFormPostProcess: function($form) {
            if ($form.length == 0)
            return;

            Kendra.service.buildQueryFormToggleRemoveLinks($form);

            $form.submit(function() {
                /**
				 * form onsubmit : serialize the form values into a smart filter
				 */
                Kendra.service.buildQueryFormSerialize($form);
                return true;

            }).find('table#kendra-smart-filters').sortable({
                /**
				 * make the search form rows draggable
				 */
                handle: 'a.tabledrag-handle',
                containment: 'table#kendra-smart-filters',
                items: 'tr.draggable',
                placeholder: 'ui-state-highlight',
                axis: 'y',

                change: function() {
                    Kendra.util.log('dropped sortable');
                    Kendra.service.filterUpdate($form);
                },
                create: function() {
                    Kendra.util.log('created sortable');
                },
                forcePlaceholderSize: true

            }).find('.kendra-filter-op1,.kendra-filter-op2,.kendra-filter-op3').change(function() {
                var $this = $(this);

                /**
				 * changing the subject selector affects the predicate options
				 * if the dataType changes, it also clears the object value
				 */
                if ($this.hasClass('kendra-filter-op1')) {
                    var key = $this.val(),
                    dataType = Kendra.util.dataTypeForKey(key);

                    if (dataType) {
                        var options = Kendra.service.buildQueryMappingTypes(dataType);

                        $this.parents('tr.draggable:eq(0)').find('.kendra-filter-op2').html(options).end().find('.kendra-filter-op3').each(function() {
                            Kendra.service.initDatepicker(this, dataType);
                        }).select().focus();
                    }
                }

                Kendra.service.filterUpdate($form);
                return true;

            }).filter('.kendra-filter-op3').each(function() {
                /**
				 * on initial form processing, set up datePicker for each
				 * datetime rule
				 */
                var key = $(this).parents('tr.draggable:eq(0)').find('select.kendra-filter-op1').val();
                if (typeof Kendra.mapping.mappings[key] != 'undefined') {
                    var dataType = Kendra.util.dataTypeForKey(key);
                    Kendra.service.initDatepicker(this, dataType);
                }
            });

        },

        /**
		 * initDatepicker
		 * 
		 * @param el JQuery selector or object
		 * @param dataType String
		 */
        initDatepicker: function(el, dataType) {
            var $op3 = $(el);
            if ($op3.hasClass('hasDatepicker')) {
                $op3.datepicker("destroy");
            }

            if (dataType == 'datetime') {
                $op3.datepicker({
                    dateFormat: "yy-mm-ddT00:00:00Z",
                    changeMonth: true,
                    changeYear: true,
                    constrainInput: false,
                    yearRange: '-50:+10',
                    showButtonPanel: true
                });
            }
        },

        /**
		 * set up ApacheSolr query
		 * 
		 * @param query Object hash of query facets => values
		 * @param params Object hash of Solr parameters
		 */
        solrQuery: function(query) {
            var query = query || {},
            params = {
                'facet': true,
                'facet.missing': true,
                'json.nl': 'map'
            };
            Kendra.Manager = new AjaxSolr.Manager({
                solrUrl: Kendra.search.solrUrl || '',

                /**
				 * override AbstractManager.handleResponse
				 */
                handleResponse: function(data) {
                    this.response = data;
                    Kendra.util.log(this.response, 'Kendra.service.solrQuery: got response: ' + data.response.numFound + ' records');

                    for (var widgetId in this.widgets) {
                        this.widgets[widgetId].afterRequest();
                    }
                }
            });

            Kendra.Manager.addWidget(new AjaxSolr.ResultWidget({
                id: 'kendra-search-result',
                target: '#kendra-search-docs'
            }));
            Kendra.Manager.addWidget(new AjaxSolr.PagerWidget({
                id: 'kendra-search-pager',
                target: '#kendra-search-pager',
                prevLabel: '&lt;',
                nextLabel: '&gt;',
                innerWindow: 1,
                renderHeader: function(perPage, offset, total) {
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

            /**
			 * set the solr query here
			 */
            Kendra.Manager.store.addByValue('q.alt', '*:*');
            Kendra.Manager.store.addByValue('fq', 'type:kendra_cat');

            /**
			 * now, build the actual query strings
			 */
            Kendra.service.buildSolrQuery(query);

            for (var name in params) {
                var val = params[name],
                multivariate_facets = ['fq', 'facet.field', 'facet.query'];

                if (typeof val == 'object') {
                    if ($.inArray(name, multivariate_facets) >= 0) {
                        for (var i in val) {
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
		 * quoteString: quote a string containing whitespace, otherwise return
		 * the original string useful for quoting substring queries within a
		 * Lucene query
		 */
        quoteString: function(str) {
            if (/\s+/.test(str))
            return '"' + str + '"';
            return str;
        },

        /**
		 * buildSolrQuery: group together the parameters necessary for doing a
		 * faceted search against Apache Solr
		 * 
		 * @param query Object
		 * @returns Object
		 * @TODO escape Lucene-specific characters: + - && || ! ( ) { } [ ] ^ " ~ * ? : \
		 * @TODO add query grouping
		 * @TODO add support for AND vs OR subqueries
		 * @TODO decide what to do about leading and trailing whitespace
		 */
        buildSolrQuery: function(query) {
            var i = {},
            subqueries = [],
            $s = $p = $o = dataType = '';

            Kendra.util.log(query, "Kendra.service.buildSolrQuery");

            for (var i in query) {
                $s = query[i].op1;
                $p = query[i].op2;
                $o = query[i].op3;

                /**
				 * format the operand according to data type
				 */
                dataType = Kendra.util.dataTypeForKey($s);

                switch (dataType) {
                case 'number':
                    if (!isNaN($o)) {
                        switch ($p) {
                        case 'lt':
                            /* less than */
                            subqueries.push($s + ':{* TO ' + $o + '}');
                            break;

                        case 'gt':
                            /* greater than */
                            subqueries.push($s + ':{' + $o + ' TO *}');
                            break;

                        case '==':
                            /* equal to */
                            subqueries.push($s + ':' + $o);
                            break;
                        }
                    }
                    break;
                case 'datetime':
                    /**
					 * @todo verify that $o is a valid datetime field
					 */
                    switch ($p) {
                    case 'lt':
                        /* before */
                        subqueries.push($s + ':{* TO ' + $o + '}');
                        break;

                    case 'gt':
                        /* after */
                        subqueries.push($s + ':{' + $o + ' TO *}');
                        break;

                    case '==':
                        /* on */
                        /** @todo verify */
                        subqueries.push($s + ':[' + $o + ' TO ' + $o + ']');
                        break;
                    }

                    break;
                case 'string':
                default:
                    switch ($p) {
                    case '^=':
                        /* starts with */
                        var substring = $o.split(/\s+/, 1).shift();
                        subqueries.push($s + ':' + substring + '*');
                        break;

                    case '$=':
                        /* ends with */
                        var substring = $o.split(/\s+/).pop();
                        subqueries.push($s + ':*' + substring);
                        break;

                    case '*=':
                        /* contains */
                        var substrings = $o.split(/\s+/);
                        for (i = 0, j = substrings.length; i < j; ++i) {
                            subqueries.push($s + ':*' + substrings[i] + '*');
                        }
                        break;

                    case '==':
                        /* is */
                    default:
                        subqueries.push($s + ':' + Kendra.service.quoteString($o));
                    }
                }
            }

            /**
			 * @todo allow OR clause grouping
			 */
            var q = '+(' + subqueries.join(') +(') + ')';
            Kendra.Manager.store.addByValue('q', q);
        }
    }
});

// document ready:
 (function($) {
    $(function() {
        if ($('body.node-type-smart-filter').length > 0 || $('#edit-smart-filter-node-form').length > 0) {
            var container = $('<div id="kendra-query-builder"><h3 class="activity">' + 'Loading&hellip;' + '</h3></div>');
            var $form = $('form#node-form');
            var buttons = ".column-side .buttons,.column-side .node-submitted",
            $source_field = {};

            if ($form.length > 0) {
                // smart filter editor page
                $source_field = $form.find('.body-field-wrapper').hide().before(container);
            } else {
                // smart filter view page
                $source_field = $('.node-smart_filter .node-content').append(container).find('p').hide();
            }

            $('<a href="#edit-body-wrapper">view JSON source</a>').click(function() {
                $source_field.toggle();
                return true;
            }).appendTo(buttons).wrap('<div class="view-source"/>');

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

                if ($form.length > 0) {
                    Kendra.service.getTemplate('smart_filter_row.tmpl.html',
                    function() {
                        Kendra.service.applyTemplate('smart_filter_wrapper.tmpl.html', jsonFilter,
                        function(html) {

                            $(selector).prepend(html).children('.activity').hide();

                            if ($form.length > 0) {
                                Kendra.service.buildQueryFormPostProcess($form);
                            }
                        });
                    });

                }

                /**
				 * run the query
				 */
                Kendra.service.applyTemplate('smart_filter_results.tmpl.html', null,
                function(html) {
                    $(selector).append(html).children('.activity').hide();

                    if (jsonFilter.rules && jsonFilter.rules.length > 0) {
                        Kendra.service.solrQuery(jsonFilter.rules);
                    }
                });

            },
            failure = function(status, data) {
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
            },
            function(status, data) {
                failure(status, data);
            });
        }
    });
})(jQuery);
