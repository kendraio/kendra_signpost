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
      'plugin_key' => 'FeedsP2PNextParser',
      'config' => array(),
    ),
    'processor' => array(
      'plugin_key' => 'FeedsFileFieldProcessor',
      'config' => array(
        'node_type' => 'kendra_import',
        'node_author' => 0,
        'filefield' => 'field_upload_file',
        'mappings' => array(
          0 => array(
            'source' => 'FeedTitle',
            'target' => 'feed_id',
            'unique' => FALSE,
          ),
          1 => array(
            'source' => 'FeedTitle',
            'target' => 'node_title',
            'unique' => FALSE,
          ),
          2 => array(
            'source' => 'FeedTitle',
            'target' => 'column',
            'unique' => 0,
          ),
          3 => array(
            'source' => 'Updated',
            'target' => 'column',
            'unique' => 0,
          ),
          4 => array(
            'source' => 'Title',
            'target' => 'column',
            'unique' => 0,
          ),
          5 => array(
            'source' => 'Identifier',
            'target' => 'column',
            'unique' => 1,
          ),
          6 => array(
            'source' => 'Abstract',
            'target' => 'column',
            'unique' => FALSE,
          ),
          7 => array(
            'source' => 'Duration',
            'target' => 'column',
            'unique' => FALSE,
          ),
          8 => array(
            'source' => 'TitleImage',
            'target' => 'column',
            'unique' => FALSE,
          ),
          9 => array(
            'source' => 'MediaUri',
            'target' => 'column',
            'unique' => FALSE,
          ),
        ),
      ),
    ),
    'content_type' => 'p2pnext_atom',
    'update' => 0,
    'import_period' => '86400',
    'expire_period' => 3600,
    'import_on_create' => 1,
  );
  $export['test_atom_import'] = $feeds_importer;

  return $export;
}
