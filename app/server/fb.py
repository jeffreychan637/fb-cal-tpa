import facebook
import json
from re import compile
from secrets import fb_keys
from models import get_settings
from time import time

def get_long_term_token(short_token, compID, instance):
    try:
        graph = facebook.GraphAPI(fb_keys["app_access_token"])
        verify = graph.get_object("/debug_token", input_token = short_token, \
                                  access_token = fb_keys["app_access_token"])
        verify_data = verify['data']
        if (verify_data["is_valid"] and (verify_data["app_id"] == fb_keys["app"])):
            user = get_settings(compID, instance)
            if user and user.access_token_data:
                access_token_data = json.loads(user.access_token_data)
                if not access_token_data["user_id"] == verify_data["user_id"]:
                  return "Invalid Access Token"
            graph = facebook.GraphAPI(short_token)
            long_token = graph.extend_access_token(fb_keys["app"], \
                                             fb_keys["secret"])
            long_token["generated_time"] = str(int(time()))
            long_token["user_id"] = verify_data["user_id"]
            return long_token
    except facebook.GraphAPIError, e:
        print e.message
        return "Facebook Error"

untilRegex = compile("until=([0-9]+)")
afterRegex = compile("after=([0-9A-Za-z=]+)")

#If request from widget, just get event titles/time from the event IDs.
#If from settings, don't need events. Just get all the event titles
#that the user has on FB accounts
def get_event_data(events_info, access_token_data, request_from_widget):
    data = get_event_info("", access_token_data["access_token"], len(events_info))
    if (data) or (data == []):
        return process_event_data(events_info, data, access_token_data["access_token"])
    else:
        return False

def get_event_info(since, access_token, events_length):
    final_event_data = [];
    next_page = True;
    graph = facebook.GraphAPI(access_token)
    after = ""
    until = ""
    while(next_page):
        events = graph.get_object("/me/events/created", since=since, after=after, until=until)
        try:
            final_event_data += events["data"]
            if (not since) and len(final_event_data) > 100 and len(final_event_data) > (events_length * 2):
                next_page = False
            if events["paging"]:
                if "cursors" in events["paging"]:
                    if "after" in events["paging"]["cursors"]:
                        after = events["paging"]["cursors"]["after"]
                        until = ""
                    else:
                        next_page = False
                else:
                    next = events["paging"]["next"]
                    untilPattern = untilRegex.search(next)
                    if untilPattern is None:
                        afterPattern = afterRegex.search(next)
                        if afterPattern is None:
                            raise Exception("Regex is not working")
                        else:
                            after = afterPattern.group(1)
                            until = ""
                    else:
                        until = untilPattern.group(1)
                        after = ""
        except KeyError, e:
            next_page = False
            return final_event_data
        except facebook.GraphAPIError, e:
            print "FACEBOOK ERROR " + e.message
            next_page = False
            return False
        except Exception, e:
            print "ERROR " + e.message
            next_page = False
            return final_event_data
    return final_event_data

def process_event_data(events_info, event_data, access_token):
    for event in event_data:
        event["location"] = ""
    print event_data
    processed_events = []
    for saved_event in events_info:
        cur_event_data = next((event for event in event_data if event["id"] == saved_event["eventId"]), None)
        if cur_event_data is None:
            cur_event_data = get_specific_event(saved_event["eventId"], access_token)
        if cur_event_data:
            cur_event_data["eventColor"] = saved_event["eventColor"]
            processed_events.append(cur_event_data)
    print processed_events
    return processed_events

def get_specific_event(eventId, access_token):
    try:
        print access_token
        graph = facebook.GraphAPI(access_token)
        event = graph.get_object("/" + eventId)
        return event
    except facebook.GraphAPIError, e:
        print "FACEBOOK ERROR " + e.message
        return {}

def get_all_event_data(access_token_data):
    try:
        cur_time = int(time())
        seconds_in_three_months = 60 * 60 * 24 * 90
        time_three_months_ago = str(cur_time - seconds_in_three_months)
        return get_event_info(time_three_months_ago,
                              access_token_data["access_token"], 0)
    except facebook.GraphAPIError, e:
        print e.message
        return False

def get_user_name(access_token_data):
    try:
        graph = facebook.GraphAPI(access_token_data["access_token"])
        me = graph.get_object("/me")
        name = me["name"]
        return name
    except facebook.GraphAPIError, e:
        print e.message
        return ""
