#!/usr/bin/python

import os

print "Content-type: text/plain"
print
print "Hello, World!"
print
for k in os.environ:
   print k, os.environ.get(k)

