from flask import current_app as app
from backend.models import db
from flask_security import SQLAlchemyUserDatastore, hash_password

with app.app_context():
    db.create_all()

userdatastore: SQLAlchemyUserDatastore = app.security.datastore
userdatastore.find_or_create_role(name='admin', description='superuser')
userdatastore.find_or_create_role(name='customer', description='genuser')
userdatastore.find_or_create_role(name='professional', description='genuser')

if(not userdatastore.find_user(email='admin@iitm')):
    userdatastore.create_user(username='admin', email='admin@iitm', password=hash_password('pass'), roles=['admin'])
if(not userdatastore.find_user(email='user1@iitm')):
    userdatastore.create_user(username='user1',email='user1@iitm', password=hash_password('pass'), roles=['customer'])

db.session.commit()
