<?php

class FeedsNextShareParser extends FeedsParser {

  public function parse(FeedsImportBatch $batch, FeedsSource $source) {
    $data = explode('<!-- METADATA FILE HEADER', $batch->getRaw());
    array_shift($data);
    
    $items = array();
    
    foreach ($data as $item) {
      $all_text = $item;
      $matches1 = array();
      preg_match_all('/<dii:Identifier>(.)*<\/dii:Identifier>/', $item, $matches1);
      $identifier = htmlentities($matches1[0][0]);
      $identifier = str_replace(array("\n", ' ', '&lt;dii:Identifier&gt;','&lt;/dii:Identifier&gt;'), '', $identifier);
      $header = explode('-->', $item);
      $matches2 = array();
      preg_match_all('/.*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}).*/', $header[0], $matches2);
      $lastseen = $matches2[1][0];
      try {
        $matches = array();
        $matches = explode('Mpeg7', $item);
        if (empty($matches[1])) {
          throw new Exception("No MPEG7 data found");
        }
        $item = html_entity_decode("&lt;Mpeg7{$matches[1]}Mpeg7&gt;");
        $item = "<?xml version='1.0' standalone='yes'?>\n{$item}";
        $xml = new SimpleXMLElement($item);
        if (!$xml) {
          throw new Exception('Error with XML parsing.');
        }
        $items[] = array(
          'Identifier' => $identifier,
          'Title' => (string)$xml->Description[0]->CreationInformation->Creation->Title,
          'TitleImage' => (string)$xml->Description[0]->CreationInformation->Creation->TitleMedia->TitleImage->MediaUri,
          'Abstract' => (string)$xml->Description[0]->CreationInformation->Creation->Abstract->FreeTextAnnotation,
          'Producer' => (string)$xml->Description[0]->CreationInformation->Creation->Creator[0]->Agent->Name,
          'Disseminator' => (string)$xml->Description[0]->CreationInformation->Creation->Creator[1]->Agent->Name,
          'Duration' => (string)$xml->Description[1]->MultimediaContent->Video->MediaTime->MediaDuration, 
          'LastSeen' => strtotime(str_replace(' ', 'T', $lastseen)),       
        );
        unset($xml);  
      } catch (Exception $e) {
        watchdog('NextShare', 'caught exception: '. $e->getMessage());
      }
    }

    $batch->title = 'NextShare core batch';
    $batch->items = $items;
  }
  
  public function getMappingSources() {
    return array(
      'Identifier' => array('name' => 'Identifier'),
      'Title' => array('name' => 'Title'),
      'TitleImage' => array('name' => 'Title Image'),
      'Abstract' => array('name' => 'Abstract'),
      'Producer' => array('name' => 'Producer'),
      'Disseminator' => array('name' => 'Disseminator'),
      'Duration' => array('name' => 'Duration'),
      'LastSeen' => array('name' => 'Last Seen'),
    );
  }
  
  
  
}


