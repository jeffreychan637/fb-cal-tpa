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
    access_token_data = TextField()

    class Meta:
        # order_by = ("instanceID, compID")
        primary_key = CompositeKey('instanceID', 'compID')

def closeDB():
    try:
        db.close()
    except Exception, e:
        print e
        return False
    else:
        return True

def save_settings(compID, info, datatype):
    try:
        db.connect()
        instanceID = info['instance']
        entry = Users.select().where((Users.instanceID == instanceID) & \
                            (Users.compID == compID)).get()
        if datatype == "access_token":
            entry.access_token_data = info['access_token']
        else:
            entry.settings = info['settings']
            entry.eventIDs = info['eventIDs']
        entry.save()
        return closeDB();
    except Users.DoesNotExist:
        try:
            instance = info['instance']
            if datatype == "access_token":
                settings = ""
                eventIDs = ""
            else:
                access_token_data = ""
            Users.create(compID = compID, instanceID = instance, \
                         settings = settings, eventIDs = eventIDs,
                         access_token_data = access_token_data)
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

def delete_info(compID, instanceID):
    try:
        db.connect()
        entry = Users.select().where((Users.instanceID == instanceID) & \
                            (Users.compID == compID)).get()
        entry.access_token_data = ""
        entry.eventIDs = ""
        entry.save()
        return closeDB()
    except Exception, e:
        print e
        closeDB()
        return False

