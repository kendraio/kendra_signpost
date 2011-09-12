<?php

/**
 * Implementation of hook_feeds_importer_default().
 */
function nextshare_importer_feeds_importer_default() {
  $export = array();

  $feeds_importer = new stdClass;
  $feeds_importer->disabled = FALSE; /* Edit this to true to make a default feeds_importer disabled initially */
  $feeds_importer->api_version = 1;
  $feeds_importer->id = 'nextshare_core';
  $feeds_importer->config = array(
    'name' => 'nextshare_core',
    'description' => '',
    'fetcher' => array(
      'plugin_key' => 'FeedsHTTPFetcher',
      'config' => array(
        'auto_detect_feeds' => FALSE,
        'use_pubsubhubbub' => FALSE,
        'designated_hub' => '',
      ),
    ),
    'parser' => array(
      'plugin_key' => 'FeedsNextShareParser',
      'config' => array(),
    ),
    'processor' => array(
      'plugin_key' => 'FeedsNodeProcessor',
      'config' => array(
        'content_type' => 'nextshare_content',
        'input_format' => '0',
        'update_existing' => '2',
        'expire' => '-1',
        'mappings' => array(
          0 => array(
            'source' => 'Title',
            'target' => 'title',
            'unique' => FALSE,
          ),
          1 => array(
            'source' => 'Identifier',
            'target' => 'guid',
            'unique' => 1,
          ),
          2 => array(
            'source' => 'TitleImage',
            'target' => 'field_nextshare_image',
            'unique' => FALSE,
          ),
          3 => array(
            'source' => 'Abstract',
            'target' => 'body',
            'unique' => FALSE,
          ),
          4 => array(
            'source' => 'Producer',
            'target' => 'field_nextshare_producer',
            'unique' => FALSE,
          ),
          5 => array(
            'source' => 'Disseminator',
            'target' => 'field_nextshare_disseminator',
            'unique' => FALSE,
          ),
          6 => array(
            'source' => 'Duration',
            'target' => 'field_nextshare_duration',
            'unique' => FALSE,
          ),
          7 => array(
            'source' => 'Identifier',
            'target' => 'field_nextshare_identifier',
            'unique' => FALSE,
          ),
        ),
        'author' => 0,
        'authorize' => 0,
      ),
    ),
    'content_type' => 'nextshare_core',
    'update' => 0,
    'import_period' => '0',
    'expire_period' => 3600,
    'import_on_create' => 1,
  );
  $export['nextshare_core'] = $feeds_importer;

  return $export;
}
