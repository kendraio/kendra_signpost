<?php

/**
 * Implementation of hook_strongarm().
 */
function kendra_cat_strongarm() {
  $export = array();

  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'comment_anonymous_kendra_cat';
  $strongarm->value = 0;
  $export['comment_anonymous_kendra_cat'] = $strongarm;

  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'comment_controls_kendra_cat';
  $strongarm->value = '3';
  $export['comment_controls_kendra_cat'] = $strongarm;

  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'comment_default_mode_kendra_cat';
  $strongarm->value = '4';
  $export['comment_default_mode_kendra_cat'] = $strongarm;

  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'comment_default_order_kendra_cat';
  $strongarm->value = '1';
  $export['comment_default_order_kendra_cat'] = $strongarm;

  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'comment_default_per_page_kendra_cat';
  $strongarm->value = '50';
  $export['comment_default_per_page_kendra_cat'] = $strongarm;

  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'comment_form_location_kendra_cat';
  $strongarm->value = '0';
  $export['comment_form_location_kendra_cat'] = $strongarm;

  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'comment_kendra_cat';
  $strongarm->value = '2';
  $export['comment_kendra_cat'] = $strongarm;

  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'comment_preview_kendra_cat';
  $strongarm->value = '1';
  $export['comment_preview_kendra_cat'] = $strongarm;

  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'comment_subject_field_kendra_cat';
  $strongarm->value = '1';
  $export['comment_subject_field_kendra_cat'] = $strongarm;

  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'content_extra_weights_kendra_cat';
  $strongarm->value = array(
    'title' => '24',
    'revision_information' => '34',
    'author' => '33',
    'options' => '35',
    'comment_settings' => '30',
    'menu' => '32',
    'path' => '36',
    'xmlsitemap' => '30',
  );
  $export['content_extra_weights_kendra_cat'] = $strongarm;

  $strongarm = new stdClass;
  $strongarm->disabled = FALSE; /* Edit this to true to make a default strongarm disabled initially */
  $strongarm->api_version = 1;
  $strongarm->name = 'node_options_kendra_cat';
  $strongarm->value = array(
    0 => 'status',
  );
  $export['node_options_kendra_cat'] = $strongarm;

  return $export;
}
