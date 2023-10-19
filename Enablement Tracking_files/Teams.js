class Teams {
    static open(teamId) {
        var form = $('#modal-edit-team').find('form');

        $.getJSON('/ajax/Teams/Get.php', { teamId: teamId }).done(function (json) {
            var team = json.team;

            $(form).find('input[name=teamId]').val(teamId);
            $(form).find('input[name=name]').val(team.teamName);
            $(form).find('input[name=abbreviation]').val(team.abbreviation);
            $(form).find('select[name=parentId]').val(team.parentId);
            $(form).find('select[name=status]').val(team.isDeleted);
            $(form).find('textarea[name=description]').val(team.description);

            // Handle assigned users/teams etc.
            $('#modal-edit-team .member-item-selection').html(''); // Clear the box
            $('#modal-edit-team').find('.member-item').removeClass('selected'); // Clear the box

            // Loop through each option and trigger a click
            var assignedCount = 0;

            var members = team.members;
            for (var userId in members) {
                if (members.hasOwnProperty(userId)) {
                    $('#modal-edit-team').find('.member-item').each(function () {
                        if ($(this).data('type') == 'user' && $(this).data('id') == userId) {
                            $(this).trigger('click');
                            assignedCount++;
                        }
                    });
                }
            }
        });
    }

    static openView(teamId, buttons = []) {
        var form = $('#modal-view-team').find('form');

        $.getJSON('/ajax/Teams/Get.php', { teamId: teamId, includeTrash: true }).done(function (json) {
            var team = json.team;

            $(form).find('input[name=teamId]').val(teamId);
            $(form).find('input[name=name]').val(team.teamName);
            $(form).find('input[name=abbreviation]').val(team.abbreviation);
            $(form).find('select[name=parentId]').val(team.parentId);
            $(form).find('select[name=status]').val(team.isDeleted);
            $(form).find('textarea[name=description]').val(team.description);

            // Handle assigned users/teams etc.
            $('#modal-view-team .member-item-selection').html(''); // Clear the box
            $('#modal-view-team').find('.member-item').removeClass('selected'); // Clear the box

            // Loop through each option and trigger a click
            var assignedCount = 0;

            var members = team.members;
            for (var userId in members) {
                if (members.hasOwnProperty(userId)) {
                    $('#modal-view-team').find('.member-item').each(function () {
                        if ($(this).data('type') == 'user' && $(this).data('id') == userId) {
                            $(this).trigger('click');
                            assignedCount++;
                        }
                    });
                }
            }

            if (buttons) {
                let bContainer = form.find('#button-container');
                bContainer.html('');
                $.each(buttons, (i, params) => {
                    let button = Buttons.get(params);
                    if (button) {
                        bContainer.append(button);
                    }
                });
            }
        });
    }

    static delete(teamId) {
        if (parseInt(teamId) > 0) {
            var deleteNotes = '';
            swal.fire({
                title: 'Are you sure, you want to delete the team?',
                html: deleteNotes,
                icon: 'warning',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
                confirmButtonColor: '#d33',
                reverseButtons: true,
                showCloseButton: true,
                showCancelButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    $.getJSON('/ajax/Teams/Delete.php', { teamId: teamId }).done(function (json) {
                        if (json.response == 'OK') {
                            Notifications.showMessage('The team has been deleted.', 'success');
                            window.setTimeout(function () {
                                location.reload();
                            }, 1000);
                        }
                    });


                }
            });
        }
    }
}