<?php
// $Id$

/**
 * A parser for the P2P-Next Programme Feed format see example at: 
 *
 *   http://p2pnextfeed1.rad0.net/content/feed/bbc/bbcone
 *
 * The FeedsP2PNextProgrammeFeedParser extends Feeds FeedsParser and implements 
 * P2P-Next Programme content type parsing and source mapping.
 *
 * P2P-Next Programme content type:
 *
 * 1) title			(ALREADY HANDLED)
 * 2) link			(NOT USED)
 * 3) category		(   )
 * 4) id			(   )
 * 5) updated		(NOT USED)
 * 6) p2pnext:image	(   )
 *
 *  xmlns="http://www.w3.org/2005/Atom" 
 *  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
 *  xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" 
 *  xmlns:dc="http://purl.org/dc/elements/1.1/" 
 *  xmlns:p2pnext="urn:p2pnext:contentfeed:2009" 
 *  xmlns:taxo="http://purl.org/rss/1.0/modules/taxonomy/">
 *
 *   =========>  NEW !!!
 * A simple parser that extends FeedsSimplePieParser by adding support for a
 * couple of Custom Namespace tags.
 */
 
include_once(drupal_get_path('module', 'feeds') .'/plugins/FeedsSimplePieParser.inc');

class FeedsP2PNextProgrammeFeedParser extends FeedsSimplePieParser {
  /**
   * Add the extra mapping sources provided by this parser.
   */
  public function getMappingSources() {
    return parent::getMappingSources() + array(

      'pid' => array(
        'name' => t('Programme id'),
        'description' => t('Id of the programme.'),
      ),
      'channel' => array(
        'name' => t('Programme channel'),
        'description' => t('The channel of the programme.'),
      ),
      'summary' => array(
        'name' => t('Programme annotation'),
        'description' => t('Annotation of the programme.'),
      ),
      'p2pnext_image' => array(
        'name' => t('Programme image'),
        'description' => t('The thumbnail image of the programme.'),
      ),
      'torrent' => array(
        'name' => t('Programme torrent'),
        'description' => t('The torrent file of the programme.'),
      ),
      'producer' => array(
        'name' => t('Programme producer'),
        'description' => t('The producer of the programme.'),
      ),
      'disseminator' => array(
        'name' => t('Programme disseminator'),
        'description' => t('The disseminator of the programme.'),
      ),
      'copyright' => array(
        'name' => t('Programme copyright string'),
        'description' => t('The copyright string of the programme.'),
      ),
      'duration' => array(
        'name' => t('Programme duration'),
        'description' => t('The duration of the programme.'),
      ),
      'aptype' => array(
        'name' => t('Programme AvailabilityPeriod type'),
        'description' => t('The AvailabilityPeriod type of the programme.'),
      ),
      'starttime' => array(
        'name' => t('Programme start time'),
        'description' => t('The start time of the programme.'),
      ),
      // Try to calculate also endtime to database, goes to field_start_time_value2
	  'endtime' => array(
        'name' => t('Programme end time'),
        'description' => t('The end time of the programme.'),
      ),
	  // With one extra DB-query we fill in the channel name (not only the id).
	  'channel_name' => array(
	    'name' => t('Channel name'),
		'description' => t('The user-friendly name of the channel this programme belongs to.'),
	  ),
    );
  }

