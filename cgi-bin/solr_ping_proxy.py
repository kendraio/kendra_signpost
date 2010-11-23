#!/usr/bin/python

# File: solr_ing_proxy.py
# Description: Rewrites Solr pings
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

if os.environ.get('HTTPS', '') == 'on':
    # Warning: proxied HTTPS requests will not attempt to validate the server certificate!
    protocol = 'https'
else:
    protocol = 'http'

logfile = open("/tmp/solr_ping_proxy_log_%f" % time.time(), "w")
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

# Redirect to call local installation of Solr 
absolute_url = '%s://%s:%d/solr/admin/ping' % (protocol, os.environ['HTTP_HOST'], 8983)

urlobject = urllib.urlopen(absolute_url)
results = urlobject.read()
content_type = urlobject.info().gettype()

sys.stdout.write("Content-type: %s\r\n\r\n" % content_type)
sys.stdout.write(results)
sys.stdout.flush()




