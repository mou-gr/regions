/*global $ Bloodhound*/
$(document).ready(function() {
    const invitationId = $('#invitation-id').val()

    const cities = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('text'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        prefetch: '/users.json'
    })
    cities.initialize()

    var elt = $('#new-user-list')
    elt.tagsinput({
        itemValue: 'value',
        itemText: 'text',
        typeaheadjs: {
            name: 'cities',
            displayKey: 'text',
            source: cities.ttAdapter()
        }
    })

    $('#new-user').on('click', function() {
        const value = $('#new-user-list').val()

        if (value === '') {
            return
        }
        const role = $('input[name=optradio]:checked').val()
        $.ajax({
            url: '/userRoleType',
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify({
                invitationId: invitationId,
                role: role,
                users: value
            }),
            contentType: 'application/json',
            cache: false,
            timeout: 5000,
            complete: function() {
                console.log('process complete')
                location.reload()
            },
            success: function(data) {
                console.log(data)
                console.log('process sucess')
            },
            error: function() {
                console.log('process error')
            }
        })
    })

    $('#delete-user').on('click', function() {
        const userRoleId = $('[name=\'user-role-id\']:checked').toArray().map(el => el.value)

        if (!userRoleId) {
            return
        }
        $.ajax({
            url: '/userRoleType',
            type: 'DELETE',
            dataType: 'json',
            data: JSON.stringify({
                id: userRoleId
            }),
            contentType: 'application/json',
            cache: false,
            timeout: 5000,
            complete: function() {
                console.log('process complete')
                location.reload()
            },
            success: function(data) {
                console.log(data)
                console.log('process sucess')
            },
            error: function() {
                console.log('process error')
            }
        })
    })
})
