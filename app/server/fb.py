import facebook
import json
from re import compile, sub
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

until_regex = compile("until=([0-9]+)")
after_regex = compile("after=([0-9A-Za-z=]+)")

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
                    until_pattern = until_regex.search(next)
                    if until_pattern is None:
                        after_pattern = after_regex.search(next)
                        if after_pattern is None:
                            raise Exception("Regex is not working")
                        else:
                            after = after_pattern.group(1)
                            until = ""
                    else:
                        until = until_pattern.group(1)
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
            cur_event_data = get_specific_event(saved_event["eventId"], access_token, "all")
        if cur_event_data:
            cur_event_data["eventColor"] = saved_event["eventColor"]
            processed_events.append(cur_event_data)
    print processed_events
    return processed_events

def get_specific_event(eventId, access_token, desired_data):
    try:
        url = "/" + eventId
        graph = facebook.GraphAPI(access_token)
        if desired_data == "cover":
            data = graph.get_object(url, fields="cover")
        elif desired_data == "guests":
            query = "SELECT attending_count, unsure_count, not_replied_count from event WHERE eid = " + eventId
            data = graph.get_object("/fql", q=query)
        elif desired_data == 'feed':
            data = graph.get_object(url + "/feed")
        else:
            data = graph.get_object(url)
        data = clean_data_dict(data)
        return data
    except facebook.GraphAPIError, e:
        print "FACEBOOK ERROR " + e.message
        return {}

def clean_data_dict(data):
    if type(data) is dict:
        for key in data:
            if type(data[key]) is dict:
                data[key] = clean_data_dict(data[key])
            elif type(data[key]) is list:
                data[key] = clean_data_list(data[key])
            elif type(data[key]) is unicode:
                data[key] = sub(r"access_token=[0-9A-Za-z]+", "", data[key])
    return data

def clean_data_list(data):
    if type(data) is list:
        for index in range(0, len(data)):
            if type(data[index]) is list:
                data[index] = clean_data_list(data[index])
            elif type(data[index]) is dict:
                data[index] = clean_data_dict(data[index])
            elif type(data[index]) is unicode:
                data[index] = sub(r"access_token=[0-9A-Za-z]+", "", data[index])
    return data

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

def get_more_feed(object_id, access_token, desired_data, after, until):
    try:
        graph = facebook.GraphAPI(access_token)
        if after:
            feed = graph.get_object("/" + object_id + "/" + desired_data, after = after)
        else:
            feed = graph.get_object("/" + object_id + "/" + desired_data, until = until)
        print feed
        return feed
    except facebook.GraphAPIError, e:
        print e.message
        return {}
