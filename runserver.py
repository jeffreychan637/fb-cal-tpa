from app import flask_app
from os import walk, path

extra_dirs = ['app/client']
extra_files = extra_dirs[:]
for extra_dir in extra_dirs:
    for dirname, dirs, files in walk(extra_dir):
        if 'bower_components' in dirs:
            dirs.remove('bower_components')
        for filename in files:
            filename = path.join(dirname, filename)
            if path.isfile(filename):
                extra_files.append(filename)

flask_app.run(debug=True, extra_files=extra_files)
