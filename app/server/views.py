from app import flask_app
from flask import make_response, send_file, render_template

@flask_app.route('/')
def index():
    return send_file('client/index.html')
      # return make_response(open('app/client/index.html').read())

@flask_app.route('/settings.html')
def settings():
    # return make_response(open('app/client/settings.html').read())
    return send_file('client/settings.html')

@flask_app.route('/modal.html/<int:event_id>')
def modal(event_id):
    # return make_response(open('app/client/modal.html').read())
    return render_template('modal.html', event_id = event_id);