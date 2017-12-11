/*global Navigo $ */
var root = null
var useHash = true // Defaults to: false
var hash = '#!' // Defaults to: '#'
var router = new Navigo(root, useHash, hash)
var invitationId

const updateName = (id, str) => {
    $.get(`/api/invitation/${id}/name`).then(res => $('#invitation-name').text(res.rows[0].Name + str))
}
router
    .on('/', function() {
        $('#invitation-name').text('Διαχείριση Προσκλήσεων')
        $('.router-option').hide()
        $('#invitation-grid').show()
        $('#invitation-grid').jsGrid('loadData')
    })
    .on('/invitation/:id', function(params) {
        invitationId = params.id
        updateName(params.id, '')
        $('.router-option').hide()
        $('#invitation').show()
    })
    .on('/invitation/:id/user', function(params) {
        invitationId = params.id
        updateName(params.id, ' - Χρήστες')
        $('#user-grid').jsGrid('render')
        $('.router-option').hide()
        $('#user-grid').show()
    })
    .on('/invitation/:id/kad', function(params) {
        invitationId = params.id
        updateName(params.id, ' - ΚΑΔ')
        $.get('/api/invitation/' + params.id + '/kad').then(function(data) {
            $('#kad-area').text(data.rows[0].EligibleKad)
        })
        $('#update-kad').on('click', function() {
            const value = $('#kad-area').val()
            $.ajax({
                url: '/api/invitation/' + params.id + '/kad',
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify({
                    kad: value
                }),
                contentType: 'application/json',
                timeout: 5000,
                complete: function(resp, status, ) {
                    if (resp.responseJSON.data == 'OK') {
                        console.log('updated')
                    } else {
                        console.log(resp, status, 'process error')
                    }
                }
            })
        })
        $('.router-option').hide()
        $('#kad').show()
    })
    .on('/invitation/:id/date', function(params) {
        invitationId = params.id
        updateName(params.id, ' - Έναρξη / Λήξη Ενεργειών')
        $('.router-option').hide()
        $('#date-grid').show()
        $('#date-grid').jsGrid('loadData')
    })
    .resolve()

