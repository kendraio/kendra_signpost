<?php

class FeedsP2PNextParser extends FeedsParser {

  public function parse(FeedsImportBatch $batch, FeedsSource $source) {
    $xml = new SimpleXMLElement($batch->getRaw());
    $batch->title = (string)$xml->title;
    $xml_p2pnext = $xml->children('p2pnext', TRUE);
    $feed_image = $xml_p2pnext->image->attributes();
    foreach ($xml->entry as $entry) {
      $p2pnext = $entry->children('p2pnext', TRUE);
      $image = $p2pnext->image->attributes();
      $batch->items[] = array(
        'FeedTitle' => $batch->title,
        'FeedAuthor' => (string)$xml->author->name,
        'FeedImage' => (string)$feed_image['src'],
        'Title' => (string)$entry->title,
        'TitleImage' => (string)$image['src'],
        'Identifier' => (string)$entry->id,
        'Abstract' => (string)$entry->summary,
        'Updated' => (string)$entry->updated,
        'Mpeg7' => (string)$entry->link['href'],
        'BroadcastType' => (string)$p2pnext->broadcastType,
        'MediaUri' => (string)$p2pnext->mediaUri,
        'TimePoint' => (string)$p2pnext->timePoint,
        'Duration' => (string)$p2pnext->mediaDuration,
      );
    }  
  }
  
  
  public function getMappingSources() {
    return array(
      'FeedTitle' => array('name' => 'Feed Title'),
      'FeedAuthor' => array('name' => 'Feed Author'),
      'FeedImage' => array('name' => 'Feed Image'),
      'Updated' => array('name' => 'Updated'),
      'Mpeg7' => array('name' => 'MPEG7 File URL'),
      'BroadcastType' => array('name' => 'Broadcast Type'),
      'MediaUri' => array('name' => 'Media URI'),
      'TimePoint' => array('name' => 'Time Point'),
      'Identifier' => array('name' => 'Identifier'),
      'Title' => array('name' => 'Title'),
      'TitleImage' => array('name' => 'TitleImage'),
      'Abstract' => array('name' => 'Abstract'),
      'Duration' => array('name' => 'Duration'),
    );
  }

  

}







