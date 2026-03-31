# TradeFlow Document Upload Portal - Backend Setup

## Overview

This Python backend provides secure document upload functionality to Google Drive for the TradeFlow Secure Trade Documentation Portal.

## Features

- **Flask API** with CORS support
- **Google Drive API** integration with service account authentication
- **Dynamic folder creation** per user/company
- **File validation** (MIME types, size limits)
- **Secure file naming** with timestamps
- **Comprehensive logging**

## Google Drive Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "TradeFlow Document Portal")
3. Enable billing for the project

### Step 2: Enable Google Drive API

1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Drive API"
3. Click **Enable**

### Step 3: Create a Service Account

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Enter a name (e.g., "tradeflow-upload-service")
4. Click **Create and Continue**
5. Grant role: **Editor** (or create a custom role with Drive permissions)
6. Click **Done**

### Step 4: Create Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key > Create New Key**
4. Select **JSON** format
5. Click **Create**
6. The JSON key file will download automatically - **keep this secure!**

### Step 5: Create Main Folder in Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder named "GlobalTradeDocuments"
3. Right-click the folder > **Share**
4. Add the service account email (found in the JSON key file under `client_email`)
5. Set permission to **Editor**
6. Copy the folder ID from the URL (the string after `/folders/`)

### Step 6: Configure Backend

1. Rename the downloaded JSON key file to `service-account.json`
2. Place it in the `backend/` directory
3. Set environment variables (or edit `config.py`):

```bash
# Linux/Mac
export GOOGLE_SERVICE_ACCOUNT_FILE="/path/to/service-account.json"
export GOOGLE_DRIVE_MAIN_FOLDER_ID="your-folder-id-here"

# Windows
set GOOGLE_SERVICE_ACCOUNT_FILE=C:\path\to\service-account.json
set GOOGLE_DRIVE_MAIN_FOLDER_ID=your-folder-id-here
```

## Installation

### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Running the Server

### Development Mode

```bash
python upload_service.py
```

The server will start on `http://localhost:5000`

### Production Mode

```bash
export FLASK_DEBUG=False
export FLASK_HOST=0.0.0.0
export FLASK_PORT=5000
python upload_service.py
```

## API Endpoints

### Health Check
```
GET /health
```

### Upload Document
```
POST /upload-document
Content-Type: multipart/form-data

Parameters:
- file: The file to upload (PDF, JPG, PNG, max 10MB)
- document_type: Type of document (e.g., 'commercial-invoice')
- document_name: Display name of document
- company_name: Company name (required)
- user_email: User email address (required)
- contact_name: Contact person name (optional)

Response:
{
    "status": "success",
    "message": "File uploaded successfully",
    "filename": "CommercialInvoice_ABC_20250101_120000.pdf",
    "file_id": "1a2b3c4d...",
    "web_view_link": "https://drive.google.com/file/d/...",
    "folder_id": "5e6f7g8h...",
    "timestamp": "2025-01-01T12:00:00"
}
```

### List Documents
```
GET /list-documents?company_name=ABC&user_email=user@example.com
```

### Delete Document
```
POST /delete-document
Content-Type: application/json

{
    "file_id": "1a2b3c4d..."
}
```

## Google Drive Folder Structure

```
GlobalTradeDocuments (Main Folder)
│
├── TradeDocs_ABCImports_john_at_email_com
│   ├── CommercialInvoice_ABCImports_20250101_120000.pdf
│   ├── PackingList_ABCImports_20250101_120005.pdf
│   └── BillOfLading_ABCImports_20250101_120010.pdf
│
├── TradeDocs_XYZExports_maria_at_email_com
│   ├── CertificateOfOrigin_XYZExports_20250101_130000.pdf
│   └── CustomsDeclaration_XYZExports_20250101_130005.pdf
```

## Security Considerations

1. **Never commit `service-account.json`** to version control
2. **Use environment variables** for sensitive configuration
3. **Restrict service account permissions** to only necessary Drive operations
4. **Validate all file uploads** (type, size, content)
5. **Use HTTPS** in production
6. **Implement rate limiting** for production use
7. **Log all upload activities** for audit purposes

## Troubleshooting

### "Service account file not found"
- Ensure `service-account.json` is in the `backend/` directory
- Check the `GOOGLE_SERVICE_ACCOUNT_FILE` environment variable

### "Permission denied" errors
- Verify the service account email has been added to the Drive folder
- Ensure the folder ID is correct
- Check that the Drive API is enabled

### CORS errors in browser
- Add your frontend domain to `CORS_ORIGINS` in `config.py`
- Ensure the Flask server is running and accessible

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_SERVICE_ACCOUNT_FILE` | Path to service account JSON | `backend/service-account.json` |
| `GOOGLE_DRIVE_MAIN_FOLDER_ID` | Main Google Drive folder ID | (empty) |
| `FLASK_HOST` | Flask server host | `0.0.0.0` |
| `FLASK_PORT` | Flask server port | `5000` |
| `FLASK_DEBUG` | Debug mode | `False` |
| `LOG_LEVEL` | Logging level | `INFO` |

## Support

For issues or questions, contact:
- Email: support@tradeflow.com
- Documentation: https://docs.tradeflow.com