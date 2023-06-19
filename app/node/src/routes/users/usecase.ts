import { Target, SearchedUser } from "../../model/types";
import {
  getUsersByUserName,
  getUsersByKana,
  getUsersByMail,
  getUsersByDepartmentName,
  getUsersByRoleName,
  getUsersByOfficeName,
  getUsersBySkillName,
  getUsersByGoal,
} from "./repository";
import { convertToSearchedUser } from "../../model/utils";
import { RowDataPacket } from "mysql2";
import pool from "../../util/mysql";

export const getUsersByKeyword = async (
  keyword: string,
  targets: Target[]
): Promise<SearchedUser[]> => {
  let users: SearchedUser[] = [];
  for (const target of targets) {
    const oldLen = users.length;
    switch (target) {
      case "userName":
        users = users.concat(await getUsersByUserName(keyword));
        break;
      case "kana":
        users = users.concat(await getUsersByKana(keyword));
        break;
      case "mail":
        users = users.concat(await getUsersByMail(keyword));
        break;
      case "department":
        users = users.concat(await getUsersByDepartmentName(keyword));
        break;
      case "role":
        users = users.concat(await getUsersByRoleName(keyword));
        break;
      case "office":
        users = users.concat(await getUsersByOfficeName(keyword));
        break;
      case "skill":
        users = users.concat(await getUsersBySkillName(keyword));
        break;
      case "goal":
        users = users.concat(await getUsersByGoal(keyword));
        break;
    }
    console.log(`${users.length - oldLen} users found by ${target}`);
  }
  return users;
};

export const getUsersByKeyword2 = async (
  keyword: string,
  targets: Target[],
  offset: number,
  limit: number
): Promise<SearchedUser[]> => {
  //const users: SearchedUser[] = [];
  const querys: string[] = [];
  const cols = ` user.user_id, user.user_name, user.kana,
    user.entry_date, user.office_id, user.user_icon_id, 
    (SELECT office_name FROM office o1 WHERE o1.office_id = user.office_id) AS office_name, 
    (SELECT file_name FROM file f1 WHERE f1.file_id = user.user_icon_id) AS file_name `;

  for (const target of targets) {
    // const oldLen = users.length;
    switch (target) {
      case "userName":
        // users = users.concat(await getUsersByUserName(keyword));
        querys.push(`(SELECT ${cols} FROM user WHERE user_name LIKE ?)`);
        break;
      case "kana":
        // users = users.concat(await getUsersByKana(keyword));
        querys.push(`(SELECT ${cols} FROM user WHERE kana LIKE ?)`);
        break;
      case "mail":
        // users = users.concat(await getUsersByMail(keyword));
        querys.push(`(SELECT ${cols} FROM user WHERE mail LIKE ?)`);
        break;
      case "department":
        // users = users.concat(await getUsersByDepartmentName(keyword));
        querys.push(
          `(SELECT ${cols}
          FROM user
          LEFT JOIN department_role_member drm
          ON drm.user_id = user.user_id
          AND drm.belong = true
          LEFT JOIN department dep
          ON dep.department_id = drm.department_id
          AND dep.active = true
          WHERE dep.department_name LIKE ? )`
        );
        break;
      case "role":
        // users = users.concat(await getUsersByRoleName(keyword));
        querys.push(
          `(SELECT ${cols}
          FROM user
          LEFT JOIN department_role_member drm
          ON drm.user_id = user.user_id
          AND drm.belong = true
          LEFT JOIN role
          ON role.role_id = drm.role_id
          AND role.active = true
          WHERE role.role_name LIKE ? )`
        );
        break;
      case "office":
        // users = users.concat(await getUsersByOfficeName(keyword));
        querys.push(
          `(SELECT ${cols}
          FROM user
          LEFT JOIN office
          ON office.office_id = user.office_id
          WHERE office.office_name LIKE ? )`
        );
        break;
      case "skill":
        // users = users.concat(await getUsersBySkillName(keyword));
        querys.push(
          `(SELECT ${cols}
          FROM user
          LEFT JOIN skill_member sm
          ON sm.user_id = user.user_id
          LEFT JOIN skill
          ON skill.skill_id = sm.skill_id
          WHERE skill.skill_name LIKE ? )`
        );
        break;
      case "goal":
        // users = users.concat(await getUsersByGoal(keyword));
        querys.push(`(SELECT ${cols} FROM user WHERE goal LIKE ? )`);
        break;
    }
    // console.log(`${users.length - oldLen} users found by ${target}`);
  }

  let query = querys.join(` 
  UNION ALL
  `);
  query += ` ORDER BY entry_date ASC, kana ASC
  LIMIT ${limit} OFFSET ${offset} `;

  console.log("---------------search---------------");
  console.log(query);

  const keywords = querys.map(() => `%${keyword}%`);

  const [rows] = await pool.query<RowDataPacket[]>(query, keywords);

  return convertToSearchedUser(rows);
};
