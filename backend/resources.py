from flask import jsonify, request, current_app as app
from flask_restful import Api, Resource, fields, marshal_with
from backend.models import *
from flask_security import auth_required, current_user

api = Api(prefix='/api')
cache = app.cache

service_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'price': fields.Float,
    'time_required': fields.Integer,
    'description': fields.String,
}

def is_admin(user):
    return any(role.name == "admin" for role in user.roles)

def is_professional(user):
    return any(role.name == "professional" for role in user.roles)


class ServiceApi(Resource):
    @auth_required('token')
    @cache.memoize()
    @marshal_with(service_fields)
    def get(self, id):
        service = Service.query.get(id)
        if not service:
            return {"msg": "Service not found"}, 404
        return service

    @auth_required('token')
    def delete(self, id):
        if not is_admin(current_user):
            return {"msg": "Admin privileges required"}, 403

        service = Service.query.get(id)
        if not service:
            return {"msg": "Service not found"}, 404
        db.session.delete(service)
        db.session.commit()
        return {"msg": "Service deleted"}, 204
    

    @marshal_with(service_fields)
    @auth_required('token')
    def put(self, id):
        if not is_admin(current_user):
            return {"msg": "Admin privileges required"}, 403

        service = Service.query.get(id)
        if not service:
            return {"msg": "Service not found"}, 404

        
        data = request.get_json()
        service.name = data.get("name", service.name)
        service.price = data.get("price", service.price)
        service.time_required = data.get("time_required", service.time_required)
        service.description = data.get("description", service.description)

        db.session.commit()
        return service, 200


class ServiceListApi(Resource):
    @auth_required('token')
    @cache.cached(timeout = 5)
    @marshal_with(service_fields)
    def get(self):
        services = Service.query.all()
        return services

    @auth_required('token')
    def post(self):
        if not is_admin(current_user):
            return {"msg": "Admin privileges required"}, 403

        data = request.get_json()
        name = data.get("name")
        price = data.get("price")
        time_required = data.get("time_required")
        description = data.get("description")

        # Create and save new Service
        new_service = Service(
            name=name,
            price=price,
            time_required=time_required,
            description=description
        )
        db.session.add(new_service)
        db.session.commit()
        return {"msg": "Service created", "service": new_service.id}, 201

api.add_resource(ServiceApi, "/services/<int:id>")
api.add_resource(ServiceListApi, "/services")



customer_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'username': fields.String,
    'address': fields.String,
    'pin': fields.String,
    'phone': fields.String,
    'email': fields.String,
}


class CustomerListApi(Resource):
    @auth_required('token')
    def get(self):
        print(f"Current User: {current_user.username}, ID: {current_user.id}")

        if is_admin(current_user):
        # Query customers and join with User table to get email
         customers = db.session.query(Customer, User.email).join(User, Customer.user_id == User.id).all()
        
        else:
            customers = db.session.query(Customer, User.email).join(User, Customer.user_id == User.id).filter(Customer.user_id == current_user.id).all()
        

        


        # Format response to include email
        customer_list = [
            {
                'id': customer.id,
                'user_id': customer.user_id,
                'username': customer.username,
                'address': customer.address,
                'pin': customer.pin,
                'phone': customer.phone,
                'email': email  
            }
            for customer, email in customers
        ]
        
        return customer_list, 200
    
    
    @marshal_with(customer_fields)
    @auth_required('token')
    def put(self):
            data = request.get_json()

            customer = Customer.query.filter_by(user_id=current_user.id).first()
            if not customer:
                return jsonify({"message": "Customer not found"}), 404

            customer.username = data.get('username', customer.username)
            customer.address = data.get('address', customer.address)
            customer.pin = data.get('pin', customer.pin)
            customer.phone = data.get('phone', customer.phone)


            db.session.commit()

            return jsonify({
                'id': customer.id,
                'user_id':customer.user_id,
                'username': customer.username,
                'address': customer.address,
                'pin': customer.pin,
                'phone': customer.phone,
                'email': current_user.email,
            }), 200



