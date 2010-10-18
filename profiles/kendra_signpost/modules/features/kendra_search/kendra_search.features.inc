<?php

/**
 * Implementation of hook_content_default_fields().
 */
function kendra_search_content_default_fields() {
  module_load_include('inc', 'kendra_search', 'kendra_search.defaults');
  $args = func_get_args();
  return call_user_func_array('_kendra_search_content_default_fields', $args);
}

/**
 * Implementation of hook_ctools_plugin_api().
 */
function kendra_search_ctools_plugin_api() {
  module_load_include('inc', 'kendra_search', 'kendra_search.defaults');
  $args = func_get_args();
  return call_user_func_array('_kendra_search_ctools_plugin_api', $args);
}

/**
 * Implementation of hook_fieldgroup_default_groups().
 */
function kendra_search_fieldgroup_default_groups() {
  module_load_include('inc', 'kendra_search', 'kendra_search.defaults');
  $args = func_get_args();
  return call_user_func_array('_kendra_search_fieldgroup_default_groups', $args);
}

/**
 * Implementation of hook_node_info().
 */
function kendra_search_node_info() {
  module_load_include('inc', 'kendra_search', 'kendra_search.features.node');
  $args = func_get_args();
  return call_user_func_array('_kendra_search_node_info', $args);
}

/**
 * Implementation of hook_user_default_permissions().
 */
function kendra_search_user_default_permissions() {
  module_load_include('inc', 'kendra_search', 'kendra_search.defaults');
  $args = func_get_args();
  return call_user_func_array('_kendra_search_user_default_permissions', $args);
}

/**
 * Implementation of hook_strongarm().
 */
function kendra_search_strongarm() {
  module_load_include('inc', 'kendra_search', 'kendra_search.defaults');
  $args = func_get_args();
  return call_user_func_array('_kendra_search_strongarm', $args);
}

/**
 * Implementation of hook_views_default_views().
 */
function kendra_search_views_default_views() {
  module_load_include('inc', 'kendra_search', 'kendra_search.features.views');
  $args = func_get_args();
  return call_user_func_array('_kendra_search_views_default_views', $args);
}
