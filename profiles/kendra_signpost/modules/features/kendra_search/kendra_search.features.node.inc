<?php

/**
 * Helper to implementation of hook_node_info().
 */
function _kendra_search_node_info() {
  $items = array(
    'portable_filter_rule' => array(
      'name' => t('Portable Filter Rule'),
      'module' => 'features',
      'description' => t('Portable Filter Rule'),
      'has_title' => '1',
      'title_label' => t('Left Operand'),
      'has_body' => '0',
      'body_label' => '',
      'min_word_count' => '0',
      'help' => '',
    ),
  );
  return $items;
}
