@echo off
echo Installing required packages for profile image functionality...
npm install react-native-image-picker@^7.1.2 react-native-image-crop-picker@^0.40.3
echo.
echo Packages installed successfully!
echo.
echo For Android, you may need to add permissions to android/app/src/main/AndroidManifest.xml:
echo ^<uses-permission android:name="android.permission.CAMERA" /^>
echo ^<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" /^>
echo ^<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" /^>
echo.
echo For iOS, you may need to add permissions to ios/taste/Info.plist:
echo ^<key^>NSCameraUsageDescription^</key^>
echo ^<string^>This app needs access to camera to take profile photos^</string^>
echo ^<key^>NSPhotoLibraryUsageDescription^</key^>
echo ^<string^>This app needs access to photo library to select profile photos^</string^>
echo.
pause