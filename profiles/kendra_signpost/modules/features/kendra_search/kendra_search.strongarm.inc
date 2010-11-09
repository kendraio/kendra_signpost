<?php
// $Id$

/**
 * Implementation of hook_strongarm().
 */
function kendra_search_strongarm() {
  $export = array();
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'apachesolr_host';
  $strongarm->value = 'dev.signpost.kendra.org.uk';

  $export['apachesolr_host'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'apachesolr_path';
  $strongarm->value = '/solr';

  $export['apachesolr_path'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'apachesolr_port';
  $strongarm->value = '8983';

  $export['apachesolr_port'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'apachesolr_read_only';
  $strongarm->value = '0';

  $export['apachesolr_read_only'] = $strongarm;
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'apachesolr_rows';
  $strongarm->value = '10';

  $export['apachesolr_rows'] = $strongarm;
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
  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'node_options_portable_filter_rule';
  $strongarm->value = array(
    0 => 'status',
    1 => 'promote',
  );

  $export['node_options_portable_filter_rule'] = $strongarm;
  return $export;
}
