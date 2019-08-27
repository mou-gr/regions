/*global Navigo $ */
var root = null
var useHash = true // Defaults to: false
var hash = '#!' // Defaults to: '#'
var router = new Navigo(root, useHash, hash)
var invitationId

// var urlBase = 'http://localhost:4000/'
var urlBase = 'api/'

var updateName = function (id, str) {
    if (id) {
        $.get(`${urlBase}invitation/${id}/name`).then(res => $('#invitation-name').text(res.rows[0].Name + str))
    } else {
        $('#invitation-name').text(str)
    }
}

var db2grid = function (row) {
    row.isActive = row.isActive == 1
    row.IsFinal = row.IsFinal == 1
    row.canFinalize = row.canFinalize == 1
    row.RandomEvaluator = row.RandomEvaluator == 1
    return row
}
var grid2db = function (row) {
    row.isActive = row.isActive ? 1 : 0
    row.IsFinal = row.IsFinal ? 1 : 0
    row.canFinalize = row.canFinalize ? 1 : 0
    row.RandomEvaluator = row.RandomEvaluator ? 1 : 0
    return row
}
const refresh = obj => obj.grid.loadData()

const reload = function ($grid) {
    return () => $grid.jsGrid('loadData')
}

var createGrid = function createDateGrid(div, controller, fields, options) {
    return function () {
        $('#' + div).jsGrid({
            width: '100%',
            filtering: true,
            inserting: options === undefined || options.inserting === undefined ? true : options.inserting,
            editing: options === undefined || options.editing === undefined ? true : options.editing,
            sorting: true,
            paging: false,
            autoload: false,
            pageButtonCount: 5,
            deleteConfirm: 'Διαγραφή ενέργειας;',
            onItemInserted: refresh,
            onItemUpdated: refresh,
            controller: controller,
            fields: fields
        })
    }
}
var createController = function (getUrl) {
    return {
        loadData: function (filter) {
            return $.get(getUrl())
                .then(result => result.rows.map(db2grid))
                .then(result => result.filter(row => Object.keys(filter).every(col => 
                    filter[col] === undefined
                    || ('' + filter[col]).trim() === ''
                    || ('' + row[col]).toLowerCase().includes(('' + filter[col]).trim().toLowerCase())
                )))
        },
        insertItem: function (item) {
            return $.post(getUrl(), grid2db(item))
        },
        updateItem: function (item) {
            return $.ajax({ type: 'PUT', url: getUrl(), data: grid2db(item) })
        },
        deleteItem: function (item) {
            return $.ajax({ type: 'DELETE', url: getUrl(), data: item })
        }
    }
}
var createDateGrid = function createDateGrid(div) {
    var controller = createController(() => urlBase + 'invitation/' + invitationId + '/date')
    var fields = [
        { name: 'ID', type: 'number', editing: false, width: 50 },
        { name: 'CallPhaseID', type: 'number', width: 70 },
        { name: 'StartDate', type: 'solRiaDateTimeField', width: 200 },
        { name: 'EndDate', type: 'solRiaDateTimeField', width: 200 },
        { name: 'isActive', type: 'checkbox', title: 'Ενεργό', sorting: false },
        { name: 'canFinalize', type: 'checkbox', title: 'Οριστικοποίηση', sorting: false },
        { type: 'control' }
    ]
    return createGrid(div, controller, fields)
}

