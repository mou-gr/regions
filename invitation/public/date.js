/*global $ Bloodhound*/
const db2grid = function(row) {
    row.isActive = row.isActive == 1
    return row
}
const grid2db = function(row) {
    row.isActive = row.isActive ? 1 : 0
    return row
}
const refresh = function(obj) {
    obj.grid.render()
}
const viewFormat = 'D MMM Y, hh:mm'
const storeFormat = 'Y-MM-DD hh:mm'
$(document).ready(function() {
    var SolRiaDateTimeField = function(config) {
        jsGrid.Field.call(this, config)
    }
    SolRiaDateTimeField.prototype = new jsGrid.Field({
        sorter: function(date1, date2) {
            return new Date(date1) - new Date(date2)
        },

        itemTemplate: function(value) {
            if (value === null) {
                return ''
            } else {
                return moment.utc(value).format(viewFormat)
            }
        },

        insertTemplate: function(value) {
            this._insertPicker = $('<input>').datetimepicker({
                format: viewFormat,
                defaultDate: moment(),
                widgetPositioning: {
                    horizontal: 'auto',
                    vertical: 'bottom'
                }
            })

            this._insertPicker.data('DateTimePicker').date(moment())
            return this._insertPicker
        },
        editTemplate: function(value) {
            this._editPicker = $('<input>').datetimepicker({
                format: viewFormat,
                widgetPositioning: {
                    horizontal: 'auto',
                    vertical: 'bottom'
                }
            })

            if (value !== null) {
                this._editPicker.data('DateTimePicker').defaultDate(moment(value))
                this._editPicker.data('DateTimePicker').date(moment.utc(value))
            }
            return this._editPicker
        },
        insertValue: function() {
            var insertDate = this._insertPicker.data('DateTimePicker').date()
            if (typeof insertDate !== 'undefined' && insertDate !== null) {
                return insertDate.format(storeFormat)
            } else {
                return null
            }
        },
        editValue: function() {
            var editValue = this._editPicker.data('DateTimePicker').date()
            if (typeof editValue !== 'undefined' && editValue !== null) {
                return editValue.format(storeFormat)
            } else {
                return null
            }
        }
    })
    jsGrid.fields.solRiaDateTimeField = SolRiaDateTimeField
})
$(document).ready(function() {
    const invitationId = $('#invitation-id').val()
    const url = '/api/invitation/' + invitationId + '/date'
    $.ajax({
        url: '/api/invitation/' + invitationId + '/name',
        type: 'get',
        cache: false,
        timeout: 5000,
        success: function(data) {
            $('#invitation-name').text(data.rows[0].Name)
        },
        error: function() {
            console.log('process error')
        }
    })

    $('#jsGrid').jsGrid({
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
            loadData: function(filter) {
                return $.get(url).then(res => res.rows.map(db2grid))
            },
            insertItem: function(item) {
                return $.post(url, grid2db(item))
            },
            updateItem: function(item) {
                return $.ajax({ type: 'PUT', url: url, data: grid2db(item) })
            },
            deleteItem: function(item) {
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
})
