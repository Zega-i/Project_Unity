# Analisis Komprehensif Perbaikan EduBridge

## Ringkasan Perbaikan yang Diminta

### 1. AI Tutor Search Bar - Text Wrapping
**Masalah**: Ketika mengetik soal panjang di search bar, teks akan shift ke kanan dan terpotong.
**Solusi**: Implementasi text wrapping ke bawah.
**File yang diubah**: `AITutorScreen.tsx`
**Database**: Tidak perlu perubahan
**Dependencies**: Tidak ada

---

### 2. Dashboard - Pembatasan Rekomendasi
**Masalah**: Halaman beranda bisa di-scroll karena terlalu banyak rekomendasi.
**Solusi**: Tampilkan hanya 3 materi penting berdasarkan AI analysis, simpan sisanya ke "Lihat Semua"
**File yang diubah**: `DashboardScreen.tsx`
**Database**: 
- Perlu endpoint untuk mendapatkan TOP 3 rekomendasi dari AI analysis
- Status materialisasi: Sudah ada `LearningPath` dan rekomendasi berbasis AI

**Dependencies**: 
- Terhubung ke fitur #3 (Lihat Semua menu)
- Perlu AI analysis untuk prioritas materi

---

### 3. Menu "Lihat Semua" untuk Rekomendasi
**Masalah**: Menu "Lihat Semua" belum berfungsi.
**Solusi**: Buat screen baru untuk menampilkan semua rekomendasi berdasarkan AI analysis.
**File yang dibuat**: 
- `screens/student/RecommendationsScreen.tsx` (BARU)
- Route di `navigation/AppNavigator.tsx`

**Database**: 
- Gunakan `LearningPath` untuk mendapatkan prioritas
- Urutkan berdasarkan importance score (perlu ditambahkan field jika belum ada)

**Dependencies**: 
- Terhubung ke fitur #2 (Dashboard)
- Perlu informasi prioritas dari backend

---

### 4. Progress Screen - Scroll Diizinkan
**Status**: Sudah bisa di-scroll (sudah benar saat ini)
**Verifikasi**: Cek `ProgressScreen.tsx`
**Database**: Tidak perlu perubahan
**Dependencies**: Tidak ada

---

### 5. Notifikasi Pembelajaran (Conditional)
**Masalah**: Notifikasi belum fungsional.
**Fungsi**:
- Trigger ketika: guru update materi, quiz belum dikerjakan, materi belum dipelajari
- Jika enabled: tampil di notifikasi push HP & di app
- Jika disabled: tidak ada notifikasi apapun
- Buka notifikasi dari dashboard → lihat semua notifikasi (scrollable)

**File yang diubah**:
- `SettingsScreen.tsx` - Toggle notifikasi pembelajaran
- `DashboardScreen.tsx` - Tombol notifikasi di header
- `screens/student/NotificationsScreen.tsx` (BARU)
- Backend routes: perlu endpoint untuk fetch notifications

**Database**:
- `StudentNotification` SUDAH ADA dengan tipe: ACHIEVEMENT, QUIZ_RESULT, NEW_MATERIAL, RISK_ALERT, SYSTEM
- Perlu tambahan: tracking apakah notifikasi sudah dikirim atau tidak

**Backend Logic Needed**:
- Service untuk trigger notifikasi ketika:
  - Teacher upload materi (event listener di uploadthing)
  - Student belum mengerjakan quiz (cron job atau real-time check)
  - Student belum belajar materi (berdasarkan MaterialView tracking)

**Dependencies**:
- Terhubung ke Settings (toggle)
- Terhubung ke Dashboard (notification button)
- Terhubung ke Backend (notification creation logic)

---

### 6. Suara & Haptic (Haptic Only)
**Masalah**: Belum fungsional.
**Fungsi**:
- Jika enabled: getaran saat klik menu atau saat mengetik
- Jika disabled: tidak ada getaran

**File yang diubah**:
- `SettingsScreen.tsx` - Toggle haptic
- Global context atau store untuk manage haptic state
- Semua interactive components: tambahkan haptic feedback

**Database**: 
- Perlu simpan preferensi di User profile
- Field baru: `hapticEnabled` (boolean) di Student model

