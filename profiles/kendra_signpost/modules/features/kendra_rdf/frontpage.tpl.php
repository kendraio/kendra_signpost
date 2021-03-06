<h2>Welcome to your new Kendra Signpost Trial website</h2>
<p>Here are some tasks you can do on this site:</p>
<ol style="margin: 1em 0pt;">
<?php if ( !$user->uid ) { ?><li style="font-weight:700"><?php print l('Login', 'user'); ?> using your Kendra Account</li><?php } ?>
<li><?php print l('Configure', 'admin/settings/kendra-rdf'); ?> the Virtuoso connection details</li>
<li><?php print l('Create an upload node', 'node/add/kendra-import'); ?> to import a CSV spreadsheet catalogue</li>
<li><?php print l('Browse', 'catalogues'); ?> or search the catalogue using the views provided</li>
<li><?php print l('List', 'cat_nodes'); ?> all catalogue node items.</li>
<li><?php print l('Create a mapping node', 'node/add/kendra-map'); ?> and then add mapping items to it.</li>
<li><?php print l('View all mappings', 'mappings'); ?>.</li>
<li><?php print l('View all smart filters', 'smart-filters'); ?> and use them to search uploaded content via the mappings.</li>
<li><?php print l('Create a smart filter', 'node/add/smart-filter'); ?> using the mappings.</li>
<li><?php print l('Import P2P-Next Atom Feed', 'import'); ?>.</li>
</ol>
