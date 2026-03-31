# TradeFlow - Secure Document Upload Portal
# Google Drive Service for file uploads and folder management

import os
import logging
from datetime import datetime
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from googleapiclient.errors import HttpError

import config

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


class GoogleDriveService:
    """Service class for Google Drive operations"""
    
    def __init__(self):
        self.service = None
        self.main_folder_id = config.GOOGLE_DRIVE_MAIN_FOLDER_ID
        self.credentials = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Google Drive API using service account"""
        try:
            # Check if service account file exists
            if not os.path.exists(config.GOOGLE_SERVICE_ACCOUNT_FILE):
                logger.error(f"Service account file not found: {config.GOOGLE_SERVICE_ACCOUNT_FILE}")
                raise FileNotFoundError(f"Service account file not found: {config.GOOGLE_SERVICE_ACCOUNT_FILE}")
            
            # Load credentials from service account file
            self.credentials = service_account.Credentials.from_service_account_file(
                config.GOOGLE_SERVICE_ACCOUNT_FILE,
                scopes=config.SCOPES
            )
            
            # Build the Drive service
            self.service = build('drive', 'v3', credentials=self.credentials)
            logger.info("Successfully authenticated with Google Drive API")
            
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            raise
    
    def get_or_create_user_folder(self, company_name, user_email):
        """
        Get or create a folder for a specific user/company.
        Folder name format: TradeDocs_CompanyName_Email
        
        Args:
            company_name: Name of the company
            user_email: Email address of the user
            
        Returns:
            str: Folder ID
        """
        try:
            # Sanitize folder name
            safe_company = self._sanitize_filename(company_name)
            safe_email = user_email.replace('@', '_at_').replace('.', '_')
            folder_name = f"{config.FOLDER_NAME_PREFIX}_{safe_company}_{safe_email}"
            
            # Search for existing folder
            query = f"mimeType='application/vnd.google-apps.folder' and name='{folder_name}' and '{self.main_folder_id}' in parents and trashed=false"
            
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name)'
            ).execute()
            
            folders = results.get('files', [])
            
            if folders:
                # Return existing folder
                folder_id = folders[0]['id']
                logger.info(f"Found existing folder: {folder_name} (ID: {folder_id})")
                return folder_id
            
            # Create new folder
            folder_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [self.main_folder_id]
            }
            
            folder = self.service.files().create(
                body=folder_metadata,
                fields='id, name'
            ).execute()
            
            folder_id = folder['id']
            logger.info(f"Created new folder: {folder_name} (ID: {folder_id})")
            
            return folder_id
            
        except HttpError as e:
            logger.error(f"Google Drive API error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error creating folder: {str(e)}")
            raise
    
    def upload_file(self, file_stream, filename, mime_type, folder_id=None):
        """
        Upload a file to Google Drive
        
        Args:
            file_stream: File stream to upload
            filename: Name for the file in Google Drive
            mime_type: MIME type of the file
            folder_id: Optional folder ID to upload into
            
        Returns:
            dict: File information including ID and web view link
        """
        try:
            # Prepare file metadata
            file_metadata = {
                'name': filename,
            }
            
            # Add parent folder if specified
            if folder_id:
                file_metadata['parents'] = [folder_id]
            elif self.main_folder_id:
                file_metadata['parents'] = [self.main_folder_id]
            
            # Create media upload
            media = MediaIoBaseUpload(
                file_stream,
                mimetype=mime_type,
                resumable=True
            )
            
            # Upload file
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, webViewLink, mimeType, size'
            ).execute()
            
            logger.info(f"Successfully uploaded file: {filename} (ID: {file['id']})")
            
            return {
                'id': file['id'],
                'name': file['name'],
                'webViewLink': file.get('webViewLink', ''),
                'mimeType': file['mimeType'],
                'size': file.get('size', '0')
            }
            
        except HttpError as e:
            logger.error(f"Google Drive API error during upload: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            raise
    
    def delete_file(self, file_id):
        """
        Delete a file from Google Drive
        
        Args:
            file_id: ID of the file to delete
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            self.service.files().delete(fileId=file_id).execute()
            logger.info(f"Successfully deleted file: {file_id}")
            return True
            
        except HttpError as e:
            logger.error(f"Error deleting file: {str(e)}")
            raise
    
    def list_files_in_folder(self, folder_id=None):
        """
        List all files in a folder
        
        Args:
            folder_id: Folder ID to list files from
            
        Returns:
            list: List of file metadata
        """
        try:
            target_folder = folder_id or self.main_folder_id
            
            query = f"'{target_folder}' in parents and trashed=false"
            
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name, mimeType, size, createdTime, webViewLink)'
            ).execute()
            
            return results.get('files', [])
            
        except HttpError as e:
            logger.error(f"Error listing files: {str(e)}")
            raise
    
    def _sanitize_filename(self, name):
        """Sanitize a string for use in filename"""
        # Remove or replace invalid characters
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            name = name.replace(char, '_')
        
        # Limit length
        return name[:50] if len(name) > 50 else name


# Singleton instance
drive_service = None

def get_drive_service():
    """Get or create Google Drive service instance"""
    global drive_service
    if drive_service is None:
        drive_service = GoogleDriveService()
    return drive_service