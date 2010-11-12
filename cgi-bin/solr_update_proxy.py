#!/usr/bin/python

# File: solr_search_proxy.py
# Description: Rewrites Solr searches and results to use added semantic tags
# Created: 2010-11-12
# Author: Neil Harris

import cgitb, cgi, sys, urllib, urllib2, string, os, time

def urlquote(x):
    return urllib.quote_plus(x)

def make_url_fields(key, values):
    return string.join(["%s=%s" % (urlquote(key), urlquote(val)) for val in values], "&")

form = cgi.FieldStorage(keep_blank_values=1)
form_data = [(k, form.getlist(k)) for k in form.keys()]

request_uri = os.environ.get("REQUEST_URI", "")
recreated_query = string.join([make_url_fields(k, vs) for (k, vs) in form_data], "&")

def is_bad_request():
    if os.environ.get("REQUEST_METHOD", None) != "POST": return "not a POST command"
    if not os.environ.get("HTTP_HOST", None): return "no HTTP_HOST specified"
    return 0

if os.environ.get('HTTPS', '') == 'on':
    # Warning: proxied HTTPS requests will not attempt to validate the server certificate!
    protocol = 'https'
else:
    protocol = 'http'

logfile = open("/tmp/solr_update_proxy_log_%0.5f" % time.time(), "w")
print >> logfile, "recreated_query", recreated_query
print >> logfile, "environment"
for k in os.environ:
    print >> logfile, k, os.environ.get(k)
logfile.close()

# Do some sanity checking before actually dispatching: we are not a general-purpose proxy
if is_bad_request():
    print "Status: 403 Forbidden"
    print "Content-type: text/plain"
    print 
    print "I'm sorry Dave, I can't do that:", is_bad_request()

    sys.exit(0)

# Redirect to call local installation of Solr search 
absolute_url = '%s://%s:%d/solr/update/?%s' % (protocol, os.environ['HTTP_HOST'], 8983,
    recreated_query)

content_type = os.environ['CONTENT_TYPE']
content_length = os.environ['CONTENT_LENGTH']
content = sys.stdin.read(content_length)

urlobject = urllib2.urlopen(urllib2.Request(absolute_url, content, {'Content-type': content_type}))
results = urlobject.read()
content_type = urlobject.info().gettype()

sys.stdout.write("Content-type: %s\n\r" % content_type)
sys.stdout.write("Content-length: %d\n\r\n\r" % len(results))
sys.stdout.write(results)
sys.stdout.flush()




