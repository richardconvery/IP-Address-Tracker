class Events {
    static save(form) {
        let formData = $('#form').serialize();
        $.getJSON('/ajax/Tasks/Save.php', formData).done(function (json) {
            if (json.response == 'OK') {
                if (taskId > 0) {
                    if (close) $('#' + form).trigger('reset');

                } else {

                }
            }
        }).fail(function () {

        });
    }

    static load(eventId) {
        let target = $('#editEventForm');

        $('[data-step="1"]').trigger('click');

        $.getJSON('/ajax/Events/Get.php', { eventId: eventId }).done(function (json) {
            let event = json.event;

            $(target).find('input[name=eventId]').val(eventId);

            $(target).find('input[name=title]').val(event.title);
            $(target).find('textarea[name=description]').val(event.description);
            let startDateFp = document.querySelector('#editEventStartDate')._flatpickr;
            startDateFp.setDate(event.startDateUk);
            let dueDateFp = document.querySelector('#editEventEndDate')._flatpickr;
            dueDateFp.setDate(event.endDateUk);

            // Handle assigned users etc.
            $('#modal-edit-event-members .member-item-selection').html(''); // Clear the box
            $('#modal-edit-event-members').find('.member-item').removeClass('selected'); // Clear the box

            // Loop through each option and trigger a click
            let assignedCount = 0;
            $(event.assignedTo.users).each(function (key, userId) {
                $('#modal-edit-event-members').find('.member-item').each(function () {
                    if ($(this).data('type') == 'user' && $(this).data('id') == userId) {
                        $(this).trigger('click');
                        assignedCount++;
                    }
                });
            });

            // Assigned
            if (assignedCount > 0) {
                $('[data-type="assigned-count"]').html(' (' + assignedCount + ')');
            } else {
                $('[data-type="assigned-count"]').html('');
            }
        });
    }

    static delete(eventId) {
        swal.fire({
            title: 'Are you sure, you want to delete the event?',
            icon: 'warning',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            confirmButtonColor: '#d33',
            reverseButtons: true,
            showCloseButton: true,
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                $.getJSON('/ajax/Events/Delete.php', { eventId: eventId }).done(function (json) {
                    if (json.response == 'OK') {
                        $('[data-eventid="' + eventId + '"]').fadeOut('', function () {
                            $('[data-eventid="' + eventId + '"]').hide();
                        });
                        Notifications.showMessage('Event deleted successfully', 'success');
                    }
                });
            }
        });
    }
}