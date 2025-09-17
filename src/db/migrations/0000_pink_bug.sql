CREATE TABLE `collection_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_type` text NOT NULL,
	`status` text NOT NULL,
	`records_count` integer,
	`error_message` text,
	`execution_time` integer,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `system_stats_detail` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hour_timestamp` text NOT NULL,
	`request_count` integer NOT NULL,
	`data_date` text NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_system_detail_hour_date` ON `system_stats_detail` (`hour_timestamp`,`data_date`);--> statement-breakpoint
CREATE INDEX `idx_system_detail_date` ON `system_stats_detail` (`data_date`);--> statement-breakpoint
CREATE TABLE `system_stats_summary` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`today_total` integer NOT NULL,
	`yesterday_total` integer NOT NULL,
	`today_users` integer NOT NULL,
	`yesterday_users` integer NOT NULL,
	`data_date` text NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_system_summary_date` ON `system_stats_summary` (`data_date`);--> statement-breakpoint
CREATE TABLE `user_stats_detail` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text,
	`count_24hour` integer NOT NULL,
	`rank_24hour` integer NOT NULL,
	`data_date` text NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_user_date` ON `user_stats_detail` (`user_id`,`data_date`);--> statement-breakpoint
CREATE INDEX `idx_data_date` ON `user_stats_detail` (`data_date`);--> statement-breakpoint
CREATE TABLE `user_stats_summary` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`total_users_24hour` integer NOT NULL,
	`total_count_24hour` integer NOT NULL,
	`data_date` text NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_user_summary_date` ON `user_stats_summary` (`data_date`);--> statement-breakpoint
CREATE TABLE `vehicle_stats_detail` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`car_id` text NOT NULL,
	`current_users` integer NOT NULL,
	`max_users` integer NOT NULL,
	`count_24hour` integer NOT NULL,
	`is_active` integer NOT NULL,
	`car_type` text NOT NULL,
	`data_date` text DEFAULT '1970-01-01' NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_vehicle_detail_date` ON `vehicle_stats_detail` (`data_date`);--> statement-breakpoint
CREATE INDEX `idx_vehicle_detail_recorded` ON `vehicle_stats_detail` (`car_id`,`recorded_at`);--> statement-breakpoint
CREATE INDEX `idx_vehicle_detail_type` ON `vehicle_stats_detail` (`car_type`,`recorded_at`);--> statement-breakpoint
CREATE TABLE `vehicle_stats_summary` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`total_cars` integer NOT NULL,
	`active_cars` integer NOT NULL,
	`total_users` integer NOT NULL,
	`total_count_24hour` integer NOT NULL,
	`data_date` text NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_vehicle_summary_date` ON `vehicle_stats_summary` (`data_date`);