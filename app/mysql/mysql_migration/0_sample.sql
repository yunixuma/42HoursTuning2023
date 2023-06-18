ALTER TABLE user ADD INDEX mail_password_idx(mail, password);
ALTER TABLE user ADD INDEX office_id_idx(office_id);
ALTER TABLE user ADD INDEX id INT NOT NULL AUTO_INCREMENT UNIQUE FIRST;
ALTER TABLE user ADD INDEX kana_idx(kana);
ALTER TABLE user ADD INDEX name_idx(name);
ALTER TABLE user ADD INDEX goal_idx(goal);
ALTER TABLE user ADD INDEX entry_date_idx(entry_date);

ALTER TABLE session ADD INDEX linked_user_id_idx (linked_user_id);
ALTER TABLE session ADD INDEX session_id_idx (session_id);

ALTER TABLE department_role_member ADD INDEX department_id_idx (department_id);
ALTER TABLE department_role_member ADD INDEX user_id_idx (user_id);
ALTER TABLE department_role_member ADD INDEX role_id_idx (role_id);

ALTER TABLE match_group_member ADD INDEX user_id_idx (user_id);

ALTER TABLE skill ADD INDEX skill_id_idx (skill_id);
ALTER TABLE skill ADD INDEX skill_name_idx (skill_name);

ALTER TABLE skill_member ADD INDEX skill_id_idx (skill_id);
ALTER TABLE skill_member ADD INDEX user_id_idx (user_id);

ALTER TABLE office ADD INDEX office_idx (office);
ALTER TABLE office ADD INDEX office_name_idx (office_name);

ALTER TABLE file ADD INDEX file_name_idx (file_name);
ALTER TABLE file ADD INDEX file_id_idx (file_id);
ALTER TABLE file ADD INDEX path_idx (path_id);

ALTER TABLE department ADD INDEX department_idx (department_id);
ALTER TABLE department ADD INDEX department_name_idx (department_name);
