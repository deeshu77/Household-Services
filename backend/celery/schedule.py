from celery.schedules import crontab
from flask import current_app as app
from backend.celery.task import email_reminder

celery_app = app.extensions['celery']


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
   

   sender.add_periodic_task(crontab(hour=18, minute=0), email_reminder.s())
    
@celery_app.task
def test(arg):
    print(arg)

