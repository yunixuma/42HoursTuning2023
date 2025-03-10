import { RowDataPacket } from "mysql2";
import pool from "../../util/mysql";
import {
  SearchedUser,
  User,
  UserForFilter,
  MatchGroupConfig,
} from "../../model/types";
import {
  convertToSearchedUser,
  convertToUserForFilter,
  convertToUserForFilter2,
  convertToUsers,
} from "../../model/utils";

export const getUserIdByMailAndPassword = async (
  mail: string,
  hashPassword: string
): Promise<string | undefined> => {
  const [user] = await pool.query<RowDataPacket[]>(
    "SELECT user_id FROM user WHERE mail = ? AND password = ?",
    [mail, hashPassword]
  );
  if (user.length === 0) {
    return;
  }

  return user[0].user_id;
};

export const getUsers = async (
  limit: number,
  offset: number
): Promise<User[]> => {
  const query = `
  SELECT
    user.user_id,
    user.user_name,
    user.office_id,
    user.user_icon_id,
    (SELECT office_name FROM office WHERE office_id = user.office_id) AS office_name,
    (SELECT file_name FROM file WHERE file_id = user.user_icon_id) AS file_name
  FROM
    user
  ORDER BY
    user.entry_date ASC,
    user.kana ASC
  LIMIT ? OFFSET ? `;

  const [rows] = await pool.query<RowDataPacket[]>(query, [limit, offset]);

  return convertToUsers(rows);
};

export const getUserByUserId = async (
  userId: string
): Promise<User | undefined> => {
  const [user] = await pool.query<RowDataPacket[]>(
    "SELECT user_id, user_name, office_id, user_icon_id FROM user WHERE user_id = ?",
    [userId]
  );
  if (user.length === 0) {
    return;
  }

  const [office] = await pool.query<RowDataPacket[]>(
    `SELECT office_name FROM office WHERE office_id = ?`,
    [user[0].office_id]
  );
  const [file] = await pool.query<RowDataPacket[]>(
    `SELECT file_name FROM file WHERE file_id = ?`,
    [user[0].user_icon_id]
  );

  return {
    userId: user[0].user_id,
    userName: user[0].user_name,
    userIcon: {
      fileId: user[0].user_icon_id,
      fileName: file[0].file_name,
    },
    officeName: office[0].office_name,
  };
};

