import string

# Mangles a URI into something that can be a valid facet name
def mangle_uri(uri):
    ok_chars = string.uppercase + string.lowercase + string.digits
    ok_dict = dict(zip(ok_chars, ok_chars))
    return "mu_" + string.join([ok_dict.get(x, "_%02X" % ord(x)) for x in uri], '')

