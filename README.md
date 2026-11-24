# EATurkish — Frontend + Admin panel

## Ishga tushirish
1. Backend (`train`) 3000-portda ishlayotgan bo'lsin (`.env` da `FRONTEND_URL=http://localhost:3001`, agar bermasangiz default ham shu).
2. Bu papkada:
   ```bash
   npm install
   cp .env.example .env.local   # kerak bo'lsa API manzilini o'zgartiring
   npm run dev                  # http://localhost:3001
   ```
   Frontend **3001** portda ishlaydi (backend CORS shu portga ruxsat bergan).

## Sahifalar
- `/login`, `/register`
- `/profile` — har qanday kirgan foydalanuvchi (USER faqat shu yerga tushadi)
- `/admin` — ADMIN va EDITOR: dashboard, `/admin/menu`, `/admin/comments`
- `/admin/users` — faqat ADMIN

## Birinchi adminni tayinlash
Register har doim USER yaratadi. Bazada:
```sql
UPDATE "user" SET role = 'ADMIN' WHERE email = 'sizning@email.com';
```
