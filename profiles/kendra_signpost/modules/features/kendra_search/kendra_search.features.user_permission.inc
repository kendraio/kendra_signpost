<?php

/**
 * Implementation of hook_user_default_permissions().
 */
function kendra_search_user_default_permissions() {
  $permissions = array();

  // Exported permission: create portable_filter_rule content
  $permissions['create portable_filter_rule content'] = array(
    'name' => 'create portable_filter_rule content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: delete any portable_filter_rule content
  $permissions['delete any portable_filter_rule content'] = array(
    'name' => 'delete any portable_filter_rule content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: delete own portable_filter_rule content
  $permissions['delete own portable_filter_rule content'] = array(
    'name' => 'delete own portable_filter_rule content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: edit any portable_filter_rule content
  $permissions['edit any portable_filter_rule content'] = array(
    'name' => 'edit any portable_filter_rule content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: edit own portable_filter_rule content
  $permissions['edit own portable_filter_rule content'] = array(
    'name' => 'edit own portable_filter_rule content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: use PHP for title patterns
  $permissions['use PHP for title patterns'] = array(
    'name' => 'use PHP for title patterns',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  return $permissions;
}
