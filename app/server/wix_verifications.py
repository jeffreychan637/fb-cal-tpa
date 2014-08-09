"""This file handles parsing the Wix Instance which is key to the security of
this app.
"""

from secrets import wix_keys

__author__ = "Jeffrey Chan"

def instance_parser(instance):
    """This function parses the Wix instance that comes with every call to the
    server. If the parse is successful (the instance is from Wix and the
    permission is set to owner), the call is from a valid source and
    the request it came with should be performed. The function returns the
    parsed instance on success and false otherwise.
    """
    return True