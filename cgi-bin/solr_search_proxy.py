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

form = cgi.FieldStorage(keep_blank_values=1)
form_data = [(k, form.getlist(k)) for k in form.keys()]

request_uri = os.environ.get("REQUEST_URI", "")
recreated_query = string.join([make_url_fields(k, vs) for (k, vs) in form_data], "&")

def is_bad_request():
    return 0
    if os.environ.get("REQUEST_METHOD", None) != "POST": return "not a POST command"
    return 0

# Do some sanity checking: we are not a general-purpose proxy
if is_bad_request():
    print "Status: 403 Forbidden"
    print "Content-type: text/plain"
    print 
    print "I'm sorry Dave, I can't do that."
    sys.exit(0)

urlobject = urllib.urlopen("http://dev1.kendra.org.uk/cgi-bin/hello.py" + recreated_query)

results = urlobject.read()
content_type = urlobject.info().gettype()

sys.stdout.write("Content-type: %s\n\r\n\r" % content_type)
sys.stdout.write(results)
sys.stdout.flush()




