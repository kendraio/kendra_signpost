#!/usr/bin/python

# File: solr_search_proxy.py
# Description: Rewrites Solr searches and results to use added semantic tags
# Created: 2010-11-05
# Author: Neil Harris

import cgitb, cgi, sys, urllib, string, os, time

def urlquote(x):
    return urllib.quote_plus(x)

def make_url_fields(key, values):
    return string.join(["%s=%s" % (urlquote(key), urlquote(val)) for val in values], "&")

def is_bad_request():
    if os.environ.get("REQUEST_METHOD", None) != "GET": return "not a GET command"
    if not os.environ.get("HTTP_HOST", None): return "no HTTP_HOST specified"
    return 0

# Do some sanity checking before actually dispatching: we are not a general-purpose proxy
if is_bad_request():
    print "Status: 403 Forbidden"
    print "Content-type: text/plain"
    print 
    print "I'm sorry Dave, I can't do that:", is_bad_request()
    sys.exit(0)

form = cgi.FieldStorage(keep_blank_values=1)
form_data = [(k, form.getlist(k)) for k in form.keys()]

request_uri = os.environ.get("REQUEST_URI", "")
request_uri_path = string.split(request_uri, "?")[0]
recreated_query = string.join([make_url_fields(k, vs) for (k, vs) in form_data], "&")

if os.environ.get('HTTPS', '') == 'on':
    # Warning: proxied HTTPS requests will not attempt to validate the server certificate!
    protocol = 'https'
else:
    protocol = 'http'

logfile = open("/tmp/solr_search_proxy_log_%f" % time.time(), "w")
print >> logfile, "recreated_query", recreated_query
print >> logfile, "request_uri_path", request_uri_path
print >> logfile, "recreated_url", '%s://%s:%d%s?%s' % (protocol, 'HTTP_HOST', 8983,  request_uri_path, recreated_query)
print >> logfile, "environment"
for k in os.environ:
    print >> logfile, k, os.environ.get(k)
logfile.close()

# Redirect to call local installation of Solr search 
absolute_url = '%s://%s:%d%s?%s' % (protocol, os.environ['HTTP_HOST'], 8983,
    request_uri_path, recreated_query)

urlobject = urllib.urlopen(absolute_url)
results = urlobject.read()
content_type = urlobject.info().gettype()

sys.stdout.write("Content-type: %s\r\n\r\n" % content_type)
sys.stdout.write(results)
sys.stdout.flush()




