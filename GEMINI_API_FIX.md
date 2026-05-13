# 🔧 Gemini API Key Issue & Fix Guide

## ❌ Problem Found

Testing hasil menunjukkan API key di `.env` **tidak valid** atau **expired**:
- Semua model tidak dapat diakses (404, UNAUTHENTICATED, dll)
- Kemungkinan penyebab:
  1. API key sudah expired
  2. API key tidak punya billing enabled
  3. API key tidak valid

---

## ✅ Solution: Get New API Key

### Step 1: Go to Google AI Studio

1. **Buka browser** dan go to: https://aistudio.google.com/app/apikey
2. **Login** dengan Google account Anda
3. Jika belum, click "Create API Key"

### Step 2: Create or Copy API Key

- Jika sudah ada key, **copy-nya**
- Jika belum, click **"Create API Key in new project"**
- Copy the generated key

### Step 3: Update .env File

File: `D:\EduBridge\backend\.env`

```env
GEMINI_API_KEY=<paste-your-new-key-here>
```

**Before:**
```
GEMINI_API_KEY=AIzaSyC5PxksTGXRtlU-VUExS-dpiZF7IDM6vPk
```

**After (with YOUR key):**
```
GEMINI_API_KEY=AIzaSy[your-actual-key-here]
```

### Step 4: Verify Key Works

```bash
cd D:\EduBridge\backend
node test-gemini-api.js
```

Expected output: **✅ Gemini API Key is VALID and working correctly!**

---

## 📋 Model Configuration

After getting valid API key, you may also need to update the model name if testing shows different available models.

### Current Configuration:
**File:** `backend/src/services/GeminiService.ts` (Line 22)

```typescript
private static model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

### Available Models (depending on your API key):
- `gemini-pro` - Older but stable
- `gemini-1.5-pro` - Newer, better quality
- `gemini-2.0-flash` - Latest, might not work with all keys

### How to Find Your Available Models:
1. Run `node test-models.js` after updating API key
2. It will show which models work
3. Update line 22 in GeminiService.ts with the working model

---

## 🔍 Troubleshooting

### If you see: "models/X is not found"
- The API key is valid but the model name is wrong
- Update GeminiService.ts with correct model name from test results

### If you see: "UNAUTHENTICATED" or "401 Unauthorized"
- API key is invalid
- Get a new one from https://aistudio.google.com/app/apikey
- Make sure you're logged in with the right Google account

### If you see: "429 Too Many Requests"
- Rate limit exceeded
- Wait a few seconds and try again
- Consider implementing rate limiting in your code

### If you see: "500 Server Error"
- Gemini API server issue
- Wait and try again later

---

## 🚀 After Fixing

Once you have a valid API key:

1. **Update .env** with new key
2. **Test it:**
   ```bash
   npm run build
   npm run dev
   ```
3. **Test endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/ai/tutor \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message":"Apa itu fotosintesis?"}'
   ```

---

## 📝 Quick Checklist

- [ ] Visit https://aistudio.google.com/app/apikey
- [ ] Copy/create a new API key
- [ ] Update `GEMINI_API_KEY` in `.env`
- [ ] Run `node test-gemini-api.js` to verify
- [ ] Run `npm run build` to rebuild
- [ ] Run `npm run dev` to start server
- [ ] Test `/api/ai/tutor` endpoint

---

## 🎯 Expected Working State

After fixing, you should see:
```
✅ Gemini API Key is VALID and working correctly!
Response preview: [AI response will appear here]
```

And the `/api/ai/tutor` endpoint will work with responses from Gemini.

---

**Need help?**
- Check Google AI Studio: https://aistudio.google.com
- Google Gemini Docs: https://ai.google.dev
- Ensure billing is enabled on your Google Cloud project
