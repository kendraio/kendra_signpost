<?php

/**
 * Implementation of hook_strongarm().
 */
function kendra_mapping_strongarm() {
  $export = array();
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
  return $export;
}
