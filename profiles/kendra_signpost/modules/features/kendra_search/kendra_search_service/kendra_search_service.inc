<?php

/**
 * Returns an array of mappings
 * explose the mapping array as an array( 'mapping URI' => 'translated name' )
 */
function kendra_search_service_get_mappings_array() {
	$mappings = kendra_search_get_array();

	if (!$mappings) {
		return services_error(t('No mappings were found.'));
	}
	return $mappings;
}

/**
 * kendra_search_service_get_template
 *
 * returns the contents of a (cached) JQuery template file
 * removes PHP tags, comments, and excess whitespace from the template body
 *
 * @param $filename String
 * @param $parent_type String parent item type (i.e. theme, theme_engine, module, profile)
 * @param $parent_name String parent item name (i.e. module or theme name)
 * @param $subdirectory String optional directory within the parent container; should have leading and trailing slashes
 */
function kendra_search_service_get_template($filename, $parent_type = 'module', $parent_name = 'help', $subdirectory = '/') {

	$cache_key = KENDRA_SEARCH_CACHE_PREFIX.$filename;

	$debugging = TRUE;

	if (!$debugging && $cache = cache_get($cache_key)) {
		$data = $cache->data;
	} else {
		$path = drupal_get_path($parent_type, $parent_name);
		$fullpath = $path . $subdirectory . $filename;

		if (!file_check_location($fullpath, $path) || !is_file($fullpath))
		return services_error(t('The requested template @fullpath was not found.', array('@fullpath'=>$fullpath)));

		ob_start();
		include( $fullpath );
		$data = ob_get_contents();
		ob_end_clean();

		if (!drupal_validate_utf8($data))
		return services_error(t('The requested template @fullpath was not valid.', array('@fullpath'=>$fullpath)));

		// strip PHP tags, comments, and excess whitespace from the template body
		$data = preg_replace(array('/<\?((?!\?>).)*\?>/sU', '/<!\-\-(.+)\-\->/U', '/\s\s+/s'), array('', '', ' '), $data);
		cache_set($cache_key, $data);
	}

	return $data;
}

