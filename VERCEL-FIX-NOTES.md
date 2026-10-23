# Vercel Fix — ADVISOR

تم إصلاح نقطة دخول Vercel في `api/cms.js`.

النسخة السابقة كانت تستخدم:

```js
export default { fetch: handler };
```

وهذا نمط Worker، بينما Vercel Functions في مجلد `api/` تستخدم Web Handler exports مثل `GET` و`POST`.

النسخة الحالية تصدّر نفس الـhandler لكل طرق HTTP المطلوبة، لذلك تظل كل مسارات المشروع (`/api/content`, `/api/admin/*`, `/media/*`, `/admin`) تمر عبر نفس منطق المصادقة وقاعدة البيانات.

## إعداد الإنتاج

في Vercel > Settings > Environment Variables أضيفي هذه القيم لبيئة **Production**:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_INITIAL_PASSWORD`
- `ADMIN_PASSWORD_PEPPER`
- `BLOB_READ_WRITE_TOKEN`

اختياري للبريد:

- `RESEND_API_KEY`
- `RESEND_FROM`

بعد إضافة القيم اعملي **Redeploy**.

لا تضعي أي token أو password داخل GitHub أو هذا الملف.