  /**
   * Parse the extra mapping sources provided by this parser.
   
  <entry>
    <title>Grow Your Own Drugs Series 2, Exotic Plants</title>
    <link type="application/xml" href="http://p2pnextfeed1.rad0.net/content/info/bbc/bbcone/b00rz6qv" />
    <id>urn:bbc-bbcone-b00rz6qv</id>
    <updated>2010-06-27T23:10:00Z</updated>
    <summary>James Wong tests plant-based remedies, including a lemongrass insect repellent.</summary>
    <p2pnext:image src="http://www.bbc.co.uk/iplayer/images/series/b00rs784_150_84.jpg" />
  </entry>
   
   
   
  parseExtensions IS CALLED BY 
	class FeedsSimplePieParser extends FeedsParser 
    public function parse(FeedsImportBatch $batch, FeedsSource $source)
    FOUND IN FILE: /sites/all/modules/feeds/plugins/FeedsSimplePieParser.inc
  */
  protected function parseExtensions(&$item, $simplepie_item) {
    $p2pnext_namespace = 'urn:p2pnext:contentfeed:2009'; // is this a namespace?
    $atom_namespace = 'http://www.w3.org/2005/Atom';
	
    $item['summary'] =  $simplepie_item->get_description();
	
	if ($image_parent = $simplepie_item->get_item_tags($p2pnext_namespace, 'image')) { 
	  if (isset($image_parent[0]['attribs']['']['src'])) {
	    $item['p2pnext_image'] = $simplepie_item->sanitize($image_parent[0]['attribs']['']['src'], SIMPLEPIE_CONSTRUCT_IRI);
	  }
    }

    // extract also the programme id and channel id ...
	$pid = $simplepie_item->get_id();
	$item['pid'] = $pid;
    //$pos = strrpos($pid, '-');
	//$item['channel'] = substr($pid,0,$pos);
    // <id>urn:bbc-bbcone</id>
    // <id>urn:bbc-bbcone-b00snzp7</id>
  
    // NOTE: id can be also like this: 
	// <id>urn:bbc-bbcfour-b00ttj2r-2</id>
    // Let's extract chars from beginning to the second '-' letter.
	//
	$pos = strpos($pid, '-');
	$item['channel'] = substr($pid,0,$pos);
	$subres = substr($pid,$pos+1); // 
	$subpos = strpos($subres, '-');
	$item['channel'] .= '-';
	$item['channel'] .= substr($subres,0,$subpos);
	
	// With one extra DB-query we fill in the channel name (not only the id).
	$db_res = db_query ("SELECT nid FROM {content_type_channel} WHERE field_id_value = '%s'", $item['channel']);
    $db_item = db_fetch_object($db_res);
    if($db_item) {
	  $db_chan = node_load($db_item->nid);
      $item['channel_name'] = $db_chan->title;
	}
	
	if ($links = $simplepie_item->get_item_tags($atom_namespace, 'link')) {
	  if (isset($links[0]['attribs']['']['href'])) {
	    $metadata_address = $simplepie_item->sanitize($links[0]['attribs']['']['href'], SIMPLEPIE_CONSTRUCT_IRI);
	  
		// Extract metadata begin
        $http_result = drupal_http_request($metadata_address);
        if ($http_result->code == 200) {
          $doc = new DOMDocument();
          try {
            $doc->loadXML($http_result->data);
          } 
		  catch (DOMException $e) {
            $msg = "Error parsing Mpeg7 metadata for %url: %msg.";
            $vars = array('%url'=>$metadata_address, '%msg'=>$e->getMessage());
	        watchdog('FeedsP2PNextProgrammeFeedParser', $msg, $vars, WATCHDOG_WARNING);
          }
		 /* 
          <Creator> 
            <Role href="urn:mpeg:mpeg7:cs:RoleCS:2001:PRODUCER"/> 
            <Agent xsi:type="OrganizationType"> 
              <Name>European Space Agency</Name> 
            </Agent> 
          </Creator> 
          <Creator> 
            <Role href="urn:mpeg:mpeg7:cs:RoleCS:2001:DISSEMINATOR"/> 
            <Agent xsi:type="OrganizationType"> 
              <Name>European Space Agency</Name> 
            </Agent> 
          </Creator> 
          <CopyrightString>Copyright message to go here</CopyrightString> */
	      $creators = $doc->getElementsByTagName('Creator');
		  $len = $creators->length;
          for($pos=0; $pos<$len; $pos++) {
		  
		    if($creators->item($pos)->hasChildNodes()) {
              $children = $creators->item($pos)->childNodes;
		      $clen = $children->length;
              for($i=0; $i<$clen; $i++) {
                if($children->item($i)->nodeName == 'Role') {
				  $attr = $children->item($i)->getAttribute('href');
				  if( $attr == 'urn:mpeg:mpeg7:cs:RoleCS:2001:PRODUCER' ) {
	                $item['producer'] = trim($creators->item($pos)->textContent);
				  }
				  if( $attr == 'urn:mpeg:mpeg7:cs:RoleCS:2001:DISSEMINATOR' ) {
	                $item['disseminator'] = trim($creators->item($pos)->textContent);
				  }
				}
			  }
			}
		  }

		  // extract the <CopyrightString> -element.
	      $copyright = $doc->getElementsByTagName('CopyrightString');
	      if ($copyright->length > 0) {
	        $item['copyright'] = trim($copyright->item(0)->textContent);
		  }

		  // extract the 2nd <MediaUri> -element.
	      $muelem = $doc->getElementsByTagName('MediaUri');
	      if ($muelem->length > 1) {
	        $item['torrent'] = trim($muelem->item(1)->textContent);
	      }

/*  $str = print_r($muelem, TRUE);
  $filename = 'debug_mediauri.txt';
  $dest = file_directory_path() . '/' . $filename;
  file_save_data($str, $dest);*/

		  
	      $durelem = $doc->getElementsByTagName('MediaDuration');
	      if ($durelem->length > 0) {
            $duration = $durelem->item(0)->textContent; // iso8601 format (PT0H5M0S)
			$dura = duration_create($duration);
            if($dura) {
              $secs = $dura->to_single_metric('seconds');
			  $item['duration'] = $secs;
            }
	      }
		  
		  // Set default value for 'aptype'. 
		  // In VOD metadata, the 'AvailabilityPeriod'-tag can be missing. 
		  // It is also possible that 'AvailabilityPeriod' has no 'type'-attribute.
		  $item['aptype'] = 'vod';
		  
          $apelem = $doc->getElementsByTagName('AvailabilityPeriod');
	      if ($apelem->length > 0) {
            if ($apelem->item(0)->hasAttribute('type')) {
	          $item['aptype'] = $apelem->item(0)->getAttribute('type');
	        }
          }
          $tpelem = $doc->getElementsByTagName('TimePoint');
	      if ($tpelem->length > 0) {
		    $item['starttime'] = strtotime($tpelem->item(0)->textContent);
			$item['endtime'] = $item['starttime'] + $item['duration'];
	      }
        } 
        else {
          // Otherwise we don't have any data
          $msg = 'No content from %url.';
          $vars = array( '%url' => $metadata_address );
          watchdog('FeedsP2PNextProgrammeFeedParser', $msg, $vars, WATCHDOG_WARNING);
        }
		// Extract metadata end
	  }
    }
  }
}
