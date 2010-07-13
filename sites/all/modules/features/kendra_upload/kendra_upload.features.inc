<?php

/**
 * Implementation of hook_content_default_fields().
 */
function kendra_upload_content_default_fields() {
  module_load_include('inc', 'kendra_upload', 'kendra_upload.defaults');
  $args = func_get_args();
  return call_user_func_array('_kendra_upload_content_default_fields', $args);
}

/**
 * Implementation of hook_node_info().
 */
function kendra_upload_node_info() {
  module_load_include('inc', 'kendra_upload', 'kendra_upload.features.node');
  $args = func_get_args();
  return call_user_func_array('_kendra_upload_node_info', $args);
}

/**
 * Implementation of hook_user_default_permissions().
 */
function kendra_upload_user_default_permissions() {
  module_load_include('inc', 'kendra_upload', 'kendra_upload.defaults');
  $args = func_get_args();
  return call_user_func_array('_kendra_upload_user_default_permissions', $args);
}

/**
 * Implementation of hook_views_default_views().
 */
function kendra_upload_views_default_views() {
  module_load_include('inc', 'kendra_upload', 'kendra_upload.features.views');
  $args = func_get_args();
  return call_user_func_array('_kendra_upload_views_default_views', $args);
}
