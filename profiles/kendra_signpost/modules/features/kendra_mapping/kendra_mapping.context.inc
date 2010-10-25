<?php

/**
 * Implementation of hook_context_default_contexts().
 */
function kendra_mapping_context_default_contexts() {
  $export = array();
  $context = new stdClass;
  $context->disabled = FALSE; /* Edit this to true to make a default context disabled initially */
  $context->api_version = 3;
  $context->name = 'kendra_mappings';
  $context->description = '';
  $context->tag = '';
  $context->conditions = array(
    'node' => array(
      'values' => array(
        'kendra_map' => 'kendra_map',
      ),
      'options' => array(
        'node_form' => '1',
      ),
    ),
  );
  $context->reactions = array(
    'block' => array(
      'blocks' => array(
        'views-kendra_mapping_items-block_1' => array(
          'module' => 'views',
          'delta' => 'kendra_mapping_items-block_1',
          'region' => 'content',
          'weight' => 0,
        ),
      ),
    ),
  );
  $context->condition_mode = 0;

  $export['kendra_mappings'] = $context;
  return $export;
}
