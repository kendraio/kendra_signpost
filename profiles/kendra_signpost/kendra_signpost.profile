<?php

function kendra_signpost_profile_modules() {
	return array(
	// default core modules
    'help', 'menu', 'dblog', 'path',

	// views modules
    'views', 'views_ui', 'views_atom', 

	// features modules
    'ctools', 'features', 'strongarm', 'diff', 'fieldgroup',

	// admin modules
    'adminrole', 'admin_menu', 'vertical_tabs',

	// cck modules
    'content', 'nodereference', 'text', 'optionwidgets',
    'filefield', 'transliteration',

	// utility modules
    'job_queue',

	// search interface modules
    'draggableviews', 'draggableviews_cck', 'number', 'auto_nodetitle', 'token', 'apachesolr', 'search', 'apachesolr_search',

	// services + json backend
  	'services', 'json_server', 'node_service', 'services_keyauth', 'system_service',

	// jquery
  	'jquery_update',

	// rdf / sparql
  	'rdfdb',

	// kendra mapping feature requirements
    'nodereference_url', 'context', 'context_ui', 
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
    'kendra_rdf',
    'kendra_cat',
    'kendra_mapping', 
    'kendra_search', 
    'kendra_search_service', 
	);
}

function kendra_signpost_profile_task_list() {
	return array(
    'kendra-signpost-features-batch' => st('Install features'),
    'kendra-signpost-configure-batch' => st('Configure features'),
	);
}


function kendra_signpost_profile_tasks(&$task, $url) {
	//Debug message:
	watchdog('kendra_signpost_profile', "Doing $task");
	$output = '';

	if ($task == 'profile') {
		$task = 'kendra-signpost-features';
	}

	// We are running a batch task for this profile so basically do nothing and return page
	if (in_array($task, array('kendra-signpost-features-batch', 'kendra-signpost-configure-batch'))) {
		include_once 'includes/batch.inc';
		$output = _batch_page();
	}

	switch ($task) {
		case 'kendra-signpost-features':
			watchdog('kendra_signpost_profile', "kendra_signpost_profile_tasks:kendra-signpost-features:url=$url");
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

		case 'kendra-signpost-configure':
			watchdog('kendra_signpost_profile', "kendra_signpost_profile_tasks:kendra-signpost-configure:url=$url");
			$batch['title'] = st('Configuring @drupal', array('@drupal' => drupal_install_profile_name()));
			$batch['operations'][] = array('_kendra_signpost_configure', array());
			$batch['operations'][] = array('_kendra_signpost_check', array());
			$batch['error_message'] = st('The configuration task has encountered an error.');
			$batch['finished'] = '_kendra_signpost_configure_finished';
			variable_set('install_task', 'kendra-signpost-configure-batch');
			batch_set($batch);
			batch_process($url, $url);
			return;
		case 'kendra-signpost-configure-batch': // @FIXME?
		watchdog('kendra_signpost_profile', "kendra_signpost_profile_tasks:kendra-signpost-configure-batch:url=$url");
	}
	return $output;
}


function _kendra_signpost_configure() {
	watchdog('kendra_signpost_profile', "enter:_kendra_signpost_configure");
	variable_set('site_footer', 'Powered by '. l('Kendra Signpost', 'http://www.kendra.org.uk', array('absolute' => TRUE)));
	variable_set('admin_theme', 'rubik');
	variable_set('site_frontpage', 'kendra-front');
	variable_set('apachesolr_search_excluded_types', array(
    'kendra_map' => 'kendra_map',
    'kendra_map_item' => 'kendra_map_item',
    'smart_filter' => 'smart_filter',
    'sparql' => 'sparql',
    'kendra_cat' => 0,
    'kendra_import' => 0,
	));
	watchdog('kendra_signpost_profile', "exit:_kendra_signpost_configure");
}

function _kendra_signpost_check() {
	watchdog('kendra_signpost_profile', "enter:_kendra_signpost_check");
	// Perform any final installation tasks
	drupal_flush_all_caches();
	variable_set('theme_default', 'rubik');

	// As a final step of the install process force a revert of the features
	// to change settings that may have been altered by other steps
	// of the install process:
	$revert = array(
    'kendra_upload' => array('user_permission', 'variable'),
	);
	features_revert($revert);
	// remove search box so that tests will run
	$theme_settings = variable_get('theme_settings', array());
	$theme_settings['toggle_search'] = 0;
	variable_set('theme_settings', $theme_settings);
	watchdog('kendra_signpost_profile', "exit:_kendra_signpost_check");
}

function kendra_signpost_form_alter(&$form, $form_state, $form_id) {
	if ($form_id == 'install_configure') {
		// Set default for site name field.
		$form['site_information']['site_name']['#default_value'] = "Kendra Signpost Trial";
		$form['admin_account']['account']['name']['#default_value'] = "admin";
	}
}

// For when feature install has finished:
function _kendra_signpost_features_finished($success, $results) {
	variable_set('install_task', 'kendra-signpost-configure');
	watchdog('kendra_signpost_profile', "_kendra_signpost_features_finished");
}
// For when configuration batch job has finished:
function _kendra_signpost_configure_finished($success, $results) {
	watchdog('kendra_signpost_profile', "enter:_kendra_signpost_configure_finished");
	variable_set('kendra_signpost_install', 1);
	// Get out of this batch and let the installer continue.
	variable_set('install_task', 'profile-finished');
	watchdog('kendra_signpost_profile', "exit:_kendra_signpost_configure_finished");
}

