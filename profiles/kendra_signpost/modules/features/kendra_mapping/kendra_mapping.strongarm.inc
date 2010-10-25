<?php

/**
 * Implementation of hook_strongarm().
 */
function kendra_mapping_strongarm() {
  $export = array();
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'ant_kendra_map';
  $strongarm->value = '0';

  $export['ant_kendra_map'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'ant_kendra_map_item';
  $strongarm->value = '1';

  $export['ant_kendra_map_item'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'ant_pattern_kendra_map';
  $strongarm->value = '';

  $export['ant_pattern_kendra_map'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'ant_pattern_kendra_map_item';
  $strongarm->value = 'mapping-item-[nid]';

  $export['ant_pattern_kendra_map_item'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'ant_php_kendra_map';
  $strongarm->value = 0;

  $export['ant_php_kendra_map'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'ant_php_kendra_map_item';
  $strongarm->value = 0;

  $export['ant_php_kendra_map_item'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'content_extra_weights_kendra_map';
  $strongarm->value = array(
    'title' => '-5',
    'revision_information' => '-1',
    'author' => '-2',
    'options' => '0',
    'menu' => '-3',
    'path' => '1',
  );

  $export['content_extra_weights_kendra_map'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'content_extra_weights_kendra_map_item';
  $strongarm->value = array(
    'title' => '-5',
    'revision_information' => '2',
    'author' => '1',
    'options' => '3',
    'menu' => '0',
    'path' => '4',
  );

  $export['content_extra_weights_kendra_map_item'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'enable_revisions_page_kendra_map';
  $strongarm->value = 1;

  $export['enable_revisions_page_kendra_map'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'enable_revisions_page_kendra_map_item';
  $strongarm->value = 1;

  $export['enable_revisions_page_kendra_map_item'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'node_options_kendra_map';
  $strongarm->value = array(
    0 => 'status',
  );

  $export['node_options_kendra_map'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'node_options_kendra_map_item';
  $strongarm->value = array(
    0 => 'status',
  );

  $export['node_options_kendra_map_item'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'show_diff_inline_kendra_map';
  $strongarm->value = 0;

  $export['show_diff_inline_kendra_map'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'show_diff_inline_kendra_map_item';
  $strongarm->value = 0;

  $export['show_diff_inline_kendra_map_item'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'show_preview_changes_kendra_map';
  $strongarm->value = 1;

  $export['show_preview_changes_kendra_map'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'show_preview_changes_kendra_map_item';
  $strongarm->value = 1;

  $export['show_preview_changes_kendra_map_item'] = $strongarm;
  return $export;
}
