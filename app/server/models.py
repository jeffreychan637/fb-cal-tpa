from peewee import Model, MySQLDatabase, CharField, TextField, \
                   CompositeKey

db = MySQLDatabase('fbCalDB', user='root')

class BaseModel(Model):
    class Meta:
        database = db


class Users(BaseModel):
    compID = CharField(max_length = 50)
    instanceID = CharField(max_length = 50)
    settings = TextField()
    eventIDs = TextField()
    access_token = TextField()

    class Meta:
        # order_by = ("instanceID, compID")
        primary_key = CompositeKey('instanceID', 'compID')

def save_settings(compID, info, long_access_token):
    try:
        db.connect()
        instanceID = info['instance']
        settings = info['settings']
        eventIDs = info['eventIDs']
        entry = Users.select().where((Users.instanceID == instanceID) & \
                            (Users.compID == compID)).get()
        entry.settings = settings
        entry.eventIDs = eventIDs
        entry.access_token = long_access_token
        entry.save()
        return closeDB();
    except Users.DoesNotExist:
        try:
            Users.create(compID = compID, instanceID = instanceID, \
                         settings = settings, eventIDs = eventIDs,
                         access_token = long_access_token)
            return closeDB()
        except Exception, e:
            print e
            closeDB()
            return False
    except Exception, e:
        print e
        closeDB()
        return False

def get_settings(compID, instanceID):
    try:
        db.connect()
        entry = Users.select().where((Users.instanceID == instanceID) & \
                            (Users.compID == compID)).get()
        return entry
    except Users.DoesNotExist:
        closeDB()
        return False
    except Exception, e:
        print e
        closeDB()
        return None

def closeDB():
    try:
        db.close()
    except Exception, e:
        print e
        return False
    else:
        return True


