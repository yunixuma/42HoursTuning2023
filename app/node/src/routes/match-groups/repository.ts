import { RowDataPacket } from "mysql2";
import pool from "../../util/mysql";
import { MatchGroup, MatchGroupDetail, User } from "../../model/types";
import { getUsersByUserIds } from "../users/repository";
import {
  convertToUser,
  convertToMatchGroupDetail,
  convertToMatchGroupDetail2,
} from "../../model/utils";

export const hasSkillNameRecord = async (
  skillName: string
): Promise<boolean> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT 1 FROM skill WHERE skill_name = ? LIMIT 1",
    [skillName]
  );
  return rows.length > 0;
};

export const getUserIdsBeforeMatched = async (
  userId: string
): Promise<string[]> => {
  const [matchGroupIdRows] = await pool.query<RowDataPacket[]>(
    "SELECT match_group_id FROM match_group_member WHERE user_id = ?",
    [userId]
  );
  if (matchGroupIdRows.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    "SELECT user_id FROM match_group_member WHERE match_group_id IN (?)",
    [matchGroupIdRows]
  );

  return userIdRows.map((row) => row.user_id);
};

export const insertMatchGroup = async (matchGroupDetail: MatchGroupDetail) => {
  await pool.query<RowDataPacket[]>(
    "INSERT INTO match_group (match_group_id, match_group_name, description, status, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [
      matchGroupDetail.matchGroupId,
      matchGroupDetail.matchGroupName,
      matchGroupDetail.description,
      matchGroupDetail.status,
      matchGroupDetail.createdBy,
      matchGroupDetail.createdAt,
    ]
  );

  for (const member of matchGroupDetail.members) {
    await pool.query<RowDataPacket[]>(
      "INSERT INTO match_group_member (match_group_id, user_id) VALUES (?, ?)",
      [matchGroupDetail.matchGroupId, member.userId]
    );
  }
};

export const getMatchGroupDetailByMatchGroupId = async (
  matchGroupId: string,
  status?: string
): Promise<MatchGroupDetail | undefined> => {
  let query =
    "SELECT match_group_id, match_group_name, description, status, created_by, created_at FROM match_group WHERE match_group_id = ?";
  if (status === "open") {
    query += " AND status = 'open'";
  }

  const [matchGroup] = await pool.query<RowDataPacket[]>(query, [matchGroupId]);
  if (matchGroup.length === 0) {
    return;
  }

  const [matchGroupMemberIdRows] = await pool.query<RowDataPacket[]>(
    "SELECT user_id FROM match_group_member WHERE match_group_id = ?",
    [matchGroupId]
  );
  const matchGroupMemberIds: string[] = matchGroupMemberIdRows.map(
    (row) => row.user_id
  );

  const searchedUsers = await getUsersByUserIds(matchGroupMemberIds);
  // SearchedUserからUser型に変換
  const members: User[] = searchedUsers.map((searchedUser) => {
    const { kana: _kana, entryDate: _entryDate, ...rest } = searchedUser;
    return rest;
  });
  matchGroup[0].members = members;

  return convertToMatchGroupDetail(matchGroup[0]);
};

export const getMatchGroupIdsByUserId = async (
  userId: string
): Promise<string[]> => {
  const [matchGroupIds] = await pool.query<RowDataPacket[]>(
    "SELECT match_group_id FROM match_group_member WHERE user_id = ?",
    [userId]
  );
  return matchGroupIds.map((row) => row.match_group_id);
};

export const getMatchGroupsByMatchGroupIds = async (
  matchGroupIds: string[],
  status: string
): Promise<MatchGroup[]> => {
  let matchGroups: MatchGroup[] = [];
  for (const matchGroupId of matchGroupIds) {
    const matchGroupDetail = await getMatchGroupDetailByMatchGroupId(
      matchGroupId,
      status
    );
    if (matchGroupDetail) {
      const { description: _description, ...matchGroup } = matchGroupDetail;
      matchGroups = matchGroups.concat(matchGroup);
    }
  }

  return matchGroups;
};

export const getMatchGroupsByMatchGroupIds2 = async (
  userId: string,
  status: string,
  offset: number,
  limit: number
): Promise<MatchGroup[]> => {
  let query = `SELECT mg.match_group_id, mg.match_group_name, mg.status, mg.created_by, mg.created_at
    FROM match_group mg
    LEFT JOIN match_group_member mgm
    ON mgm.match_group_id = mg.match_group_id
    WHERE mgm.user_id = ? `;
  if (status === "open") {
    query += " AND mg.status = 'open' ";
  }
  query +=
    " ORDER BY mg.status DESC, mg.created_at DESC, mg.match_group_name ASC ";
  query += ` LIMIT ${limit} OFFSET ${offset} `;

  const [matchGroups] = await pool.query<RowDataPacket[]>(query, [userId]);

  return convertToMatchGroupDetail2(matchGroups);
};

export const getMatchGroupDetail = async (
  matchGroups: MatchGroup[]
): Promise<MatchGroup[]> => {
  const ret: MatchGroup[] = [];
  const query = `SELECT u1.user_id, u1.user_name, u1.office_id, u1.user_icon_id, 
  (SELECT office_name FROM office o1 WHERE o1.office_id = u1.office_id) AS office_name, 
  (SELECT file_name FROM file f1 WHERE f1.file_id = u1.user_icon_id) AS file_name 
  FROM user u1
  LEFT JOIN match_group_member mgm
  ON mgm.user_id = u1.user_id
  WHERE mgm.match_group_id = ? `;

  for (let i = 0; i < matchGroups.length; i++) {
    const [rows] = await pool.query<RowDataPacket[]>(query, [
      matchGroups[i].matchGroupId,
    ]);
    matchGroups[i].members = convertToUser(rows);
    ret.push(matchGroups[i]);
  }

  return ret;
};
