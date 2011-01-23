#!/usr/bin/python

# File: solr_get_name_mangling_mappings.py
# Description: Rewrites Solr updates to add semantic tags
# Created: 2010-12-28
# Author: Neil Harris

import cgitb, cgi, sys, urllib, urllib2, string, re, os, time, traceback
import simplejson
import urllib

import kendra_signpost_utils
from kendra_signpost_utils import type_uri_to_prefix_map

def is_bad_request():
    if not os.environ.get("HTTP_HOST", None): return "no HTTP_HOST specified"
    return 0

# Make a query to Virtuoso to get metadata for this object

# Do some sanity checking before actually dispatching: we are not a general-purpose proxy
if is_bad_request():
    print "Status: 403 Forbidden"
    print "Content-type: text/plain"
    print 
    print "I'm sorry Dave, I can't do that:", is_bad_request()

    sys.exit(0)

# Add linefeed to end for the sake of neatness -- not strictly needed
results = simplejson.dumps(type_uri_to_prefix_map) + "\n"

sys.stdout.write("Content-Type: %s\r\n" % "text/plain")
sys.stdout.write("Content-Length: %d\r\n\r\n" % len(results))
sys.stdout.write(results)
sys.stdout.flush()
sys.exit(0)
