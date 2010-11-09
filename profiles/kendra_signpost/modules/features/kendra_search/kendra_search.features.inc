<?php
// $Id$

/**
 * @file
 * Kendra Search provides an API for creating and using portable search filters.
 */

/**
 * Implementation of hook_ctools_plugin_api().
 */
function kendra_search_ctools_plugin_api() {
	list($module, $api) = func_get_args();
	if ($module == "strongarm" && $api == "strongarm") {
		return array("version" => 1);
	}
}

/**
 * Implementation of hook_node_info().
 */
function kendra_search_node_info() {
	$items = array(
    'portable_filter_rule' => array(
      'name' => t('Portable Filter Rule'),
      'module' => 'features',
      'description' => t('Portable Filter Rule'),
      'has_title' => '1',
      'title_label' => t('Left Operand'),
      'has_body' => '0',
      'body_label' => '',
      'min_word_count' => '0',
      'help' => '',
	),
	);
	return $items;
}

/**
 * Implementation of hook_views_api().
 */
function kendra_search_views_api() {
	return array(
    'api' => '2',
	);
}

/**
 * translate map values by simple string unencoding, removing the URI prefix
 */
function kendra_search_map_alter(&$item, $key) {
	$item = urldecode(end(split('#', $item)));
}

/**
 * Function to return an associative array of mappings with key/values based on args
 * Can be used to get results for FAPI form options.
 * @return array
 *  An associative array based on arguments
 **/
function kendra_search_get_array() {
	$mappings = kendra_mapping_allowed_values();
	array_walk($mappings, 'kendra_search_map_alter');

	return $mappings;
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
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/Core.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/AbstractManager.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/managers/Manager.jquery.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/Parameter.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/ParameterStore.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/kendra_search.js');

	/**
	 * expose core Kendra vars in Javascript
	 */
	$jsonContainer = array(
		'search' => array(
		'solrUrl' => '/cgi-bin/solr_search_proxy.py'
		// 'solrUrl' => 'http://' . variable_get('apachesolr_host', 'localhost') . ':' . variable_get('apachesolr_port', '8983') . variable_get('apachesolr_path', '/solr')
	)
	,'mapping'=> array('mappings'=>array())
	);

	$inline_script = 'var Kendra=' . drupal_to_js( $jsonContainer );

	drupal_add_js($inline_script, 'inline');
}

