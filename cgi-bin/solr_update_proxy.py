#!/usr/bin/python

# File: solr_search_proxy.py
# Description: Rewrites Solr searches and results to use added semantic tags
# Created: 2010-11-12
# Author: Neil Harris

import cgitb, cgi, sys, urllib, urllib2, string, os, time, traceback

def urlquote(x):
    return urllib.quote_plus(x)

def make_url_fields(key, values):
    return string.join(["%s=%s" % (urlquote(key), urlquote(val)) for val in values], "&")

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

try:
	# Redirect to call update interface of local installation of Solr search
	absolute_url = '%s://%s:%d/solr/update/' % (protocol, os.environ['HTTP_HOST'], 8983)

	content_type = os.environ['CONTENT_TYPE']
	content_length = os.environ['CONTENT_LENGTH']
	content = sys.stdin.read()

	request = urllib2.Request(absolute_url, content, {'Content-Type': content_type})
	urlobject = urllib2.urlopen(request)
	results = urlobject.read()
	content_type = urlobject.info().gettype()
except urllib2.HTTPError, e:
        results = repr((e.code, e.msg, e.read()))
        results_type = "text/plain"
except:
        exc_info = sys.exc_info()
        tb = traceback.format_tb(exc_info[2])
	results = "an exception happened: " + absolute_url + " " + repr(exc_info[0]) + "\n" + string.join(tb, "")
	results_type = "text/plain"

sys.stdout.write("Content-Type: %s\r\n" % results_type)
sys.stdout.write("Content-Length: %d\r\n\r\n" % len(results))
sys.stdout.write(results)
sys.stdout.flush()
sys.exit(0)
