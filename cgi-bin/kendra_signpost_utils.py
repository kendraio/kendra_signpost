import string, re

def get_sparql_endpoint_uri():
    return string.strip(open("sparql_endpoint.conf").read())

# Mangles a URI into something that can be a valid facet name
def mangle_uri(type_prefix, uri):
    ok_chars = string.uppercase + string.lowercase + string.digits
    ok_dict = dict(zip(ok_chars, ok_chars))
    return type_prefix + string.join([ok_dict.get(x, "_%02X" % ord(x)) for x in uri], '')

type_uri_to_prefix_map = {
       "http://kendra.org.uk/#number": "fm_kendra_",
       "http://kendra.org.uk/#datetime": "dm_kendra_",
       "http://kendra.org.uk/#string": "sm_kendra_"
          }

def type_uri_to_prefix(prefix):
     return type_uri_to_prefix_map.get(prefix, 'sm_kendra_')

uri_regex = re.compile(r"^[A-Za-z][-A-Za-z0-9+.]*://(?:[-._~A-Za-z0-9:/?#\[\]@!$&'()*+,;=]|%[A-Fa-f0-9][A-Fa-f0-9])*$")

def validate_uri(uristring):
    return re.findall(uri_regex, uristring) != []

# Escape the most problematic XML delimiters that might be used for XML frame-breaking
def xml_escape_text(text):
    text = string.replace(text, "&", "&amp;")
    text = string.replace(text, "<", "&lt;")
    text = string.replace(text, ">", "&gt;")
    return text
