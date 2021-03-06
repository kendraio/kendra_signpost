#!/usr/bin/python

# File: solr_update_proxy.py
# Description: Rewrites Solr updates to add semantic tags
# Created: 2010-11-12
# Author: Neil Harris

import cgitb, cgi, sys, urllib, urllib2, string, re, os, time, traceback
import urllib

import kendra_signpost_utils
from kendra_signpost_utils import mangle_uri, type_uri_to_prefix

# start logging early
current_time = time.time()
logfile = open("/tmp/solr_update_proxy_log_%0.5f" % current_time, "w")
print >> logfile, '<log datetime="%s">' % current_time
logfile.flush()

def uniq(x):
    return {}.fromkeys(x).keys()

def urlquote(x):
    return urllib.quote_plus(x)

def make_url_fields(key, values):
    return string.join(["%s=%s" % (urlquote(key), urlquote(val)) for val in values], "&")

def is_bad_request():
    if os.environ.get("REQUEST_METHOD", None) != "POST": return "not a POST command"
    if not os.environ.get("HTTP_HOST", None): return "no HTTP_HOST specified"
    return 0

# Make a query to Virtuoso to get metadata for this object
def strip_result_fields(x):
    return re.findall(r'(?s)<binding name="[^>]+"><[^<>]*>(.*?)<[^<>]*></binding>', x)

# TODO: Note: assumes that URI is valid: need sanity check here to prevent XSS attacks on SPARQL DB, or assurance this is valid at all callers
def get_property_list(row_uri):
	query = "SELECT ?property ?object WHERE {<%s> ?property ?object}" % row_uri
	query_url = "%s?default-graph-uri=&query=%s&format=text%%2Frdf+n3&debug=on&timeout=" % (kendra_signpost_utils.get_sparql_endpoint_uri(), urllib.quote_plus(query))
	return map(strip_result_fields, re.findall(r"(?s)<result>.*?</result>", urllib.urlopen(query_url).read()))

# TODO: Note: assumes that URI is valid: need sanity check here to prevent XSS attacks on SPARQL DB, or assurance this is valid at all callers
def get_same_as_list():
	query = "SELECT ?subject ?object WHERE {?subject <http://www.w3.org/2002/07/owl#sameAs> ?object}"
	query_url = "%s?default-graph-uri=&query=%s&format=text%%2Frdf+n3&debug=on&timeout=" % (kendra_signpost_utils.get_sparql_endpoint_uri(), urllib.quote_plus(query))
	return map(strip_result_fields, re.findall(r"(?s)<result>.*?</result>", urllib.urlopen(query_url).read()))

# TODO: Note: assumes that URI is valid: need sanity check here to prevent XSS attacks on SPARQL DB, or assurance this is valid at all callers
def get_subclass_of_list():
	query = "SELECT ?subject ?object WHERE {?subject <http://www.w3.org/2000/01/rdf-schema#subClassOf> ?object}"
	query_url = "%s?default-graph-uri=&query=%s&format=text%%2Frdf+n3&debug=on&timeout=" % (kendra_signpost_utils.get_sparql_endpoint_uri(), urllib.quote_plus(query))
	return map(strip_result_fields, re.findall(r"(?s)<result>.*?</result>", urllib.urlopen(query_url).read()))

# TODO: Note: assumes that URI is valid: need sanity check here to prevent XSS attacks on SPARQL DB, or assurance this is valid at all callers
def get_type_list():
	query = "SELECT ?subject ?object WHERE {?subject <http://kendra.org/#hasType> ?object}"
	query_url = "%s?default-graph-uri=&query=%s&format=text%%2Frdf+n3&debug=on&timeout=" % (kendra_signpost_utils.get_sparql_endpoint_uri(), urllib.quote_plus(query))
	return map(strip_result_fields, re.findall(r"(?s)<result>.*?</result>", urllib.urlopen(query_url).read()))

def validate_typed_data_value(name, value):
    typ = name_uri_to_type_uri.get(name, None)
    if typ == "http://kendra.org/#datetime":
       return re.findall(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:.[0-9]+)?Z$", value) != []
    if typ == "http://kendra.org/#number":
       return re.findall(r"^[-+]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][-+]?[0-9]+)?$", value) != []
    # Otherwise, everything is valid by default -- will change later
    return 1

# Perform a series of value inferences based on directed arcs
# Avoid recursion
def infer_from(name, value):
#    print "INFER_FROM", name, value
    out = []
    pending = [(name, value)]
    while pending:
        # Pop an arc off the top
        name, value = pending[0]
        pending = pending[1:]

        if not validate_typed_data_value(name, value):
	   continue

        # Add this one directly to the output
	out += [(name, value)]

        # Add the rest of the new arcs from it, if any, to the pending pool
	for n in implies.get(name, []):
            if (n, value) not in (out + pending):
		pending += [(n, value)]
#    print "DONE", out
    return out

# Process a single XML segment
def rewrite_stanza(text):
    global name_uri_to_type_uri
    if text[:5] != "<doc>":
        return text
    row_uri = re.findall(r'<field name="ss_cck_field_cat_rowuri">(.*?)</field>', text)
    if not row_uri:
       return text
    row_uri = row_uri[0]

    # now modifiy property list to include inferred properties from metadata equivalences
