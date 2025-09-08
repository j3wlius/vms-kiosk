# SSL Certificate Setup for Kiosk App

This document explains how to set up local HTTPS certificates for the kiosk app development.

## Prerequisites

- Windows PowerShell
- Internet connection for downloading mkcert

## Setup Steps

### 1. Download and Install mkcert

```powershell
# Download mkcert
Invoke-WebRequest -Uri "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe" -OutFile "mkcert.exe"

# Install the local CA
.\mkcert.exe -install
```

### 2. Generate Certificates

```powershell
# Create certificates for localhost
.\mkcert.exe localhost 127.0.0.1 ::1
```

This creates:
- `localhost+2.pem` - Certificate file
- `localhost+2-key.pem` - Private key file

### 3. Configure Vite

The `vite.config.js` has been updated to use these certificates:

```javascript
server: {
  https: {
    key: fs.readFileSync('./localhost+2-key.pem'),
    cert: fs.readFileSync('./localhost+2.pem'),
  },
  host: true,
  port: 5173,
},
```

### 4. Start Development Server

```powershell
pnpm dev
```

The app will now be available at:
- **HTTPS**: https://localhost:5173
- **HTTP**: http://localhost:5173 (fallback)

## Important Notes

- The certificates are valid for `localhost`, `127.0.0.1`, and `::1`
- Certificates expire on December 6, 2027
- Certificate files are excluded from git via `.gitignore`
- The local CA is installed in the system trust store

## Troubleshooting

### Certificate Not Trusted
If you see certificate warnings:
1. Ensure mkcert CA is installed: `.\mkcert.exe -install`
2. Restart your browser
3. Clear browser cache

### Camera Not Working
- Ensure you're accessing via HTTPS (https://localhost:5173)
- Check browser permissions for camera access
- Some browsers require HTTPS for camera access

### Port Already in Use
If port 5173 is busy:
1. Change the port in `vite.config.js`
2. Update the certificate domains if needed
3. Restart the development server

## Security Note

These certificates are for development only. Do not use them in production environments.

