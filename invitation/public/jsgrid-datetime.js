/* global $ jsGrid moment*/
const viewFormat = 'D MMM Y, HH:mm'
const storeFormat = 'Y-MM-DD HH:mm'

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

        insertTemplate: function() {
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
