# Kendra Signpost

## Introduction

This is the full Drupal install for the Kendra Signpost Trial website, including
Drupal core, required modules, and Kendra Signpost specific modules and 
configuration.

## System requirements

To run a full Kendra Signpost stack, the following components are required:

 * LAMP (Linux/Apache/MySQL/PHP) server for running the Kendra Signpost site
 * Python for running the inference proxy layer
 * Solr for powering the search services
 * Virtuoso for storage of RDF data
 * A Git client - for checking out the code from github.

## Installation 

These are the steps to get your own Kendra Signpost server up and running:

 1. Download the Kendra Signpost Trial code from the github repository. If you want to make a working copy (in order to push back changes to github) then use `git clone git@github.com:kendrainitiative/kendra_signpost_trial.git` or if you just want to download the code to run tests, use `wget http://github.com/kendrainitiative/kendra_signpost_trial/tarball/master`.
 2. Create an empty MySQL database.
 3. In the sites/default folder, prepare for installation by copying `default.settings.php` to `settings.php` and making it writable by the webserver, and create a folder `sites/default/files` and make this writable by the webserver.
 4. Run the Drupal installer, using install.php and selecting the Kendra Signpost Trial install profile. You will need to enter database connection settings and create an admin account.
 5. Configure the connection settings for Virtuoso. 

## Apache and Python configuration

Configure Apache to execute the python scripts when called. There are rules in the .htaccess file to deal with the rewriting of Solr requests to use the proxy.

## Installation instructions for Solr and Kendra Signpost

The instructions below offer a step by step procedure for installing Apache Solr for use with the Kendra Signpost Trial.

### install Java

    apt-get install openjdk-6-jdk

### download and install Apache Solr

    wget http://apache.dataphone.se//lucene/solr/1.4.1/apache-solr-1.4.1.tgz
    tar xzvf apache-solr-1.4.1.tgz 
    cd apache-solr-1.4.1/example/solr/conf/

### Backup default configuration files.

    mv schema.xml schema.bak
    mv solrconfig.xml solrconfig.bak

### install Drupal Solr module

    cd /var/www/dev.kendra.org.uk/
    drush dl apachesolr
    cd /var/www/dev.kendra.org.uk/sites/all/modules/apachesolr

### get the PHP Solr module

    svn checkout -r22 http://solr-php-client.googlecode.com/svn/trunk/ SolrPhpClient

### To prepare solr for use with Drupal we must copy over schema.xml and solrconfig.xml which comes with the solr Drupal module.

    cp schema.xml solrconfig.xml /usr/local/src/apache-solr-1.4.1/example/solr/conf/

### enable the Solr module

    drush en apachesolr #    The following modules will be enabled: apachesolr, search

### confirm Drupal solr configuration

Visit http://dev.kendra.org.uk/admin/settings/apachesolr in a browser.

### start solr
    cd /usr/local/src/apache-solr-1.4.1/example
    java -jar start.jar

### create an init script to start solr at boot time

    cp /etc/init.d/skeleton /etc/init.d/solr
    vim /etc/init.d/solr      # see attached configuration script
    chmod 700 /etc/init.d/solr
    rcconf    # look for the new solr service, select to start at boot time

## Testing

The Kendra Signpost Trial includes a content type for uploading CSV data. An example file for testing is included with the source code in the examples folder.

After installation the front page prompts you to do the following:

 1. Configure the endpoint - this is done if you are using the default Kendra RDF repository.
 2. Upload a catalogue - click the link and upload thirdear.csv from the examples folder.
 3. Run CRON - RDF imports are queued to run on cron for better performance
 4. Browse to the catalogue page to see the result of a basic SPARQL query against the data.

## Development

Changes to Drupal features should be exported to code using the features module and committed back to github. (t.b.c. - insert commands for doing so).

 * kendra_rdf = includes the commands to connect to the repository and send queries
 * kendra_uploads = includes the feature (cck + views), and some nodeapi stuff to process the uploaded files

Other modules/features should be added (for example for the search/query builder/mapping tool). These should be placed in separate modules and then activated by the install profile by adding them to `_kendra_signpost_features()` as found in `kendra_signpost.profile`.

## License Terms

*Code:* Kendra Signpost is licensed under GPL, as per the Drupal licensing 
terms. Please see LICENSE.txt for more information.

*Example metadata:* Real World is pleased to be part of the Kendra Trials and 
has supplied metadata as part of these trials. The Real World Catalogue metadata 
is copyright Real World Records Ltd and the non exclusive license for its use 
during these trials is limited to experimental use within the Kendra environment
with all other rights reserved to Real World Records Ltd. By accessing this data
you accept those terms.

