import uuid
from flask import current_app as app, jsonify,  render_template, request, send_file
from flask_security import auth_required, verify_password, hash_password
from backend.models import *
from sqlalchemy import text
from backend.celery.task import add, create_csv
from celery.result import AsyncResult

datastore = app.security.datastore
cache = app.cache

@app.route("/")
def home():
   return render_template("index.html")

@app.get('/celery')
def celery():
   task = add.delay(10,20)
   return {'task_id': task.id}

@app.get('/get-celery-data/<id>')
def getData(id):
   result = AsyncResult(id)

   if result.ready():
      return {'result' : result.result},200
   else:
      return {'message': 'task not ready'}, 405
   
@app.get('/create-csv')
def createCSV():
   task = create_csv.delay()
   return {'task_id': task.id}, 200

@app.get('/get-csv/<task_id>')
def getCSV(task_id):
    result = AsyncResult(task_id)

    if result.ready():
       return send_file(f'./backend/celery/user-downloads/{result.result}')
    else:
       return {'message':'task not ready'}, 405


@app.get('/cache')
@cache.cached(timeout = 5)
def cache():
   return {'Time':str(datetime.now())}

@app.route("/protected", methods=["GET"])
@auth_required('token')
def protected():
   return "<h1>Only accessible by auth user</h1>"


@app.route("/test", methods=["GET"])
def test():
    return jsonify({"msg": "Test route is working!"}), 200

@app.route("/login", methods=["POST"])
def login():
    if request.content_type != 'application/json':
        return jsonify({"msg": "Content-Type must be application/json"}), 415


    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")  

    if not email or not password or not role:
        return jsonify({"msg": "Invalid inputs. Email, password, and role are required."}), 400

    # Find the user by email
    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"msg": "Invalid email"}), 400
    
    if user.active==0:  # `user.active == 0` can also be used explicitly if needed
        return jsonify({"msg": "User is not active. Please contact support."}), 403

    # Verify password
    if not verify_password(password, user.password):
        return jsonify({"msg": "Wrong password"}), 400

    # Check if the user role matches the selected role
    user_role = user.roles[0].name  # Assuming user has roles and roles[0] is the current role
    if user_role != role:
        return jsonify({"msg": f"Role mismatch. User does not have the '{role}' role."}), 403

    # Generate authentication token and return user data
    return jsonify({
        "token": user.get_auth_token(),
        "email": user.email,
        "id": user.id,
        "role": user_role  # Return the user role for frontend handling
    })


@app.route("/cregister", methods=["POST"])
def cregister():
   data = request.get_json()

   username=data.get("username")
   address=data.get("address")
   phone=data.get("phone")
   pin=data.get("pin")
   email = data.get("email")
   password = data.get("password")

   
   user = datastore.find_user(email=email)

   if user:
      return jsonify({"msg": "This email already exists!"}),404
   
   try:
      # Create a new user
      new_user = User(
         username=username,
         email=email,
         password=hash_password(password),
         fs_uniquifier=str(uuid.uuid4()),
         active=True
      )
      db.session.add(new_user)
      db.session.commit() 

      # Create a new customer entry
      new_customer = Customer(
         user_id=new_user.id,
         username=username,
         address=address,
         pin=pin,
         phone=phone,
      )
      db.session.add(new_customer)
      db.session.commit()

      db.session.execute(
            text("INSERT INTO roles_users (user_id, role_id) VALUES (:user_id, :role_id)"),
            {"user_id": new_user.id, "role_id": 2}
        )
      db.session.commit()

      return jsonify({"msg": "Registered successfully!"}), 200

   except Exception as e:
      db.session.rollback()
      print(f"Error occurred: {e}")
      return jsonify({"msg": "Error occurred!"}), 400

   

@app.route("/pregister", methods=["POST"])
def pregister():
   data = request.get_json()

   username=data.get("username")
   address=data.get("address")
   phone=data.get("phone")
   pin=data.get("pin")
   email = data.get("email")
   password = data.get("password")
   experience =data.get("experience")
   service_id=data.get("service_id")
   description=data.get("description")
   
   

   if not email or not password or not username or not service_id:
        return jsonify({"msg": "Invalid input"}), 400
   
   user = datastore.find_user(email=email)

   if user:
      return jsonify({"msg": "This email already exists!"}),404
   
   try:
      # Create a new user
      new_user = User(
         username=username,
         email=email,
         password=hash_password(password),
         fs_uniquifier=str(uuid.uuid4()),
         active=True
      )
      db.session.add(new_user)
      db.session.commit()  

      # Create a new professional entry
      new_professional = Professional(
         user_id=new_user.id,
         username=username,
         address=address,
         pin=pin,
         phone=phone,
         experience=experience,
         service_id=service_id,
         description=description,
      )
      db.session.add(new_professional)
      db.session.commit()

      db.session.execute(
            text("INSERT INTO roles_users (user_id, role_id) VALUES (:user_id, :role_id)"),
            {"user_id": new_user.id, "role_id": 3}
        )
      db.session.commit()

      return jsonify({"msg": "Registered successfully!"}), 200

   except Exception as e:
      db.session.rollback()
      print(f"Error occurred: {str(e)}")
      return jsonify({"msg": "Error occurred!"}), 400
  

@app.route("/services", methods=["GET"])
def get_services():
    services = Service.query.all() 
    return jsonify([{
        'id': service.id,
        'name': service.name,
        'price': service.price,
        'time_required': service.time_required,
        'description': service.description
    } for service in services]), 200


@app.route('/api/toggle_user_status', methods=['POST'])
def toggle_user_status():
    data = request.get_json()
    user_id = data.get('user_id')
    block = data.get('block')
    
    # Query the user
    user = User.query.get(user_id)
    if user:
        user.active = not block  # Toggle active status
        db.session.commit()
        return jsonify({"msg": "Status updated successfully", "active": user.active})
    else:
        return jsonify({"msg": "User not found"}), 404
