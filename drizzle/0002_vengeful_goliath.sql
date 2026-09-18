CREATE TABLE `admin_password_resets` (
	`user_id` text PRIMARY KEY NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` integer NOT NULL
);
