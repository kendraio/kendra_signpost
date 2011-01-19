<?php
// $Id$
/**
 * @file
 * Kendra Search provides an API for creating and using smart search filters.
 */
/**
 * translate map values by simple string unencoding, removing the URI prefix
 */
function kendra_search_map_alter(&$item, $key) {
	$item = kendra_search_map_alter_value($item);
}

/**
 * kendra_search_map_alter_value
 *
 * @param string $item URI containing a mapping term
 * @returns the printable version of a mapping term
 */
function kendra_search_map_alter_value($item) {
	return urldecode(end(split('#', $item)));
}

/**
 * kendra_search_map_alter_key
 * munge a string according to RFC 3986
 * see http://www.faqs.org/rfcs/rfc3986.html
 * 
 * also transforms the dot (.), tilde (~), and underscore (_) characters
 * and then transforms all percent (%) signs into underscores
 *
 * @param string $text URI corresponding to a mapping term
 * @returns a munged URI suitable for usage as a search facet for Apache Solr
 */
function kendra_search_map_alter_key($text) {
	$munged_text = "ss_kendra_" ;
	//	$munged_text .= preg_replace_callback( '/./', create_function('$c', 'if (preg_match("/[a-zA-Z0-9]/", $c)) return $c; return str_replace("%", "_", urlencode($c));'));
	$munged_text .= str_replace('~', '_7E', str_replace('.', '_2E', str_replace('%', '_', str_replace('_', '_5F', rawurlencode($text)))));
	return $munged_text ;
}

/**
 * Function to return an associative array of mappings with key/values based on args
 * Can be used to get results for FAPI form options.
 * @return array
 *  An associative array based on arguments
 **/
function kendra_search_get_array() {
	static $maps = NULL;
	if ($cache = cache_get('kendra_search_mappings')) {
		$maps = $cache->data;
	}
	if ($maps == NULL) {
		// only retrieve mappings on first call of this function
		$result = db_query("SELECT nid, title FROM node WHERE type = '%s'", 'kendra_import');
		$maps = array();

		// fetch mappings for data types
		$map = kendra_rdf_send("SELECT DISTINCT ?s, ?o WHERE {?s <http://kendra.org.uk/#hasType> ?o}", "application/sparql-results+json");
		$result_list = json_decode($map->data);
		if (!empty($result_list->results->bindings)) {
			foreach ($result_list->results->bindings as $binding) {
				$key = kendra_search_map_alter_key($binding->s->value);
				$value = $binding->o->value;
				$maps [$key] = array('dataType' => $value);
			}
		}

		while ($node = db_fetch_object($result)) {
			$graph = url("node/{$node->nid}", array('absolute' => TRUE));

			// fetch mappings for column headings
			$map = kendra_rdf_send("SELECT DISTINCT ?p FROM <{$graph}> WHERE {?s ?p ?o}", "application/sparql-results+json");
			$result_list = json_decode($map->data);
			if (!empty($result_list->results->bindings)) {
				foreach ($result_list->results->bindings as $binding) {
					$label = $node->title . ': ' . kendra_search_map_alter_value($binding->p->value);
					$key = kendra_search_map_alter_key($binding->p->value);

					if (!isset($maps[$key])) $maps[$key] = array();
					$maps [$key]['label'] = $label;
				}
			}
		}
		ksort($maps);
		cache_set('kendra_search_mappings', $maps);
	}

	return $maps;
}

/**
 * Function for returning an associative array useful for FAPI select elements
 * @param array
 *  The first value in the array (defaults to '' => 'Please Choose')
 * @return array
 *  Returns an associative array in $mapping['URI'] => $mapping['printable_name'] format.
 */
function kendra_search_get_options_array($first_element = array('' => 'Please Choose')) {
	return array_merge($first_element, kendra_search_get_array());
}

/**
 * Implementation of hook_init().
 *
 * <p>Includes the global JSON object <strong>Kendra</strong>, which gets exposed in the HTML.</p>
 * <p>Its format is based on syntax of modules included in the install profile, replacing underscores with dot syntax:
 * <pre>
 *  Kendra = {
 *      "cat" : {},
 *      "mapping" : {
 *          "mappings" : { } //
 *      },
 *      "search" : {
 *          "solrUrl" : "http://dev.signpost.kendra.org.uk:8983/solr" // see /admin/settings/apachesolr
 *      }
 *  }
 * </pre>
 */
function kendra_search_init() {
	// required libs
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/json2.js');
	drupal_add_js(drupal_get_path('module', 'json_server') .'/json_server.js');
	drupal_add_js(drupal_get_path('module', 'draggableviews') .'/draggableviews.js');

	// JQuery templates
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/jquery.tmpl.js');

	/**
	 * expose the required JQuery templates in the page head
	 * see http://api.jquery.com/template/
	 */
	/*
	$templates = array('smart-filter-row-tmpl' => 'kendra_search.smart_filter_row.tmpl.html','smart-filter-wrapper-tmpl' => 'kendra_search.smart_filter_wrapper.tmpl.html');
	foreach ($templates as $id => $template) {
		//$data = kendra_search_get_js_template($template, 'module','kendra_search', '/js/tmpl/');
		$data = kendra_search_service_get_template($template, 'module','kendra_search', '/js/tmpl/');
		drupal_set_html_head(sprintf('<script id="%s" type="text/x-jquery-tmpl">%s</script>', $id, $data));
	}
	*/

	// AjaxSolr core
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/Core.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/AbstractManager.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/managers/Manager.jquery.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/Parameter.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/ParameterStore.js');

	// AjaxSolr widget support
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/AbstractWidget.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/AbstractFacetWidget.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/AbstractTextWidget.js');

	// AjaxSolr UI widgets
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/widgets/ResultWidget.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/widgets/jquery/PagerWidget.js');

	// AjaxSolr theme support
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/helpers/ajaxsolr.support.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/helpers/ajaxsolr.theme.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/helpers/jquery/ajaxsolr.theme.js');

	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/kendra_search.theme.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/kendra_search.js');

	drupal_add_css(drupal_get_path('module', 'kendra_search') . "/css/kendra_search.css", "module");

	/**
	 * expose core Kendra vars in Javascript
	 */
	$jsonContainer = array(
		'search' => array(
	//'solrUrl' => 'http://dev.signpost.kendra.org.uk/solr/'
	//'solrUrl' => '/solr/'
	 'solrUrl' => 'http://' . variable_get('apachesolr_host', 'dev.signpost.kendra.org.uk') . ':' . variable_get('apachesolr_port', '8983') . variable_get('apachesolr_path', '/solr/dev') . '/'
	 )
	 ,'mapping'=> array('mappings'=>array())
	 );

	 $inline_script = 'var Kendra=Kendra || {};jQuery.extend(Kendra,' . drupal_to_js( $jsonContainer ) . ');';

	 drupal_add_js($inline_script, 'inline');

	 /**
	  * make the smart filter rules draggable
	  */
	 drupal_add_tabledrag('kendra-smart-filter-editor', 'order', 'sibling', 'filter-weight');
}

