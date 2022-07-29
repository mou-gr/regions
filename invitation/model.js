'use strict'
const sql = require('mssql')
const Promise = require('bluebird')
const credentials = require('./config')
sql.Promise = Promise

const config = credentials.config

const hideCnMask = 'HIDE'

const resquel = {
    db: config,
    routes: [{
        method: 'GET',
        endpoint: '/api/invitation',
        query: `select ID, Name, IsFinal, CN_Code_Mask, InvitationGroup, RandomEvaluator, StoreProcedureToRandomise, tags  from Invitation
                where CN_Code_Mask != '${hideCnMask}'`
    }, {
        method: 'PUT',
        endpoint: '/api/invitation',
        query: `update Invitation set
                Name = '{{ Name }}'
                , IsFinal = {{ IsFinal }}
                , CN_Code_Mask = '{{ CN_Code_Mask }}'
                , InvitationGroup = {{ InvitationGroup }}
                , RandomEvaluator = {{ RandomEvaluator }}
                , StoreProcedureToRandomise = '{{ StoreProcedureToRandomise }}'
                , tags = '{{ tags }}'
            where ID = {{ ID }}`
    }, {
        method: 'DELETE',
        endpoint: '/api/invitation/',
        query: 'delete from Invitation where ID= {{ ID }}'
    }, {
        method: 'GET',
        endpoint: '/api/invitation/:id',
        query: 'select * from Invitation where ID={{ params.id }};'
    }, {
        method: 'POST',
        endpoint: '/api/invitation/:id/clone',
        query: `insert into Invitation
            (IsFinal, InvitationGroup, JsonData, Name, CN_Code_Mask, RandomEvaluator, StoreProcedureToRandomise, tags)
                select IsFinal, InvitationGroup, JsonData, concat(Name, '_copy'), CN_Code_Mask, RandomEvaluator, StoreProcedureToRandomise, tags
                from Invitation where ID = {{ params.id }}`
    }, {
        method: 'GET',
        endpoint: '/api/invitation/:id/name',
        query: 'select Name from Invitation where ID={{ params.id }};'
    }, {
        method: 'GET',
        endpoint: '/api/invitation/:id/kad',
        query: 'select ID, Name, EligibleKad from Invitation where ID={{ params.id }};'
    }, {
        method: 'PUT',
        endpoint: '/api/invitation/:id/kad',
        query: `update invitation set EligibleKad='{{ kad }}' where ID= {{ params.id }}`
    }, {
        method: 'GET',
        endpoint: '/api/invitation/:id/date',
        query: `SELECT ID = ISNULL(b.ID,''), InvitationID =  1, a.CallPhaseID, isActive = ISNULL(b.isActive,''), StartDate = ISNULL(b.StartDate,''), 
                            EndDate = ISNULL(b.EndDate,''), canFinalize = ISNULL(b.canFinalize,''), Invisible = ISNULL(b.Invisible,''), 
                            MinDuration = ISNULL(b.MinDuration,''), MaxDuration = ISNULL(b.MaxDuration,'')
                FROM (SELECT * FROM CallPhase WHERE CP_CallID = 204) a 
                LEFT JOIN (SELECT * FROM Invitation_CallPhase_Date 
                WHERE InvitationID = {{ params.id }}) b ON b.CallPhaseID = a.CallPhaseID`
    },{
        method: 'POST',
        endpoint: '/api/invitation/:id/date',
        query: `insert into Invitation_CallPhase_Date (InvitationID, CallPhaseID, isActive, StartDate, EndDate)
            values ({{ params.id }}, {{ CallPhaseID }}, {{ isActive }}, '{{ StartDate }}', '{{ EndDate }}') `
    }, {
        method: 'PUT',
        endpoint: '/api/invitation/:id/date',
        query: `update Invitation_CallPhase_Date set
                CallPhaseID = {{ CallPhaseID }}
                , isActive = {{ isActive }}
                , canFinalize = {{ canFinalize }}
                , StartDate = '{{ StartDate }}'
                , EndDate = '{{ EndDate }}'
            where ID = {{ ID }}`
    }, {
        method: 'DELETE',
        endpoint: '/api/invitation/:id/date',
        query: 'delete from Invitation_CallPhase_Date where ID = {{ ID }}'
    }, {
        method: 'GET',
        endpoint: '/api/invitation/:id/user',
        query: `SELECT iur.*, u.U_LoginName, i.Name, urt.URT_Description
      FROM Invitation_User_Role iur join _User u on u.UserID = iur.U_UserID
      join invitation i on i.ID = iur.IN_InvitationID
      join UserRoleType urt on urt.UserRoleType_Code = iur.URT_UserRoleType_Code
      where i.ID = {{ params.id }}
      order by urt.UserRoleType_Code`
    },
    {
        method: 'GET',
        endpoint: '/api/user',
        query: 'select UserID, U_LoginName from _User'
    },
    {
        method: 'POST',
        endpoint: '/api/invitation/:id/user',
        query: `insert into Invitation_User_Role (U_UserID, IN_InvitationID, URT_UserRoleType_Code) values ({{ U_UserId }}, {{ IN_InvitationID }}, {{ URT_UserRoleType_Code }})`
    }
    ]
}

const getConnection = function(config) {
    return new sql.ConnectionPool(config).connect()
}
// const closeConnection = function() {
//     return sql.close()
// }

const query = async function(str, pool) {
    try {
        const result = await pool.request().query(str)
        return result
    } catch (e) {
        e.query = str
        throw (e)
    }
}
const updateInvitation = function(id, jsonData, pool) {
    const q = `update Invitation
    set JsonData = @jsonData
    where id = ${id}`

    return pool.request()
        .input('jsonData', sql.NVarChar, jsonData)
        .query(q, pool)
}
const addInvitationUsers = (invitationId, userList, role, pool) => {
    /**@userList: comma seperated list of usernames */
    const q = `insert into Invitation_User_Role
        (IN_InvitationID, U_UserID, URT_UserRoleType_Code)
            select ${invitationId}, UserID, ${role}
            from _User
            where U_LoginName in ( '${userList.split(',').join(`','`)}' )
			and UserID not in 
			(
			select U_UserID
			from Invitation_User_Role
			where IN_InvitationID = ${invitationId} 
			)`
    return query(q, pool)
}

const deleteInvitationUser = (ids, pool) => {
    if (!ids || !ids[0]) { return Promise.resolve() }
    const q = `delete from Invitation_User_Role where ID in ( ${ids.join()} )`
    return query(q, pool)
}

const getAllIds = (pool) => {
    const q = 'select top 10 id from Invitation'
    return query(q, pool)
        .then(resp => resp.recordset.map(i => i.id))
}
const getJsonData = (pool, id) => {
    const q = `select id, jsonData from Invitation where id = ${id}`
    return query(q, pool)
        .then(res => res.recordset)
}


module.exports = {
    getConnection,
    // closeConnection,
    updateInvitation,
    addInvitationUsers,
    deleteInvitationUser,
    getAllIds,
    getJsonData,
    resquel
}
