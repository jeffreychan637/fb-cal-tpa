from flask import Flask

class MyFlask(Flask):
    def get_send_file_max_age(self, name):
        if name.lower().endswith('.js'):
            print "oh yes!"
            return 0
        elif name.lower().endswith('.css'):
            print "hell yeah!"
            return 0
        elif name.lower().endswith('.html'):
            print "I'm a winner!"
            return 0
        return Flask.get_send_file_max_age(self, name)

flask_app = MyFlask(__name__, static_folder="client", template_folder="client");

from app.server import views
from app.server import controllers

