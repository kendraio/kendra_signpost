#!/usr/bin/python

import os

print "Content-type: text/plain"
print
print "Hello, World!"
print "REQUEST_URI", os.environ.get("REQUEST_URI")

