from flask import request
from app import flask_app
from status_codes import status
from wix_verifications import instance_parser
from fb import get_long_term_token, get_event_data
from models import save_settings, get_settings
from flask.ext.restful import Resource, Api, abort
import json

api = Api(flask_app)

class SaveSettings(Resource):
    def put(self, compID):
        info = validate_put_request(request, compID)
        if info["access_token"]:
            long_term_token = get_long_term_token(info["access_token"])
            if  not long_term_token:
                abort(status["Bad_Gateway"], 
                      message="Facebook returned error on access_token")
        else:
            long_term_token = None
        if save_settings(compID, info, long_term_token):
            abort(status["Internal_Server_Error"], message="Could Not Save Settings")
        else:
            return ""

class GetSettingsWidget(Resource):
    def get(self, compID):
        return get_data(request, compID, True)

class GetSettingsSettings(Resource):
    def get(self, compID):
        return get_data(request, compID, False)

api.add_resource(SaveSettings, "/SaveSettings/<string:compID>")
api.add_resource(GetSettingsWidget, "/GetSettingsWidget/<string:compID>")
api.add_resource(GetSettingsSettings, "/GetSettingsSettings/<string:compID>")


def validate_put_request(request, compID):
    try:
        instance = request.header["X-Wix-Instance"]
        window = request.header["URL"]
        access_token = request.header["owner_access_token"]
        content_type = request.header["Content-Type"]
    except AttributeError:
        abort(status["Unauthorized"], message="Request Incomplete")
    except KeyError:
        abort(status["Unauthorized"], message="Missing Value")
    if window != "editor.wix.com":
        abort(status["Forbbidden"], message="Not Inside Editor")
    if content_type != "application/json":
        abort(status["Bad_Request"], message="Badly Formed Request")
    try:
        data = request.form["data"]
        data_dict = json.loads(data)
        settings = json.dumps(data_dict["settings"])
        eventIDs = json.dumps(data_dict["eventIDs"])
    except:
        abort(status["Bad_Request"], message="Badly Formed Request")
    if not settings:
        abort(status["Bad_Request"], message="Missing Settings")
    if not instance_parser(instance):
        abort(status["Forbbidden"], message="Invalid Instance")
    info = {"instance" : instance, "access_token" : access_token, \
            "settings" : settings, "eventIDs" : eventIDs}
    return info

def validate_get_request(request, compID, request_from_widget):
    try:
        instance = request.header["X-Wix-Instance"]
        if not request_from_widget:
            window = request.header["URL"]
            if window != "editor.wix.com":
                abort(status["Forbbidden"], message="Not Inside Editor")
    except AttributeError:
        abort(status["Unauthorized"], message="Request Incomplete")
    except KeyError:
        abort(status["Unauthorized"], message="Missing Value")
    if not instance_parser(instance):
        abort(status["Forbbidden"], message="Invalid Instance")
    return instance

def get_data(request, compID, request_from_widget):
    instance = validate_get_request(request, compID, request_from_widget)
    if (instance):
        db_entry = get_settings(compID, instance)
        if db_entry is None:
            abort(status["Internal_Server_Error"], \
                  message="Could Not Get Settings")
        if not db_entry:
            empty_json = json.dumps({"settings" : "", "eventIDs" : "", \
                                     "fb_event_data" : ""})
            return empty_json
        else:
            settings = json.loads(db_entry.settings)
            eventIDs = json.loads(db_entry.eventIDs)
            access_token = db_entry.access_token
            fb_event_data = get_event_data(eventIDs, access_token, \
                                           request_from_widget)
            if not fb_event_data:
                abort(status["Bad_Gateway"], 
                      message="Couldn't receive data from Facebook")
            full_json = json.dumps({"settings" : settings, "eventIDs" : eventIDs, \
                                    "fb_event_data" : fb_event_data})
            return full_json





