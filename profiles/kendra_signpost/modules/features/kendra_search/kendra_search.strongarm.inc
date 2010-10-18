<?php

/**
 * Implementation of hook_strongarm().
 */
function kendra_search_strongarm() {
  $export = array();
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'content_extra_weights_portable_filter_rule';
  $strongarm->value = array(
    'title' => '-5',
    'revision_information' => '-3',
    'comment_settings' => '-1',
    'menu' => '-4',
    'path' => '-2',
  );

  $export['content_extra_weights_portable_filter_rule'] = $strongarm;
  return $export;
}
