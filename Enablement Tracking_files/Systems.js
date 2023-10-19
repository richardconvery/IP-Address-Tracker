$(document).ready(function (e) {


    function updateSystemNotes(systemId, notes) {
        $.post('/ajax/Systems/Save.php', {
            systemId: systemId,
            notes: notes,
        }).done(function (data) {
            json = JSON.parse(data);
            if (json.response == 'OK') {
                Notifications.showMessage('Note saved successfully', 'success');
            } else {
                Notifications.showMessage('Failed to save the note', 'error');
            }
        });
    }

    function updateSystemStatus(systemId, statusId) {
        $.post('/ajax/Systems/Save.php', {
            systemId: systemId,
            status: statusId,
        }).done(function (data) {
            json = JSON.parse(data);
            if (json.response == 'OK') {
                Notifications.showMessage('Status changed successfully', 'success');
            } else {
                Notifications.showMessage('Failed to save the status', 'error');
            }
        });
    }

    $('.system-notes').on('keypress', function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            let systemId = $(this).data('systemid');
            let notes = $(this).val();
            updateSystemNotes(systemId, notes);
        }
    });

    $('.system-status').on('change', function (event) {
        let systemId = $(this).data('systemid');
        let statusId = $(this).val();
        updateSystemStatus(systemId, statusId);
    });
});