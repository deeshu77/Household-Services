from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


roles_users = db.Table('roles_users',
    db.Column('user_id', db.Integer(), db.ForeignKey('users.id')),
    db.Column('role_id', db.Integer(), db.ForeignKey('roles.id'))
)

# Role Model
class Role(db.Model, RoleMixin):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

# User Model
class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(), nullable=False)
    email=db.Column(db.String(), unique=True, nullable=False)
    password = db.Column(db.String(), nullable=False)
    fs_uniquifier = db.Column(db.String(), nullable=False, unique=True)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))

   

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)


class Admin(db.Model):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)


class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer)  
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # One-to-many relationship with Service Requests
    service_requests = db.relationship('ServiceRequest', backref='service', lazy=True)


class Professional(db.Model):
    __tablename__ = 'professionals'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    username = db.Column(db.String(), nullable=False)
    address = db.Column(db.String(), nullable=False)
    pin = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False) 
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)  # Foreign key to services
    experience = db.Column(db.String(100))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # One-to-many relationship with Service Requests
    service_requests = db.relationship('ServiceRequest', backref='professional', lazy=True)

# Customer Model
class Customer(db.Model):
    __tablename__ = 'customers'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    username = db.Column(db.String(), nullable=False)
    address = db.Column(db.String())
    pin = db.Column(db.String())
    phone= db.Column(db.String())
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    #One-to-many relationship with Service Requests
    service_requests = db.relationship('ServiceRequest', backref='customer',  cascade='all, delete-orphan', passive_deletes=True)


class ServiceRequest(db.Model):
    __tablename__ = 'service_requests'

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.user_id', ondelete='CASCADE'), nullable=False)  
    professional_id = db.Column(db.Integer, db.ForeignKey('professionals.user_id'), nullable=True)  
    date_of_request = db.Column(db.DateTime, default=datetime.utcnow)
    date_of_completion = db.Column(db.DateTime, nullable=True)
    service_status = db.Column(db.String(50), nullable=False) 
    rating = db.Column(db.Integer, nullable=True) 
    remarks = db.Column(db.Text, nullable=True)       




#     # Relationships with service requests through customer and professional
service_requests_as_customer = db.relationship('ServiceRequest', backref='customer', foreign_keys='ServiceRequest.customer_id', lazy=True)
service_requests_as_professional = db.relationship('ServiceRequest', backref='professional', foreign_keys='ServiceRequest.professional_id', lazy=True)                                     


