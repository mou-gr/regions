$(document).ready(function() {
    $("#new-invitation").on('click', function() {
        const value = $("#fieldName").val();

        if (value === "") {
            return
        }
        $.ajax({
            url: "/userRoleType",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({name: value}),
            contentType: "application/json",
            cache: false,
            timeout: 5000,
            complete: function() {
                console.log('process complete');
                // location.reload();
            },
            success: function(data) {
                console.log(data);
                console.log('process sucess');
            },
            error: function() {
                console.log('process error');
            }
        });
    });
});
