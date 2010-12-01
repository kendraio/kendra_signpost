<?php

/**
 * Implementation of hook_strongarm().
 */
function kendra_upload_strongarm() {
  $export = array();
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'content_extra_weights_kendra_format';
  $strongarm->value = array(
    'title' => '32',
    'revision_information' => '36',
    'author' => '35',
    'options' => '37',
    'menu' => '34',
    'path' => '38',
  );

  $export['content_extra_weights_kendra_format'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'node_options_kendra_format';
  $strongarm->value = array(
    0 => 'status',
  );

  $export['node_options_kendra_format'] = $strongarm;
  return $export;
}