api.add_resource(CustomerListApi, "/customers")      
    
class CustomerApi(Resource):
    @marshal_with(customer_fields)
    @auth_required('token')
    def get(self, id):
        customer = Customer.query.get(id)
        if not customer:
            return {"msg": "Customer not found"}, 404
        return customer




    @auth_required('token')
    def delete(self, user_id):
        
        if not is_admin(current_user):
            return {"msg": "Admin privileges required"}, 403

       
        customer = Customer.query.get(user_id)
        if not customer:
            return {"msg": "Customer not found"}, 404
        
        service_requests = ServiceRequest.query.filter_by(customer_id=user_id).all()
        if service_requests:
         for request in service_requests:
            db.session.delete(request)

        db.session.delete(customer)

        user = User.query.get(user_id)
        if user:
         db.session.delete(user)

        db.session.commit()
        
        return {"msg": "Customer removed successfully"}, 200
    

api.add_resource(CustomerApi, "/customers/<int:user_id>")  


professional_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'username': fields.String,
    'address': fields.String,
    'pin': fields.String,
    'phone': fields.String,
    'email': fields.String,
    'service_name': fields.String,
    'price':fields.Float,
    'experience':fields.String,
    'description':fields.String,
}
class ProfessionalListApi(Resource):
    @marshal_with(professional_fields)
    @auth_required('token')
    def get(self):
        print(f"Current User: {current_user.username}, ID: {current_user.id}")
        service_id = request.args.get('service_id')
        
        query = db.session.query(
            Professional,
            User.email,
            Service.name.label("service_name"),
            Service.price
        ).join(User, Professional.user_id == User.id
        ).join(Service, Professional.service_id == Service.id)

        
        if is_admin(current_user):
            if service_id:
                query = query.filter(Service.id == service_id)  
            results = query.all() 

        # Professional: View only their own profile
        elif is_professional(current_user):
            query = query.filter(Professional.user_id == current_user.id)
            result = query.first() 
            if result:
                professional, email, service_name, price = result
                professional_list = [{
                    'id': professional.id,
                    'user_id': professional.user_id,
                    'username': professional.username,
                    'address': professional.address,
                    'pin': professional.pin,
                    'phone': professional.phone,
                    'experience': professional.experience,
                    'description': professional.description,
                    'service_name': service_name,
                    'email': email,
                    'price': price
                }]
                return professional_list, 200
            else:
                return [], 404 

        # Customer: View all professionals providing the requested service
        else:
            if service_id:
                query = query.filter(Service.id == service_id)  
            results = query.all()  

        
        professional_list = [
            {
                'id': professional.id,
                'user_id': professional.user_id,
                'username': professional.username,
                'address': professional.address,
                'pin': professional.pin,
                'phone': professional.phone,
                'experience': professional.experience,
                'description': professional.description,
                'service_name': service_name,
                'email': email,
                'price': price
            }
            for professional, email, service_name, price in results
        ]

        return professional_list, 200




    @marshal_with(professional_fields)
    @auth_required('token')
    def put(self):
            data = request.get_json()

            professional = Professional.query.filter_by(user_id=current_user.id).first()
            if not professional:
                return jsonify({"message": "Professional not found"}), 404

            professional.username = data.get('username', professional.username)
            professional.address = data.get('address', professional.address)
            professional.pin = data.get('pin', professional.pin)
            professional.phone = data.get('phone', professional.phone)
            professional.experience = data.get('experience', professional.experience)
            professional.description = data.get('description', professional.description)


            db.session.commit()

            return jsonify({
                'id': professional.id,
                'user_id': professional.user_id,
                'username': professional.username,
                'address': professional.address,
                'pin': professional.pin,
                'phone': professional.phone,
                'experience': professional.experience,
                'description': professional.description,
                'email': current_user.email,
            }), 200


