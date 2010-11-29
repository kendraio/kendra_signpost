import urllib, sys, string, re

query = "SELECT ?graph ?subject ?property ?object WHERE { GRAPH ?graph {?subject ?property ?object}}"
url = "http://dev.kendra.org.uk:8890/sparql?default-graph-uri=&query=%s&format=text%%2Frdf+n3&debug=on&timeout=" % urllib.quote_plus(query)

def strip_fields(x):
    return re.findall(r'(?s)<binding name="[^>]+">(.*?)</binding>', x)

data = map(strip_fields, re.findall(r"(?s)<result>.*?</result>", urllib.urlopen(url).read()))

for d in data:
    print "--------"
    print d
