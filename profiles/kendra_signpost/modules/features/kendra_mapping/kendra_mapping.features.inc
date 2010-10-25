<?php

/**
 * Implementation of hook_ctools_plugin_api().
 */
function kendra_mapping_ctools_plugin_api() {
  list($module, $api) = func_get_args();
  if ($module == "context" && $api == "context") {
    return array("version" => 3);
  }
  elseif ($module == "strongarm" && $api == "strongarm") {
    return array("version" => 1);
  }
}

/**
 * Implementation of hook_node_info().
 */
function kendra_mapping_node_info() {
  $items = array(
    'kendra_map' => array(
      'name' => t('Kendra Mapping'),
      'module' => 'features',
      'description' => t('Create a set of field and rdf mappings.'),
      'has_title' => '1',
      'title_label' => t('Title'),
      'has_body' => '0',
      'body_label' => '',
      'min_word_count' => '0',
      'help' => '',
    ),
    'kendra_map_item' => array(
      'name' => t('Kendra Mapping Item'),
      'module' => 'features',
      'description' => '',
      'has_title' => '1',
      'title_label' => t('Title'),
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
function kendra_mapping_views_api() {
  return array(
    'api' => '2',
  );
}
