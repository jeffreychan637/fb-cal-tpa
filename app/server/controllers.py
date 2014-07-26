from flask import request
from app import flask_app
from status_codes import STATUS
from wix_verifications import instance_parser
from fb import get_long_term_token, get_event_data, get_user_name, get_all_event_data
from models import save_settings, get_settings, delete_info
from flask.ext.restful import Resource, Api, abort
import json

api = Api(flask_app)

class SaveSettings(Resource):
    def put(self, compID):
        return save_data(request, compID, 'settings')

class SaveAccessToken(Resource):
    def put(self, compID):
        return save_data(request, compID, 'access_token')

class GetSettingsWidget(Resource):
    def get(self, compID):
        return get_data(request, compID, True)

class GetSettingsSettings(Resource):
    def get(self, compID):
        return get_data(request, compID, False)

class GetAllEvents(Resource):
    def get(self, compID):
        instance = validate_get_request(request, False)
        db_entry = get_settings(compID, instance)
        if db_entry is None:
            abort(STATUS["Internal_Server_Error"], \
              message= "Could Not Get Events")
        if not db_entry and db_entry.access_token_data:
            abort(STATUS["Not_Found"], message= "Could not find User")
        event_data = get_all_event_data(db_entry.access_token_data)
        if not event_data:
            abort(STATUS["Bad_Gateway"], 
                  message="Couldn't receive data from Facebook")
        return json.dumps(event_data)

class Logout(Resource):
    def put(self, compID):
        info = validate_put_request(request, "logout")
        if not delete_info(compID, info):
            abort(STATUS["Internal_Server_Error"], \
                  message="Failed to Logout")
        else:
            return { "message" : "User Logged Out Successfully"}

api.add_resource(SaveSettings, "/SaveSettings/<string:compID>")
api.add_resource(SaveAccessToken, "/SaveAccessToken/<string:compID>")
api.add_resource(GetSettingsWidget, "/GetSettingsWidget/<string:compID>")
api.add_resource(GetSettingsSettings, "/GetSettingsSettings/<string:compID>")
api.add_resource(GetAllEvents, "/GetAllEvents/<string:compID>")
api.add_resource(Logout, "/Logout/<string:compID>")

def validate_put_request(request, datatype):
    try:
        instance = request.header["X-Wix-Instance"]
        window = request.header["URL"]
        content_type = request.header["Content-Type"]
    except AttributeError:
        abort(STATUS["Unauthorized"], message="Request Incomplete")
    except KeyError:
        abort(STATUS["Unauthorized"], message="Missing Value")
    if window != "editor.wix.com":
        abort(STATUS["Forbbidden"], message="Not Inside Editor")
    if content_type != "application/json":
        abort(STATUS["Bad_Request"], message="Badly Formed Request")
    if not instance_parser(instance):
        abort(STATUS["Forbbidden"], message="Invalid Instance")
    if datatype == "access_token":
        try:
            data = request.form['access_token']
            access_token = json.loads(data)
        except:
            abort(STATUS["Bad_Request"], message="Badly Formed Request")
        info = {"instance" : instance, "access_token" : access_token}
    elif datatype == "settings":
        try:
            data = request.form["data"]
            data_dict = json.loads(data)
            settings = json.dumps(data_dict["settings"])
            eventIDs = json.dumps(data_dict["eventIDs"])
        except:
            abort(STATUS["Bad_Request"], message="Badly Formed Request")
        if not (settings and eventIDs):
            abort(STATUS["Bad_Request"], message="Missing Settings or Events")
        info = {"instance" : instance, "settings" : settings, \
                "eventIDs" : eventIDs}
    else:
        info = {"instance" : instance}
    return info

def validate_get_request(request, request_from_widget):
    try:
        instance = request.header["X-Wix-Instance"]
        if not request_from_widget:
            window = request.header["URL"]
            if window != "editor.wix.com":
                abort(STATUS["Forbbidden"], message="Not Inside Editor")
    except AttributeError:
        abort(STATUS["Unauthorized"], message="Request Incomplete")
    except KeyError:
        abort(STATUS["Unauthorized"], message="Missing Value")
    if not instance_parser(instance):
        abort(STATUS["Forbbidden"], message="Invalid Instance")
    return instance

def save_data(request, compID, datatype):
    info = validate_put_request(request, datatype)
    if datatype == "access_token":
        long_term_token = get_long_term_token(info["access_token"], compID, \
                                              info["instance"])
        if  long_term_token == "Facebook Error":
            abort(STATUS["Bad_Gateway"], 
                  message="Facebook returned error on access_token")
        elif long_term_token == "Invalid Access Token":
            abort(STATUS["Forbbidden"], message="This access token is invalid.")
        else:
            access_token_data = json.dumps(long_term_token)
            info["access_token"] = access_token_data
    if not save_settings(compID, info, datatype):
        abort(STATUS["Internal_Server_Error"], message="Could Not Save " + datatype)
    else:
        return {"message" : "Saved " + datatype + " Successfully"}

def get_data(request, compID, request_from_widget):
    instance = validate_get_request(request, request_from_widget)
    db_entry = get_settings(compID, instance)
    if db_entry is None:
        abort(STATUS["Internal_Server_Error"], \
              message= "Could Not Get Settings")
    if not db_entry:
        if request_from_widget:
            empty_settings = {"settings" : "", "eventIDs" : "", \
                              "fb_event_data" : "", "active" : "false"}
        else:
            empty_settings = {"settings" : "", "eventIDs" : "", \
                              "active" : "false"}
        empty_json = json.dumps(empty_settings)
        return empty_json
    else:
        settings = ""
        access_token_data = ""
        eventIDs = ""
        if db_entry.settings:
            settings = json.loads(db_entry.settings)
        if db_entry.eventIDs == "":
            eventIDs = json.loads(db_entry.eventIDs)
        if db_entry.access_token_data:
            access_token_data = json.loads(db_entry.access_token_data)
        if request_from_widget:
            if access_token_data:
                fb_event_data = get_event_data(eventIDs, access_token_data, \
                                           request_from_widget)
                if not fb_event_data:
                    abort(STATUS["Bad_Gateway"], 
                        message="Couldn't receive data from Facebook")
                ###should consider sending settings, just without fb event data
                full_settings = {"settings" : settings, "eventIDs" : eventIDs, \
                                 "fb_event_data" : fb_event_data, \
                                 "active" : "true"}
            else:
                full_settings = {"settings" : settings, "eventIDs" : eventIDs, \
                                 "fb_event_data" : "", "active" : "false"}
        else:
            if access_token_data:
                name = get_user_name(access_token_data)
                active = "true"
            else:
                active = "false"
                name = ""

            full_settings = {"settings" : settings, "eventIDs" : eventIDs, \
                                 "active" : active, "name" : name};
        full_json = json.dumps(full_settings)
        return full_json
