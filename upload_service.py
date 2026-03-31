# TradeFlow - Secure Document Upload Portal
# Flask API Service for document uploads

import os
import io
import logging
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify
from flask_cors import CORS

import config
from google_drive_service import get_drive_service

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(config.LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = config.MAX_FILE_SIZE

# Enable CORS
CORS(app, origins=config.CORS_ORIGINS)

# Initialize Google Drive service
drive_service = None


def get_mime_type_extension(mime_type):
    """Get file extension from MIME type"""
    mime_to_ext = {
        'application/pdf': '.pdf',
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png'
    }
    return mime_to_ext.get(mime_type, '.pdf')


def validate_file(file):
    """Validate uploaded file"""
    errors = []
    
    # Check if file exists
    if not file or file.filename == '':
        errors.append("No file provided")
        return False, errors
    
    # Check MIME type
    if file.content_type not in config.ALLOWED_MIME_TYPES:
        errors.append(f"Invalid file type: {file.content_type}. Allowed types: PDF, JPG, PNG")
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > config.MAX_FILE_SIZE:
        max_size_mb = config.MAX_FILE_SIZE / (1024 * 1024)
        errors.append(f"File too large. Maximum size: {max_size_mb}MB")
    
    return len(errors) == 0, errors


def generate_filename(document_type, company_name, original_filename):
    """
    Generate a standardized filename
    Format: DocumentType_CompanyName_Timestamp.pdf
    """
    # Get document type abbreviation
    doc_type_abbr = config.DOCUMENT_TYPES.get(document_type, 'Document')
    
    # Sanitize company name
    safe_company = secure_filename(company_name)[:30]
    
    # Generate timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Get extension from original filename
    _, ext = os.path.splitext(original_filename)
    if not ext:
        ext = '.pdf'
    
    # Generate filename
    filename = f"{doc_type_abbr}_{safe_company}_{timestamp}{ext}"
    
    return filename


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'TradeFlow Document Upload Service',
        'timestamp': datetime.now().isoformat()
    }), 200


@app.route('/upload-document', methods=['POST'])
def upload_document():
    """
    Upload a document to Google Drive
    
    Expected form data:
    - file: The file to upload
    - document_type: Type of document (e.g., 'commercial-invoice')
    - document_name: Display name of document
    - company_name: Company name
    - user_email: User email address
    - contact_name: Contact person name (optional)
    
    Returns:
        JSON response with upload status and file information
    """
    try:
        logger.info("Received upload request")
        
        # Get form data
        if 'file' not in request.files:
            logger.warning("No file in request")
            return jsonify({
                'status': 'error',
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        document_type = request.form.get('document_type', '')
        document_name = request.form.get('document_name', '')
        company_name = request.form.get('company_name', '')
        user_email = request.form.get('user_email', '')
        contact_name = request.form.get('contact_name', '')
        
        # Validate required fields
        if not document_type:
            return jsonify({
                'status': 'error',
                'message': 'Document type is required'
            }), 400
        
        if not company_name:
            return jsonify({
                'status': 'error',
                'message': 'Company name is required'
            }), 400
        
        if not user_email:
            return jsonify({
                'status': 'error',
                'message': 'Email address is required'
            }), 400
        
        # Validate file
        is_valid, errors = validate_file(file)
        if not is_valid:
            logger.warning(f"File validation failed: {errors}")
            return jsonify({
                'status': 'error',
                'message': 'File validation failed',
                'errors': errors
            }), 400
        
        # Initialize drive service if not already done
        global drive_service
        if drive_service is None:
            drive_service = get_drive_service()
        
        # Get or create user folder
        logger.info(f"Getting/creating folder for {company_name} ({user_email})")
        folder_id = drive_service.get_or_create_user_folder(company_name, user_email)
        
        # Generate filename
        original_filename = secure_filename(file.filename)
        new_filename = generate_filename(document_type, company_name, original_filename)
        
        logger.info(f"Uploading file: {new_filename}")
        
        # Upload file to Google Drive
        file_stream = io.BytesIO(file.read())
        file_info = drive_service.upload_file(
            file_stream=file_stream,
            filename=new_filename,
            mime_type=file.content_type,
            folder_id=folder_id
        )
        
        logger.info(f"Upload successful: {file_info['id']}")
        
        # Return success response
        return jsonify({
            'status': 'success',
            'message': 'File uploaded successfully',
            'filename': new_filename,
            'file_id': file_info['id'],
            'web_view_link': file_info.get('webViewLink', ''),
            'document_type': document_type,
            'folder_id': folder_id,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except FileNotFoundError as e:
        logger.error(f"Configuration error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Server configuration error. Please contact support.'
        }), 500
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Upload failed: {str(e)}'
        }), 500


@app.route('/list-documents', methods=['GET'])
def list_documents():
    """
    List documents for a specific user/company
    
    Query parameters:
    - company_name: Company name
    - user_email: User email address
    
    Returns:
        JSON response with list of documents
    """
    try:
        company_name = request.args.get('company_name', '')
        user_email = request.args.get('user_email', '')
        
        if not company_name or not user_email:
            return jsonify({
                'status': 'error',
                'message': 'Company name and email are required'
            }), 400
        
        # Initialize drive service
        global drive_service
        if drive_service is None:
            drive_service = get_drive_service()
        
        # Get user folder
        folder_id = drive_service.get_or_create_user_folder(company_name, user_email)
        
        # List files in folder
        files = drive_service.list_files_in_folder(folder_id)
        
        return jsonify({
            'status': 'success',
            'documents': files,
            'folder_id': folder_id
        }), 200
        
    except Exception as e:
        logger.error(f"List documents error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/delete-document', methods=['POST'])
def delete_document():
    """
    Delete a document from Google Drive
    
    Expected JSON body:
    - file_id: ID of the file to delete
    
    Returns:
        JSON response with deletion status
    """
    try:
        data = request.get_json()
        file_id = data.get('file_id', '')
        
        if not file_id:
            return jsonify({
                'status': 'error',
                'message': 'File ID is required'
            }), 400
        
        # Initialize drive service
        global drive_service
        if drive_service is None:
            drive_service = get_drive_service()
        
        # Delete file
        drive_service.delete_file(file_id)
        
        return jsonify({
            'status': 'success',
            'message': 'File deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Delete error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    max_size_mb = config.MAX_FILE_SIZE / (1024 * 1024)
    return jsonify({
        'status': 'error',
        'message': f'File too large. Maximum size: {max_size_mb}MB'
    }), 413


@app.errorhandler(500)
def server_error(e):
    """Handle internal server error"""
    logger.error(f"Internal server error: {str(e)}")
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500


if __name__ == '__main__':
    logger.info(f"Starting TradeFlow Document Upload Service on {config.FLASK_HOST}:{config.FLASK_PORT}")
    
    # Initialize drive service on startup
    try:
        drive_service = get_drive_service()
        logger.info("Google Drive service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Google Drive service: {str(e)}")
        logger.warning("Server will start but uploads may fail until service account is configured")
    
    app.run(
        host=config.FLASK_HOST,
        port=config.FLASK_PORT,
        debug=config.FLASK_DEBUG
    )