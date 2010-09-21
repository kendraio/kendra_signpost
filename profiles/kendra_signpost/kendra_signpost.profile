<?php

function kendra_signpost_profile_modules() {
  return array(
    // default core modules
    'help', 'menu', 'dblog', 'path',
    
    // views modules
    'views', 'views_ui',
    
    // features modules
    'ctools', 'features', 'strongarm', 'diff', 
    
    // admin modules
    'adminrole', 'admin_menu', 'vertical_tabs',
    
    // cck modules
    'content', 'nodereference', 'text', 'optionwidgets',
    'filefield', 'transliteration',
  );
}

function kendra_signpost_profile_details() {
  return array(
    'name' => 'Kendra Signpost',
    'description' => 'Select this profile install Drupal with Kendra Signpost functionality.'
  );
}
// Hijack the install profile default option!
function system_form_install_select_profile_form_alter(&$form, $form_state) {
  foreach($form['profile'] as $key => $element) {
    $form['profile'][$key]['#value'] = 'kendra_signpost';
  }
}

function _kendra_signpost_features() {
  return array(
    'kendra_upload',
  );
}

function kendra_signpost_profile_task_list() {
  return array(
    'kendra-signpost-features-batch' => st('Install features'),
    'kendra-signpost-configure-batch' => st('Configure features'),
  );
}


function kendra_signpost_profile_tasks(&$task, $url) {
  //Debug message: drupal_set_message("Doing $task");
  $output = '';
  
  if ($task == 'profile') {
    $task = 'kendra-signpost-features';
  }

  // We are running a batch task for this profile so basically do nothing and return page
  if (in_array($task, array('kendra-signpost-features-batch', 'kendra-signpost-configure-batch'))) {
    include_once 'includes/batch.inc';
    $output = _batch_page();
  }
  
  if ($task == 'kendra-signpost-features') {
    $modules = _kendra_signpost_features();
    $files = module_rebuild_cache();
    // create a batch job to install Kendra Signpost features
    foreach ($modules as $module) {
      $batch['operations'][] = array('_install_module_batch', array($module,$files[$module]->info['name']));
    }
    $batch['finished'] = '_kendra_signpost_features_finished';
    $batch['title'] = st('Installing @drupal', array('@drupal' => drupal_install_profile_name()));
    $batch['error_message'] = st('The installation has encountered an error.');
    variable_set('install_task', 'kendra-signpost-features-batch');
    batch_set($batch);
    batch_process($url, $url);
    return;
  }
  if ($task == 'kendra-signpost-configure') {
    $batch['title'] = st('Configuring @drupal', array('@drupal' => drupal_install_profile_name()));
    $batch['operations'][] = array('_kendra_signpost_configure', array());
    $batch['operations'][] = array('_kendra_signpost_check', array());
    $batch['finished'] = '_kendra_signpost_configure_finished';
    variable_set('install_task', 'kendra-signpost-configure-batch');
    batch_set($batch);
    batch_process($url, $url);
    return;    
  }
  return $output;
}


function _kendra_signpost_configure() {
  variable_set('site_footer', 'Powered by '. l('Kendra Signpost', 'http://www.kendra.org.uk', array('absolute' => TRUE)));
  variable_set('admin_theme', 'rubik');
}

































