<?php

/**
 * Implementation of hook_user_default_permissions().
 */
function kendra_search_user_default_permissions() {
  $permissions = array();

  // Exported permission: administer search
  $permissions['administer search'] = array(
    'name' => 'administer search',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: create portable_filter content
  $permissions['create portable_filter content'] = array(
    'name' => 'create portable_filter content',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'anonymous user',
    ),
  );

  // Exported permission: create portable_filter_rule content
  $permissions['create portable_filter_rule content'] = array(
    'name' => 'create portable_filter_rule content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: delete any portable_filter content
  $permissions['delete any portable_filter content'] = array(
    'name' => 'delete any portable_filter content',
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

  // Exported permission: delete own portable_filter content
  $permissions['delete own portable_filter content'] = array(
    'name' => 'delete own portable_filter content',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'anonymous user',
    ),
  );

  // Exported permission: delete own portable_filter_rule content
  $permissions['delete own portable_filter_rule content'] = array(
    'name' => 'delete own portable_filter_rule content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: edit any portable_filter content
  $permissions['edit any portable_filter content'] = array(
    'name' => 'edit any portable_filter content',
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

  // Exported permission: edit own portable_filter content
  $permissions['edit own portable_filter content'] = array(
    'name' => 'edit own portable_filter content',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'anonymous user',
    ),
  );

  // Exported permission: edit own portable_filter_rule content
  $permissions['edit own portable_filter_rule content'] = array(
    'name' => 'edit own portable_filter_rule content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: load CSV mappings data
  $permissions['load CSV mappings data'] = array(
    'name' => 'load CSV mappings data',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'anonymous user',
      '2' => 'authenticated user',
    ),
  );

  // Exported permission: search content
  $permissions['search content'] = array(
    'name' => 'search content',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'anonymous user',
    ),
  );

  // Exported permission: use PHP for title patterns
  $permissions['use PHP for title patterns'] = array(
    'name' => 'use PHP for title patterns',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: use advanced search
  $permissions['use advanced search'] = array(
    'name' => 'use advanced search',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'anonymous user',
    ),
  );

  return $permissions;
}
