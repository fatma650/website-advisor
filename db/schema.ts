// مخطط البيانات فقط. أي تغيير لاحق يولّد migration جديدة دون تعديل سجل مطبّق.
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
export const contentItems = sqliteTable('content_items', {
  kind: text('kind').notNull(), id: text('id').notNull(), payload: text('payload').notNull(),
  version: integer('version').notNull().default(1), sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(), deletedAt: integer('deleted_at')
}, table => [primaryKey({columns: [table.kind, table.id]})]);
export const cmsMeta = sqliteTable('cms_meta', {key: text('key').primaryKey(), value: text('value').notNull()});
// نربط حساب المالك بالمعرف الموثوق الخاص بهذا الموقع مرة واحدة، وليس بكلمة مرور في الواجهة.
export const cmsAdmins = sqliteTable('cms_admins', {role: text('role').primaryKey(), userId: text('user_id').notNull().unique(), createdAt: text('created_at').notNull()});
export const mediaFiles = sqliteTable('media_files', {
  key: text('key').primaryKey(), filename: text('filename').notNull(), mime: text('mime').notNull(),
  size: integer('size').notNull(), uploadedBy: text('uploaded_by').notNull(), createdAt: text('created_at').notNull(), deletedAt: integer('deleted_at')
});

// بوابة كلمة المرور إضافية إلى هوية المالك؛ لا تُخزّن كلمة المرور نفسها.
export const adminPasswords = sqliteTable('admin_passwords', {
  userId: text('user_id').primaryKey(), hash: text('password_hash').notNull(), salt: text('salt').notNull(), createdAt: text('created_at').notNull()
});
export const adminSessions = sqliteTable('admin_sessions', {
  tokenHash: text('token_hash').primaryKey(), userId: text('user_id').notNull(), expiresAt: integer('expires_at').notNull()
});
export const adminLoginAttempts = sqliteTable('admin_login_attempts', {
  userId: text('user_id').primaryKey(), startedAt: integer('started_at').notNull(), attempts: integer('attempts').notNull()
});
export const adminPasswordResets = sqliteTable('admin_password_resets', {
  userId: text('user_id').primaryKey(), codeHash: text('code_hash').notNull(), expiresAt: integer('expires_at').notNull()
});
