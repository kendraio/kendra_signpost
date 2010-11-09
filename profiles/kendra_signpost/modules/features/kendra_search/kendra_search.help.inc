<?php
// $Id$

/**
 * Implementation of hook_help()
 */
function kendra_search_help($path, $arg) {
	// switch over section
	switch ($path) {
		case 'admin/help#kendra_search':
			$content = '<p>' . t("Please see !module_url", array('!module_url'=> l("the Kendra Atrium", "http://atrium.kendra.org.uk/dev/kendra-signpost"))) . '</p>';
			$content = '<p>' . t("Requires services.module.") . '</p>';
			
			break;
		default:
			$content = "";
	}
	return $content;
}
