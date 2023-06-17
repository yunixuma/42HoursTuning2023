CREATE DATABASE IF NOT EXISTS app;

CREATE TABLE `user` (
    `user_id` VARCHAR(36) NOT NULL,
    `employee_id` VARCHAR(50) NOT NULL,
    `user_name` VARCHAR(50) NOT NULL,
    `kana` VARCHAR(50) NOT NULL,
    `mail` VARCHAR(200) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `entry_date` DATE NOT NULL,
    `office_id` VARCHAR(36) NOT NULL,
    `user_icon_id` VARCHAR(36) NOT NULL,
    `goal` VARCHAR(1024) NOT NULL,
    PRIMARY KEY (`user_id`)
);

CREATE TABLE `session` (
    `session_id` VARCHAR(36) NOT NULL,
    `linked_user_id` VARCHAR(36) NOT NULL,
    `created_at` DATE NOT NULL,
    PRIMARY KEY (`session_id`)
);

CREATE TABLE `department` (
    `department_id` VARCHAR(36) NOT NULL,
    `department_name` VARCHAR(50) NOT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT '1',
    PRIMARY KEY (`department_id`)
);

CREATE TABLE `role` (
    `role_id` VARCHAR(36) NOT NULL,
    `role_name` VARCHAR(50) NOT NULL,
    `active` TINYINT(1) NOT NULL DEFAULT '1',
    PRIMARY KEY (`role_id`)
);

CREATE TABLE `department_role_member` (
    `department_id` VARCHAR(36) NOT NULL,
    `role_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `entry_date` DATE NOT NULL,
    `belong` TINYINT(1) NOT NULL DEFAULT '1',
    PRIMARY KEY (`user_id`, `department_id`, `role_id`, `entry_date`)
);

--alter table department_role_member add index user_id_idx(user_id);

CREATE TABLE `office` (
    `office_id` VARCHAR(36) NOT NULL,
    `office_name` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`office_id`)
);

CREATE TABLE `file` (
    `file_id` VARCHAR(36) NOT NULL,
    `file_name` VARCHAR(120) NOT NULL,
    `path` VARCHAR(1024) NOT NULL,
    PRIMARY KEY (`file_id`)
);

CREATE TABLE `skill` (
    `skill_id` VARCHAR(36) NOT NULL,
    `skill_name` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`skill_id`)
);

CREATE TABLE `skill_member` (
    `skill_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    PRIMARY KEY (`skill_id`, `user_id`)
);

CREATE TABLE `match_group` (
    `match_group_id` VARCHAR(36) NOT NULL,
    `match_group_name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(120) NOT NULL,
    `status` VARCHAR(10) NOT NULL DEFAULT 'open',
    `created_by` VARCHAR(36) NOT NULL,
    `created_at` DATE NOT NULL,
    PRIMARY KEY (`match_group_id`)
);

CREATE TABLE `match_group_member` (
    `match_group_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    PRIMARY KEY (`user_id`, `match_group_id`)
);

--alter table match_group_member add index user_id_idx(user_id);
