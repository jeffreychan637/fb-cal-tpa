import facebook
from secrets import fb_keys

def get_long_term_token(short_token):
  try:
    graph = facebook.GraphAPI(short_token)
    long_token = graph.extend_access_token(fb_keys["app"], fb_keys["secret"])
  except facebook.GraphAPIError, e:
    print e.message
    return
  else:
    return long_token

def get_event_data(eventIDs, access_token, request_from_widget):
  try:
    graph = facebook.GraphAPI(access_token)
    

  except facebook.GraphAPIError, e:
    print e.message
    return False


