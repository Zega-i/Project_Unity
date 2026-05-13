# 🔧 Frontend Profile Data Fix Guide

## ❌ Problem Identified

Backend sudah **WORKING PERFECTLY** ✅
- Data tersimpan ke database dengan benar
- Data di-retrieve dari database dengan benar

**Masalahnya di FRONTEND** (React Native/React):
1. Register form tidak mengirim semua field ke backend
2. Profile screen tidak menampilkan data dari API response
3. Data tidak disimpan ke local state/AsyncStorage

---

## ✅ Backend Test Result

Test dengan data lengkap:
```
Register input: name, grade, className, school, dateOfBirth, address, parentName, parentPhone
Register response: ✅ Semua field ada
Get profile response: ✅ Semua field ada
Database: ✅ Semua data tersimpan
```

Contoh response:
```json
{
  "user": {
    "id": "cmp4k7hy70003kh9gcy607o22",
    "email": "student@example.com",
    "name": "Ahmad Wijaya",
    "school": "SMP Negeri 5 Jakarta",
    "className": "9B",
    "grade": 9,
    "dateOfBirth": "2010-05-15T00:00:00.000Z"
  }
}
```

---

## 🔨 Frontend Fixes Needed

### 1. **Register Screen** - Kirim semua field

Pastikan form mengirim ini ke `/api/auth/register`:

```javascript
const registerData = {
  email: email,
  password: password,
  name: name,
  role: "STUDENT",
  grade: parseInt(grade),           // ← Yang sering lupa
  className: className,              // ← Yang sering lupa
  school: school,                    // ← Yang sering lupa
  dateOfBirth: dateOfBirth,         // ← Yang sering lupa
  nisn: nisn,
  address: address,
  parentName: parentName,
  parentPhone: parentPhone
};
```

### 2. **Save Response Data** - Simpan ke AsyncStorage

Setelah berhasil register/login:

```javascript
const response = await fetch('/api/auth/register', {...});
const data = await response.json();

// Save ke AsyncStorage
await AsyncStorage.setItem('userToken', data.data.token);
await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));

// Save ke Redux/Context
dispatch(setUser(data.data.user));
```

### 3. **Profile Screen** - Tampilkan data dari state

```javascript
// Get dari AsyncStorage atau Redux
const user = await AsyncStorage.getItem('userData');
const userData = JSON.parse(user);

// Atau dari Redux:
const userData = useSelector(state => state.auth.user);

// Display
<Text>{userData.school}</Text>        // SMP Negeri 5 Jakarta
<Text>{userData.className}</Text>     // 9B
<Text>{userData.grade}</Text>         // 9
<Text>{userData.dateOfBirth}</Text>   // 2010-05-15
```

### 4. **Refresh Profile** - Call GET /api/auth/me

Setiap kali screen di-mount:

```javascript
useEffect(() => {
  async function fetchProfile() {
    const token = await AsyncStorage.getItem('userToken');
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    // Update state
    setUser(data.data.user);
    await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));
  }
  
  fetchProfile();
}, []);
```

---

## 📋 Checklist - Frontend Changes

Frontend perlu pastikan:

- [ ] Register form capture semua field (grade, className, school, dateOfBirth, etc)
- [ ] Register form kirim semua field ke backend
- [ ] After register, save response.data.user ke AsyncStorage/Redux
- [ ] Profile screen read data dari AsyncStorage/Redux, bukan hardcoded "User"
- [ ] Profile screen call GET /api/auth/me on mount untuk refresh
- [ ] Edit profile feature (jika ada) harus update backend dan local storage

---

## 🧪 Testing Checklist

✅ Backend:
- [x] Register dengan data lengkap → Database ✅
- [x] Login → Return data lengkap ✅
- [x] GET /api/auth/me → Return data lengkap ✅

❌ Frontend (perlu di-fix):
- [ ] Register form send semua field
- [ ] Login save data ke local storage
- [ ] Profile display data dari storage
- [ ] Data appear di home screen

---

## 📞 Endpoints Reference

**Register:**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "name": "Ahmad Wijaya",
  "role": "STUDENT",
  "grade": 9,
  "className": "9B",
  "school": "SMP Negeri 5 Jakarta",
  "dateOfBirth": "2010-05-15",
  "nisn": "0012345678",
  "address": "Jl. Merdeka No. 123",
  "parentName": "Budi Wijaya",
  "parentPhone": "081234567890"
}
```

**Get Profile:**
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "name": "...",
      "school": "...",
      "className": "...",
      "grade": 9,
      "dateOfBirth": "2010-05-15T00:00:00.000Z"
    }
  }
}
```

---

## Summary

**Backend:** ✅ WORKING - Semua data disimpan dan di-retrieve dengan benar

**Frontend:** ❌ BROKEN - Tidak mengirim/menampilkan data

**Fix:** Update register screen dan profile screen sesuai checklist di atas.

