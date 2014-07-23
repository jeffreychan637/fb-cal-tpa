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

#If request from widget, just get event titles/time from the event IDs.
#If from settings, don't need eventIDs. Just get all the event titles
#that the user has on FB accounts
def get_event_data(eventIDs, access_token, request_from_widget):
  try:
    graph = facebook.GraphAPI(access_token)
    

  except facebook.GraphAPIError, e:
    print e.message
    return False


