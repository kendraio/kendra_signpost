<?php

/**
 * Implementation of hook_feeds_importer_default().
 */
function kendra_upload_feeds_importer_default() {
  $export = array();
  $feeds_importer = new stdClass;
  $feeds_importer->disabled = FALSE; /* Edit this to true to make a default feeds_importer disabled initially */
  $feeds_importer->api_version = 1;
  $feeds_importer->id = 'test_atom_import';
  $feeds_importer->config = array(
    'name' => 'P2PNext Atom Import',
    'description' => 'Import the data from a P2PNext Atom feed.',
    'fetcher' => array(
      'plugin_key' => 'FeedsHTTPFetcher',
      'config' => array(
        'auto_detect_feeds' => 1,
        'use_pubsubhubbub' => 0,
        'designated_hub' => '',
      ),
    ),
    'parser' => array(
      'plugin_key' => 'P2PNextAtom',
      'config' => array(),
    ),
    'processor' => array(
      'plugin_key' => 'DebugProcessor',
      'config' => array(
        'mappings' => array(
          0 => array(
            'source' => 'mpeg_file',
            'target' => 'field_upload_file',
            'unique' => FALSE,
          ),
          1 => array(
            'source' => 'channel',
            'target' => 'title',
            'unique' => FALSE,
          ),
        ),
        'content_type' => 'kendra_import',
        'update_existing' => '0',
        'expire' => '-1',
        'author' => 0,
      ),
    ),
    'content_type' => '',
    'update' => 0,
    'import_period' => '1800',
    'expire_period' => 3600,
    'import_on_create' => 1,
  );

  $export['test_atom_import'] = $feeds_importer;
  return $export;
}
