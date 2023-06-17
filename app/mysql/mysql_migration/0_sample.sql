ALTER TABLE user ADD INDEX mail_password_idx(mail, password);
ALTER TABLE user ADD COLUMN id INT NOT NULL AUTO_INCREMENT UNIQUE FIRST;

ALTER TABLE session ADD INDEX linked_user_id_idx (linked_user_id);
ALTER TABLE session ADD INDEX session_id_idx (session_id);

ALTER TABLE department_role_member ADD INDEX user_id_idx (user_id);
ALTER TABLE department_role_member ADD INDEX role_id_idx (role_id);

ALTER TABLE match_group_member ADD INDEX user_id_idx (user_id);
