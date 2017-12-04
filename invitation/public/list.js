/*global $*/
$(document).ready(function() {
    $('[data-toggle=confirmation]').confirmation({
        rootSelector: '[data-toggle=confirmation]',
        // other options
    })
    $('#new-invitation').on('click', function() {
        const value = $('#fieldName').val()

        if (value === '') {
            return
        }
        $.ajax({
            url: '/invitation',
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify({
                name: value
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
    $('.rename-btn').on('click', function() {
        const value = $(this).closest('tr').find('.rename-text').val()
        if (value === '') {
            return
        }
        const id = $(this).closest('tr').find('.id').text()
        $.ajax({
            url: '/api/invitation/' + id + '/rename',
            type: 'PUT',
            dataType: 'json',
            data: JSON.stringify({
                name: value
            }),
            contentType: 'application/json',
            cache: false,
            timeout: 5000,
            complete: function(resp, status, ) {
                if (resp.responseJSON.data == 'OK') {
                    location.reload()
                } else {
                    console.log(resp, status, 'process error')
                }
            }
        })
    })
    $('.rename-mask-btn').on('click', function() {
        const value = $(this).closest('tr').find('.rename-mask').val()
        if (value === '') {
            return
        }
        const id = $(this).closest('tr').find('.id').text()
        $.ajax({
            url: '/api/invitation/' + id + '/rename-mask',
            type: 'PUT',
            dataType: 'json',
            data: JSON.stringify({
                mask: value
            }),
            contentType: 'application/json',
            cache: false,
            timeout: 5000,
            complete: function(resp, status, ) {
                if (resp.responseJSON.data == 'OK') {
                    location.reload()
                } else {
                    console.log(resp, status, 'process error')
                }
            }
        })
    })
    $('.final-checkbox').on('change', function() {
        const value = $(this).prop('checked')
        const sendVal = value ? 1 : 0
        const id = $(this).closest('tr').find('.id').text()
        $.ajax({
            url: '/api/invitation/' + id + '/final',
            type: 'PUT',
            dataType: 'json',
            data: JSON.stringify({
                IsFinal: sendVal
            }),
            contentType: 'application/json',
            cache: false,
            timeout: 5000,
            complete: function(resp, status, ) {
                if (resp.responseJSON.data == 'OK') {
                    location.reload()
                } else {
                    console.log(resp, status, 'process error')
                }
            }
        })
    })
    $('.clone-btn').on('click', function() {
        const id = $(this).closest('tr').find('.id').text()
        $.ajax({
            url: '/api/invitation/' + id + '/clone',
            type: 'POST',
            dataType: 'json',
            data: '{}',
            contentType: 'application/json',
            cache: false,
            timeout: 5000,
            complete: function(resp, status, ) {
                if (resp.responseJSON.data == 'OK') {
                    location.reload()
                } else {
                    console.log(resp, status, 'process error')
                }
            },
        })
    })
    $('.remove-btn').on('click', function() {
        const id = $(this).closest('tr').find('.id').text()
        $.ajax({
            url: '/api/invitation/' + id,
            type: 'DELETE',
            dataType: 'json',
            data: '{}',
            contentType: 'application/json',
            cache: false,
            timeout: 5000,
            complete: function(resp, status, ) {
                if (resp.responseJSON.data == 'OK') {
                    location.reload()
                } else {
                    console.log(resp, status, 'process error')
                }
            }
        })
    })
})
