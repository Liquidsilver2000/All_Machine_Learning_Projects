# TradeFlow - Secure Document Upload Portal
# Configuration Settings

import os
from pathlib import Path

# Base Directory
BASE_DIR = Path(__file__).parent.absolute()

# Google Drive Configuration
# NOTE: These should be set as environment variables in production
GOOGLE_SERVICE_ACCOUNT_FILE = os.environ.get(
    'GOOGLE_SERVICE_ACCOUNT_FILE',
    str(BASE_DIR / 'service-account.json')
)

# Main folder ID where all trade documents will be stored
# This folder should be shared with the service account email
GOOGLE_DRIVE_MAIN_FOLDER_ID = os.environ.get(
    'GOOGLE_DRIVE_MAIN_FOLDER_ID',
    ''  # Replace with your main folder ID
)

# Folder naming convention
FOLDER_NAME_PREFIX = 'TradeDocs'

# Upload Configuration
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg'
]

ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']

# Flask Configuration
FLASK_HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
FLASK_PORT = int(os.environ.get('FLASK_PORT', 5000))
FLASK_DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

# CORS Configuration
CORS_ORIGINS = [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:3000',
    'https://*.ok.kimi.link',  # Allow Kimi deployment domains
]

# Logging Configuration
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
LOG_FILE = str(BASE_DIR / 'uploads.log')

# Document Types Mapping
DOCUMENT_TYPES = {
    'commercial-invoice': 'CommercialInvoice',
    'packing-list': 'PackingList',
    'bill-of-lading': 'BillOfLading',
    'certificate-of-origin': 'CertificateOfOrigin',
    'import-export-license': 'ImportExportLicense',
    'customs-declaration': 'CustomsDeclaration',
    'insurance-certificate': 'InsuranceCertificate',
    'inspection-certificate': 'InspectionCertificate',
    'letter-of-credit': 'LetterOfCredit',
    'proforma-invoice': 'ProformaInvoice'
}

# Scopes for Google Drive API
SCOPES = ['https://www.googleapis.com/auth/drive']