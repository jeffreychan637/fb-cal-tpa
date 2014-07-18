from app import flask_app
from flask import make_response

@flask_app.route('/')
def index():
      return make_response(open('app/client/index.html').read())

@flask_app.route('/settings.html')
def settings():
    return make_response(open('app/client/settings.html').read())