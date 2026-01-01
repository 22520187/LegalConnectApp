# Hướng dẫn cấu hình Google OAuth cho Mobile App

## Vấn đề: Lỗi 400: invalid_request

Lỗi này xảy ra khi redirect URI không khớp với cấu hình trong Google Cloud Console.

## Các bước cấu hình:

### 1. Truy cập Google Cloud Console
- Đi tới: https://console.cloud.google.com/
- Chọn project của bạn (hoặc tạo project mới)

### 2. Cấu hình OAuth Consent Screen
- Vào **APIs & Services** > **OAuth consent screen**
- Chọn **External** (hoặc Internal nếu dùng Google Workspace)
- Điền thông tin:
  - App name: LegalConnect
  - User support email: email của bạn
  - Developer contact: email của bạn
- Lưu và tiếp tục

### 3. Tạo OAuth 2.0 Client ID
- Vào **APIs & Services** > **Credentials**
- Click **Create Credentials** > **OAuth client ID**
- Chọn **Application type**: 
  - **iOS** (nếu build cho iOS)
  - **Android** (nếu build cho Android)
  - Hoặc tạo cả 2

### 4. Cấu hình cho Android:
- **Package name**: `com.legalconnect`
- **SHA-1 certificate fingerprint**: 
  - Lấy bằng lệnh: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
  - Hoặc từ Expo: `expo credentials:manager`

### 5. Cấu hình cho iOS:
- **Bundle ID**: `com.legalconnect`
- **App Store ID**: (nếu đã publish)

### 6. QUAN TRỌNG: Thêm Authorized redirect URIs
- Vào **APIs & Services** > **Credentials**
- Click vào OAuth 2.0 Client ID của bạn
- Trong phần **Authorized redirect URIs**, thêm:
  ```
  com.legalconnect://oauth2/callback
  ```
- Lưu lại

### 7. Kiểm tra Client ID
- Đảm bảo Client ID trong `application.properties` và `AuthController.java` khớp với Client ID trong Google Console

## Lưu ý:
- Redirect URI phải khớp CHÍNH XÁC (bao gồm cả scheme và path)
- Nếu dùng Expo, có thể cần cấu hình thêm trong `app.json`
- Đối với development, có thể cần thêm test users trong OAuth Consent Screen

## Debug:
1. Kiểm tra redirect URI trong Google Console có đúng: `com.legalconnect://oauth2/callback`
2. Kiểm tra Client ID trong code có khớp với Google Console
3. Kiểm tra OAuth Consent Screen đã được publish (hoặc thêm test users)
4. Xem log trong backend để kiểm tra OAuth URL được generate đúng