var createInvitationGrid = function createDateGrid(div) {
    var controller = createController(() => urlBase + 'invitation/')
    var fields = [
        { name: 'ID', type: 'number', editing: false, width: 20 },
        { name: 'Name', type: 'text', width: 170 },
        { name: 'CN_Code_Mask', type: 'text', width: 70 },
        { name: 'InvitationGroup', title: 'Group', type: 'number', width: 40 },
        { name: 'IsFinal', type: 'checkbox', title: 'Ενεργό', sorting: false, width: 60 },
        { name: 'RandomEvaluator', type: 'checkbox', title: 'Κλήρωση αξιολογητών', sorting: false, width: 60 },
        { name: 'StoreProcedureToRandomise', type: 'text', width: 100 },
        { type: 'control' },
        {
            itemTemplate: function (value, item) {
                var $result = $('<div class="btn-group" role="group">')
                var dateLink = '<a href="#!/invitation/' + item.ID + '/date" title="Έναρξη / Λήξη" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span></a>'
                var kadLink = '<a href="#!/invitation/' + item.ID + '/kad" title="ΚΑΔ" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span></a>'
                var userLink = '<a href="#!/invitation/' + item.ID + '/user" title="Χρήστες" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-user" aria-hidden="true"></span></a>'
                var editLink = '<a href="#!/invitation/' + item.ID + '" title="Επεξεργασία" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></a>'
                var cloneLink = '<button title="Αντιγραφή" data-id="' + item.ID + '"class="btn btn-info btn-sm clone-btn"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>'
                return $result.append(dateLink + kadLink + userLink + editLink + cloneLink)
            },
            width: 120
        }
    ]
    return createGrid(div, controller, fields)
}
var createUserGrid = function (div) {
    var controller = createController(() => urlBase + 'invitation/' + invitationId + '/user')
    var deleteSelectedItems = function () {
        const $div = $('#' + div)
        var ids = $div.find('tr:has(.user-checkbox:checked)').find('.id-cell').toArray().map(el => el.textContent)
        $.ajax({ type: 'DELETE', url: urlBase + 'userRoleType', data: { id: ids } }).then(reload($div))
    }

    var fields = [
        { name: 'ID', type: 'number', editing: false, width: 50, css: 'id-cell' },
        { name: 'U_LoginName', type: 'text', title: 'Χρήστης', editing: false, width: 70 },
        { name: 'URT_Description', type: 'text', title: 'Ρόλος', editing: false, width: 200 },
        { name: 'regions', type: 'text', title: 'Περιφέρειες', editing: false, width: 180 },
        {
            align: 'center',
            sorting: false,
            headerTemplate: function () {
                return $('<input class="jsgrid-button jsgrid-delete-button" title="Delete Selected" type="button">')
                    .off('click').on('click', deleteSelectedItems)
            },
            itemTemplate: function () {
                return '<input type="checkbox" class="user-checkbox">'
            },
            width: '20px'
        },
    ]
    return createGrid(div, controller, fields, { inserting: false, editing: false })
}
var createRoute = function (name, $grid, $div) {
    $div = $div === undefined ? $grid : $div
    return function (params) {
        invitationId = params.id
        updateName(params.id, name)
        $('.router-option').hide()
        $div.show()
        reload($grid)()
    }
}

$(document).ready(createUserGrid('user-grid'))
$(document).ready($('#new-user').off('click').on('click', function () {
    const userList = $('#new-user-list').val()
    const role = $('#user-role').val()
    $.post(`${urlBase}userRoleType`, { id: invitationId, userList: userList, role: role })
        .then(reload($('#user-grid')))
}))
$(document).ready(createDateGrid('date-grid'))
$(document).ready(createInvitationGrid('invitation-grid'))
$(document).ready($('#invitation-grid').on('click', '.clone-btn', function () {
    $.post(`${urlBase}invitation/${this.dataset.id}/clone`).then(reload($('#invitation-grid')))
}))
$(document).ready(function () {
    router
        .on('/', createRoute('Διαχείριση Προσκλήσεων', $('#invitation-grid')))
        .on('/invitation/:id', function (params) {
            invitationId = params.id
            updateName(params.id, '')
            $('.router-option').hide()
            $('#invitation').show()
            $.get(`${urlBase}invitation/${invitationId}?location=local`)
                .then(resp => {
                    const data = (resp.status == 200 && resp.rows && resp.rows[0]) ? resp.rows[0].JsonData : '{}'
                    window.renderForm(invitationId, data)
                })
        })
        .on('/invitation/:id/date', createRoute(' - Έναρξη / Λήξη Ενεργειών', $('#date-grid')))
        .on('/invitation/:id/user', createRoute(' - Χρήστες', $('#user-grid'), $('#user-div')))
        .on('/invitation/:id/kad', function (params) {
            $('.router-option').hide()
            $('#kad').show()
            invitationId = params.id
            updateName(params.id, ' - ΚΑΔ')
            $.get(`${urlBase}invitation/${params.id}/kad`)
                .then(data => $('#kad-area').text(data.rows[0].EligibleKad))
            $('#update-kad').off('click').on('click', function () {
                var value = $('#kad-area').val()
                $.ajax({
                    url: `${urlBase}invitation/${params.id}/kad`,
                    type: 'PUT',
                    dataType: 'json',
                    data: JSON.stringify({
                        kad: value
                    }),
                    contentType: 'application/json',
                    timeout: 5000,
                    complete: function (resp, status, ) {
                        if (resp.responseJSON.data == 'OK') {
                            console.log('updated')
                        } else {
                            console.log(resp, status, 'process error')
                        }
                    }
                })
            })
        })
        .resolve()
})
