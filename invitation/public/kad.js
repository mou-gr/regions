/*global $ Bloodhound*/
$(document).ready(function() {
    const invitationId = $('#invitation-id').val()
    $.ajax({
        url: '/api/invitation/' + invitationId + '/kad',
        type: 'get',
        dataType: 'json',
        cache: false,
        timeout: 5000,
        success: function(data) {
            console.log(data)
            $('#invitation-name').text(data.rows[0].Name)
            $('#kad-area').text(data.rows[0].EligibleKad)
        },
        error: function() {
            console.log('process error')
        }
    })
    $('#update-kad').on('click', function() {
        const value = $('#kad-area').val()
        console.log(value)
        const id = invitationId
        $.ajax({
            url: '/api/invitation/' + id + '/kad',
            type: 'PUT',
            dataType: 'json',
            data: JSON.stringify({
                kad: value
            }),
            contentType: 'application/json',
            cache: false,
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
})
