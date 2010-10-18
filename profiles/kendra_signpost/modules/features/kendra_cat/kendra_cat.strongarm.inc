<?php

/**
 * Implementation of hook_strongarm().
 */
function kendra_cat_strongarm() {
  $export = array();
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'content_extra_weights_kendra_cat';
  $strongarm->value = array(
    'title' => '-5',
    'revision_information' => '5',
    'author' => '4',
    'options' => '6',
    'menu' => '3',
    'path' => '7',
  );

  $export['content_extra_weights_kendra_cat'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'node_options_kendra_cat';
  $strongarm->value = array(
    0 => 'status',
  );

  $export['node_options_kendra_cat'] = $strongarm;
  return $export;
}
