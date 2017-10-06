'use strict'
const sql = require('mssql');
const R = require ('ramda');
Promise = require("bluebird");
const credentials = require('./config');
sql.Promise = Promise;

const config = credentials.config;

const getConnection = function () {
    return sql.connect(config);
}
const closeConnection = function () {
    return sql.close();
}

const query = async function (str, pool) {
    try {
        const result = await pool.request().query(str);
        return result;
    } catch(e) {
        e.query = str;
        throw(e);
    }
}

const getList = function (pool) {
    var q = `select ID, Name from Invitation`;
    return query(q, pool);
}

const getInvitation = function (id, pool) {
      var q = `select * from invitation where ID = ${id}`;
      return query(q, pool);
}

const getInvitationUsers = (id, pool) => {
    var q = `SELECT iur.*, u.U_LoginName, i.Name, urt.URT_Description
  FROM [MIS_DB_DEV].[dbo].[Invitation_User_Role] iur join _User u on u.UserID = iur.U_UserID
  join invitation i on i.ID = iur.IN_InvitationID
  join UserRoleType urt on urt.UserRoleType_Code = iur.URT_UserRoleType_Code
  order by urt.UserRoleType_Code`;
    return query(q, pool);
}
const addInvitationUsers = (id, userId, role, pool) => {
    var q = `insert into Invitation_User_Role (U_UserID, IN_InvitationID, URT_UserRoleType_Code) values (${userId}, ${id}, ${role})`;
    return query(q, pool);
}
const removeInvitationUsers = (ids, pool) => {
    const idString = '(' + ids.join() + ')'
    var q = `delete from Invitation_User_Role ID in ${idString}`;
    return query(q, pool);
}

const deleteInvitation = function (id, pool) {
      var q = `delete from invitation where ID = ${id}`;
      return query(q, pool);
}

const newInvitation =  function (isFinal, group, jsonData, name, pool) {
    const q = `insert into Invitation (IsFinal, InvitationGroup, JsonData, Name) values (${isFinal}, ${group}, @jsonData, '${name}')`;
    return pool.request()
    .input('jsonData', sql.NVarChar, jsonData)
    .query(q, pool);
}

const updateInvitation =  function (id, isFinal, group, jsonData, pool) {
    const q = `update Invitation
    set IsFinal = ${isFinal}, InvitationGroup = ${group}, JsonData = @jsonData
    where id = ${id}`;

    return pool.request()
    .input('jsonData', sql.NVarChar, jsonData)
    .query(q, pool);
}

const getUsers = pool => {
    const q = `select UserID, U_LoginName from _User`
    return query(q, pool);
}

module.exports = {getConnection, query, deleteInvitation, newInvitation,
     getInvitation, getList, closeConnection, updateInvitation, getInvitationUsers,
     getUsers
 }
