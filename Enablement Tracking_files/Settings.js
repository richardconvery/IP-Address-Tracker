$(document).ready(function (e) {
    $('#userImageForm').on('submit', (function (e) {
        e.preventDefault();

        //validate file input
        let fileInput = $(this).find('#editAvatarUploaderModal')[0];

        if (Files.validate(fileInput)) {
            let formData = new FormData(this);
            formData.append('method', 'uploadUserImage');

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
                        Notifications.showMessage('Failed to update user image', 'error')
                        return false;
                    }

                    if(json.response == 'OK') {
                        let updatedImage = json.image;
                        $('#accountNavbarDropdown').find('.avatar-img').attr('src', updatedImage);
                        $('#accountNavbarDropdown').parents('.dropdown').find('.dropdown-menu').find('.avatar-img').attr('src', updatedImage);
                        
                        Notifications.showMessage('User image updated successfully', 'success')
                    } else {
                        let errorMsg = 'Failed to update user image';
                        if (json.error) {
                            errorMsg += ', Error - ' + json.error;
                        }
                        Notifications.showMessage(errorMsg, 'error')
                    }
                },
                error: function (data) {
                    Notifications.showMessage('Failed to update user image', 'error')
                }
            });
        }
    }));

    $("#editAvatarUploaderModal").on("change", function () {
        $("#userImageForm").submit();
    });
});