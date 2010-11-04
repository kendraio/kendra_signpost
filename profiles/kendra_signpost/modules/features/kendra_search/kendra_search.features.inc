<?php

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
 * Implementation of hook_init().
 * 
 * <p>Includes the global object <strong>Kendra</strong></p>
 */
function kendra_search_init() {
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/Core.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/AbstractManager.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/managers/Manager.jquery.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/Parameter.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/lib/ajaxsolr/core/ParameterStore.js');
	drupal_add_js(drupal_get_path('module', 'kendra_search') .'/js/kendra_search.js');

	$inline_script = 'var Kendra = Kendra || {};';
	$inline_script .= 'Kendra.solrUrl = "http://' . variable_get('apachesolr_host', 'localhost') . ':' . variable_get('apachesolr_port', '8983') . variable_get('apachesolr_path', '/solr') . '";';
	drupal_add_js($inline_script, 'inline');
}
