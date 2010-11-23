#!/usr/bin/python

# File: solr_ing_proxy.py
# Description: Rewrites Solr pings
# Created: 2010-11-05
# Author: Neil Harris

import cgitb, cgi, sys, urllib, string, os, time

def urlquote(x):
    return urllib.quote_plus(x)

request_uri = os.environ.get("REQUEST_URI", "")

def is_bad_request():
    if os.environ.get("REQUEST_METHOD", None) not in ["GET", "HEAD"]: return "not a GET or HEAD command"
    if not os.environ.get("HTTP_HOST", None): return "no HTTP_HOST specified"
    if request_uri[:6] != "/solr/": return "not a /solr/ request"
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
absolute_url = '%s://%s:%d%s' % (protocol, os.environ['HTTP_HOST'], 8983, request_uri)

urlobject = urllib.urlopen(absolute_url)
results = urlobject.read()
content_type = urlobject.info().gettype()

if os.environ.get("REQUEST_METHOD", None) == "HEAD":
   results = ""

sys.stdout.write("Content-type: %s\r\n" % content_type)
sys.stdout.write("Content-length: %d\r\n\r\n" % len(results))
sys.stdout.write(results)
sys.stdout.flush()




