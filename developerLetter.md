##Letter to Developer
###From: Jeffrey Chan
Hello there fellow developer! I'm glad to hear you'll be taking on my app, the **Facebook Calendar App**. 

In this document is everything you need to know to improve and deploy this app. Note that most bolded text (besides the headers) are links and are therefore clickable.

**As soon as possible**, I would recommend setting up and playing with the app to get a feel for its functionality. It will also make understanding certain parts of this document a lot easier. 

####Document Contents
- Viewing the Live App
- General Overview
- Technology Used
- Account Details
- File Organization
- Starting Development on your Device
- Deployment Methods
- Database Setup
- Architecture
- I18n/L10n Preparation & Readiness
- Security
- Todos before Releasing the App
- Bugs
- Limitations
- Things to Note
- Ideas for Future Updates

####Viewing the Live App
**App Name**: Facebook Calendar

**App Key**: 137faf71-6063-ae23-b6c2-094358025093

**Live App on Heroku**: [http://wix-fb-calendar.herokuapp.com](http://wix-fb-calendar.herokuapp.com/)

**App Code**: [https://github.com/jeffreywix/fb-cal-tpa](https://github.com/jeffreywix/fb-cal-tpa)

####General Overview
This app allows Wix users to have a calendar on their website that displays information about all their Facebook events to site visitors. The attains all it's information from the Facebook event on each load, so it is always updated in real time. 

All users have to do is choose which of their Facebook events they want to place on their calendars in the settings panel. Users can also choose what color they want their event to appear as on the calendar. All settings are saved to the database after 1 second using a **[debounce mechanism](http://davidwalsh.name/javascript-debounce-function)**.

The widget comes with two different views. Users can choose to show visitors a calendar of their events in month view or they can show all their events in a list.

When visitors click on an event on the calendar or list, a Wix modal opens with an interface similar to Facebook's style for presenting events. On this modal, the visitor gets information on the event (e.g. time, location, description). They can also view the Facebook event feed as well as perform Facebook interactions (e.g. RSVP to the Facebook event, post a status to the event wall, likes a post, comment on a status in the feed, share the event to their own Facebook feed).

The backend basically works by storing the user's Facebook access token in a database and using that to get information on the user's events from Facebook whenever a visitor loads the website the widget is on or opens the modal.

Along with this guide, all functions in my code have been thoroughly documented and should help you greatly in understanding my app.

*Wireframes* of the app can be viewed on the **[Github repository](https://github.com/jeffreywix/fb-cal-tpa)**.

####Technology Used
- The app is written on a **[Flask server](http://flask.pocoo.org/docs/)** on the backend and **[Angular JS](https://angularjs.org/)** & **[JQuery](http://jquery.com/)** on the frontend. Flask is just used to serve the files while the rendering is done by AngularJS & JQuery.
    - On the frontend, the two main packages are **[Bootstrap-Calendar](http://bootstrap-calendar.azurewebsites.net/)** - desktop calendar - and **[Clndr](http://kylestetz.github.io/CLNDR/)** - mobile calendar.
      - They depend on **[Moment JS](http://momentjs.com/)** for event time management and **[Underscore JS](http://underscorejs.org/)** for calendar rendering.
    - On the backend, the two main packages are **[Flask-Restful](http://flask-restful.readthedocs.org/en/latest/index.html)** for handling all requests from the client and **[Peewee](http://peewee.readthedocs.org/en/latest/)** for database interactions.
    - The **[Facebook Javascript SDK](https://developers.facebook.com/docs/javascript)** is used on both the frontend and the backend through this 3rd  party implementation of the Facebook JS SDK in **[Python](https://github.com/pythonforfacebook/facebook-sdk)**.
    
####Account Details
- **Facebook** 
  - The app is set up on Facebook with no specialized configuration. A new version can easily be set up by following Facebook's instructions or I can share the current one with you - just email me.
- **Github**
  - The development version of the app is here: **[fb-cal-tpa](https://github.com/jeffreywix/fb-cal-tpa)**
    
  - The deployed version of the app (with the bare minimum amount of files needed to run the app) is here: **[fb-cal-tpa-production](https://github.com/jeffreywix/fb-cal-tpa-production)**.
- **Heroku**
  - The deployed app can be found here: **[Heroku](http://wix-fb-calendar.herokuapp.com/)**.
  - Note that this is using the files from the **[fb-cal-tpa-production](https://github.com/jeffreywix/fb-cal-tpa-production)** repository.
  
####File Organization
Here you will find a quick summary of what each file's purpose is. Note that each file has been thoroughly documented already and you can find a file's purpose at the top of the file. 

*This describes all the files in the **[fb-cal-tpa](https://github.com/jeffreywix/fb-cal-tpa)** repository.*

- **runserver.py** - Run this file to start the app.
- **requirements.txt** - The Python packages used in the app are listed here. Just run `pip install -r requirements.txt` to download the packages on your machine.
- **bin, include, lib** - Directories created by virtualenv where Python packages are stored. **The version of Python used for this app is 2.7**.
- **node_modules, package.json** - Used for the gruntfile to minimize this app's code. It is unnecessary for the app and can be deleted once the app is minimized.
- **Procfile** - File for Heroku to figure out what to do to start app
- **Wireframes, README.md, LICENSE** - Self-explanatory. Change the License as desired.
- **app** - This is where the app and all its essential files live.
  - **--init--.py** - Defines the Flask server the app is running on.
    - **bower.json** - Details the Javascript packages the app is using. The dev dependencies are not necessary to the app obviously.
    - **Gruntfile.js, dist** - Used for minification of the app. Right now, no minification of the app has been done as I have been unable to get the Gruntfile to work properly. Also, the dist folder constains files that are not up to date. I believe they are failed attempts to minify the app's files.
    - **karma-e2e.conf.js, test** - This file as well as the entire *test* directory is used for testing, but they were all originally from the Send Files app and Donatus. I have not touched them in any way or written any tests for this app.
    - **server** - Folder for all server side files of the app
      - **--init--.py** - necessary file for Python to recognize server directory
        - **controllers.py** - All requests from the client are handled here. This is the central file of the backend as most other files and their functions are called here.
        - **fb.py** - Handles all interactions with the Facebook SDK (e.g. getting long term access token, getting event data).
        - **models.py** - Handles all interactions with the database (e.g. getting and saving data)
        - **secrets.py** - All app/secret keys for Facebook and Wix are located here. **This file is not on the Github**, but you will find that fb.py and wix_verifications.py reference it. On Heroku, the server checks the environment for the secrets as they are not on Heroku either.
        - **status_codes.py** - This file basically holds a bunch of constants that represent HTTP status codes. Keeps the controllers.py code cleaner.
        - **views.py** - This is where the server serves the three pages of the app (the widget, the settings panel, and the modal)
        - **wix_verifications.py** - This file handles parsing the Wix instance and verifying that it is indeed legitimate.
    - **client** - Folder for all client side files of the app
      - **index.html** - The HTML for the widget
        - **settings.html** - The HTML for the settings panel
        - **modal.html** - The HTML for the modal
      - **bower_components** - Javascript dependencies live here
        - **fonts** - This stores the images used for the icon font used in the settings panel and modal from **[Fontastic.me](http://fontastic.me/)**.
        - **images** - Stores the various images used in the app. Besides the wix icon for the settings panel, the other images are used for the dropdown shown when clicking on an event on the widget calendar. They are from **[Bootstrap-Calendar](http://bootstrap-calendar.azurewebsites.net/)**.
        - **mobile** - All work on the mobile version of the widget calendar is here. When this version is done, this folder should be deleted and the files should be moved to their appropriate locations.
           - **index.html** - This is the HTML file for the widget. It should replace  *views/index.html* when done.
             - **mobileCalendar.js** - Contains the functions that setup the mobile calendar view for the widget
             - **calendar.css** - CSS file for mobile calendar for the widget
             - **Latest Look of Mobile Calendar.png** - The look of the mobile calendar the last time I worked on it
        - **styles** - Holds all CSS files used in the app except for the ones from the **[Bootstrap](http://getbootstrap.com/)** and **[Normalize](http://necolas.github.io/normalize.css/)** packages.
         - **calendar.css** - CSS file for desktop calendar for the widget
         - **desktop.css** - CSS file for the widget
         - ** modal.css** - CSS file for the modal
         - **icons.css** - CSS file for the icon font used in the modal and settings panel.
         - **toggle.css** - CSS file for the toggle switch used in the settings panel. The code was originally generated with **[proto.io](http://proto.io/freebies/onoff/)**.
      - **views** - The content HTML files for the app
          - **index.html, settings.html, modal.html** - Content HTML files for parts of the app
            - **alternateModalLayout.html** - An alternate modal layout I was considering. This file should eventually be deleted.
            - **tmpls** - A folder containing a series of templates used by **[Bootstrap-Calendar](http://bootstrap-calendar.azurewebsites.net/)** when rendering the desktop calendar in the widget.
      - **scripts** - All Javascript files for the app are located here.
         - **app.js** - Where the Angular module is initialized
         - **libraries** - Contains outside libraries used by the app
            - **calendar.js** - While this is originally from **[Bootstrap-Calendar](http://bootstrap-calendar.azurewebsites.net/)**, it has been modified for this app. That's why it's not in *bower_components*.
         - **directives** - **[Directives](https://docs.angularjs.org/guide/directive)** for this AngularJS app
          - **borderWidth.js, corners.js** - Updates the widget in real time when the border width and corner settings are changed in the settings panel
            
            - **onFinishRender.js** - Tells the settings panel that the user's Facebook events have been added and it's time to initialize the Wix UI.
        - **controllers** - This houses the AngularJS [controllers](https://docs.angularjs.org/guide/controller) for the app. These are the central Javascript files for the app.
        - **services** - These are the AngularJS **[factories](https://docs.angularjs.org/guide/providers)** for the app.
           - **api.js** - Holds the default settings for the app and the function to get the Wix instance
             - **desktopCalendar.js** - Contains the functions that setup the desktop calendar view for the widget
             - **list.js** - Contains the functions that setup the list view for the widget
             - **processor.js** - Handles most of the event info processing for the modal
             - **server.js** - All requests to the server are made here
             - **wix.js** - Checks if the Wix JS SDK has been loaded
             - **messages.js** - Holds a lot of the messages that are shown to user and visitors for various situations and errors
             - **facebook** - All Facebook interactions on the client side are handled by the file in this folder
              - **fbSetup.js** - **[Sets up](https://developers.facebook.com/docs/javascript/quickstart/v2.0)** the Facebook SDK. Also notifies controller when SDK is ready to be used
                
               - **fbEvents.js** - Handles all interactions with Facebook events. Gets the event data for the settings panel here and all interactions done by the visitor in the modal (e.g. posting, commenting, liking) are done here
               - **fbLogin.js** - Handles **[login](https://developers.facebook.com/docs/facebook-login/login-flow-for-web/v2.0)** of the user in the settings panel
               - **modalFbLogin.js** - Handles the **[login](https://developers.facebook.com/docs/facebook-login/login-flow-for-web/v2.0)** of the visitor in the modal - A lot of the code here overlaps with *fbLogin.js*. They could be merged. The main difference in that it is more important to check Facebook **[permissions](https://developers.facebook.com/docs/facebook-login/permissions/v2.0#checking)** in the modal, since we only request one permission in the settings panel login process.
               
####Starting Development on your Device
Here I will do my best to explain how to start running the app on your own computer.

1. Set up a Python virtual environment in the directory you want to use using virtualenv.

2. Fork the **[Github repository](https://github.com/jeffreywix/fb-cal-tpa)** and clone a copy on your computer. Move all the files into the directory with the virtualenv.

3. Run `pip install -r requirements.txt` to download the Python dependencies.

4. In the folder called *app*, run `bower update` to download the Javascript dependencies.

5. Set up some kind of database either locally or online. Connect it to the app by setting up the database configuration in *server/models.py*. In the file, you will see how I connected the database to a local MySQL and a Heroku Postgres database. Follow those examples to connect the database to the app and then set the *db* variable to your new database. *You should also read the Database setup section of this document before setting up your new database.*

6. Run `python runserver.py` to start the app. Navigate to *localhost:5000* to see the app. Note that because the app verifies instance, it will only truly work in the Wix editor or on a Wix website.
 
####Deployment Methods
Here are the steps to set up this app on a new server and database.

1. Setup the database configuration in *server/models.py*. In the file, you will see how I connected the database to a local MySQL and a Heroku Postgres database. Follow those examples to connect the database to the app and then set the *db* variable to your new database. *You should also read the Database setup section of this document before setting up your new database.*

2. Create a Procfile or some sort of instructions for your server to start the app server. Follow my Procfile example for Heroku, but basically to start the server, all you have to do is call `python runserver.py`. 

3. You can either upload a *secrets.py* file into your server that contains the Facebook app ID and secret in a Python dictionary and the Wix app key and secret in another Python dictionary like so:
```python
fb_keys = {"app" : "xxxxx", 
       "secret": "yyyyy",
           "app_access_token: "xxxxx|yyyyy"
          }
wix_keys = {"app" : "xxxxx",
      "secret" : "yyyyy"
           }
```
The other option is to set up environment variables on the server that correspond to these keys and secrets. Checks the *server/fb.py* and *server/wix_verifications.py* file to see how the app gets these environment variables. These two files are the **only** places in the app where the secrets are used.
  - Note that I set an environment variable called HEROKU to 1 and then check for it when starting the app. If it's present, I know I'm on a production server and I turn Flask's debug tools off and vice versa. See *runserver.py* and *app/--init--.py* for good examples of this.

4.  Move the files from the repository to the server. Make sure all dependencies are installed. You should *minify* the JS and CSS files before doing so. Right now, the files on Heroku are  **not** minified and the Gruntfile in **[fb-cal-tpa](https://github.com/jeffreywix/fb-cal-tpa)** used to minify does not work properly. To run the Gruntfile however, just call `npm run build` in the outside directory.

Note on **App Access Token**:

The app access token is used to **[verify](https://developers.facebook.com/docs/facebook-login/access-tokens#debug)** that access tokens sent to the server from the client side were actually generated from Facebook for the Wix Calendar app.

It is simply the app ID and the secret concatenated together with a pipe in the middle.

####Database Setup
The python package I'm using for database interactions, **[Peewee](http://peewee.readthedocs.org/en/latest/)**, makes it really easy to set up a new database. During development of the app, I worked on a local *MySQL* database and on Heroku, I'm using a *PostgreSQL* database. All you have to do to change it is modify the line that defines **db** in *server/models.py* to change it back or even to a *NoSQL* database. Here's the related code for doing that.
```python
"""The database type is defined here. For development, I have used a MySQL DB,
but the production version of this app uses a Heroku Postgres DB. If you need to
change the DB for whatever reason, just change the line defining "db", providing
the neccesary information to connect to that database.
"""

if "HEROKU" in environ:
    uses_netloc.append("postgres")
    url = urlparse(environ["DATABASE_URL"])
    DATABASE = {
        "name": url.path[1:],
        "user": url.username,
        "password": url.password,
        "host": url.hostname,
        "port": url.port,
    }
    db = PostgresqlDatabase(DATABASE["name"], user=DATABASE["user"], 
                                              password=DATABASE["password"],
                                              host=DATABASE["host"],
                                              port=DATABASE["port"])
    db.get_conn().set_client_encoding('UTF8')
else:
    db = MySQLDatabase("fbCalDB", user="root")
```
*The `set_client_encoding` function just sets the time on the database to UTC8 time. I only store UNIX timestamps for when the access token expires so this line isn't completely necessary.*

*Note that for MySQL, you will need to download a Python package called MySQL-python. You can find this requirement in **requirements.txt** in **[fb-cal-tpa](https://github.com/jeffreywix/fb-cal-tpa)**.*

Setting up the new database is all done by **[Peewee](http://peewee.readthedocs.org/en/latest/)**. All you have to do is start Python on the server, import *server/models.py* and call
`
create_tables()
`
and the database is set up. 

My database setup for this app is one table called Users and here's the self-explanatory code.
```python
class Users(BaseModel):
    """Users is the main - and right now only - table in the DB. It stores the
    information of each app in use. 

    The columns of Users are Wix component ID, Wix instance ID, user settings,
    events saved by the user to be placed on their list or calendar, and their
    long term Facebook access token data.

    The primary keys of Users are the component ID and the instance ID.
    """
    compID = CharField(max_length = 50)
    instanceID = CharField(max_length = 50)
    settings = TextField()
    events = TextField()
    access_token_data = TextField()

    class Meta:
        # order_by = ("instanceID, compID")
        primary_key = CompositeKey('instanceID', 'compID')
```
The compID and the instanceID fields are strings of the component ID and the Instance ID for the specific app this row contains information for. These two fields are used as the primary keys for this database.

The settings field is a JSON object representing an object whose attributes represents the user's settings. You can see what one of these objects look like in *services/api.js*.

The access_token_data is a JSON object representing an object that that contains the user's access token, a UNIX timestamp of when it was generated, the time in seconds till it expires, and the user ID the access token is tied to.

The events field is an JSON object representing an array of objects that have two attributes - event name and event color - representing a saved event and the color the user wanted for that event.

*Note that I do not save any event data of any kind, except event IDs and the colors users want for them. This is used to decide what events I have to retrieve data for when the widget is loaded.*

####Architecture
Here's an explanation of where the Facebook event data is coming from in each aspect of the app and where the work is done. Note that reading the **Limitations** section below will provide lots of additional insight into the architecture of this app.

#####Settings
- On load, the client retrieves the user's settings as well as the name and ID of the Facebook account the app is tied to. While the server is processing the request and once the Facebook SDK is ready to use on the client side, the client checks if the user is currently logged into Facebook. If she is, it tries to get the user's event data on the client side. If that is successful, it waits for the ID of the Facebook account to be sent from the server. Once that's received, the IDs are compared. If the IDs match, then the event data obtained on the client side is used. If not or anything went wrong on the client side while getting the user's data (e.g. user isn't logged into Facebook or logged into another account), then a request is made to the server to get the data on the backend with the long term access token. You can see all of this happening at towards the bottom of the file *controllers/settings.js* (look for `fbInitWatch`).
  - I decided to go with this dual approach rather than just auto getting the event data on the server side, because it's faster to get the data on the client side and getting two pieces of information at the same time (settings from server and event data from Facebook) is much faster than just waiting for the server to get the settings and then making a call to Facebook on its end to get the event data before sending all of this back to the client side.
- All the event data is loaded and rendered into the DOM by Angular JS's **[ng-repeat](https://docs.angularjs.org/api/ng/directive/ngRepeat)** before the `Wix.UI.initialize` function is called. I have to wait for this because I am using a variable amount of color pickers and radio buttons in the settings panel depending on how many events the user has and I need all of them to be in the DOM before I can initialize the Wix Settings UI or else the settings will not work properly.
  - Look for `"Render finished"` in *controllers/setting.js* and then look at the file *directives/onFinishRender.js* to see how this works. Basically, this work allows me to have a variable amount of elements in the Wix settings panel. Another solution would have been to just call `Wix.UI.initialize` and then use Wix UI's **[dynamic creation function](http://wix.github.io/wix-ui-lib/#WixCustomHTMLAttributes-DynamicCreationOfjavascriptComponents-entry)** to build the elements afterwards, but my way allows `Wix.UI.initialize` to find and initialize all the elements for me instead of me having the call the **[dynamic creation function](http://wix.github.io/wix-ui-lib/#WixCustomHTMLAttributes-DynamicCreationOfjavascriptComponents-entry)** multiple times.
- The header of the settings panel is also used to display messages (e.g. error messages) to the user.
- In the settings, there are separate design settings for the widget and the modal. I chose this route because the design of the two elements differ differently enough that their settings can't be placed into one accordion. For example, the *outer buttons* settings for *month view* in the calendar makes no sense in the modal. Likewise, the *blocks* settings for the modal makes no sense for the calendar. Also, I believe that the elements differ enough that each is its own entity such that users should be able to make them different color themes if they want to, although the default gives the user a similar color them for the widget and the modal.

#####Widget
- In the widget, **all** event data is sent from the server along with the user's settings on load. This event data is then handed to the calendar and list setup functions to be rendered properly on the widget.
- In the case of errors, the calendar or list is rendered just without any events.

#####Modal
- In the modal, **all** event data is sent from the server along with the user's settings on load. To speed up the rendering in the modal, I've separated getting the event data into multiple calls to the server. Thus, while the client waits for one piece of information, it can begin processing the previous bit of information that it received.
- To get more comments on a single status post or to get more statuses for the feed, the link to the next page of data (that Facebook sends with the original data) is send back to the server to generate the request for the next piece of data. Look at the function `getMoreFeed` in *server/fb.py* as well as **[this](https://developers.facebook.com/docs/graph-api/using-graph-api/v2.0#paging)** to understand more about how Facebook paging works.
- All Facebook interactions by the visitor (e.g. liking a comment, posting a status, RSVP-ing) is done on the client side. No data from these interactions is saved which leads to some of the limitations described in the **Limitations** section below.
- Messages (e.g. error messages) to be displayed to the visitor are shown through a Bootstrap modal.
- The modal is designed using Bootstrap 3. I also use some of the Bootstrap 3 Javascript elements, but I only load the ones I need when running the app rather than all the elements.

####I18n/L10n Preparation & Readiness
- The app is ready for the most part for a global launch. All times from Facebook are converted to local time (`toLocaleDateString`), although the formatting slightly varies across browsers based on how each browser interprets the local time format.
- Both **[Bootstrap-Calendar](http://bootstrap-calendar.azurewebsites.net/)** and **[Clndr](http://kylestetz.github.io/CLNDR/)** support tons of languages. At this time, I have only accounted for English. You should view the website of these packages to figure out the specifics on how to localize the calendars, but here's a quick example of  how to do it in **[Bootstrap-Calendar](http://bootstrap-calendar.azurewebsites.net/)**:
```javascript
var calendar = $('#calendar').calendar();
calendar.setLanguage(new_language_here);
calendar.view();
```
- All event details are pulled from Facebook. I do not know if Facebook will give event details in other languages or they must be translated within the app.
- Many of the strings shown to users and visitors can be found in the file  *services/messages.js*. Other strings may be present in the angular controllers for the widget, settings, and modal (Found in the *controllers* folder) as well as the HTML files.

####Security
I have done my best to make the app as secure as possible. Here's a quick explanation of all security related features. As for SSL, read this explanation and decide whether it is necessary.

For all server requests, the Wix instance is first verified as coming from Wix and my app before the request is processed. For *put* requests - saving access tokens and settings - the permission attribute in the instance object is verified as being equivalent to "OWNER" before the *put*  request is processed. 

When saving an access token, the access token is sent to Facebook on the server side to **[verify](https://developers.facebook.com/docs/facebook-login/access-tokens#debug)** that it's valid and was actually generated by my app and Facebook. Also, unless no access token has ever been saved, the user ID of the new access token is checked with that of the old one to verify that that the access token belongs to the same user. *Note that we don't run into problems when the user logs out and wants to use another Facebook account because logging out actually **deletes the user's saved events and their access token** from the database.*

**The user's long term access token is never sent to the client side.** It is only used on the server side to get event data. Note that Facebook breaks down data sent to the app in pages when there is a lot of data. Each page comes with a link to the next page. In the link, the access token is sometimes present. Before any Facebook event data is sent from the server to the client, the event data is thoroughly parsed to remove all mentions of the access token. 

In the modal, visitor access tokens are not stored and used only on the client side (the calendar does not require the visitor to connect with Facebook). They are only requested when the user wants to perform a Facebook action in the modal (e.g. posting a status). Actually, Facebook's SDK handles everything such that I don't ever need to do anything with the access token. It seems that once Facebook verifies that the user **[is logged in](https://developers.facebook.com/docs/reference/javascript/FB.getLoginStatus)**, all Facebook calls on behalf of that user are automatically accepted (assuming the user provided permissions for those actions). Perhaps it uses cookies or something, but either way, I never do anything with visitor access tokens. They are not even stored into a variable on the client side.

I do not store any information about the site visitors. All Facebook actions performed in the modal by the visitor are forgotten after the visitor closes the modal. While this is good for security, it actually leads to minor limitations #3 and #4 that I describe in the **Limitations**  section below.

The only data passed from the server to the client is event data and the user's settings. I'm not really worried about this data being stolen because users want to share their event information and settings are useless to outsiders. It is possible though that a user will want to share private Facebook events with a small circle of friends only. 

The only data I would really be worried about people stealing are user's access tokens. Fortunately, they expire within 2 hours.

SSL would definitely make sure that the user's data is as safe as possible. I would personally prefer that my own Facebook access token never gets into the hands of a mischievous user. *Note that anyone can do anything they want under the app's name if they have an access token generated by the app and their actions are within the bounds granted by the user. While I only request for access to a user's event data for this app, it could still expose events that user's want to keep private if the access tokens goes into the wrong hands.*

This might be a much better idea. Instead of SSL, because it might be computationally expensive and not worthwhile for most requests between the client and server, just encrypt the access tokens on the client side with some public key before sending it to the server who will decrypt the data with its secret key to get the access token. This also provides additional verification  that the access token was actually generated by my client and Facebook. 

One thing you should also consider is protecting against **[XSS attacks](http://en.wikipedia.org/wiki/Cross-site_scripting)**. Using **[$sanitize](https://docs.angularjs.org/api/ngSanitize/service/$sanitize)**, I sanitize all event descriptions from Facebook, before rendering it as HTML on the modal. This preserves all the line formatting in the description. I tried to sanitize all data being posted and commented to Facebook, but unfortunately, any new lines or potentially hazardous symbols (e.g. <) are left as in their safe form (e.g. &lt;) when posted on Facebook. It seems like Facebook doesn't render their comments and posts in HTML but instead leaves them as strings. Thus, as of now, the app directly sends the messages to Facebook and in case of errors - actually displays them in the HTML in an error message Bootstrap modal. Because we display visitor typed messages in the HTML of the app, it leaves us vulnerable to XSS attacks - although because the message is a string, when binding the message to the HTML with AngularJS, it's left as a string, so my own pathetic attempts to self-XSS with ```<script type="text/javascript">alert(“hello world!”)</script>``` failed as it was shown as a string in the HTML. Therefore, XSS attacks might actually not be an issue we have to worry about.

Also, note that the URL to the modal is dependent on the event ID, because that's how the widget tells the server what event to open the modal for (In turn, Flask passes this ID back to the modal client so that it knows what event to request the server for data on later - this can be seen in *server/views.py* and *client/modal.html* (code is actually posted in #2 of **Things to Note** section below)). To prevent nefarious people from taking advantage of this, only data for events that have been saved by the user to be shown on their calendar in the settings panel can be shown. Basically, I verify each request from the modal for event data by checking if the event ID of the event being requested matches one of the event IDs for the events in the list of saved events in the database.

####Todos before Releasing the App

#####Required Todos
Here's a list of things that **must** be done before the app should go through QA and Language translation for a global release.

1. Fix the bugs in the **Bugs** section of this document to ensure full browser support.

2. **[Register the app](https://developers.facebook.com/docs/web/tutorials/scrumptious/register-facebook-application)** as a Facebook app and get approval from Facebook to release the app.

3. Setup the app on a new database and server. Follow the instructions from the section  **Deployment Methods** above to see how to do so. Use the Facebook app ID and secret given to you when you registered the Facebook app.

As you can see from the list above, the app is essentially done and you can now just focus on deploying it. 

#####Recommended Todos
But here's a list of things that I **recommend** doing before pushing the app through QA and language translation.

1. Upgrade the app to use the **[2.1 version of Facebook's SDK](https://developers.facebook.com/docs/apps/changelog)**. Right now, the app is on the 2.0 version, but Facebook released an update on August 8th that I would recommend upgrading to. *Note that most of the links to the SDK in this document points to the 2.0 version. I finished writing all Facebook interactions the day they released the new SDK, so I don't understand all the changes as of yet and how they affect the app if we upgrade.* 
 - The only change that affects the app that I can see based on the **[changelog](https://developers.facebook.com/docs/apps/changelog)** is this one: 
  - Instead of relying on an **[FQL](https://developers.facebook.com/docs/reference/fql/)** request (which isn't supported anymore) to get guest numbers, we can get it by **[making a request to the event ID](https://developers.facebook.com/docs/graph-api/reference/v2.1/event])** and specifying the fields *attending_count, maybe_count, no_reply_count*.
      - Changing this in *server/fb.py*
        ```python
         elif desired_data == "guests":
            query = "SELECT attending_count, unsure_count, not_replied_count from event WHERE eid = " + eventId
            data = graph.get_object("/fql", q=query)
        ```
        to this
        ```python
         elif desired_data == "guests":
            data = graph.get_object("url", fields="attending_count, maybe_count, no_reply_count")
        ```
        should solve the problem and complete the upgrade to 2.1.
        - Note that the function that processes this data `processGuests` in *services/processor.js* might need to updated a bit depending on the format/structure of the guest data returned from Facebook.
   - Unfortunately, the **[Python package](https://github.com/pythonforfacebook/facebook-sdk)** used to connect to the Facebook SDK does not support specifying version numbers (not just yet, there's been pull requests that implement it but none have been merged yet because builds are failing) and when you don't specify a version, Facebook defaults to 2.0, so it might not actually be worthwhile to upgrade at this time.
   - Facebook will support the 2.0 version till **[August 7, 2016](https://developers.facebook.com/blog/post/2014/08/07/Graph-API-v2.1/)**.
   - Estimated time to complete: Assuming the **[Python package](https://github.com/pythonforfacebook/facebook-sdk)** is updated to support 2.1 and I didn't miss anything in the changelog that would break massive parts of the app, it should take 30 minutes to upgrade and test all the functionalities of the app to make sure nothing is broken.

2. Develop a better mobile version of the calendar view in the widget using **[Clndr](http://kylestetz.github.io/CLNDR/)** because the app is too long in height on mobile in my opinion when using **[Bootstrap-Calendar](http://bootstrap-calendar.azurewebsites.net/)** (*The list view is looking great already on mobile.*). I've already started development of this mobile version and you'll find the work in the folder *client/mobile*. Follow the wireframes and your own intuition to finish the work. It's mostly frontend work as connecting it to the backend is as simple as just passing in the *eventData* variable in *controllers/desktop.js* as was done for the desktop calendar setup.
 -  As of right now, the coding is only partly finished, so I've isolated the code into a separate folder called *mobile*. Setting up the mobile app for development should be pretty easy. Note that the *mobile/index.html* file is basically just the *views/index.html* file. Just change the file connections in *client/index.html*, add the *mobile/mobileCalendar.css* file, the *mobile/mobileCalendar.js* file, and the **[Clndr](http://kylestetz.github.io/CLNDR/)** dependency (using the minified version is fine), and make sure to call `mobileCalendar.setup(eventData)` where `desktopCalendar.setup(eventData)` is called in *controllers/desktop.js*.
 - When you're done, remove the *mobile* folder and put the files in their appropriate folders (e.g. scripts, styles).
 - Also, you'll have to figure out a way to decide when to show the mobile calendar versus the desktop calendar. You could just add another page for the server to serve and add that as the Wix mobile endpoint rather than using the same endpoint for desktop and mobile.
 - There is a *png* file in the *mobile* folder that shows the latest progress I made on the mobile calendar although the **[wireframes on Github](https://github.com/jeffreywix/fb-cal-tpa)** will probably be more useful.
 - Estimated time to complete: About 1 week

3. Setup some kind of worker in the server to run once a week. This worker should go through every user's access token data and check if it is about to expire. Since I'm storing time generated and seconds to expiration from time generated, this calculation should be simple. For access tokens about to expire, users should be notified in some way (Wix dashboard event? Email? We can request user's email from Facebook for that) that they need to go to the Wix editor and just load the page the widget is on so the app can get a new access token and keep functioning.
  - The point of all this is to solve the #1 limitation of the app listed in the **Limitations** section.
    
4. **[Bootstrap-Calendar](http://bootstrap-calendar.azurewebsites.net/)** provides a calendar with a lot of views (e.g. day, week, month, year), but for the app, I'm only using the month view, so there's a lot of code in *libraries/calendar.js* that's not being run at all. I'd recommend finding this code and removing it to reduce the size of the app.
 - It might not be worth it though as the code in the file is pretty difficult to really understand and you probably won't save much in file size.
 - Estimated time: 1-2 days

####Bugs
1. The modal works on mobile because it's build with Bootstrap's responsive design, but for some reason you can't scroll down in the modal. At least that's the case on my iPhone. I actually think this is a Wix bug and has nothing to do with the app as it works fine in the mobile preview in the editor. Either way, I imagine you have more experience that I do with the Wix modal implementation and it'll be your job to figure out why scrolling isn't possible in the Wix modal on mobile.
  - Estimated time to fix: I don't know, because I don't know how to where and why this problem is happening.

2. In the modal, visitor comments are posted immediately and appended to the status they were posted on. Also, on initial load, each status has a max of 5 comments shown with a *show more comment* button available. (This is also true for the feed where I only shown 5 statuses max at the beginning the and the user can choose to reveal more). If a visitor comments, the comment is appended to the array of comments on the status. If a visitor at that point chooses to *show more comments*, the hidden comments will be appended on to the array of comments on the status that's displayed using **[ng-repeat](https://docs.angularjs.org/api/ng/directive/ngRepeat)**. What happens when things are done in that order is that the hidden comments will be below the comment posted by the visitor giving the illusion that the visitor's comment was posted first. It's possible to solve this problem by creating another array to display using **[ng-repeat](https://docs.angularjs.org/api/ng/directive/ngRepeat)** under the array of comments already there. This array will only hold comments posted through the modal. Thus, when the user clicks *show more replies*, the replies will show up in the original comments array and above the comments posted by the user. Note that there will be some issues regarding the border radius of the elements - Try this solution and then set the modal corners to *Round* in the Settings Panel and then post on a status with comments and one without comments and you will likely see what I mean.
  - Estimated time to fix by implementing my solution: 1 hour
    
3. This isn't a bug I would really be worried about but things will go bad if the user revokes access to their Facebook account outside of the app (e.g. instead of logging out through the app, they go to Facebook and revoke access in their settings). For example, the user will still be shown as logged in in the settings panel but their name won't display because that's retrieved using  the (now useless) access token on the server side. But users should understand the consequences if they revoke access to the app, so I'm not entirely worried about this bug.
 - It could be fixed by checking for authorization errors when retrieving the user's name on settings load. On errors, delete the user's saved events and access tokens in the database. It could get complicated though as you have to differentiate between errors related to authorization versus other random Facebook errors and Facebook's error codes are not very well documented although **[Facebook authorization errors](https://developers.facebook.com/docs/graph-api/using-graph-api/v2.1#errors)** are pretty explicit.
 - This is only a problem in the settings panel. The widget handles it gracefully by just showing a calendar or list with no events. And the modal can never be opened without the event being on the calendar.
 - Estimated time to fix by implementing my solution: 30 minutes 
 
####Limitations
1. As of right now, the user must enter the Wix editor at least once every 60 days, so the app can reload and I can get a new short term access token that I can convert into a long term one that I can use for another 60 days. It is my understanding that **[Facebook doesn't allow me to generate access tokens on my own](https://developers.facebook.com/docs/facebook-login/access-tokens#extending)**. Without a valid access token, I cannot access their events and their calendar will therefore show no events. I have tried to make this problem smaller and as easy to resolve as possible by auto saving any access tokens I can get on every widget and settings panel load. On the server side, I then verify that this is actually the user's access token and whether or not this is a safe access token generated by my app and Facebook. 
 - One way to alleviate this problem is to actually save event data (e.g. titles, times), but now we have to constantly update this data to make sure it's up to date, but it is a valid fallback solution.
 - Another solution is to run the worker described in #3 of **Recommended Todos**. That would at least warn the user when the access token is about to expire and all they have to do is open the editor to resolve the problem - since I save the access token on every widget load.

2. Right now, in the settings panel, I only retrieve all Facebook events the user has created whose time of occurrence is between 3 months ago till anytime in the future. The 3 months ago is variable as in if I open the settings panel today (August 14th), it'll go back to May 15th. But if I open it on December 25th, it'll go back to September 25th. This time amount can be adjusted (or even set to a fixed time) in the `get_all_event_data` function in *server/fb.py* when getting all event data on the server side as well as in the `getAllEvents` function in *facebook/fbEvents.js* when getting all event data on the client side (Recall that, as explained in the **Architecture** section above, the settings panel tries to get the event data on the client side but if fails will try to get the event data on the server side.
  - I chose to do this because I did not see the point in getting all the event data for every single event the user has ever created every time the settings panel is opened. But I do understand that user sometimes want to put past events on their calendar so the 3 months is a compromise in limiting how far in time I go back to look for events every time the settings panel is opened.
    - The **limitation that is introduced** by doing all this is that users cannot place events older than 3 months ago on their calendar and for the events that are older than 3 months that are *already* on the calendar, they cannot be removed. This happens because the settings to place the event on the calendar is not there anymore because the event is never fetched when opening the settings panel. What setting the user originally chose for that event is stuck in place.
    - When I get the event data for the calendar/list in the widget however, I go back enough to get at most 100 created events from the user's account. Then I compare this list of events (call it **list `allEvents`**) with the list, from the database, of events that the user wants on their calendar (call it **list `savedEvents`**). All the event data for events on list `allEvents` that are not on list `savedEvents` are removed from list `allEvents`. Then if there are any events on the list `savedEvents` but not on list `allEvents`, I make a call to Facebook specifically for the data of those events one by one. All of this means that if an event has been marked by the user to be on their calendar, it will be on it no matter what - **basically, the 3 month limitation does not apply to the widget because if a user wants an event on their calendar, I want to make the guarantee that it will be on their calendar no matter what.** 

3. The app allows users to delete posts and comments they've added immediately after they are added. But if a user wants to reopen the modal and delete it later, this is not possible (*X* symbol to delete won't show up). This is because the modal only keeps track of the visitor's actions while they are in the modal. Once they exit, **no information** about the site visitor is stored. While this functionality could be enabled by storing user comment and post IDs in the database, this seems like a lot of used database space for a functionality most visitors will never use.

4. There are two limitations to liking posts and comments that are interlinked.
 - First, the modal does not know what comments and posts the site visitor has liked upon opening the modal. If a user likes a comment or post that they have liked previously on Facebook or through the app, a Facebook error will occur - because you can't like something twice.
 - Second, Facebook does not return a like count of a status (it does for comments however and this isn't a problem on those) when getting an event feed. It only returns an array of user IDs for people that have liked the status. Right now I just get the length of the array to figure out the like count. Unfortunately, Facebook only returns a limit of 25 IDs in the array and it requires multiple calls to get the full array or one request to the like object to get the like count. Thus, the max amount of likes for any status shown in the modal is 25.
 - Both problems could be solved by getting the entire like array (and going through it to check for the visitor's ID). Actually, the second can be solved by just making a request for the like object without getting the rest of the array. Either way, I don't think the cost of making multiple calls to the backend which in turn makes multiple calls to the Facebook server for each status in the event feed is not worthwhile just to solve this problem.
  - *The reason the call the Facebook server is done on the backend is to avoid transferring the user's long term access token to the client side where it could be used for nefarious purposes. This is explained further in the **Things to Note** section below as well as the **Security** section above.*

####Things to Note
Here's a mashup of things that I think you should keep in mind about this app.

- I use Angular JS's **[ngAnimate](https://docs.angularjs.org/guide/animations)** animate adding the status to the feed. It's a minor animation for what may be a heavy cost of loading ngAnimate. I'm not sure the cost for loading ngAnimate though, so it might be no big deal but it might be something to keep in mind if we want to keep the app as small and fast as possible.

- The dist folder contains data that I know is not up to date and the Gruntfile that's supposed to be used for minification does not work. Thus, I have not done any minification of the files. I do not know how to fix is, but keep in mind that this code in *client/modal.html* 
```html
<!-- This is necessary to pass event ID from server into modal, so the modal
       knows what event to ask the server for later. event_id is a python 
       variable for Flask to fill in when rendering the modal rather than an
       Angular JS variable 
  -->
  <script type="text/javascript">
      angular.module('fbCal').value('eventId', {{event_id}});
  </script>
```
will likely cause problems.
- There is a decent amount of text that shown to the user in the header of the settings panel before a user logs in. I suspect QA isn't going to be happy about it, but all the text there is relevant for the user to have a good experience. It might be a good idea to have the text in a small modal that shows up when a user that has not logged in opens the settings panel or it could be hidden in a tooltip - although the inability to format text in a Wix tooltip makes me think that this is a terrible idea. I'm already not happy with all the other tooltips used in the settings panel because of the inability to format text (e.g. add newlines).
  - The note on events needing to be public on Facebook is really important as it will cause problems for visitors that try to post/comment/like on an event that they don't have access to on Facebook. *Because I am using the user's access tokens, visitors will always be able to view all parts of the modal however.* Another way to let users know about this is to mark all events in the settings panel that are private (Facebook has a `privacy` attribute that you can use to determine this information) and warn them of the consequences if they choose to add one of these private events to their calendar. 
- All functions in all my files have been thoroughly documented. I recommend you read through them as well as this guide whenever you don't understand how any parts of my app work.
- No tests have been written for this app.
- The **[Normalize CSS](http://necolas.github.io/normalize.css/)** might not be necessary as Bootstrap implements it into its CSS files. This is stated both on **[Normalize CSS](http://necolas.github.io/normalize.css/)** and **[Bootstrap CSS](http://getbootstrap.com/css/)**. 
- I cannot explain why the routing for the scripts and CSS files in *index.html, settings.html,* and *modal.html* looks so different. All the HTML files are in the same directory. The *server/views.py* file that serves all 3 files is always in the same location. In addition, while the *index.html* and *setting.html* files are pulled from what Flask has been told is the *static* folder (since they are not rendered just served) and *modal.html* is pulled from what Flask has been told is the *templates* folder (since Flask does a little rendering for the modal, passing in the event ID variable), both the *static* and *template* folders are set to the *client* folder that all 3 HTML files are in. This is set when initializing the Flask app in the *app/--init--.py* file. There is no reason for the routing to be so different but this is the only way I could get the app to work. If you figure out why, please do let me know.
- I have chosen for the app to just function as a calendar with no events on it if the user does not log in to the app. You may decide to put some kind of inactive banner on the widget if the user is not logged in (the exact place to do that is labeled in the `setSettings` function in *controllers/desktop.js*), but I would recommend not doing so, as it allows the app to just serve as a nice calendar for users without events that just want a calendar on their Wix site.

####Ideas for Future Updates
These are ideas for future versions of the app. If there are any things that you didn't do in the **Recommended Todos** sections above, definitely include them in a  future update as well.

- Right now, I'm able to handle events created by Facebook users very well, but I don't know what happens if a user signs into a **[Facebook Page account](https://www.facebook.com/pages/create/)** and tries to put events hosted by a Facebook page on their calendar. I believe everything in the app will work just fine, but I'm not completely sure if I'm requesting all the **[permissions](https://developers.facebook.com/docs/facebook-login/permissions/v2.0)** necessary to get details for an event created by a Facebook Page account. It should be easy to change and having this support would be crucial for businesses that use Facebook Page accounts.
- Support for multiple Facebook accounts when users have a primary account as well as a **[Facebook Page account](https://www.facebook.com/pages/create/)**.
- Facebook provides a `ticket uri` attribute that is a link to where you can buy tickets for an event. It wouldn't be that difficult to implement a *Buy Tickets* button next to the *RSVP* and *Share* dropdowns in the modal. This attribute only apply for events created by Facebook Pages accounts however so you'll have to implement support for those events first.
- Similar to events created by Facebook Page Accounts, I'm not sure if I'm asking for all the **[permissions](https://developers.facebook.com/docs/facebook-login/permissions/v2.0)** necessary to handle events hosted for groups. I'm pretty sure I am because I believe all events for a group must be hosted by some individual (or a Facebook page account I suppose), but I'm not completely sure. Again, it shouldn't be difficult to fix (if it isn't implemented already) and having this feature would be useful for those that want to share their events and Wix website to their wider social circle.
- Allow for comment moderation through the app, although this is likely an unnecessary feature as users can just go to the actual Facebook event page to report visitors and remove their posts. Also, this would be taxing on our end as we would have to store a lot of comment and post IDs, so we could delete them later if the user wanted to.
- Have a checkbox in the settings panel that would allow users to add all events to the calendar at once or remove all events from calendar in one click.
- **[Bootstrap-Calendar](http://bootstrap-calendar.azurewebsites.net/)** makes it really easy for you to display a list of all events that are on the calendar. This means we could enable users to have the option to use both the calendar and list view. The code is actually already implemented in *views/index.html* and *services/desktopCalendar.js* but is just commented out. I'm not sure how this would translate to mobile.
- For further Wix integration, visitors should be allowed to RSVP through Wix and through Facebook. I haven't really thought this out but users could get a Wix dashboard event whenever a visitor RSVPs although I think it would be a lot cleaner for everyone though if all event RSVP-ing was handled on the Facebook end. But it would be easy to keep track of visitors who are interacting with the modal and let the user know in logistical statistics.
- Because all events data is generated on widget load and a lot of it is only displayed in the modal, users get almost no SEO benefit from this app unless web crawlers are able to run Javascript **([Google's crawler does, but it's unclear to what extent](http://stackoverflow.com/questions/13499040/how-do-search-engines-deal-with-angularjs-applications)**). It would be great if you looked through Google and **[Facebook's tips](https://developers.facebook.com/docs/web/webmasters)** for SEO and made sure the app complied as much as possible so users of the app will see SEO gains and people looking for certain events will find their Wix websites.
- Currently, Facebook gives me posts in the order that they were posted and this how they are displayed in the feed. On Facebook however, posts are actually displayed in an order that takes into account the time of the post as well as when the latest comment was added to a post. It might be worthwhile to sort posts like this if it isn't too much computational work. I don't think it will be because I only display a limited amount of posts in the feed initially anyways and we're always limited by the fact that **[Facebook's data comes in pages](https://developers.facebook.com/docs/graph-api/using-graph-api/v2.0#paging)**, so you'll never have to ever sort that many items at a time (max 25 items). Each time new data comes in, just sort it and then append it to the end of the array of feed objects that is already there.
- I chose to only feature posts from actual Facebook users in the modal feed - by checking each status object for a *message* attribute. I've ignored Facebook stories (e.g. *"Joe Smith created an event"*) as they can be pretty variable in terms of format and I didn't think Facebook event stories are that worthwhile to show because usually they just say that the user changed the event logistics (e.g. *"Joe Smith changed the event time"*) and the visitor can just look at the current event logistics at the top of the modal to figure that out. But in the future, if there are worthwhile Facebook stories to show, it might be worthwhile to implement showing them in the feed.
- Right now, if a user posts a video onto the event wall, it will not be available to watch in the modal. I did not think the effort to get video embedding to work on the initial version of this app was worthwhile, but it might be something to look into for a future update.

####Conclusion
Thank you so much for taking the time to read all this! It's a lot - I know! You have an incredible understanding of my app now, but do feel free to email me if you have any other questions. Thanks for taking on this app and I can't wait to see it in the Wix App Market!

Jeffrey Chan
 