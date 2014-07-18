from flask import Flask

flask_app = Flask(__name__, static_folder="client")

from app.server import views
from app.server import controllers

