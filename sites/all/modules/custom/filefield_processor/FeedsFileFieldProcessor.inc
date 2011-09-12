<?php

class FeedsFileFieldProcessor extends FeedsProcessor {

  
  public function process(FeedsImportBatch $batch, FeedsSource $source) {
    
    $unique_source = $this->getUniqueSource();
    $title_source = $this->getNodeTitleSource();
    
    //TODO: Check for existing lines in file using unique field
    foreach ($batch->items as $item) {
      $nid = $this->findUniqueID($item[$unique_source], $source);
      if (!empty($nid)) {
        $node = node_load($nid);
      } else {
        $node = new stdClass();
        $node->type = $this->config['node_type'];
        $node->author = $this->config['node_author'];
        $node->feeds_node_item = new stdClass();
        $node->feeds_node_item->id = $this->id;
        $node->feeds_node_item->imported = FEEDS_REQUEST_TIME;
        $node->feeds_node_item->feed_nid = $batch->feed_nid;
        $node->feeds_node_item->url = '';
        $node->feeds_node_item->guid = $item[$unique_source];
        $filepath = file_directory_temp() .'/'. md5($item[$unique_source]) .'.csv';
        $output = array();
        foreach ($this->config['mappings'] as $mapping) {
          if ($mapping['target'] == 'column') {
            $output[] = "\"{$mapping['source']}\"";
          }
        }
        file_put_contents($filepath, implode(',',$output) ."\n");
        self::loadMappers();
        filefield_feeds_set_target($node, $this->config['filefield'], $filepath);
      }
      $node->title = $item[$title_source];
      @node_save($node);
      $output = array();
      foreach ($this->config['mappings'] as $mapping) {
        if ($mapping['target'] == 'column') {
          $output[] = "\"{$item[$mapping['source']]}\"";
        }
      }
      file_put_contents($node->{$this->config['filefield']}[0]['filepath'], implode(',',$output) ."\n", FILE_APPEND);
      $batch->created++;
    }
    if ($batch->created) {
      drupal_set_message(format_plural($batch->created, 'Created @number @type node.', 'Created @number @type nodes.', array('@number' => $batch->created, '@type' => node_get_types('name', $this->config['content_type']))));
    }
    elseif ($batch->updated) {
      drupal_set_message(format_plural($batch->updated, 'Updated @number @type node.', 'Updated @number @type nodes.', array('@number' => $batch->updated, '@type' => node_get_types('name', $this->config['content_type']))));
    }
    else {
      drupal_set_message(t('There is no new content.'));
    }
  }
  
  protected function getUniqueSource() {
    foreach ($this->config['mappings'] as $mapping) {
      if ($mapping['target'] == 'feed_id') {
        return $mapping['source'];
      } 
    }
    return FALSE;
  }
  protected function getNodeTitleSource() {
    foreach ($this->config['mappings'] as $mapping) {
      if ($mapping['target'] == 'node_title') {
        return $mapping['source'];
      } 
    }
    return FALSE;
  }
  
  protected function findUniqueID($value, FeedsSource $source) {
    $nid = db_result(db_query("SELECT nid FROM {feeds_node_item} WHERE 
      feed_nid = %d AND id = '%s' AND guid = '%s'", $source->feed_nid, $source->id, $value));
    if ($nid) {
      return $nid;
    }
    return 0;
  }
  
  public function clear(FeedsBatch $batch, FeedsSource $source) {  
    feeds_include('FeedsNodeProcessor', 'plugins');
    $nids = db_query("SELECT nid FROM {feeds_node_item} WHERE feed_nid = %d AND id = '%s'", $source->feed_nid, $source->id);
    while ($node = db_fetch_object($nids)) {
      _feeds_node_delete($node->nid);
      $batch->deleted++;
    }
    drupal_get_messages('status');
    if ($batch->deleted) {
      drupal_set_message(format_plural($batch->deleted, 'Deleted @number node.', 'Deleted @number nodes.', array('@number' => $batch->deleted)));
    }
    else {
      drupal_set_message(t('There is no content to be deleted.'));
    }
  }
  
  public function configDefaults() {
    return array(
      'node_type' => '',
      'node_author' => 0,
      'filefield' => '',
      'mappings' => array(),
    );
  }
  
  public function configForm(&$form_state) {
    $types = node_get_types('names');
    $filefields = array();
    foreach (content_fields() as $field_name => $field_spec) {
      if ($field_spec['type'] == 'filefield') {
        $filefields[$field_name] = $field_name;
      }
    }
    $form = array();
    $form['node_type'] = array(
      '#type' => 'select',
      '#title' => t('Content type'),
      '#description' => t('Select the content type for the nodes to be created.'),
      '#options' => $types,
      '#default_value' => $this->config['node_type'],
    );
    $form['filefield'] = array(
      '#type' => 'select',
      '#title' => t('Filefield'),
      '#description' => t('Select the filefield to store the generated CSV. NOTE: This must exist within the content type selected above!'),
      '#options' => $filefields,
      '#default_value' => $this->config['filefield'],
    );
    $form['node_author'] = array(
      '#type' => 'textfield',
      '#title' => t('Author'),
      '#description' => t('Select the author of the nodes to be created - leave empty to assign "anonymous".'),
      '#autocomplete_path' => 'user/autocomplete',
      '#default_value' => 'anonymous',
    );
    return $form;
  }
  public function configFormValidate(&$values) {
    if ($author = user_load(array('name' => $values['node_author']))) {
      $values['node_author'] = $author->uid;
    }
    else {
      $values['node_author'] = 0;
    }
  }
  public function configFormSubmit(&$values) {
    parent::configFormSubmit($values);
  }

  public function getMappingTargets() {
    $targets = array(
      'column' => array(
        'name' => t('Column'),
        'description' => t('Map this item onto a column within the created CSV file.'),
        'optional_unique' => TRUE,
       ),
      'feed_id' => array(
        'name' => t('Feed ID'),
        'description' => t('The unique ID of this feed, for selecting which node to map to. If a node with this ID does not exist with appropriate content type, a new node is created.'),
      ),
      'node_title' => array(
        'name' => t('Node title'),
        'description' => t('The title for the created node, if new node is required.'),
      ),
    );
    
    return $targets;
  }

}
