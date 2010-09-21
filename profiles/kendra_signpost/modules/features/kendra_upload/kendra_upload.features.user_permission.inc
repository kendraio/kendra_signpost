<?php

/**
 * Implementation of hook_user_default_permissions().
 */
function kendra_upload_user_default_permissions() {
  $permissions = array();

  // Exported permission: create kendra_import content
  $permissions['create kendra_import content'] = array(
    'name' => 'create kendra_import content',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'authenticated user',
    ),
  );

  // Exported permission: delete any kendra_import content
  $permissions['delete any kendra_import content'] = array(
    'name' => 'delete any kendra_import content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: delete own kendra_import content
  $permissions['delete own kendra_import content'] = array(
    'name' => 'delete own kendra_import content',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'authenticated user',
    ),
  );

  // Exported permission: edit any kendra_import content
  $permissions['edit any kendra_import content'] = array(
    'name' => 'edit any kendra_import content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: edit own kendra_import content
  $permissions['edit own kendra_import content'] = array(
    'name' => 'edit own kendra_import content',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'authenticated user',
    ),
  );

  return $permissions;
}
