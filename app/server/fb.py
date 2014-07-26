import facebook
from secrets import fb_keys
from models import get_settings
from time import time

def get_long_term_token(short_token, compID, instance):
  try:
    graph = facebook.GraphAPI(short_token)
    verify = graph.get_object("/debug_token", input_token = short_token, \
                         app_access_token = fb_keys["app_access_token"])
    verify_data = verify['data']
    if (verify_data["is_valid"] and (verify_data["app_id"] == fb_keys["app"])):
      user = get_settings(compID, instance)
      if user and user.access_token_data:
        if not user.access_token_data.userID == verify_data["user_id"]:
          return "Invalid Access Token"
      long_token = graph.extend_access_token(fb_keys["app"], \
                                             fb_keys["secret"])
      long_token["generated_time"] = int(time())
      long_token["user_id"] = verify_data["user_id"]
      return long_token
  except facebook.GraphAPIError, e:
    print e.message
    return "Facebook Error"

#If request from widget, just get event titles/time from the event IDs.
#If from settings, don't need eventIDs. Just get all the event titles
#that the user has on FB accounts
def get_event_data(eventIDs, access_token_data, request_from_widget):
  try:
    graph = facebook.GraphAPI(access_token_data.access_token)


  except facebook.GraphAPIError, e:
    print e.message
    return False

def get_all_event_data(access_token_data):
  try:
    graph = facebook.GraphAPI(access_token_data.access_token)


  except facebook.GraphAPIError, e:
    print e.message
    return False

def get_user_name(access_token_data):
  try:
    graph = facebook.GraphAPI(access_token_data.access_token)
    me = graph.get_object("/me")
    name = me["name"]
    return name
  except facebook.GraphAPIError, e:
    print e.message
    return False
