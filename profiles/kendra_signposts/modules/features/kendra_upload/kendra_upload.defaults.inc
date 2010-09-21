<?php

/**
 * Helper to implementation of hook_content_default_fields().
 */
function _kendra_upload_content_default_fields() {
  $fields = array();

  // Exported field: field_upload_file
  $fields[] = array(
    'field_name' => 'field_upload_file',
    'type_name' => 'kendra_import',
    'display_settings' => array(
      'label' => array(
        'format' => 'above',
        'exclude' => 0,
      ),
      'teaser' => array(
        'format' => 'default',
        'exclude' => 0,
      ),
      'full' => array(
        'format' => 'default',
        'exclude' => 0,
      ),
      '4' => array(
        'format' => 'default',
        'exclude' => 0,
      ),
    ),
    'widget_active' => '1',
    'type' => 'filefield',
    'required' => '1',
    'multiple' => '0',
    'module' => 'filefield',
    'active' => '1',
    'list_field' => '0',
    'list_default' => 1,
    'description_field' => '0',
    'widget' => array(
      'file_extensions' => 'csv',
      'file_path' => 'csv_uploads',
      'progress_indicator' => 'bar',
      'max_filesize_per_file' => '',
      'max_filesize_per_node' => '',
      'label' => 'File',
      'weight' => '-4',
      'description' => 'Attach a csv to this upload node.',
      'type' => 'filefield_widget',
      'module' => 'filefield',
    ),
  );

  // Translatables
  array(
    t('File'),
  );

  return $fields;
}

/**
 * Helper to implementation of hook_user_default_permissions().
 */
function _kendra_upload_user_default_permissions() {
  $permissions = array();

  // Exported permission: create kendra_import content
  $permissions[] = array(
    'name' => 'create kendra_import content',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'authenticated user',
    ),
  );

  // Exported permission: delete any kendra_import content
  $permissions[] = array(
    'name' => 'delete any kendra_import content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: delete own kendra_import content
  $permissions[] = array(
    'name' => 'delete own kendra_import content',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'authenticated user',
    ),
  );

  // Exported permission: edit any kendra_import content
  $permissions[] = array(
    'name' => 'edit any kendra_import content',
    'roles' => array(
      '0' => 'administrator',
    ),
  );

  // Exported permission: edit own kendra_import content
  $permissions[] = array(
    'name' => 'edit own kendra_import content',
    'roles' => array(
      '0' => 'administrator',
      '1' => 'authenticated user',
    ),
  );

  return $permissions;
}
