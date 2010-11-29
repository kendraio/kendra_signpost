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
    'smart_filter' => array(
      'name' => t('Smart Filter'),
      'module' => 'features',
      'description' => t('User-generated smart content filter'),
      'has_title' => '1',
      'title_label' => t('Title'),
      'has_body' => '1',
      'body_label' => t('Body'),
      'min_word_count' => '0',
      'help' => '',
	));
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