const db2grid = function(row) {
    row.isActive = row.isActive == 1
    row.isFinal = row.isFinal == 1
    return row
}
const grid2db = function(row) {
    row.isActive = row.isActive ? 1 : 0
    row.isFinal = row.isFinal ? 1 : 0
    return row
}
const refresh = function(obj) {
    obj.grid.render()
}
// const createGrid = function createGrid (div, type) {
//     const config = [
//         date: {endPoint: '/date', }
//     ]
//     return function() {
//         $('#' + div).jsGrid({
//             width: '100%',
//             filtering: false,
//             inserting: true,
//             editing: true,
//             sorting: true,
//             paging: false,
//             autoload: true,
//             pageButtonCount: 5,
//             deleteConfirm: 'Διαγραφή ενέργειας;',
//             onItemInserted: refresh,
//             onItemUpdated: refresh,
//             controller: {
//                 loadData: function() {
//                     const url = '/api/invitation/' + invitationId + '/date'
//                     return $.get(url).then(res => res.rows.map(db2grid))
//                 },
//                 insertItem: function(item) {
//                     const url = '/api/invitation/' + invitationId + '/date'
//                     return $.post(url, grid2db(item))
//                 },
//                 updateItem: function(item) {
//                     const url = '/api/invitation/' + invitationId + '/date'
//                     return $.ajax({ type: 'PUT', url: url, data: grid2db(item) })
//                 },
//                 deleteItem: function(item) {
//                     const url = '/api/invitation/' + invitationId + '/date'
//                     return $.ajax({ type: 'DELETE', url: url, data: item })
//                 }
//             },
//             fields: [
//                 { name: 'ID', type: 'number', editing: false, width: 50 },
//                 { name: 'CallPhaseID', type: 'number', width: 70 },
//                 { name: 'StartDate', type: 'solRiaDateTimeField', width: 200 },
//                 { name: 'EndDate', type: 'solRiaDateTimeField', width: 200 },
//                 { name: 'isActive', type: 'checkbox', title: 'Ενεργό', sorting: false },
//                 { type: 'control' }
//             ]
//         })
//     }
// }
const createDateGrid = function createDateGrid(div) {
    return function() {
        $('#' + div).jsGrid({
            width: '100%',
            filtering: false,
            inserting: true,
            editing: true,
            sorting: true,
            paging: false,
            autoload: true,
            pageButtonCount: 5,
            deleteConfirm: 'Διαγραφή ενέργειας;',
            onItemInserted: refresh,
            onItemUpdated: refresh,
            controller: {
                loadData: function() {
                    const url = '/api/invitation/' + invitationId + '/date'
                    return $.get(url).then(res => res.rows.map(db2grid))
                },
                insertItem: function(item) {
                    const url = '/api/invitation/' + invitationId + '/date'
                    return $.post(url, grid2db(item))
                },
                updateItem: function(item) {
                    const url = '/api/invitation/' + invitationId + '/date'
                    return $.ajax({ type: 'PUT', url: url, data: grid2db(item) })
                },
                deleteItem: function(item) {
                    const url = '/api/invitation/' + invitationId + '/date'
                    return $.ajax({ type: 'DELETE', url: url, data: item })
                }
            },
            fields: [
                { name: 'ID', type: 'number', editing: false, width: 50 },
                { name: 'CallPhaseID', type: 'number', width: 70 },
                { name: 'StartDate', type: 'solRiaDateTimeField', width: 200 },
                { name: 'EndDate', type: 'solRiaDateTimeField', width: 200 },
                { name: 'isActive', type: 'checkbox', title: 'Ενεργό', sorting: false },
                { type: 'control' }
            ]
        })
    }
}
const createInvitationGrid = function createDateGrid(div) {
    return function() {
        $('#' + div).jsGrid({
            width: '100%',
            filtering: false,
            inserting: true,
            editing: true,
            sorting: true,
            paging: false,
            autoload: true,
            pageButtonCount: 5,
            deleteConfirm: 'Διαγραφή ενέργειας;',
            onItemInserted: refresh,
            onItemUpdated: refresh,
            controller: {
                loadData: function() {
                    const url = '/api/invitation'
                    return $.get(url).then(res => res.rows.map(db2grid))
                },
                insertItem: function(item) {
                    const url = '/api/invitation'
                    return $.post(url, grid2db(item))
                },
                updateItem: function(item) {
                    const url = '/api/invitation'
                    return $.ajax({ type: 'PUT', url: url, data: grid2db(item) })
                },
                deleteItem: function(item) {
                    const url = '/api/invitation'
                    return $.ajax({ type: 'DELETE', url: url, data: item })
                }
            },
            fields: [
                { name: 'ID', type: 'number', editing: false, width: 50 },
                { name: 'Name', type: 'text', width: 170 },
                { name: 'CN_Code_Mask', type: 'text', width: 70 },
                { name: 'InvitationGroup', type: 'number', width: 70 },
                { name: 'IsFinal', type: 'checkbox', title: 'Ενεργό', sorting: false },
                { type: 'control' },
                {
                    itemTemplate: function(value, item) {
                        // var $result = jsGrid.fields.control.prototype.itemTemplate.apply(this, arguments)
                        var $result = $('<div class="btn-group" role="group">')
                        const dateLink = '<a href="#!/invitation/' + item.ID + '/date" title="Έναρξη / Λήξη" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span></a>'
                        const kadLink = '<a href="#!/invitation/' + item.ID + '/kad" title="ΚΑΔ" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span></a>'
                        const userLink = '<a href="#!/invitation/' + item.ID + '/user" title="Χρήστες" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-user" aria-hidden="true"></span></a>'
                        const editLink = '<a href="#!/invitation/' + item.ID + '" title="Επεξεργασία" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></a>'
                        const cloneLink = '<button title="Αντιγραφή" data-id="' + item.ID + '"class="btn btn-info btn-sm clone-btn"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></a>'
                        return $result.append(dateLink + kadLink + userLink + editLink + cloneLink)
                    }
                }
            ]
        })
    }
}
$
$(document).ready(createDateGrid('date-grid'))
$(document).ready(createInvitationGrid('invitation-grid'))
$(document).ready('#invitation-grid').on('click', '.clone-btn', function () {
    $.post(`/api/invitation/${this.dataset.id}/clone`).then($('#invitation-grid').jsGrid('render'))
})
