<?php

class P2PNextAtomParser extends FeedsSyndicationParser {

  public function parse(FeedsImportBatch $batch, FeedsSource $source) {
    watchdog('Parse Atom', $batch->getLink());
    parent::parse($batch, $source);
    $items = array();
    while ($item = $batch->shiftItem()) { 
      $data = get_mpeg_data_from_url($item['url']);      
      $item['mpeg_file'] = $item['url'];
      $item['title_image'] = $data['title_image'];
      $item['abstract'] = $data['abstract'];
      $item['torrent'] = $data['torrent'];
      $item['producer'] = $data['producer'];
      $item['disseminator'] = $data['disseminator'];
      $item['copyright'] = $data['copyright'];
      $item['duration'] = $data['duration'];
      $item['time_point'] = $item['p2pnext:timePoint'];
      $item['channel'] = $batch->getTitle();
      $items[] = $item;
    }
    $total = array($items);
    $batch->setItems($total);
  }
  
  public function getSourceElement($item, $element_key) {
    if ($element_key == 'mpeg_file') {
      // create a csv file
      $filename = file_directory_temp() .'/'. md5($item[0]['url']) .'.csv';
      $fp = fopen($filename, 'w');
      fputcsv($fp, array_keys($item[0]));
      foreach ($item as $fields) {
        foreach ($fields as $key => $field) {
          if (is_array($field)) {
            $fields[$key] = implode("|", $field);
          }
        }
        fputcsv($fp, $fields);
      }
      watchdog('Feed Debug', "Writing to file {$filename}");
      fclose($fp);
      return $filename;
    }
    return isset($item[0][$element_key]) ? $item[0][$element_key] : '';
  }
  
  public function getMappingSources() {
    return parent::getMappingSources() + array(
      'mpeg_file' => array(
        'name' => t('P2PNext: MPEG7 CSV File'),
        'description' => t('CSV converted from MPEG7 data.'),
      ),
      'abstract' => array(
        'name' => t('P2PNext: Abstract'),
        'description' => t('The abstract of the programme from the MPEG7 data.'),
      ),
      'channel' => array(
        'name' => t('P2PNext: Channel'),
        'description' => t('The channel of the programme from the MPEG7 data.'),
      ),
      'title_image' => array(
        'name' => t('P2PNext: Image'),
        'description' => t('The thumbnail image of the programme from the MPEG7 data.'),
      ),
      'torrent' => array(
        'name' => t('P2PNext: Torrent'),
        'description' => t('The torrent file of the programme from the MPEG7 data.'),
      ),
      'producer' => array(
        'name' => t('P2PNext: Producer'),
        'description' => t('The producer of the programme from the MPEG7 data.'),
      ),
      'disseminator' => array(
        'name' => t('P2PNext: Disseminator'),
        'description' => t('The disseminator of the programme from the MPEG7 data.'),
      ),
      'copyright' => array(
        'name' => t('P2PNext: Copyright'),
        'description' => t('The copyright string of the programme from the MPEG7 data.'),
      ),
      'duration' => array(
        'name' => t('P2PNext: Duration'),
        'description' => t('The duration of the programme from the MPEG7 data.'),
      ),
     ); 
  }

}



