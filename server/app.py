from flask import Flask, render_template, jsonify, send_from_directory, request
from flask_cors import CORS
from flask_restful import Api, Resource, reqparse
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
from datetime import datetime
import os
import uuid
import requests
import json

# Initialize Flask app and extensions
app = Flask(__name__, static_folder='../src', template_folder='../templates')

# Enable CORS for all routes, allowing requests from localhost:3000 (React dev server)
CORS(app, resources={
    r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]},
    r"/": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}
})

# Configuration - try to use PostgreSQL if available, fallback to SQLite
import os
# For testing purposes, use SQLite; for production, use PostgreSQL
use_postgresql = os.environ.get('USE_POSTGRESQL', 'false').lower() == 'true'
if use_postgresql:
    database_url = os.environ.get('DATABASE_URL', 'postgresql://username:password@localhost/jobtracker')
    if database_url.startswith('postgres://'):
        # Fix for Heroku-style postgres:// URLs
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
else:
    database_url = 'sqlite:///jobtracker.db'  # Use SQLite for testing

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-this')  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour

db = SQLAlchemy(app)
api = Api(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # CREATE, READ, UPDATE, DELETE
    table_name = db.Column(db.String(100), nullable=False)
    record_id = db.Column(db.String(100))  # ID of the record being modified
    old_values = db.Column(db.Text)  # JSON string of old values
    new_values = db.Column(db.Text)  # JSON string of new values
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)

