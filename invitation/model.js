'use strict'
const sql = require('mssql')
const Promise = require('bluebird')
const credentials = require('./config')
sql.Promise = Promise

const config = credentials.config

const resquel = {
    db: config
    , routes: [
        {
            'method': 'get',
            'endpoint': '/api/invitation',
            'query': 'select ID, Name, IsFinal, CN_Code_Mask from Invitation;'
        }
        , {
            'method': 'get',
            'endpoint': '/api/invitation/:id',
            'query': 'select * from Invitation where ID={{ params.id }};'
        }
        , {
            'method': 'get',
            'endpoint': '/api/invitation/:id/kad',
            'query': 'select ID, Name, EligibleKad from Invitation where ID={{ params.id }};'
        }
        , {
            'method': 'put',
            'endpoint': '/api/invitation/:id/kad',
            'query': 'update invitation set EligibleKad=\'{{ kad }}\' where ID= {{ params.id }}'
        }
        , {
            'method': 'put',
            'endpoint': '/api/invitation/:id/rename',
            'query': 'update invitation set Name=\'{{ name }}\' where ID= {{ params.id }}'
        }
        , {
            'method': 'put',
            'endpoint': '/api/invitation/:id/rename-mask',
            'query': 'update invitation set CN_Code_Mask=\'{{ mask }}\' where ID= {{ params.id }}'
        }
        , {
            'method': 'put',
            'endpoint': '/api/invitation/:id/final',
            'query': 'update invitation set IsFinal=\'{{ IsFinal }}\' where ID= {{ params.id }}'
        }
        , {
            'method': 'post',
            'endpoint': '/api/invitation/:id/clone',
            'query': 'insert into Invitation (IsFinal, InvitationGroup, JsonData, Name) select IsFinal, InvitationGroup, JsonData, concat(Name, \'_copy\') from Invitation where ID = {{ params.id }}'
        }
        , {
            'method': 'delete',
            'endpoint': '/api/invitation/:id',
            'query': 'delete from Invitation where ID= {{ params.id }}'
        }

    ]
}

const getConnection = function () {
    return sql.connect(config)
}
const closeConnection = function () {
    return sql.close()
}

const query = async function (str, pool) {
    try {
        const result = await pool.request().query(str)
        return result
    } catch(e) {
        e.query = str
        throw(e)
    }
}

const getList = function (pool) {
    var q = 'select ID, Name, IsFinal, CN_Code_Mask from Invitation'
    return query(q, pool)
}

const getInvitation = function (id, pool) {
    var q = `select * from invitation where ID = ${id}`
    return query(q, pool)
}

const getInvitationUsers = (id, pool) => {
    var q = `SELECT iur.*, u.U_LoginName, i.Name, urt.URT_Description
  FROM [MIS_DB_DEV].[dbo].[Invitation_User_Role] iur join _User u on u.UserID = iur.U_UserID
  join invitation i on i.ID = iur.IN_InvitationID
  join UserRoleType urt on urt.UserRoleType_Code = iur.URT_UserRoleType_Code
  where i.ID = ${id}
  order by urt.UserRoleType_Code`
    return query(q, pool)
}
const addInvitationUsers = (id, userId, role, pool) => {
    var q = `insert into Invitation_User_Role (U_UserID, IN_InvitationID, URT_UserRoleType_Code) values (${userId}, ${id}, ${role})`
    return query(q, pool)
}
const deleteInvitationUser = (ids, pool) => {
    const idString = '(' + ids.join() + ')'
    var q = `delete from Invitation_User_Role where ID in ${idString}`
    return query(q, pool)
}

const deleteInvitation = function (id, pool) {
    var q = `delete from invitation where ID = ${id}`
    return query(q, pool)
}

const newInvitation =  function (isFinal, group, jsonData, name, pool) {
    const q = `insert into Invitation (IsFinal, InvitationGroup, JsonData, Name) values (${isFinal}, ${group}, @jsonData, '${name}')`
    return pool.request()
        .input('jsonData', sql.NVarChar, jsonData)
        .query(q, pool)
}

const updateInvitation =  function (id, isFinal, group, jsonData, pool) {
    const q = `update Invitation
    set IsFinal = ${isFinal}, InvitationGroup = ${group}, JsonData = @jsonData
    where id = ${id}`

    return pool.request()
        .input('jsonData', sql.NVarChar, jsonData)
        .query(q, pool)
}

const getUsers = pool => {
    const q = 'select UserID, U_LoginName from _User'
    return query(q, pool)
}

module.exports = {getConnection, query, deleteInvitation, newInvitation,
    getInvitation, getList, closeConnection, updateInvitation, getInvitationUsers,
    getUsers, addInvitationUsers, deleteInvitationUser, resquel
}
