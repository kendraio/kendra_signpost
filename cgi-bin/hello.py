#!/usr/bin/python

import os

print "Content-type: text/x-undefined-for-testing"
print
print "Hello, World!"
print
for k in os.environ:
   print k, os.environ.get(k)

