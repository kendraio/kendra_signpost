<?php
// Feeds dev docs: http://drupal.org/node/622700

class DebugProcessor extends FeedsNodeProcessor {

  /*
  function process(FeedsImportBatch $batch, FeedsSource $source) {
    watchdog('Feeds Debug', '<strong>Import:</strong><pre>'. print_r($batch, TRUE) .'</pre>'.
      '<strong>Source:</strong><pre>'. print_r($source, TRUE) .'</pre>');
      
    while ($item = $batch->shiftItem()) {
      $data = get_mpeg_data_from_url($item['url']);
      
    }
    
    return FEEDS_BATCH_COMPLETE;  
  }
  */

  public function configForm(&$form_state) {
    $form = parent::configForm($form_state);
    $form['content_type']['#options'] = array('kendra_import' => 'Kendra Import');
    $form['content_type']['#default_value'] = 'kendra_import';
    return $form;
  }
  
  function clear(FeedsBatch $batch, FeedsSource $source) {
    // let's not clear anything for now.
  }
  
  
}



