$(document).ready(function (e) {
    $('#systemLogoForm').on('submit', (function (e) {
        e.preventDefault();

        //validate file input
        let fileInput = $(this).find('#editAvatarUploaderModal')[0];

        if (Files.validate(fileInput)) {
            let formData = new FormData(this);
            formData.append('method', 'uploadSystemLogo');

            $.ajax({
                type: 'POST',
                url: '/ajax.php',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                success: function (jsonStr) {
                    let json = {};
                    try {
                        json = jQuery.parseJSON(jsonStr);
                    } catch(e) {
                        Notifications.showMessage('Failed to update system logo', 'error')
                        return false;
                    }

                    if(json.response == 'OK') {
                        Notifications.showMessage('System logo updated successfully', 'success')
                    } else {
                        let errorMsg = 'Failed to update system logo';
                        if (json.error) {
                            errorMsg += ', Error - ' + json.error;
                        }
                        Notifications.showMessage(errorMsg, 'error')
                    }
                },
                error: function (data) {
                    Notifications.showMessage('Failed to update system logo', 'error')
                }
            });
        }
    }));

    $("#editAvatarUploaderModal").on("change", function () {
        $("#systemLogoForm").submit();
    });
});