**Implementation**:
- Gunakan `react-native-haptic-feedback` atau built-in Haptics
- Apply ke: button clicks, text input, menu navigation

**Dependencies**:
- Terhubung ke Settings (toggle)
- Global state management untuk preference

---

### 7. Dark Mode
**Status**: Toggle sudah ada di Settings
**Fungsi**: Implementasi tema gelap yang konsisten di semua screen

**File yang diubah**:
- `SettingsScreen.tsx` - Toggle sudah ada, perlu logic
- `utils/theme.ts` - Buat theme provider/context
- Semua screen files - Implementasi conditional styling
- `App.tsx` atau root navigation - Bungkus dengan theme provider

**Database**:
- Field baru: `darkModeEnabled` (boolean) di Student model
- Implementasi di AuthStore untuk persistent storage

**Design System**:
```
Light Mode:
- Background: #FFFFFF
- Text: #1E293B
- Secondary: #64748B

Dark Mode:
- Background: #0F172A (atau #1A202C)
- Text: #F1F5F9 (atau #E2E8F0)
- Secondary: #94A3B8
- Accent: #7C3AED (consistent)
```

**Dependencies**:
- Global preference storage
- Theme context API
- Perlu update semua color values di semua screens

---

### 8. Ganti Password
**Masalah**: Menu ada tapi belum fungsional.
**Solusi**: Buat screen baru untuk change password.

**File yang diubah/dibuat**:
- `screens/student/ChangePasswordScreen.tsx` (BARU)
- `SettingsScreen.tsx` - Navigation ke change password screen
- Backend route: POST `/auth/change-password`

**Backend Logic**:
```
1. Verify old password
2. Validate new password strength
3. Update password dengan hash baru
4. Invalidate semua existing sessions (optional)
```

**Database**: Tidak perlu field baru (password sudah ada)

**Security**:
- Validasi password strength (min 8 char, mixed case, number, symbol)
- Rate limiting untuk prevent brute force
- Clear confirmation dialog

**Dependencies**:
- Terhubung ke Settings
- Perlu backend endpoint

---

### 9. Privasi & Data
**Masalah**: Menu ada tapi belum fungsional.
**Solusi**: Buat screen untuk info privasi/data user.

**File yang diubah/dibuat**:
- `screens/student/PrivacyDataScreen.tsx` (BARU)
- `SettingsScreen.tsx` - Navigation ke privacy screen

**Isi Screen**:
- Penjelasan penggunaan data user
- Kebijakan privasi
- Hak-hak user
- Contact untuk data privacy concerns
- Opsi: download data, delete account (future)

**Database**: Tidak perlu perubahan

**Dependencies**:
- Terhubung ke Settings
- Informational page only

---

### 10. Ubah Foto Profil
**Masalah**: Profil picture belum bisa diubah.
**Solusi**: Implementasi image picker dengan upload.

**File yang diubah**:
- `ProfileScreen.tsx` - Avatar dengan + button popup
- `screens/student/EditProfilePictureScreen.tsx` atau Modal (BARU)
- Backend route: POST `/profile/avatar` (upload)

**Frontend Implementation**:
1. Tap avatar → buka modal popup (centered)
2. Modal punya + button di bottom-right corner
3. + button → buka image picker (local storage)
4. Upload ke backend via UploadThing (sudah ada)
5. Update avatar URL di user profile

**Database**:
- Field baru: `avatar` (URL string) di Student model
- Sudah ada field `avatar` di ProfileScreen line 78, perlu dipastikan di schema

**Backend**:
- POST endpoint untuk upload avatar
- Gunakan uploadthing yang sudah dikonfigurasi
- Return URL untuk disimpan

**Dependencies**:
- Terhubung ke ProfileScreen
- Perlu backend upload endpoint
- Perlu react-native-image-picker atau expo-image-picker

---

## Database Schema Changes Required

### Additions to Student Model:
```prisma
model Student {
  // Existing fields...
  
  // NEW FIELDS:
  avatar           String?              // Profile picture URL
  darkModeEnabled  Boolean   @default(false)
  hapticEnabled    Boolean   @default(true)
  notificationsEnabled Boolean   @default(true)
  passwordUpdatedAt DateTime?           // Track password changes
}
```

