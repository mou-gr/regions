/*global Navigo $ ace*/
var root = null
var useHash = true // Defaults to: false
var hash = '#!' // Defaults to: '#'
var router = new Navigo(root, useHash, hash)
var invitationId

let callPhaseList = [
    { value: '', label: ''},
    { value: 1985, label: '1985 - Ηλ. Υποβολή/Submission of the Proposal (AF) [electronic submission]'},
    { value: 2031, label: '2031 - Συμπληρωματικά Έγγραφα'},
    { value: 2054, label: '2054 - Έλεγχος Πληρότητας'},
    { value: 2061, label: '2061 - Αξιολόγηση Προτάσεων'},
    { value: 2073, label: '2073 - Γνωμοδοτική Ένταξης'},
    { value: 2123, label: '2123 - Αίτηση Ένστασης'},
    { value: 2125, label: '2125 - Αξιολόγηση Ένστασης'},
    { value: 2129, label: '2129 - Αίτηση Προκαταβολής'},
    { value: 2131, label: '2131 - Αξιολόγηση Αίτησης Προκαταβολής'},
    { value: 2170, label: '2170 - Εκταμίευση Προκαταβολής'},
    { value: 2171, label: '2171 - Παραλαβή Φυσικού Φακελού'},
    { value: 2177, label: '2177 - Αίτημα Ενδιάμεσης Καταβολής Ενίσχυσης (Ελέγχου)'},
    { value: 2178, label: '2178 - Έκθεση Ενδιάμεσης Επαλήθευσης (Ελέγχου)'},
    { value: 2179, label: '2179 - Έκθεση Ενδιάμεσης Πιστοποίησης'},
    { value: 2345, label: '2345 - Ενδιάμεσος Έλεγχος Δικαιολογητικών'},
    { value: 2351, label: '2351 - Ενδιάμεση Καταβολή Ενίσχυσης (Εκταμίευση)'},
    { value: 2357, label: '2357 - Αίτημα Τροποποίησης'},
    { value: 2378, label: '2378 - Χρήση Καταπιστευτικού Λογαριασμού'},
    { value: 2403, label: '2403 - Αξιολόγηση Τροποποίησης'},
    { value: 2429, label: '2429 - Αίτημα Τελικής Καταβολής Ενίσχυσης (Ελέγχου)'},
    { value: 2431, label: '2431 - Έκθεση Τελικής Επαλήθευσης (Ελέγχου)'},
    { value: 2432, label: '2432 - Έκθεση Τελικής Πιστοποίησης'},
    { value: 2433, label: '2433 - Τελικός Έλεγχος Δικαιολογητικών'},
    { value: 2434, label: '2434 - Τελική Καταβολή Ενίσχυσης (Εκταμίευση)'},
    { value: 2485, label: '2485 - Αντίρρηση Ενδιάμεσης Πιστοποίησης'},
    { value: 2486, label: '2486 - Αξιολόγηση Αντιρρήσεων Ενδιάμεσης Πιστοποίησης'},
    { value: 2489, label: '2489 - Αντίρρηση Τελικής Πιστοποίησης'},
    { value: 2491, label: '2491 - Αξιολόγηση Αντίρρησης Τελικής Πιστοποίησης'},
    { value: 2561, label: '2561 - Απογραφικό Δελτίο'},
    { value: 2769, label: '2769 - Αίτημα Μακροχρόνιων Υποχρεώσεων'},
    { value: 2781, label: '2781 - Έλεγχος Μακροχρόνιων Υποχρεώσεων'},
    { value: 2782, label: '2782 - Αξιολόγηση Αντιρρήσεων Μακροχρόνιων Υποχρεώσεων'}	
];

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
        {   name: 'CallPhaseID',
            type: 'select',
            align: "left",
            width: 400,
            items: callPhaseList,
            valueField: "value",
            textField: "label",
        },
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
        { name: 'tags', type: 'text', width: 60 },
        { type: 'control' },
        {
            itemTemplate: function (value, item) {
                var $result = $('<div class="btn-group" role="group">')
                var dateLink = '<a href="#!/invitation/' + item.ID + '/date" title="Έναρξη / Λήξη" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span></a>'
                var kadLink = '<a href="#!/invitation/' + item.ID + '/kad" title="ΚΑΔ" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span></a>'
                var userLink = '<a href="#!/invitation/' + item.ID + '/user" title="Χρήστες" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-user" aria-hidden="true"></span></a>'
                var editLink = '<a href="#!/invitation/' + item.ID + '" title="Επεξεργασία" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></a>'
                var cloneLink = '<button title="Αντιγραφή" data-id="' + item.ID + '"class="btn btn-info btn-sm clone-btn"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span>'
                var compareLink = '<button title="Σύγκριση" data-id="' + item.ID + '"class="btn btn-success btn-sm diff-btn"><span class="glyphicon glyphicon-sunglasses" aria-hidden="true"></span>'
                return $result.append(dateLink + kadLink + userLink + editLink + cloneLink + compareLink)
            },
            width: 120
        },
        {
            itemTemplate: function () {
                return $('<div class="compareResult"></div>')
            },
            width: 80
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
    const userArray =  userList.replaceAll(', ',',').split(',');
    userArray.forEach(user => {
        $.post(`${urlBase}userRoleType`, { id: invitationId, userList: user, role: role })
            .then(reload($('#user-grid')))
    });
}))
$(document).ready(createDateGrid('date-grid'))
$(document).ready(createInvitationGrid('invitation-grid'))
$(document).ready($('#invitation-grid').on('click', '.clone-btn', function () {
    $.post(`${urlBase}invitation/${this.dataset.id}/clone`)
        .then(reload($('#invitation-grid')))
        .catch(function (error) {
            $.notify({
                message: error.responseText
            }, {
                type: 'danger',
                placement: {
                    align: 'center'
                }
            })
        })
}))
const compareRow = function (showModal, $btn) {
    const id = $btn.data('id')
    $.get(`${urlBase}compare/${id}`)
        .then(resp => {
            const print = resp.length <= 5 ? resp : resp.slice(0, 5).concat(['...'])
            $btn.closest('tr')
                .find('.compareResult')
                .html(`<ul class="list-unstyled" style="line-height: 85%;font-size:80%">${print.map(el => '<li>' + JSON.stringify(el) + '</li>').join('')}</ul>`)
            if (showModal) {
                $('#difference-details').modal('show')
                const editor = ace.edit('diff-preview')
                editor.setOptions({
                    maxLines: 50,
                    autoScrollEditorIntoView: true
                })
                editor.setTheme('ace/theme/chrome')
                editor.session.setMode('ace/mode/json')
                editor.setValue(JSON.stringify(resp, null, 2), -1)
            }
        })
}
$(document).ready(() => {
    const invitationGrid = document.getElementById('invitation-grid')
    invitationGrid.addEventListener('click', (e) => {
        const $btn = $(e.target).closest('button')
        if (!$btn.hasClass('diff-btn')) { return }
        compareRow(true, $btn)
        e.stopPropagation()
    }, true)
})

$(document).ready($('#compare-button').on('click', function () {
    $('#invitation-grid').find('.diff-btn').each((index, el) => compareRow(false, $(el)))
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
