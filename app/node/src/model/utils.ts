import { RowDataPacket } from "mysql2";
import { User, SearchedUser, UserForFilter, MatchGroupDetail } from "./types";

export const convertDateToString = (date: Date): string => {
  return (
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  );
};

export const convertToUsers = (rows: RowDataPacket[]): User[] => {
  return rows.map((row: RowDataPacket) => ({
    userId: row.user_id,
    userName: row.user_name,
    userIcon: {
      fileId: row.user_icon_id,
      fileName: row.file_name,
    },
    officeName: row.office_name,
  }));
};

export const convertToSearchedUser = (
  rows: RowDataPacket[]
): SearchedUser[] => {
  return rows.map((row: RowDataPacket) => ({
    userId: row.user_id,
    userName: row.user_name,
    kana: row.kana,
    entryDate: row.entry_date,
    userIcon: {
      fileId: row.user_icon_id,
      fileName: row.file_name,
    },
    officeName: row.office_name,
  }));
};

export const convertToUserForFilter = (row: RowDataPacket): UserForFilter => {
  return {
    userId: row.user_id,
    userName: row.user_name,
    userIcon: {
      fileId: row.user_icon_id,
      fileName: row.file_name,
    },
    officeName: row.office_name,
    departmentName: row.department_name,
    skillNames: row.skill_names,
  };
};

export const convertToMatchGroupDetail = (
  row: RowDataPacket
): MatchGroupDetail => {
  return {
    matchGroupId: row.match_group_id,
    matchGroupName: row.match_group_name,
    description: row.description,
    members: row.members,
    status: row.status,
    createdBy: row.created_by,
    createdAt: convertDateToString(row.created_at),
  };
};

export const convertToMatchGroupDetail2 = (
  rows: RowDataPacket[]
): MatchGroupDetail[] => {
  return rows.map((row: RowDataPacket) => ({
    matchGroupId: row.match_group_id,
    matchGroupName: row.match_group_name,
    description: row.description,
    members: row.members,
    status: row.status,
    createdBy: row.created_by,
    createdAt: convertDateToString(row.created_at),
  }));
};

export const convertUsersForFilterToUsers = (
  usersForFilter: UserForFilter[]
): User[] => {
  return usersForFilter.map((userForFilter) => {
    const {
      departmentName: _departmentName,
      skillNames: _skillNames,
      ...user
    } = userForFilter;
    return user;
  });
};

export const convertToUserForFilter2 = (
  rows: RowDataPacket[]
): UserForFilter[] => {
  return rows.map((row: RowDataPacket) => ({
    userId: row.user_id,
    userName: row.user_name,
    userIcon: {
      fileId: row.user_icon_id,
      fileName: row.file_name,
    },
    officeName: row.office_name,
    departmentName: row.department_name,
    skillNames: row.skill_names,
  }));
};