api.add_resource(ProfessionalListApi, "/professionals")
    
    

class ProfessionalApi(Resource):
    @auth_required('token')
    def delete(self, user_id):
       
        if not is_admin(current_user):
            return {"msg": "Admin privileges required"}, 403

       
        professional = Professional.query.get(user_id)
        if not professional:
            return {"msg": "Professional not found"}, 404

      
        db.session.delete(professional)
        db.session.commit()
        
        return {"msg": "Professional removed successfully"}, 200




api.add_resource(ProfessionalApi, "/professionals/<int:user_id>")







class ServiceRequestApi(Resource):
    @auth_required('token')
    def post(self):
        data = request.get_json()
        
        service_id = data.get('service_id')
        professional_id = data.get('professional_id')
        customer_id = current_user.id 
        
        
        service_request = ServiceRequest(
            service_id=service_id,
            customer_id=customer_id,
            professional_id=professional_id,
            service_status='Requested',  # Initially set to 'Requested'
        )
        
        db.session.add(service_request)
        db.session.commit()

        return {"msg": "Service request created", "service_request_id": service_request.id}, 201

    @auth_required('token')
    def put(self):
        data = request.get_json()
        
        # Extract fields from the request payload
        service_request_id = data.get('service_request_id')
        service_status = data.get('service_status')
        rating = data.get('rating')
        remarks = data.get('remarks')

        if not service_request_id:
            return {"msg": "Service request ID is required"}, 400
        
        

        
        service_request = ServiceRequest.query.get(service_request_id)
        if not service_request:
            return {"msg": "Service request not found"}, 404

        # Ensure only the customer who owns the request can modify it
        if service_request.customer_id != current_user.id:
            return {"msg": "Unauthorized access"}, 403

        # Validate input fields
        if service_status not in ['Accepted', 'Closed']:
            return {"msg": "Invalid service status provided"}, 400
        
        if not rating or not (1 <= rating <= 5):
            return {"msg": "Rating must be between 1 and 5"}, 400

        if service_request.service_status == 'Closed':
         return {"msg": "Service request is already closed"}, 400

        # Update the service request status and rating
        service_request.service_status = service_status
        service_request.rating = rating
        service_request.remarks = remarks
        service_request.date_of_completion = datetime.utcnow()  # Set completion date

        db.session.commit()

        return {
            "msg": "Service successfully closed and rated",
            "service_request_id": service_request.id
        }, 200

api.add_resource(ServiceRequestApi, '/service_requests')



class CustomerServiceHistoryApi(Resource):
    @auth_required('token')
    def get(self):
        customer_id = current_user.id
        service_requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()
        history = [{
            'id': req.id,
            'professional_id': req.professional_id,
            'service_name': req.service.name,
            'status': req.service_status,
            'date_of_request': req.date_of_request.isoformat()
        } for req in service_requests]

        return history, 200


api.add_resource(CustomerServiceHistoryApi, '/service_requests/history')


class AcceptServiceRequest(Resource):
    @auth_required('token')
    def post(self):
     try:
        data = request.get_json()
        request_id = data.get('request_id')
        
        # Find the service request in the database
        service_request = ServiceRequest.query.filter_by(id=request_id).first()
        if not service_request:
            return {'message': 'Request not found'}, 404
        
        
        service_request.service_status = 'Accepted'
        db.session.commit()

        return {'message': 'Request accepted successfully'}, 200

     except Exception as e:
        return {'message': f'Error accepting request: {str(e)}'}, 500

api.add_resource(AcceptServiceRequest, '/accept_service_request')


class RejectServiceRequest(Resource):
    @auth_required('token')
    def post(self):
     try:
        data = request.get_json()
        request_id = data.get('request_id')
        
     
        service_request = ServiceRequest.query.filter_by(id=request_id).first()
        if not service_request:
            return {'message': 'Request not found'}, 404
        
        # Update the status to 'Rejected'
        service_request.service_status = 'Rejected'
        db.session.commit()

        return {'message': 'Request rejected successfully'}, 200

     except Exception as e:
        return {'message': f'Error rejecting request: {str(e)}'}, 500
     
