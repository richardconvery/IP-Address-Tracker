class Alerts {
    static alert(msg, params) {
        $('#modal-alert .modal-message').html(msg);
        $('#modal-alert').modal();
        // Todo - handle params to change the 'alert' button text, include icons etc.
    }

    static confirm(msg, params) {
        $('#modal-confirm .modal-message').html(msg);
        $('#modal-confirm').modal();
        // Todo - handle params to change the 'confirm' button text, include icons etc.

        var confirmation = $.Deferred();

        $('#modal-confirm')
            .off('click')
            .on('click', '.btn-primary', function() {
                confirmation.resolve();
                $('#modal-confirm').modal('hide');
            })
            .on('click', '.btn-cancel', function() {
                confirmation.reject();
                $('#modal-confirm').modal('hide');
            });

        return confirmation.promise();
    }
}