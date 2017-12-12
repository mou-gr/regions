/*global Navigo $ */
var root = null
var useHash = true // Defaults to: false
var hash = '#!' // Defaults to: '#'
var router = new Navigo(root, useHash, hash)
var invitationId

// var urlBase = 'http://localhost:4000/'
var urlBase = '/api/'

var updateName = function (id, str) {
    if (id) {
        $.get(`/api/invitation/${id}/name`).then(res => $('#invitation-name').text(res.rows[0].Name + str))
    } else {
        $('#invitation-name').text(str)
    }
}

var db2grid = function(row) {
    row.isActive = row.isActive == 1
    row.isFinal = row.isFinal == 1
    return row
}
var grid2db = function(row) {
    row.isActive = row.isActive ? 1 : 0
    row.isFinal = row.isFinal ? 1 : 0
    return row
}
var refresh = function(obj) {
    obj.grid.loadData()
}

var createGrid = function createDateGrid(div, controller, fields) {
    return function() {
        $('#' + div).jsGrid({
            width: '100%',
            filtering: false,
            inserting: true,
            editing: true,
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
        loadData: function() {
            return $.get(getUrl()).then(res => res.rows.map(db2grid))
        },
        insertItem: function(item) {
            return $.post(getUrl(), grid2db(item))
        },
        updateItem: function(item) {
            return $.ajax({ type: 'PUT', url: getUrl(), data: grid2db(item) })
        },
        deleteItem: function(item) {
            return $.ajax({ type: 'DELETE', url: getUrl(), data: item })
        }
    }
}
var createDateGrid = function createDateGrid(div) {
    var controller = createController(function () {
        return urlBase + 'invitation/' + invitationId + '/date'
    })
    var fields = [
        { name: 'ID', type: 'number', editing: false, width: 50 },
        { name: 'CallPhaseID', type: 'number', width: 70 },
        { name: 'StartDate', type: 'solRiaDateTimeField', width: 200 },
        { name: 'EndDate', type: 'solRiaDateTimeField', width: 200 },
        { name: 'isActive', type: 'checkbox', title: 'Ενεργό', sorting: false },
        { type: 'control' }
    ]
    return createGrid(div, controller, fields)
}

var createInvitationGrid = function createDateGrid(div) {
    var controller = createController(function () {
        return urlBase + 'invitation/'
    })
    var fields = [
        { name: 'ID', type: 'number', editing: false, width: 50 },
        { name: 'Name', type: 'text', width: 170 },
        { name: 'CN_Code_Mask', type: 'text', width: 70 },
        { name: 'InvitationGroup', type: 'number', width: 70 },
        { name: 'IsFinal', type: 'checkbox', title: 'Ενεργό', sorting: false },
        { type: 'control' },
        {
            itemTemplate: function(value, item) {
                var $result = $('<div class="btn-group" role="group">')
                var dateLink = '<a href="#!/invitation/' + item.ID + '/date" title="Έναρξη / Λήξη" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span></a>'
                var kadLink = '<a href="#!/invitation/' + item.ID + '/kad" title="ΚΑΔ" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span></a>'
                var userLink = '<a href="#!/invitation/' + item.ID + '/user" title="Χρήστες" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-user" aria-hidden="true"></span></a>'
                var editLink = '<a href="#!/invitation/' + item.ID + '" title="Επεξεργασία" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></a>'
                var cloneLink = '<button title="Αντιγραφή" data-id="' + item.ID + '"class="btn btn-info btn-sm clone-btn"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></a>'
                return $result.append(dateLink + kadLink + userLink + editLink + cloneLink)
            }
        }
    ]
    return createGrid(div, controller, fields)
}
var createRoute = function (name, $grid) {
    return function (params) {
        invitationId = params.id
        updateName(params.id, name)
        $('.router-option').hide()
        $grid.jsGrid('loadData')
        $grid.show()
    }
}

// $(document).ready(createUserGrid('user-grid'))
$(document).ready(createDateGrid('date-grid'))
$(document).ready(createInvitationGrid('invitation-grid'))
$(document).ready('#invitation-grid').on('click', '.clone-btn', function() {
    $.post(`/api/invitation/${this.dataset.id}/clone`).then(function () {
        $('#invitation-grid').jsGrid('loadData')
    })
})
$(document).ready(function() {
    router
        .on('/', createRoute('Διαχείριση Προσκλήσεων', $('#invitation-grid')))
        .on('/invitation/:id', createRoute('', $('#invitation')))
        .on('/invitation/:id/date', createRoute(' - Έναρξη / Λήξη Ενεργειών', $('#date-grid')))
        .on('/invitation/:id/user', createRoute(' - Χρήστες', $('#user-grid')))
        .on('/invitation/:id/kad', function(params) {
            invitationId = params.id
            updateName(params.id, ' - ΚΑΔ')
            $.get('/api/invitation/' + params.id + '/kad').then(function(data) {
                $('#kad-area').text(data.rows[0].EligibleKad)
            })
            $('#update-kad').on('click', function() {
                var value = $('#kad-area').val()
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
        .resolve()
})
