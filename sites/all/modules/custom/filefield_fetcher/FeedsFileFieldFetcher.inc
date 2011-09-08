<?php

class FeedsFileFieldFetcher extends FeedsFetcher {

  public function fetch(FeedsSource $source) {
    $feed_node = node_load($source->feed_nid);
    return new FeedsFileBatch($feed_node->{$this->config['file_field']}[0]['filepath'], $source->feed_nid);
  }

  public function configDefaults() {
    return array('file_field' => '');
  }
  
  public function configForm(&$form_state) {
    $options = array();
    foreach (content_fields() as $field_name => $field_spec) {
      if ($field_spec['type'] == 'filefield') {
        $options[$field_name] = $field_name;
      }
    }
    $form = array();
    $form['file_field'] = array(
      '#type' => 'select',
      '#title' => t('Source field'),
      '#description' => t('Select a filefield to read the source file from. This filefield must exist in the content type that this importer is attached to.'),
      '#options' => $options,
    );
    return $form;
  }

}