### New/Modified Notifications Logic:
```prisma
// Existing StudentNotification model:
model StudentNotification {
  // Sudah ada, perlu tambahan logic di backend
  // untuk auto-create saat: new material, quiz pending, material unviewed
}
```

### Potential New Model (Optional):
```prisma
model LearningPathPriority {
  id        String @id @default(cuid())
  materialId String
  studentId String
  priority  Int     // 1 = highest, etc
  reason    String? // why prioritized
  
  @@unique([studentId, materialId])
}
```

---

## Feature Dependencies & Sync Issues

### Dependency Graph:
```
Dashboard (#2)
  ↓
  ├─ Recommendations Screen (#3)
  └─ Notification Button → Notifications Screen (#5)

Settings (#7, #8, #9)
  ├─ Dark Mode (#7) - requires theme context
  ├─ Haptic (#6) - requires haptic context
  ├─ Change Password (#8) - requires backend endpoint
  └─ Privacy (#9) - just informational

Profile Screen (#10)
  └─ Upload Avatar - requires backend endpoint

AI Tutor (#1)
  └─ Text wrapping - isolated, no dependencies
```

### Sync Issues to Handle:
1. **Avatar Sync**: Profile picture harus tersimpan di database & AuthStore
   - Update di ProfileScreen → sync ke DashboardScreen
   - Gunakan AuthStore untuk cached avatar

2. **Dark Mode Sync**: Preferensi harus tersimpan dan applied global
   - Save di Student.darkModeEnabled
   - Create ThemeContext untuk broadcast changes
   - Apply ke semua screens

3. **Haptic Sync**: Preferensi harus tersimpan
   - Save di Student.hapticEnabled
   - Create HapticContext untuk centralized management
   - Applied saat: button clicks, inputs, navigation

4. **Notification Sync**: 
   - StudentNotification records created di backend
   - Pull saat app launch & periodic refresh
   - Mark as read saat dibuka

5. **Settings Sync**:
   - Semua toggle di Settings harus immediately update backend
   - Store preferences di Student model
   - Sync dengan AuthStore untuk offline access

---

## Implementation Priority

### Phase 1 (Database + Backend):
1. Add fields ke Student model (avatar, darkModeEnabled, hapticEnabled, notificationsEnabled)
2. Run migration
3. Create backend endpoints:
   - POST `/profile/avatar` (upload)
   - POST `/auth/change-password`
   - GET `/notifications` (list)
   - PUT `/settings/preferences` (update)

### Phase 2 (Core Screens):
4. AI Tutor text wrapping (#1)
5. Dashboard rekomendasi 3 item (#2)
6. Dark mode implementation (#7)
7. Haptic feedback (#6)

### Phase 3 (New Screens):
8. RecommendationsScreen (#3)
9. NotificationsScreen (#5)
10. ChangePasswordScreen (#8)
11. PrivacyDataScreen (#9)
12. ProfileScreen updates (#10)

---

## Notes for Implementation

1. **Theme Context**: Buat `contexts/ThemeContext.tsx` dengan:
   - isDarkMode state
   - color palette dinamis
   - Provider untuk wrap entire app

2. **Haptic Context**: Buat `contexts/HapticContext.tsx` dengan:
   - isHapticEnabled state
   - triggerHaptic() function
   - Hook: useHaptic()

3. **Notification Service**: Backend service untuk:
   - Auto-create notifications based on events
   - Poll/fetch di app launch
   - Handle read status

4. **Settings Sync**: Setiap toggle di Settings harus:
   - Update local state
   - Call API endpoint untuk persist
   - Update AuthStore cache

5. **Image Picker**: Use `expo-image-picker` untuk:
   - Pick dari camera roll
   - Compress image
   - Upload via uploadthing

---

## Testing Checklist

- [ ] AI Tutor: Long text wraps properly
- [ ] Dashboard: Shows only 3 recommendations
- [ ] See All: Lists all recommendations correctly
- [ ] Notifications: Triggers at right events, respects toggle
- [ ] Dark Mode: Applies to all screens, persists
- [ ] Haptic: Vibrates on interactions (if enabled)
- [ ] Password: Change password with validation
- [ ] Avatar: Upload & display correctly
- [ ] Settings: All toggles sync with backend
- [ ] Scroll: Dashboard doesn't scroll, Progress does
