#!/usr/bin/python

# File: solr_update_proxy.py
# Description: Rewrites Solr updates to add semantic tags
# Created: 2010-11-12
# Author: Neil Harris

import cgitb, cgi, sys, urllib, urllib2, string, re, os, time, traceback
import urllib

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
	query_url = "http://%s:8890/sparql?default-graph-uri=&query=%s&format=text%%2Frdf+n3&debug=on&timeout=" % (os.environ['HTTP_HOST'], urllib.quote_plus(query))
	return map(strip_result_fields, re.findall(r"(?s)<result>.*?</result>", urllib.urlopen(query_url).read()))

# Mangles a URI into something that can be a valid facet name
def mangle_uri(uri):
    ok_chars = string.uppercase + string.lowercase + string.digits
    ok_dict = dict(zip(ok_chars, ok_chars))
    return "mu_" + string.join([ok_dict.get(x, "_%02X" % x) for x in uri], '')

# Process a single XML segment
def rewrite_stanza(text):
    if text[:5] != "<doc>":
        return text
    row_uri = re.findall(r'<field name="ss_cck_field_cat_rowuri">(.*?)</field>', text)
    if not row_uri:
       return text
    row_uri = row_uri[0]

    # Get the property list for this row from SPARQL endpoint
    property_list = get_property_list(row_uri)

    # Bash these metadata fields in, very inefficiently
    # TO DO: make more efficient
    for name, value in property_list:
        text = string.replace(text, "</doc>", '<field name="%s">%s</field></doc>' % (mangle_uri(name), value))

    return text

# Break the input XML down into segments, process, then reassemble
def rewrite_content(text):
   return string.join(map(rewrite_stanza, re.findall(r"(?s)<doc>.*?</doc>|<.*?>|[^<]+", text)), "")

logfile = open("/tmp/solr_update_proxy_log_%0.5f" % time.time(), "w")
print >> logfile, "environment"
for k in os.environ:
    print >> logfile, k, os.environ.get(k)
logfile.flush()

if os.environ.get('HTTPS', '') == 'on':
    # Warning: proxied HTTPS requests will not attempt to validate the server certificate!
    protocol = 'https'
else:
    protocol = 'http'

# Do some sanity checking before actually dispatching: we are not a general-purpose proxy
if is_bad_request():
    print "Status: 403 Forbidden"
    print "Content-type: text/plain"
    print 
    print "I'm sorry Dave, I can't do that:", is_bad_request()

    sys.exit(0)

try:
	# Redirect to call update interface of local installation of Solr search
	absolute_url = '%s://%s:%d/solr/update/' % (protocol, os.environ['HTTP_HOST'], 8983)

	content_type = os.environ['CONTENT_TYPE']
	content_length = os.environ['CONTENT_LENGTH']
	content = sys.stdin.read()

	print >> logfile, "-------- indexing input data:"
	print >> logfile, content
	logfile.flush()

        content = rewrite_content(content)

	print >> logfile, "-------- rewritten input data:"
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

print >> logfile, "-------- indexing output data:"
print >> logfile, results
logfile.close()

sys.stdout.write("Content-Type: %s\r\n" % results_type)
sys.stdout.write("Content-Length: %d\r\n\r\n" % len(results))
sys.stdout.write(results)
sys.stdout.flush()
sys.exit(0)