##    property_list = get_property_list(row_uri):
##    properties = {}
##    for name, value in property_list:
##       other_names = item_synset.get(name, [])
##       if len(other_names) > 1:
##          print >> logfile, "MADE INFERENCE:", name, "->", other_names
##       for other_name in other_names:
##          properties[other_name] = value

    # Get the property list for this row from SPARQL endpoint
    # and perform inferernce
    inferred_values = []
    for name, value in get_property_list(row_uri):
        inferred_values += infer_from(name, value)

    # deduplicate
    inferred_values = uniq(inferred_values)

    # Bash these metadata fields in, very inefficiently
    # TO DO: make more efficient
    for name, value in inferred_values:
        type_prefix = type_uri_to_prefix(name_uri_to_type_uri.get(name, None))
        text = string.replace(text, "</doc>", '<field name="%s">%s</field></doc>' % (mangle_uri(type_prefix, name), value))

    return text

# Break the input XML down into segments, process, then reassemble
def rewrite_content(text):
   return string.join(map(rewrite_stanza, re.findall(r"(?s)<doc>.*?</doc>|<.*?>|[^<]+", text)), "")

# format a comment, suitable for XML
def format_comment(text):
   return '<!-- %s -->' % text

# main
# equivalence sets of labels
##item_synset = {}
##
##def make_mapping(a, b):
##    ab_synset = uniq(item_synset.get(a, [a]) + item_synset.get(b, [b]))
##    for x in ab_synset:
##       item_synset[x] = ab_synset

# now build equivalence classes
same_as_mappings = get_same_as_list()
subclass_of_mappings = get_subclass_of_list()

# model two-way implication as two one-way ones
implies = {}
for a, b in same_as_mappings:
    implies[a] = implies.get(a, []) + [b]
    implies[b] = implies.get(b, []) + [a]

for a, b in subclass_of_mappings:
    implies[a] = implies.get(a, []) + [b]

# Then prune duplicate arcs
for a in implies:
    implies[a] = {}.fromkeys(implies[a]).keys()

name_uri_to_type_uri = dict(get_type_list())

print >> logfile, "<mappings>"
print >> logfile, "same_as_mappings:", same_as_mappings
print >> logfile, "subclass_of_mappings:", subclass_of_mappings
## print >> logfile, "item_synset:", item_synset
print >> logfile, "name_uri_to_type_uri:", name_uri_to_type_uri
print >> logfile, "sparql endpoint uri", kendra_signpost_utils.get_sparql_endpoint_uri()
print >> logfile, "</mappings>"

print >> logfile, "<environment>"
for k in os.environ:
    print >> logfile, k, os.environ.get(k)
print >> logfile, "</environment>"
logfile.flush()

if os.environ.get('HTTPS', '') == 'on':
    # Warning: proxied HTTPS requests will not attempt to validate the server certificate!
    protocol = 'https'
else:
    protocol = 'http'

request_uri_path = string.split(os.environ.get('REQUEST_URI', ''), '?')[0]

# Do some sanity checking before actually dispatching: we are not a general-purpose proxy
if is_bad_request():
    print "Status: 403 Forbidden"
    print "Content-type: text/plain"
    print 
    print "I'm sorry Dave, I can't do that:", is_bad_request()

    sys.exit(0)

try:
    #solr_host = string.split(os.environ.get("HTTP_HOST"), ':')[0]
    solr_host = 'solr.kendra.org'
    solr_port = 8983
    
    # Redirect to call update interface of local installation of Solr search
    absolute_url = '%s://%s:%d%s' % (protocol, solr_host, solr_port, request_uri_path)

    content_type = os.environ['CONTENT_TYPE']
    content_length = os.environ['CONTENT_LENGTH']
    content = sys.stdin.read()

    print >> logfile, format_comment("indexing input data:")
    print >> logfile, content
    logfile.flush()

    content = rewrite_content(content)

    print >> logfile, format_comment("rewritten input data:")
    print >> logfile, content
    logfile.flush()

    request = urllib2.Request(absolute_url, content, {'Content-Type': content_type})
    urlobject = urllib2.urlopen(request)
    results = urlobject.read()
    results_type = urlobject.info().gettype()
except urllib2.HTTPError, e:
    results = repr((e.code, e.msg, e.headers.items(), e.read()))
    results_type = "text/plain"
except:
    exc_info = sys.exc_info()
    tb = traceback.format_tb(exc_info[2])
    results = "an exception happened: " + absolute_url + " " + repr(exc_info[0]) + "\n" + string.join(tb, "")
    results_type = "text/plain"
    
print >> logfile, format_comment("indexing output data:")
print >> logfile, results
print >> logfile, '</log>'
logfile.close()

sys.stdout.write("Content-Type: %s\r\n" % results_type)
sys.stdout.write("Content-Length: %d\r\n\r\n" % len(results))
sys.stdout.write(results)
sys.stdout.flush()
sys.exit(0)