api.add_resource(RejectServiceRequest, '/reject_service_request')







class ServiceRequestCloseApi(Resource):
    @auth_required('token')
    def put(self, id):  
        service_request = ServiceRequest.query.get(id)
        
        if not service_request:
            return {"msg": "Service request not found"}, 404

        # Update the status to 'closed'
        service_request.service_status = 'closed'
        service_request.date_of_completion = datetime.utcnow()

        db.session.commit()

        return {"msg": "Service request closed"}, 200


api.add_resource(ServiceRequestCloseApi, '/service_requests/<int:id>/close')



class ProfessionalServiceRequestsApi(Resource):
    @auth_required('token')
    def get(self):
        professional_id = current_user.id  

       
        service_requests = (
            db.session.query(
                ServiceRequest.id,
                Service.name.label("service_name"),
                Customer.username.label("customer_name"),
                Customer.address,
                Customer.pin,
                Customer.phone,
                ServiceRequest.date_of_request,
                ServiceRequest.service_status,
                ServiceRequest.remarks
            )
            .join(Service, ServiceRequest.service_id == Service.id)
            .join(Customer, ServiceRequest.customer_id == Customer.user_id)
            .filter(ServiceRequest.professional_id == professional_id)
            .order_by(ServiceRequest.date_of_request.desc())
            .all()
        )

        # Format response as a list of dictionaries
        service_request_list = [
            {
                "id": request.id,
                "service_name": request.service_name,
                "customer_name": request.customer_name,
                "address": request.address,
                "pin": request.pin,
                "phone":request.phone,
                "date_of_request": request.date_of_request.isoformat(),
                "status": request.service_status,
                "remarks": request.remarks
            }
            for request in service_requests
        ]

        return (service_request_list), 200


api.add_resource(ProfessionalServiceRequestsApi, "/professional_service_requests")

class ServiceRequestHistory(Resource):
    @auth_required('token')
    def get(self):
        service_requests = ServiceRequest.query.filter(
            ServiceRequest.professional_id == current_user.id,
            ServiceRequest.service_status.in_(['Accepted', 'Rejected', 'Closed'])
        ).all()

        # Create a list of service requests for the response
        history = [
            {
                'id': req.id,
                'customer_id': req.customer_id,
                'date_of_request': req.date_of_request.isoformat(),
                'service_status': req.service_status
            }
            for req in service_requests
        ]

        return history, 200

# Add the resource to the API
api.add_resource(ServiceRequestHistory, '/service_request_history')



class ServiceBookedHistory(Resource):
    @auth_required('token')
    def get(self):
      if is_admin(current_user):
        service_booked = ServiceRequest.query.all()


      else:
        service_booked = ServiceRequest.query.filter(
            ServiceRequest.customer_id == current_user.id,
            ServiceRequest.service_status.in_(['Accepted', 'Rejected', 'Requested','Closed'])
        ).all()

        # Create a list of service requests for the response
      history = [
            {
                'id': req.id,
                'professional_id': req.professional_id,
                'date_of_request': req.date_of_request.isoformat(),
                'service_status': req.service_status
            }
            for req in service_booked
        ]

      return history, 200

api.add_resource(ServiceBookedHistory, '/service_booked_history')



class SearchServices(Resource):
    @auth_required('token')
    def get(self):
        search_query = request.args.get('query', '')

        # Start the query for services
        query = db.session.query(Service)

        # Search by name or description
        if search_query:
            query = query.filter(Service.name.ilike(f'%{search_query}%'))

        # Execute the query
        services = query.all()

        # Prepare the response
        service_list = [{
            'id': service.id,
            'name': service.name,
            'description': service.description,
        } for service in services]

        return  service_list , 200

api.add_resource(SearchServices, '/search/services')