class JobApplication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    role_title = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200))
    hourly_rate = db.Column(db.Float)
    applied_date = db.Column(db.Date)
    status = db.Column(db.String(50), default='Applied')
    application_source = db.Column(db.String(100))
    contact_email = db.Column(db.String(200))
    priority_level = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TargetCompany(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    role_title = db.Column(db.String(200))
    website = db.Column(db.String(200))
    company_size = db.Column(db.String(50))
    industry = db.Column(db.String(100))
    remote_policy = db.Column(db.String(50))
    application_status = db.Column(db.String(50), default='To Apply')
    priority = db.Column(db.String(20), default='Medium')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TargetCompaniesAPI(Resource):
    @jwt_required()
    def get(self):
        # Get target companies for the current user
        current_user_id = int(get_jwt_identity())

        companies = TargetCompany.query.filter_by(user_id=current_user_id).all()

        result = []
        for company in companies:
            result.append({
                'id': company.id,
                'name': company.name,
                'role': company.role_title,
                'website': company.website,
                'size': company.company_size,
                'industry': company.industry,
                'remote_policy': company.remote_policy,
                'application_status': company.application_status,
                'priority': company.priority,
                'created_at': company.created_at.isoformat(),
                'updated_at': company.updated_at.isoformat()
            })

        return {'companies': result}

    @jwt_required()
    def post(self):
        # Add a new target company
        current_user_id = int(get_jwt_identity())
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Company name is required')
        parser.add_argument('role', type=str, required=False)
        parser.add_argument('website', type=str, required=False)
        parser.add_argument('size', type=str, required=False)
        parser.add_argument('industry', type=str, required=False)
        parser.add_argument('remote_policy', type=str, required=False)
        parser.add_argument('application_status', type=str, default='To Apply')
        parser.add_argument('priority', type=str, default='Medium')
        args = parser.parse_args()

        company = TargetCompany(
            user_id=current_user_id,
            name=args['name'],
            role_title=args['role'],
            website=args['website'],
            company_size=args['size'],
            industry=args['industry'],
            remote_policy=args['remote_policy'],
            application_status=args['application_status'],
            priority=args['priority']
        )

        db.session.add(company)
        db.session.commit()

        # Create audit log entry
        audit_log = AuditLog(
            user_id=current_user_id,
            action='CREATE',
            table_name='target_companies',
            record_id=str(company.id),
            old_values=None,
            new_values=json.dumps({
                'name': company.name,
                'role': company.role_title,
                'website': company.website,
                'size': company.company_size,
                'industry': company.industry,
                'remote_policy': company.remote_policy,
                'application_status': company.application_status,
                'priority': company.priority
            }),
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string if request.user_agent else None
        )
        db.session.add(audit_log)
        db.session.commit()

        return {'message': 'Target company added successfully', 'company': {
            'id': company.id,
            'name': company.name,
            'role': company.role_title,
            'website': company.website,
            'size': company.company_size,
            'industry': company.industry,
            'remote_policy': company.remote_policy,
            'application_status': company.application_status,
            'priority': company.priority
        }}, 201


class TargetCompanyDetailAPI(Resource):
    @jwt_required()
    def get(self, company_id):
        # Get a specific target company
        current_user_id = int(get_jwt_identity())
        company = TargetCompany.query.filter_by(id=company_id, user_id=current_user_id).first()

        if not company:
            return {'message': 'Target company not found'}, 404

        return {'company': {
            'id': company.id,
            'name': company.name,
            'role': company.role_title,
            'website': company.website,
            'size': company.company_size,
            'industry': company.industry,
            'remote_policy': company.remote_policy,
            'application_status': company.application_status,
            'priority': company.priority,
            'created_at': company.created_at.isoformat(),
            'updated_at': company.updated_at.isoformat()
        }}


class InterviewsAPI(Resource):
    @jwt_required()
    def get(self):
        # Get upcoming interviews for the current user
        current_user_id = get_jwt_identity()

        # For now, return mock data - in a real app this would fetch from an interviews table
        interviews = [
            {
                "id": 1,
                "company": "Tech Innovations Inc.",
                "role": "Senior Software Engineer",
                "date": "2025-01-15",
                "type": "Technical Interview",
                "interviewer": "John Smith",
                "questions": "What projects have you worked on?",
                "notes": "Focus on system design skills"
            },
            {
                "id": 2,
                "company": "Global Solutions Ltd.",
                "role": "Frontend Developer",
                "date": "2025-01-18",
                "type": "Behavioral Interview",
                "interviewer": "Sarah Johnson",
                "questions": "Tell me about a challenging situation you faced",
                "notes": "Emphasize teamwork examples"
            }
        ]

        return {'interviews': interviews}

    @jwt_required()
    def post(self):
        # Create a new interview schedule
        current_user_id = int(get_jwt_identity())
        parser = reqparse.RequestParser()
        parser.add_argument('company', type=str, required=True, help='Company name is required')
        parser.add_argument('role', type=str, required=True, help='Role is required')
        parser.add_argument('date', type=str, required=True, help='Interview date is required')
        parser.add_argument('type', type=str, required=True, help='Interview type is required')
        parser.add_argument('interviewer', type=str, required=False)
        parser.add_argument('questions', type=str, required=False)
        parser.add_argument('notes', type=str, required=False)
        args = parser.parse_args()

        # In a real app, this would create a new Interview record in the database
        new_interview = {
            'id': 999,  # Mock ID
            'company': args['company'],
            'role': args['role'],
            'date': args['date'],
            'type': args['type'],
            'interviewer': args['interviewer'],
            'questions': args['questions'],
            'notes': args['notes']
        }

        return {'message': 'Interview scheduled successfully', 'interview': new_interview}, 201



class UploadResumeAPI(Resource):
    @jwt_required()
    def post(self):
        # Handle resume upload and job matching
        from werkzeug.utils import secure_filename

        # Check if the post request has the file part
        if 'resume' not in request.files:
            return {'message': 'No file part in the request'}, 400

        file = request.files['resume']

        # If user does not select file, browser submits an empty part without filename
        if file.filename == '':
            return {'message': 'No selected file'}, 400

        if file:
            # Save file temporarily
            filename = secure_filename(file.filename)
            filepath = os.path.join('/tmp', f"resume_{get_jwt_identity()}_{filename}")
            file.save(filepath)

            # For demo purposes, we'll return mock job matches
            # In a real implementation, we would parse the resume and match to job opportunities

            job_matches = [
                {
                    'company': 'Tech Innovations Inc.',
                    'position': 'Senior Software Engineer',
                    'industry': 'Technology',
                    'salaryRange': '$90,000 - $130,000',
                    'remotePolicy': 'Hybrid',
                    'applyLink': 'https://techinnovations.com/jobs/123'
                },
                {
                    'company': 'Global Solutions Ltd.',
                    'position': 'Frontend Developer',
                    'industry': 'Web Development',
                    'salaryRange': '$70,000 - $100,000',
                    'remotePolicy': 'Remote',
                    'applyLink': 'https://globalsolutions.com/jobs/456'
                },
                {
                    'company': 'Data Systems Co.',
                    'position': 'Full Stack Developer',
                    'industry': 'Software',
                    'salaryRange': '$80,000 - $110,000',
                    'remotePolicy': 'On-site',
                    'applyLink': 'https://datasystems.com/jobs/789'
                },
                {
                    'company': 'Cloud Technologies',
                    'position': 'DevOps Engineer',
                    'industry': 'Infrastructure',
                    'salaryRange': '$95,000 - $125,000',
                    'remotePolicy': 'Hybrid',
                    'applyLink': 'https://cloudtech.com/jobs/101'
                },
                {
                    'company': 'AI Startups Hub',
                    'position': 'Machine Learning Engineer',
                    'industry': 'AI/ML',
                    'salaryRange': '$100,000 - $140,000',
                    'remotePolicy': 'Remote',
                    'applyLink': 'https://aistartupshub.com/jobs/202'
                }
            ]

            # Clean up the temporary file
            os.remove(filepath)

            return {
                'message': 'Resume uploaded successfully',
                'jobMatches': job_matches
            }, 200

        return {'message': 'Invalid file type'}, 400


class UserApplicationDetailAPI(Resource):
    @jwt_required()
    def get(self, application_id):
        # Get a specific job application
        current_user_id = int(get_jwt_identity())
        application = JobApplication.query.filter_by(id=application_id, user_id=current_user_id).first()

        if not application:
            return {'message': 'Application not found'}, 404

        return {'application': {
            'id': application.id,
            'company': application.company,
            'role_title': application.role_title,
            'location': application.location,
            'hourly_rate': application.hourly_rate,
            'applied_date': application.applied_date.isoformat() if application.applied_date else None,
            'status': application.status,
            'application_source': application.application_source,
            'contact_email': application.contact_email,
            'priority_level': application.priority_level,
            'created_at': application.created_at.isoformat(),
            'updated_at': application.updated_at.isoformat()
        }}

    @jwt_required()
    def put(self, application_id):
        # Update a job application
        current_user_id = int(get_jwt_identity())
        application = JobApplication.query.filter_by(id=application_id, user_id=current_user_id).first()

        if not application:
            return {'message': 'Application not found'}, 404

        # Store old values for audit
        old_values = {
            'company': application.company,
            'role_title': application.role_title,
            'location': application.location,
            'hourly_rate': application.hourly_rate,
            'applied_date': application.applied_date.isoformat() if application.applied_date else None,
            'status': application.status,
            'application_source': application.application_source,
            'contact_email': application.contact_email,
            'priority_level': application.priority_level
        }

        parser = reqparse.RequestParser()
        parser.add_argument('company', type=str, required=True, help='Company name is required')
        parser.add_argument('role_title', type=str, required=True, help='Role title is required')
        parser.add_argument('location', type=str, required=False)
        parser.add_argument('hourly_rate', type=float, required=False)
        parser.add_argument('applied_date', type=str, required=False)
        parser.add_argument('status', type=str, required=False)
        parser.add_argument('application_source', type=str, required=False)
        parser.add_argument('contact_email', type=str, required=False)
        parser.add_argument('priority_level', type=str, required=False)
        args = parser.parse_args()

        # Update application
        application.company = args['company']
        application.role_title = args['role_title']
        application.location = args['location']
        application.hourly_rate = args['hourly_rate']
        application.status = args['status']
        application.application_source = args['application_source']
        application.contact_email = args['contact_email']
        application.priority_level = args['priority_level']

        if args['applied_date']:
            application.applied_date = datetime.strptime(args['applied_date'], '%Y-%m-%d').date()

        application.updated_at = datetime.utcnow()
        db.session.commit()

        # Create audit log entry
        new_values = {
            'company': application.company,
            'role_title': application.role_title,
            'location': application.location,
            'hourly_rate': application.hourly_rate,
            'applied_date': application.applied_date.isoformat() if application.applied_date else None,
            'status': application.status,
            'application_source': application.application_source,
            'contact_email': application.contact_email,
            'priority_level': application.priority_level
        }

        audit_log = AuditLog(
            user_id=current_user_id,
            action='UPDATE',
            table_name='job_applications',
            record_id=str(application_id),
            old_values=json.dumps(old_values),
            new_values=json.dumps(new_values),
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string if request.user_agent else None
        )
        db.session.add(audit_log)
        db.session.commit()

        return {'message': 'Application updated successfully', 'application': {
            'id': application.id,
            'company': application.company,
            'role_title': application.role_title,
            'location': application.location,
            'hourly_rate': application.hourly_rate,
            'applied_date': application.applied_date.isoformat() if application.applied_date else None,
            'status': application.status,
            'application_source': application.application_source,
            'contact_email': application.contact_email,
            'priority_level': application.priority_level
        }}

    @jwt_required()
    def delete(self, application_id):
        # Delete a job application
        current_user_id = int(get_jwt_identity())
        application = JobApplication.query.filter_by(id=application_id, user_id=current_user_id).first()

        if not application:
            return {'message': 'Application not found'}, 404

        # Store old values for audit
        old_values = {
            'company': application.company,
            'role_title': application.role_title,
            'location': application.location,
            'hourly_rate': application.hourly_rate,
            'applied_date': application.applied_date.isoformat() if application.applied_date else None,
            'status': application.status,
            'application_source': application.application_source,
            'contact_email': application.contact_email,
            'priority_level': application.priority_level
        }

        db.session.delete(application)
        db.session.commit()

        # Create audit log entry
        audit_log = AuditLog(
            user_id=current_user_id,
            action='DELETE',
            table_name='job_applications',
            record_id=str(application_id),
            old_values=json.dumps(old_values),
            new_values=None,
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string if request.user_agent else None
        )
        db.session.add(audit_log)
        db.session.commit()

        return {'message': 'Application deleted successfully'}
        company = TargetCompany.query.filter_by(id=company_id, user_id=current_user_id).first()

        if not company:
            return {'message': 'Target company not found'}, 404

        # Store old values for audit
        old_values = {
            'name': company.name,
            'role': company.role_title,
            'website': company.website,
            'size': company.company_size,
            'industry': company.industry,
            'remote_policy': company.remote_policy,
            'application_status': company.application_status,
            'priority': company.priority
        }

        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Company name is required')
        parser.add_argument('role', type=str, required=False)
        parser.add_argument('website', type=str, required=False)
        parser.add_argument('size', type=str, required=False)
        parser.add_argument('industry', type=str, required=False)
        parser.add_argument('remote_policy', type=str, required=False)
        parser.add_argument('application_status', type=str)
        parser.add_argument('priority', type=str)
        args = parser.parse_args()

        # Update the company
        company.name = args['name']
        company.role_title = args['role']
        company.website = args['website']
        company.company_size = args['size']
        company.industry = args['industry']
        company.remote_policy = args['remote_policy']
        if args['application_status']:
            company.application_status = args['application_status']
        if args['priority']:
            company.priority = args['priority']
        company.updated_at = datetime.utcnow()

        db.session.commit()

        # Create audit log entry
        new_values = {
            'name': company.name,
            'role': company.role_title,
            'website': company.website,
            'size': company.company_size,
            'industry': company.industry,
            'remote_policy': company.remote_policy,
            'application_status': company.application_status,
            'priority': company.priority
        }

        audit_log = AuditLog(
            user_id=current_user_id,
            action='UPDATE',
            table_name='target_companies',
            record_id=str(company_id),
            old_values=json.dumps(old_values),
            new_values=json.dumps(new_values),
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string if request.user_agent else None
        )
        db.session.add(audit_log)
        db.session.commit()

        return {'message': 'Target company updated successfully', 'company': {
            'id': company.id,
            'name': company.name,
            'role': company.role_title,
            'website': company.website,
            'size': company.company_size,
            'industry': company.industry,
            'remote_policy': company.remote_policy,
            'application_status': company.application_status,
            'priority': company.priority
        }}

    @jwt_required()
    def delete(self, company_id):
        # Delete a target company
        current_user_id = int(get_jwt_identity())
        company = TargetCompany.query.filter_by(id=company_id, user_id=current_user_id).first()

        if not company:
            return {'message': 'Target company not found'}, 404

        # Store old values for audit
        old_values = {
            'name': company.name,
            'role': company.role_title,
            'website': company.website,
            'size': company.company_size,
            'industry': company.industry,
            'remote_policy': company.remote_policy,
            'application_status': company.application_status,
            'priority': company.priority
        }

        db.session.delete(company)
        db.session.commit()

        # Create audit log entry
        audit_log = AuditLog(
            user_id=current_user_id,
            action='DELETE',
            table_name='target_companies',
            record_id=str(company_id),
            old_values=json.dumps(old_values),
            new_values=None,
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string if request.user_agent else None
        )
        db.session.add(audit_log)
        db.session.commit()

        return {'message': 'Target company deleted successfully'}

# Path to Excel file
EXCEL_FILE = 'Hamman_Job_Search_Tracker.xlsx'

class JobTrackerAPI(Resource):
    def __init__(self):
        # Load the Excel file and store the dataframes
        self.dataframes = {}
        
        if os.path.exists(EXCEL_FILE):
            excel_file = pd.ExcelFile(EXCEL_FILE)
            for sheet_name in excel_file.sheet_names:
                self.dataframes[sheet_name] = pd.read_excel(EXCEL_FILE, sheet_name=sheet_name)
    
    def get(self, sheet_name=None):
        # Get data from Excel file
        if not sheet_name:
            # Return list of sheets
            sheets_info = {}
            for name, df in self.dataframes.items():
                sheets_info[name] = {'rows': len(df), 'columns': len(df.columns)}
            return {'sheets': sheets_info}
        
        if sheet_name in self.dataframes:
            # Convert DataFrame to JSON
            df = self.dataframes[sheet_name]
            # Convert date columns properly
            result = {}
            for col in df.columns:
                if pd.api.types.is_datetime64_any_dtype(df[col]):
                    result[col] = df[col].dt.strftime('%Y-%m-%d').tolist()
                else:
                    result[col] = df[col].fillna('').tolist()
            return result
        else:
            return {'error': f'Sheet {sheet_name} not found'}, 404


class ApplicationTrackerAPI(Resource):
    def get(self):
        # Get application tracker data
        tracker_api = JobTrackerAPI()
        tracker_api.__init__()  # Initialize to load data
        if 'Application Tracker' in tracker_api.dataframes:
            df = tracker_api.dataframes['Application Tracker']
            result = {}
            for col in df.columns:
                if pd.api.types.is_datetime64_any_dtype(df[col]):
                    result[col] = df[col].dt.strftime('%Y-%m-%d').tolist()
                else:
                    result[col] = df[col].fillna('').tolist()
            return result
        else:
            return {'error': 'Application Tracker sheet not found'}, 404
    
    def post(self):
        # Add/update application data
        parser = reqparse.RequestParser()
        parser.add_argument('company', type=str, help='Company name', required=True)
        parser.add_argument('role_title', type=str, help='Role title', required=True)
        parser.add_argument('location', type=str, help='Location')
        parser.add_argument('hourly_rate', type=float, help='Hourly rate')
        parser.add_argument('applied_date', type=str, help='Applied date')
        parser.add_argument('application_source', type=str, help='Application source')
        parser.add_argument('status', type=str, help='Application status')
        args = parser.parse_args()
        
        # This is a simplified version - in a real app you would write to the Excel file
        return {'message': 'Application added successfully', 'data': args}


class DashboardAPI(Resource):
    @jwt_required()
    def get(self):
        # Get dashboard metrics for the current user from the database
        current_user_id = int(get_jwt_identity())

        # Get all applications for the current user
        applications = JobApplication.query.filter_by(user_id=current_user_id).all()

        if not applications:
            return {
                'total_applications': 0,
                'applications_this_week': 0,
                'interviews_scheduled': 0,
                'offers_received': 0,
                'high_priority_applications': 0,
                'average_hourly_rate': 0.0,
                'applications_today': 0,
                'success_rate': 0.0
            }

        # Calculate metrics from the applications
        total_applications = len(applications)
        applications_this_week = 0  # This would require more specific date calculation
        interviews_scheduled = 0
        offers_received = 0
        high_priority_applications = 0

        today = datetime.now().date()
        valid_rates = [app.hourly_rate for app in applications if app.hourly_rate is not None]
        avg_hourly_rate = sum(valid_rates) / len(valid_rates) if valid_rates else 0.0
        applications_today = 0

        for app in applications:
            # Count applications from the past week
            if app.applied_date and (today - app.applied_date).days <= 7:
                applications_this_week += 1

            # Count interviews and offers
            if app.status and 'interview' in app.status.lower():
                interviews_scheduled += 1
            elif app.status and 'offer' in app.status.lower():
                offers_received += 1

            # Count high priority applications
            if app.priority_level and app.priority_level.lower() == 'high':
                high_priority_applications += 1

            # Count today's applications
            if app.applied_date and app.applied_date == today:
                applications_today += 1

        success_rate = (offers_received / max(total_applications, 1)) * 100

        return {
            'total_applications': total_applications,
            'applications_this_week': applications_this_week,
            'interviews_scheduled': interviews_scheduled,
            'offers_received': offers_received,
            'high_priority_applications': high_priority_applications,
            'average_hourly_rate': round(avg_hourly_rate, 2),
            'applications_today': applications_today,
            'success_rate': round(success_rate, 2)
        }


class AuthAPI(Resource):
    def post(self, action):
        # Handle authentication: signup/login
        parser = reqparse.RequestParser()
        
        if action == 'signup':
            parser.add_argument('username', type=str, required=True, help='Username is required')
            parser.add_argument('email', type=str, required=True, help='Email is required')
            parser.add_argument('password', type=str, required=True, help='Password is required')
            args = parser.parse_args()
            
            # Check if user already exists
            if User.query.filter_by(username=args['username']).first():
                return {'message': 'Username already exists'}, 400
            
            if User.query.filter_by(email=args['email']).first():
                return {'message': 'Email already exists'}, 400
            
            # Create new user
            user = User(username=args['username'], email=args['email'])
            user.set_password(args['password'])
            db.session.add(user)
            db.session.commit()
            
            # Create access token - convert user.id to string to avoid JWT identity issues
            access_token = create_access_token(identity=str(user.id))
            return {'message': 'User created successfully', 'access_token': access_token}, 201
        
        elif action == 'login':
            parser.add_argument('username', type=str, required=True, help='Username is required')
            parser.add_argument('password', type=str, required=True, help='Password is required')
            args = parser.parse_args()
            
            user = User.query.filter_by(username=args['username']).first()
            
            if user and user.check_password(args['password']):
                access_token = create_access_token(identity=str(user.id))
                return {'message': 'Login successful', 'access_token': access_token}, 200
            else:
                return {'message': 'Invalid credentials'}, 401


class UserApplicationsAPI(Resource):
    @jwt_required()
    def get(self):
        # Get user's job applications
        current_user_id = int(get_jwt_identity())
        applications = JobApplication.query.filter_by(user_id=current_user_id).all()
        
        result = []
        for app in applications:
            result.append({
                'id': app.id,
                'company': app.company,
                'role_title': app.role_title,
                'location': app.location,
                'hourly_rate': app.hourly_rate,
                'applied_date': app.applied_date.isoformat() if app.applied_date else None,
                'status': app.status,
                'application_source': app.application_source,
                'contact_email': app.contact_email,
                'priority_level': app.priority_level,
                'created_at': app.created_at.isoformat() if app.created_at else None,
                'updated_at': app.updated_at.isoformat() if app.updated_at else None
            })
        
        return {'applications': result}
    
    @jwt_required()
    def post(self):
        # Create a new job application
        current_user_id = int(get_jwt_identity())
        parser = reqparse.RequestParser()
        parser.add_argument('company', type=str, required=True, help='Company name is required')
        parser.add_argument('role_title', type=str, required=True, help='Role title is required')
        parser.add_argument('location', type=str)
        parser.add_argument('hourly_rate', type=float)
        parser.add_argument('applied_date', type=str)
        parser.add_argument('status', type=str, default='Applied')
        parser.add_argument('application_source', type=str)
        parser.add_argument('contact_email', type=str)
        parser.add_argument('priority_level', type=str)
        args = parser.parse_args()
        
        # Convert date string to date object if provided
        applied_date = None
        if args['applied_date']:
            applied_date = datetime.strptime(args['applied_date'], '%Y-%m-%d').date()
        
        application = JobApplication(
            user_id=current_user_id,
            company=args['company'],
            role_title=args['role_title'],
            location=args['location'],
            hourly_rate=args['hourly_rate'],
            applied_date=applied_date,
            status=args['status'],
            application_source=args['application_source'],
            contact_email=args['contact_email'],
            priority_level=args['priority_level']
        )
        
        db.session.add(application)
        db.session.commit()
        
        # Create audit log entry
        audit_log = AuditLog(
            user_id=current_user_id,
            action='CREATE',
            table_name='job_applications',
            record_id=str(application.id),
            new_values=None,  # We'll store the new values in JSON format
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string if request.user_agent else None
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return {'message': 'Application created successfully', 'application': {
            'id': application.id,
            'company': application.company,
            'role_title': application.role_title,
            'location': application.location,
            'hourly_rate': application.hourly_rate,
            'applied_date': application.applied_date.isoformat() if application.applied_date else None,
            'status': application.status,
            'application_source': application.application_source,
            'contact_email': application.contact_email,
            'priority_level': application.priority_level
        }}, 201


class UserApplicationDetailAPI(Resource):
    @jwt_required()
    def get(self, application_id):
        # Get a specific job application
        current_user_id = int(get_jwt_identity())
        application = JobApplication.query.filter_by(id=application_id, user_id=current_user_id).first()

        if not application:
            return {'message': 'Application not found'}, 404

        return {'application': {
            'id': application.id,
            'company': application.company,
            'role_title': application.role_title,
            'location': application.location,
            'hourly_rate': application.hourly_rate,
            'applied_date': application.applied_date.isoformat() if application.applied_date else None,
            'status': application.status,
            'application_source': application.application_source,
            'contact_email': application.contact_email,
            'priority_level': application.priority_level,
            'created_at': application.created_at.isoformat(),
            'updated_at': application.updated_at.isoformat()
        }}
    
    @jwt_required()
    def put(self, application_id):
        # Update a job application
        current_user_id = int(get_jwt_identity())
        application = JobApplication.query.filter_by(id=application_id, user_id=current_user_id).first()
        
        if not application:
            return {'message': 'Application not found'}, 404
        
        # Store old values for audit
        old_values = {
            'company': application.company,
            'role_title': application.role_title,
            'location': application.location,
            'hourly_rate': application.hourly_rate,
            'applied_date': application.applied_date.isoformat() if application.applied_date else None,
            'status': application.status,
            'application_source': application.application_source,
            'contact_email': application.contact_email,
            'priority_level': application.priority_level
        }
        
        parser = reqparse.RequestParser()
        parser.add_argument('company', type=str, required=True, help='Company name is required')
        parser.add_argument('role_title', type=str, required=True, help='Role title is required')
        parser.add_argument('location', type=str)
        parser.add_argument('hourly_rate', type=float)
        parser.add_argument('applied_date', type=str)
        parser.add_argument('status', type=str, default='Applied')
        parser.add_argument('application_source', type=str)
        parser.add_argument('contact_email', type=str)
        parser.add_argument('priority_level', type=str)
        args = parser.parse_args()
        
        # Convert date string to date object if provided
        applied_date = None
        if args['applied_date']:
            applied_date = datetime.strptime(args['applied_date'], '%Y-%m-%d').date()
        
        # Update the application
        application.company = args['company']
        application.role_title = args['role_title']
        application.location = args['location']
        application.hourly_rate = args['hourly_rate']
        application.applied_date = applied_date
        application.status = args['status']
        application.application_source = args['application_source']
        application.contact_email = args['contact_email']
        application.priority_level = args['priority_level']
        application.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Create audit log entry
        new_values = {
            'company': application.company,
            'role_title': application.role_title,
            'location': application.location,
            'hourly_rate': application.hourly_rate,
            'applied_date': application.applied_date.isoformat() if application.applied_date else None,
            'status': application.status,
            'application_source': application.application_source,
            'contact_email': application.contact_email,
            'priority_level': application.priority_level
        }
        
        audit_log = AuditLog(
            user_id=current_user_id,
            action='UPDATE',
            table_name='job_applications',
            record_id=str(application_id),
            old_values=str(old_values),
            new_values=str(new_values),
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string if request.user_agent else None
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return {'message': 'Application updated successfully', 'application': {
            'id': application.id,
            'company': application.company,
            'role_title': application.role_title,
            'location': application.location,
            'hourly_rate': application.hourly_rate,
            'applied_date': application.applied_date.isoformat() if application.applied_date else None,
            'status': application.status,
            'application_source': application.application_source,
            'contact_email': application.contact_email,
            'priority_level': application.priority_level
        }}
    
    @jwt_required()
    def delete(self, application_id):
        # Delete a job application
        current_user_id = int(get_jwt_identity())
        application = JobApplication.query.filter_by(id=application_id, user_id=current_user_id).first()
        
        if not application:
            return {'message': 'Application not found'}, 404
        
        # Store old values for audit
        old_values = {
            'company': application.company,
            'role_title': application.role_title,
            'location': application.location,
            'hourly_rate': application.hourly_rate,
            'applied_date': application.applied_date.isoformat() if application.applied_date else None,
            'status': application.status,
            'application_source': application.application_source,
            'contact_email': application.contact_email,
            'priority_level': application.priority_level
        }
        
        db.session.delete(application)
        db.session.commit()
        
        # Create audit log entry
        audit_log = AuditLog(
            user_id=current_user_id,
            action='DELETE',
            table_name='job_applications',
            record_id=str(application_id),
            old_values=str(old_values),
            new_values=None,
            ip_address=request.remote_addr,
            user_agent=request.user_agent.string if request.user_agent else None
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return {'message': 'Application deleted successfully'}


class AuditLogAPI(Resource):
    @jwt_required()
    def get(self):
        # Get audit logs for current user
        current_user_id = int(get_jwt_identity())
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        logs = AuditLog.query.filter_by(user_id=current_user_id)                     .order_by(AuditLog.timestamp.desc())                     .paginate(page=page, per_page=per_page, error_out=False)

        result = []
        for log in logs.items:
            result.append({
                'id': log.id,
                'action': log.action,
                'table_name': log.table_name,
                'record_id': log.record_id,
                'old_values': log.old_values,
                'new_values': log.new_values,
                'timestamp': log.timestamp.isoformat(),
                'ip_address': log.ip_address,
                'user_agent': log.user_agent
            })

        return {
            'logs': result,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': logs.total,
                'pages': logs.pages
            }
        }


class CompanySearchAPI(Resource):
    @jwt_required()
    def post(self):
        # Search for top companies using Google AI or web search
        parser = reqparse.RequestParser()
        parser.add_argument('query', type=str, required=True, help='Search query is required')
        args = parser.parse_args()

        search_query = args['query']

        # Note: In a real implementation, you would connect to Google AI API
        # For demonstration, I'll create mock data based on the search query
        # To implement real Google AI, you would need to install and configure google-generativeai package

        # Mock response - in real implementation this would be from Google AI API
        mock_companies = [
            {
                "name": f"TechCorp {search_query}",
                "website": f"https://techcorp{search_query.lower().replace(' ', '')}.com",
                "size": "Large",
                "industry": "Technology",
                "remote_policy": "Hybrid",
                "role": f"{search_query} Developer"
            },
            {
                "name": f"InnovateInc {search_query}",
                "website": f"https://innovateinc{search_query.lower().replace(' ', '')}.com",
                "size": "Medium",
                "industry": "Software",
                "remote_policy": "Remote",
                "role": f"Senior {search_query} Engineer"
            },
            {
                "name": f"GlobalSystems {search_query}",
                "website": f"https://globalsystems{search_query.lower().replace(' ', '')}.com",
                "size": "Large",
                "industry": "Enterprise",
                "remote_policy": "On-site",
                "role": f"Lead {search_query} Specialist"
            },
            {
                "name": f"FutureLabs {search_query}",
                "website": f"https://futurelabs{search_query.lower().replace(' ', '')}.com",
                "size": "Small",
                "industry": "Startups",
                "remote_policy": "Fully Remote",
                "role": f"Principal {search_query} Architect"
            },
            {
                "name": f"DigitalSolutions {search_query}",
                "website": f"https://digitalsolutions{search_query.lower().replace(' ', '')}.com",
                "size": "Medium",
                "industry": "IT Services",
                "remote_policy": "Hybrid",
                "role": f"Staff {search_query} Developer"
            }
        ]

        # Return only the first 5 results as an example (would be 20 in real implementation)
        return {'results': mock_companies[:5]}


# Add resource routes
api.add_resource(JobTrackerAPI, '/api/tracker', '/api/tracker/<string:sheet_name>')
api.add_resource(ApplicationTrackerAPI, '/api/tracker/application')
api.add_resource(DashboardAPI, '/api/tracker/dashboard')
api.add_resource(AuthAPI, '/api/auth/<string:action>')
api.add_resource(UserApplicationsAPI, '/api/applications')
api.add_resource(UserApplicationDetailAPI, '/api/applications/<int:application_id>')
api.add_resource(TargetCompaniesAPI, '/api/target-companies')
api.add_resource(TargetCompanyDetailAPI, '/api/target-companies/<int:company_id>')
api.add_resource(InterviewsAPI, '/api/interviews')
api.add_resource(AuditLogAPI, '/api/audit-log')
api.add_resource(CompanySearchAPI, '/api/search-companies')

# Only create tables if not using Alembic (to avoid conflicts during migration)
if not os.environ.get('ALEMBIC_RUNNING'):
    with app.app_context():
        # Create tables
        db.create_all()
        # Check if admin user exists, create if not
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', email='admin@example.com')
            admin.set_password('password')
            db.session.add(admin)
            db.session.commit()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    # Serve the React frontend or specific static assets
    if path != '' and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
