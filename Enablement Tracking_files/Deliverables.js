class Deliverables {
    static open(deliverableId) {
        var form = $('#modal-edit-deliverable').find('form');

        $.getJSON('/ajax/Deliverables/Get.php', {deliverableId: deliverableId}).done(function(json) {
            if (json.response == 'OK') {
                var deliverable = json.deliverable;
    
                $(form).find('input[name=deliverableId]').val(deliverableId);
                $(form).find('input[name=title]').val(deliverable.deliverable);
                $(form).find('textarea[name=description]').val(deliverable.description);
                $(form).find('.richText-editor').html(deliverable.description);
                let dueDateFp = document.querySelector('#editDueDateDeliverable')._flatpickr;
                dueDateFp.setDate(deliverable.dueDateUK);
            } else { 
                Notifications.showMessage(json.response, 'error');
            }
        });
    }

    static openView(deliverableId, buttons = [], includeDeleted = 0) {
        var form = $('#modal-view-deliverable').find('form');

        $.getJSON('/ajax/Deliverables/Get.php', {deliverableId: deliverableId, includeDeleted: includeDeleted}).done(function(json) {
            var deliverable = json.deliverable;

            $(form).find('input[name=deliverableId]').val(deliverableId);
            $(form).find('input[name=title]').val(deliverable.deliverable);
            $(form).find('textarea[name=description]').val(deliverable.description);
            $(form).find('.richText-editor').html(deliverable.description);
            $(form).find('input[name=dueDate]').val(deliverable.dueDateUK);
            let dueDateFp = document.querySelector('#viewDueDateDeliverable')._flatpickr;
            dueDateFp.setDate(deliverable.dueDateUK);

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

    static delete(obj) {
        var deliverableId = $(obj).closest('form').find('input[name=deliverableId]').val();
        if(deliverableId > 0) {
            var deleteNotes = '';
    
            swal.fire({
                title: 'Are you sure you want to delete this deliverable?',
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
                    $.get('/ajax/Deliverables/Delete.php', {deliverableId: deliverableId}).done(function(response) {
                        if(response == 'OK') {
                            location.reload(true);
                        } else {
                            let errorMsg = 'Failed to delete the deliverable';
                            if (response) {
                                errorMsg += '. Error - ' + response;
                            }
                            Notifications.showMessage(errorMsg, 'error');
                        }
                    });
    
    
                }
            });
        }
    }
    
    static addList(obj) {
        var form = $(obj).closest('form');
        var list = $(form).find('textarea[name=list]').val();
        var projectId = $(form).find('input[name=projectId]').val();

        if(list != '') {
            $.ajax({
                url: '/ajax/Deliverables/AddList.php',
                type: 'post',
                data: {
                    projectId: projectId,
                    list: list,
                },
                dataType: 'json',
                success: function(json) {
                    console.log(json);
                    if(json.response == 'OK') {
                        location.reload(true); // Todo - look at adding all of the tasks using ajax
                    } else {
                        UI.modalError('Error adding multiple deliverables, please try again');
                    }
                },
                error: function() {
                    UI.modalError('Error adding multiple deliverables, please check connection and try again');
                },
            });
        } else {
            UI.modalError('Please enter a deliverable');
        }
    }
}