class Auth {
    static changePassword() {
        var form = $('#modal-change-password').find('form');
        if (!form.valid()) {
            return false;
        }

        var current = $(form).find('input[name=current]').val();
        var newpassword = $(form).find('input[name=newpassword]').val();
        var newpassword2 = $(form).find('input[name=newpassword2]').val();
        var csrfToken = $(form).find('input[name=csrfToken]').val();


        $.get('/ajax/Auth/ChangePassword.php', {current: current, newpassword: newpassword, newpassword2: newpassword2, csrfToken: csrfToken}).done(function(response) {
            if(response == 'OK') {
                $('#modal-change-password').modal('hide');
                $('#modal-complete .modal-header').find('span').html('Password changed')
                $('#modal-complete .modal-body').find('span').html('Your password has been updated. You will need to use your new password the next time you log in.')
                $('#modal-complete').modal('show');
            } else {
                UI.modalError(response);
            }
        });
    }
}