export const getUsersByUserIds = async (
  userIds: string[]
): Promise<SearchedUser[]> => {
  if (userIds.length === 0) {
    return [];
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT user_id, user_name, kana, entry_date, office_id, user_icon_id, 
    (SELECT office_name FROM office o1 WHERE o1.office_id = u1.office_id) AS office_name, 
    (SELECT file_name FROM file f1 WHERE f1.file_id = u1.user_icon_id) AS file_name 
    FROM user u1 WHERE u1.user_id IN (?)`,
    [userIds]
  );

  return convertToSearchedUser(rows);
};

export const getUsersByUserName = async (
  userName: string
): Promise<SearchedUser[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT user_id FROM user WHERE user_name LIKE ?`,
    [`%${userName}%`]
  );
  const userIds: string[] = rows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByKana = async (kana: string): Promise<SearchedUser[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT user_id FROM user WHERE kana LIKE ?`,
    [`%${kana}%`]
  );
  const userIds: string[] = rows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByMail = async (mail: string): Promise<SearchedUser[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT user_id FROM user WHERE mail LIKE ?`,
    [`%${mail}%`]
  );
  const userIds: string[] = rows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByDepartmentName = async (
  departmentName: string
): Promise<SearchedUser[]> => {
  const [departmentIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT department_id FROM department WHERE department_name LIKE ? AND active = true`,
    [`%${departmentName}%`]
  );
  const departmentIds: string[] = departmentIdRows.map(
    (row) => row.department_id
  );
  if (departmentIds.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT user_id FROM department_role_member WHERE department_id IN (?) AND belong = true`,
    [departmentIds]
  );
  const userIds: string[] = userIdRows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByRoleName = async (
  roleName: string
): Promise<SearchedUser[]> => {
  const [roleIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT role_id FROM role WHERE role_name LIKE ? AND active = true`,
    [`%${roleName}%`]
  );
  const roleIds: string[] = roleIdRows.map((row) => row.role_id);
  if (roleIds.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT user_id FROM department_role_member WHERE role_id IN (?) AND belong = true`,
    [roleIds]
  );
  const userIds: string[] = userIdRows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByOfficeName = async (
  officeName: string
): Promise<SearchedUser[]> => {
  const [officeIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT office_id FROM office WHERE office_name LIKE ?`,
    [`%${officeName}%`]
  );
  const officeIds: string[] = officeIdRows.map((row) => row.office_id);
  if (officeIds.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT user_id FROM user WHERE office_id IN (?)`,
    [officeIds]
  );
  const userIds: string[] = userIdRows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersBySkillName = async (
  skillName: string
): Promise<SearchedUser[]> => {
  const [skillIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT skill_id FROM skill WHERE skill_name LIKE ?`,
    [`%${skillName}%`]
  );
  const skillIds: string[] = skillIdRows.map((row) => row.skill_id);
  if (skillIds.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    `SELECT user_id FROM skill_member WHERE skill_id IN (?)`,
    [skillIds]
  );
  const userIds: string[] = userIdRows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

export const getUsersByGoal = async (goal: string): Promise<SearchedUser[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT user_id FROM user WHERE goal LIKE ?`,
    [`%${goal}%`]
  );
  const userIds: string[] = rows.map((row) => row.user_id);

  return getUsersByUserIds(userIds);
};

/*
export const getUserForFilter = async (
  userId?: string
): Promise<UserForFilter> => {
  let userRows: RowDataPacket[];
  if (!userId) {
    let randomUserRow;
    do {
      const [recordCountRow] = await pool.query<RowDataPacket[]>(
        "SELECT COUNT(1) as recordCount FROM user"
      );
      const recordCount = recordCountRow[0].recordCount;
      const randomId = Math.floor(Math.random() * recordCount) + 1;

      [randomUserRow] = await pool.query<RowDataPacket[]>(
        "SELECT user_id, user_name, office_id, user_icon_id FROM user WHERE id = ?",
        [randomId]
      );
    } while (randomUserRow.length === 0);

    userRows = randomUserRow;
  } else {
    [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT user_id, user_name, office_id, user_icon_id FROM user WHERE user_id = ?",
      [userId]
    );
  }
  const user = userRows[0];

  const [officeNameRow] = await pool.query<RowDataPacket[]>(
    `SELECT office_name FROM office WHERE office_id = ?`,
    [user.office_id]
  );
  const [fileNameRow] = await pool.query<RowDataPacket[]>(
    `SELECT file_name FROM file WHERE file_id = ?`,
    [user.user_icon_id]
  );
  const [departmentNameRow] = await pool.query<RowDataPacket[]>(
    `SELECT department_name FROM department WHERE department_id = (SELECT department_id FROM department_role_member WHERE user_id = ? AND belong = true)`,
    [user.user_id]
  );
  const [skillNameRows] = await pool.query<RowDataPacket[]>(
    `SELECT skill_name FROM skill WHERE skill_id IN (SELECT skill_id FROM skill_member WHERE user_id = ?)`,
    [user.user_id]
  );

  user.office_name = officeNameRow[0].office_name;
  user.file_name = fileNameRow[0].file_name;
  user.department_name = departmentNameRow[0].department_name;
  user.skill_names = skillNameRows.map((row) => row.skill_name);

  return convertToUserForFilter(user);
};
*/

export const getUserForFilter = async (
  userId: string
): Promise<UserForFilter> => {
  const query = `SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, 
  (SELECT office_name FROM office WHERE office.office_id = user.office_id) AS office_name, 
  (SELECT file_name FROM file WHERE file.file_id = user.user_icon_id) AS file_name, 
  (SELECT department_name FROM department WHERE department_id = (SELECT department_id FROM department_role_member drm WHERE drm.user_id = user.user_id AND belong = true)) AS department_name 
  FROM user WHERE user_id = ? `;
  const [userRows] = await pool.query<RowDataPacket[]>(query, [userId]);

  const user = userRows[0];

  const [skillNameRows] = await pool.query<RowDataPacket[]>(
    `SELECT skill_name FROM skill WHERE skill_id IN (SELECT skill_id FROM skill_member WHERE user_id = ?)`,
    // `SELECT skill_name
    // FROM skill
    // LEFT JOIN skill_member sm
    // ON sm.skill_id = skill.skill_id
    // WHERE user_id = ? `,
    [user.user_id]
  );

  user.skill_names = skillNameRows.map((row) => row.skill_name);

  return convertToUserForFilter(user);
};
/*
export const getUserForFilter2 = async (
  ): Promise<UserForFilter[]> => {

    let userRows: RowDataPacket[];

    const [recordCountRow] = await pool.query<RowDataPacket[]>("SELECT COUNT(1) as recordCount FROM user");
    const recordCount = recordCountRow[0].recordCount;
    let randomIds: number[] = [];

    for(let i = 0; i < 100; i++) {
      randomIds.push(Math.floor(Math.random() * recordCount) + 1);
    }
    let query = "SELECT \
    user_id, user_name, office_id, user_icon_id, \
    (SELECT office_name FROM office WHERE office.office_id = user.office_id) AS office_name, \
    (SELECT file_name FROM file WHERE file.file_id = user.user_icon_id) AS file_name, \
    (SELECT department_name FROM department WHERE department_id = (SELECT department_id FROM department_role_member drm WHERE drm.user_id = user.user_id AND belong = true)) AS department_name, \
    (SELECT skill_name FROM skill WHERE skill_id = (SELECT skill_id FROM skill_member sk WHERE sk.user_id = user.user_id LIMIT 1)) AS skill_names \
    FROM user WHERE id in (?)";
    [userRows] = await pool.query<RowDataPacket[]>(query, [randomIds]);

    return convertToUserForFilter2(userRows);
  };
*/
export const getUserForFilter3 = async (
  matchGroupConfig: MatchGroupConfig,
  owner: UserForFilter
): Promise<UserForFilter[]> => {
  let filter_count = 0;
  let query =
    "SELECT user.user_id, user.user_name, user.office_id, user.user_icon_id, \
  (SELECT office_name FROM office WHERE office.office_id = user.office_id) AS office_name, \
  (SELECT file_name FROM file WHERE file.file_id = user.user_icon_id) AS file_name, \
  (SELECT department_name FROM department WHERE department_id = (SELECT department_id FROM department_role_member drm WHERE drm.user_id = user.user_id AND belong = true)) AS department_name \
  FROM user ";

  // 部署指定がある時
  if (matchGroupConfig.departmentFilter === "onlyMyDepartment") {
    query += ` INNER JOIN department_role_member drm 
        ON drm.user_id = user.user_id 
        AND department_id = (SELECT department_id FROM department_role_member WHERE user_id = "${owner.userId}" AND belong = true) 
        AND drm.belong = true `;
    filter_count++;
  }
  // オフィス指定がある時
  if (matchGroupConfig.officeFilter === "onlyMyOffice") {
    query += ` INNER JOIN office 
        ON user.office_id = office.office_id 
        AND office.office_id = (SELECT office_id FROM office WHERE office_name = "${owner.officeName}") `;
    filter_count++;
  }
  // スキル指定がある時
  if (matchGroupConfig.skillFilter.length > 0) {
    let skills = matchGroupConfig.skillFilter.join('", "');
    skills = '"' + skills + '"';
    query += ` INNER JOIN skill_member skm
        ON user.user_id = skm.user_id 
        INNER JOIN skill
        ON skill.skill_id = skm.skill_id
        AND skill.skill_name IN (${skills}) `;
    filter_count++;
  }

  //console.log("---------------");
  //console.log(matchGroupConfig.skillFilter);

  const c1 = "0123456789abcdefghijklmnopqrstuvwxyz"[
    Math.floor(Math.random() * 36)
  ];
  // const c2 = "0123456789abcdefghijklmnopqrstuvwxyz"[
  //   Math.floor(Math.random() * 36)
  // ];
  if (filter_count > 0) {
    query += " LIMIT 100 ";
  } else {
    query += ` WHERE user.user_id LIKE "${c1}%"`;
    query += " LIMIT 100 ";
  }

  //console.log("------------------------0");
  //console.log(query);

  const [userRows] = await pool.query<RowDataPacket[]>(query);

  for (let i = 0; i < userRows.length; i++) {
    const [skillNameRows] = await pool.query<RowDataPacket[]>(
      `SELECT skill_name FROM skill WHERE skill_id IN (SELECT skill_id FROM skill_member WHERE user_id = ?)`,
      // `SELECT skill_name
      // FROM skill
      // LEFT JOIN skill_member sm
      // ON sm.skill_id = skill.skill_id
      // WHERE user_id = ? `,
      [userRows[i].user_id]
    );

    userRows[i].skill_names = skillNameRows.map((row) => row.skill_name);
  }

  return convertToUserForFilter2(userRows);
};
