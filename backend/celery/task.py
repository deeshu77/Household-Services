from celery import shared_task
import time 
import flask_excel
from backend.models import *
from backend.celery.mail_service import send_email

@shared_task(ignore_result = False)
def add(x,y):
    time.sleep(10)
    return x+y


@shared_task(ignore_result = False)
def create_csv():
    print("CSV task is being triggered.")
    resource  = ServiceRequest.query.all()


    column_names = [column.name for column in ServiceRequest.__table__.columns]
    print(column_names)
    csv_out  = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv')


    with open('./backend/celery/user-downloads/service_request.csv', 'wb') as file:
        file.write(csv_out.data)

    return 'service_request.csv'


@shared_task(ingore_result = True)
def email_reminder():
     # Check for professionals with pending service requests
    pending_requests = ServiceRequest.query.filter(ServiceRequest.service_status == 'Requested').all()
    professionals_to_notify = set(req.professional_id for req in pending_requests)
   
    professionals = Professional.query.filter(Professional.user_id.in_(professionals_to_notify)).all()
    users = User.query.filter(User.id.in_([prof.user_id for prof in professionals])).all()

    user_mapping = {user.id: user for user in users}

    for professional in professionals:
     user = user_mapping.get(professional.user_id)
     if user: 
        send_email(
            user.email,
            'Daily Reminder: Pending Service Requests',
            f"<p>Dear {professional.username},</p><p>You have pending service requests. Please log in to review them.</p>"
        )

