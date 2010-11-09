<?php
/**
 * Implementation of hook_help()
 */
function kendra_search_help($path, $arg) {
	// switch over section
	switch ($path) {
		case 'admin/help#kendra_search':
			$content = t("Please see !module_url", array('!module_url'=> l("the Kendra Atrium", "http://atrium.kendra.org.uk/dev/kendra-signpost")));
			break;
		default:
			$content = "";
	}
	return $content;
}
