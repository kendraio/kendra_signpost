<?php

/**
 * Implementation of hook_fieldgroup_default_groups().
 */
function kendra_search_fieldgroup_default_groups() {
  $groups = array();

  // Exported group: group_filter_properties
  $groups['portable_filter_rule-group_filter_properties'] = array(
    'group_type' => 'standard',
    'type_name' => 'portable_filter_rule',
    'group_name' => 'group_filter_properties',
    'label' => 'Filter Properties',
    'settings' => array(
      'form' => array(
        'style' => 'fieldset',
        'description' => '',
      ),
      'display' => array(
        'description' => '',
        'label' => 'above',
        'teaser' => array(
          'format' => 'fieldset',
          'exclude' => 0,
        ),
        'full' => array(
          'format' => 'fieldset',
          'exclude' => 0,
        ),
        '4' => array(
          'format' => 'fieldset',
          'exclude' => 0,
        ),
        '2' => array(
          'format' => 'fieldset',
          'exclude' => 0,
        ),
        '3' => array(
          'format' => 'fieldset',
          'exclude' => 0,
        ),
        'token' => array(
          'format' => 'fieldset',
          'exclude' => 0,
        ),
      ),
    ),
    'weight' => '0',
    'fields' => array(
      '0' => 'field_operand1',
      '1' => 'field_operator',
      '2' => 'field_operand2',
    ),
  );

  // Translatables
  // Included for use with string extractors like potx.
  t('Filter Properties');

  return $groups;
}
