class Tasks {
    static save(form, close) {
        var movingProject = false; // If this is true, we want to remove the task from the screen when saving
        var taskId = $('#' + form + ' input[name=taskId]').val(); // If this is set, we're editing the task
        if (taskId > 0) {
            // DD - 1/11/21 - When editing a task, users can now change a task's project
            var projectId = $('#' + form + ' input[name=origProjectId]').val();
            var newProjectId = $('#' + form + ' select[name=projectId]').val();
            if (projectId != newProjectId) {
                projectId = newProjectId;
                movingProject = true;
            }
        } else {
            var projectId = $('#' + form + ' input[name=projectId]').val();
        }
        var title = $('#' + form + ' input[name=title]').val();
        var description = $('#' + form + ' textarea[name=description]').val();
        var statusId = $('#' + form + ' select[name=statusId]').val();
        var deliverableId = $('#' + form + ' select[name=deliverableId]').val();
        var userId = $('#' + form + ' select[name=userId]').val();
        var startDate = $('#' + form + ' input[name=startDate]').val();
        var dueDate = $('#' + form + ' input[name=dueDate]').val();
        var duration = $('#' + form + ' input[name=duration]').val();
        var durationType = $('#' + form + ' select[name=durationType]').val();
        var priority = 0;
        if ($('#' + form + ' input[name=priority]').is(':checked')) {
            priority = 1;
        }

        var teams = [];
        var i = 0;
        $("#" + form + " input[name='teams[]']").each(function () {
            if ($(this).is(':checked')) {
                teams[i] = $(this).val();
                i++;
            }
        });

        var roles = [];
        var i = 0;
        $("#" + form + " input[name='roles[]']").each(function () {
            if ($(this).is(':checked')) {
                roles[i] = $(this).val();
                i++;
            }
        });

        var users = [];
        var i = 0;
        $("#" + form + " input[name='users[]']").each(function () {
            if ($(this).is(':checked')) {
                users[i] = $(this).val();
                i++;
            }
        });

        if (typeof taskId == 'undefined') taskId = 0;
        if (typeof close == 'undefined') close = false;

        var newTaskId = 0;

        if (title == '') {
            Alerts.alert('Please give task a title');
            $('#' + form + ' input[name=title]').focus();
        } else {
            var method = 'addTask';
            if (taskId > 0) method = 'editTask';
            $.getJSON('/ajax/Tasks/Save.php', { method: method, projectId: projectId, taskId: taskId, title: title, description: description, userId: userId, statusId: statusId, startDate: startDate, dueDate: dueDate, duration: duration, durationType: durationType, deliverableId: deliverableId, priority: priority, teams: teams, roles: roles, users: users }).done(function (json) {
                if (json.response == 'OK') {
                    if (taskId == 0) {
                        newTaskId = json.taskId;
                    }
                    Notifications.footer('Task saved', 'fas fa-check-circle text-brand-colour-2');
                    if (taskId > 0) {
                        if (close) $('#' + form).trigger('reset');
                        if (json.html != '') { // If no html is passed over it's because the user's current filter omits the task from their view
                            if (json.origStatusId == statusId) {
                                $('[data-taskid="' + taskId + '"]').replaceWith(json.html);
                            } else {
                                $('[data-taskid="' + taskId + '"]').remove();
                                $('#projectTaskStatusBottomAdd' + statusId).append(json.html);
                                // Reduce the original status count by 1 and increase the new status by 1
                                if (!movingProject) {
                                    var origStatusCount = parseInt($('[data-status-count="' + json.origStatusId + '"]').html());
                                    if (origStatusCount > 0) origStatusCount -= 1;
                                    $('[data-status-count="' + json.origStatusId + '"]').html(origStatusCount);
                                    var newStatusCount = parseInt($('[data-status-count="' + statusId + '"]').html());
                                    newStatusCount += 1;
                                    $('[data-status-count="' + statusId + '"]').html(newStatusCount);
                                }
                            }
                        }

                        // Has the task moved projects?
                        if (movingProject) {
                            $('[data-taskid="' + taskId + '"]').fadeOut('', function () {
                                $('[data-taskid="' + taskId + '"]').remove();
                                // Reduce this task's status count by 1
                                var statusCount = parseInt($('[data-status-count="' + json.origStatusId + '"]').html());
                                if (statusCount > 0) statusCount -= 1;
                                $('[data-status-count="' + json.origStatusId + '"]').html(statusCount);
                            });
                        }

                        // We also need to clear the list of assigned teams/roles/users
                        if (close) {
                            $('#' + form + ' .filter-applied').each(function () {
                                if (!$(this).hasClass('clear')) {
                                    $(this).remove();
                                }
                            });
                        }
                    } else {
                        if (json.html != '') {
                            if (priority > 0) {
                                $('#projectTaskStatusTopAdd' + statusId).append(json.html);
                            } else {
                                $('#projectTaskStatusBottomAdd' + statusId).append(json.html);
                            }
                        }

                        $('#' + form).trigger('reset');
                        // We also need to clear the list of assigned teams/roles/users
                        $('#' + form + ' .filter-applied').each(function () {
                            if (!$(this).hasClass('clear')) {
                                $(this).remove();
                            }
                        });
                        $('#' + form + ' .container-checkbox').removeClass('checked');
                    }
                    if (close) {
                        $(document).sidebar('close');
                    } else if (newTaskId > 0) {
                        Tasks.open(null, newTaskId, true);
                    }
                } else {
                    console.log('Response ' + json.response);
                }
            }).fail(function () {

            });
        }
    }

    // This was 'editTask' but doesn't seem to be used anywhere
    static edit(e, taskId) {
        if (clicked != null && clicked.target.tagName == 'I' && clicked.target.onclick != null) {
            // Don't launch the task if the user has clicked the 'tick' icon to mark the task as completed
        } else {
            $.getJSON('/ajax.php', { method: 'getProjectTask', taskId: taskId }).done(function (json) {

            });
        }
    }

    // DD - 1/4/22 - This is the new function - move this up and sort it all out!
    static load(event, taskId, tab) {
        var target = $('#modal-edit-task').find('form');
        $(target).find('.copy-link').html('Copy Link');
        $(target).find('.copy-link').removeClass('active');

        target.find('.compare-start-date-message').text('');
        target.find('.compare-due-date-message').text('');

        // Move to the correct tab
        $('[data-step="1"]').trigger('click');

        $.getJSON('/ajax/Tasks/Get.php', { taskId: taskId }).done(function (json) {
            var task = json.task;
            var userId = json.userId;
            // Set task name in the modal title
            let modalTitle = target.find('.modal-title');
            let newtitle = 'Edit task - ' + task.task;
            modalTitle.html(newtitle);
            $(target).find('.copy-link-value').val(task.link);
            $(target).find('input[name=taskId]').val(taskId);

            $(target).find('input[name=title]').val(task.task);
            $(target).find('select[name=statusId]').val(task.statusId);
            $(target).find('select[name=projectId]').val(task.projectId);
            $(target).find('select[name=deliverableId]').val(task.deliverableId);
            // Set text in the quill editor 
            let divContainer = document.getElementById('editTaskQuillDescription');
            let quillInstance = Quill.find(divContainer);
            let delta = quillInstance.clipboard.convert(task.description);
            quillInstance.setContents(delta, 'silent');

            let startDateFp = document.querySelector('#editStartDateTask')._flatpickr;
            startDateFp.setDate(task.startDateUk);
            let dueDateFp = document.querySelector('#editDueDateTask')._flatpickr;
            dueDateFp.setDate(task.dueDateUk);
            $(target).find('input[name=duration]').val(task.duration);
            $(target).find('select[name=durationType]').val(task.durationType);
            $(target).find('select[name=deliverableId]').val(((task.deliverableId == 0)) ? '' : task.deliverableId);

            // Handle assigned users/teams etc.
            $('#modal-edit-task-members .member-item-selection').html(''); // Clear the box
            $('#modal-edit-task-members').find('.member-item').removeClass('selected'); // Clear the box

            // Loop through each option and trigger a click
            var assignedCount = 0;
            $(task.assignedTo.users).each(function (key, userId) {
                $('#modal-edit-task-members').find('.member-item').each(function () {
                    if ($(this).data('type') == 'user' && $(this).data('id') == userId) {
                        $(this).trigger('click');
                        assignedCount++;
                    }
                });
            });

            $(task.assignedTo.teams).each(function (key, teamId) {
                $('#modal-edit-task-members').find('.member-item').each(function () {
                    if ($(this).data('type') == 'team' && $(this).data('id') == teamId) {
                        $(this).trigger('click');
                        assignedCount++;
                    }
                });
            });

            $(task.assignedTo.roles).each(function (key, roleId) {
                $('#modal-edit-task-members').find('.member-item').each(function () {
                    if ($(this).data('type') == 'role' && $(this).data('id') == roleId) {
                        $(this).trigger('click');
                        assignedCount++;
                    }
                });
            });

            // Files
            if (task.files > 0) {
                $('[data-type="files-count"]').html(' (' + task.files + ')');
            } else {
                $('[data-type="files-count"]').html('');
            }

            // Comments
            if (task.id == "945") {
                $("#comments-list").hide();
                $("#comments-list-demo").show();
            } else  if (task.comments > 0 ) {
                $('[data-type="comments-count"]').html(' (' + task.comments + ')');
                $('[data-type="comments-list"]').show();
                $("#comments-list-demo").hide();


                var comments = '';
                var i = 0;

                $(task.commentsarr).each(function (key, comment) {
                    i++;
                    comments += '<div class="card ' + (i > 1 ? 'mt-2' : '') + ((comment.addedBy == userId) ? " comment-right-side-card" : " comment-left-side-card") + ((UI.isInternalRecord(comment.addedBy))? " internal-task-comment":" ") +  '">';
                    comments += '<div class="card-body">';
                    comments += '<div class="row no-gutters">';
                    comments += '<div class="d-flex">';
                    comments += '<div class="flex-shrink-0">';
                    comments += comment.avatar;
                    comments += '</div>';
                    comments += '<div class="flex-grow-1 ms-3">';
                    comments += '<div class="row">';
                    comments += '<div class="col-sm-auto mb-sm-0">';
                    comments += '<span class="d-block text-dark">' + comment.poster + '</span>';
                    comments += '<small class="d-block text-muted">' + comment.ukdate + '</small>';
                    comments += comment.note;
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '<div class="flex-shrink-0">';
                    comments += '<div class="card-pinned custom-pin-tog">';
                    comments += '<div class="card-pinned-top-end">';
                    comments += '<div class="dropdown" data-display="static">';
                    comments += '<button type="button" class="btn btn-ghost-secondary btn-icon btn-sm rounded-circle" id="connectionsDropdown2" data-bs-toggle="dropdown" aria-expanded="true">';
                    comments += '<i class="bi-three-dots-vertical"></i>';
                    comments += '</button>';
                    comments += '<div class="dropdown-menu dropdown-menu-sm dropdown-menu-end" aria-labelledby="connectionsDropdown2" style="margin: 0.5rem 0px 0px; position: absolute; inset: 0px 0px auto auto; transform: translate(0px, 32px);" data-display="static" data-popper-placement="bottom-end">';
                    comments += '<a class="dropdown-item js-clipboard text-primary" href="javascript:;" >';
                    comments += '<i class="bi-pencil pe-2 text-muted"></i> Edit Comment';
                    comments += '</a>';
                    comments += '<a class="dropdown-item js-clipboard text-primary" href="javascript:;">';
                    comments += '<i class="bi-eye-slash pe-2 text-muted"></i> Make internal';
                    comments += '</a>';
                    comments += '<a class="dropdown-item text-danger border-top" href="javascript:;" onclick="Tasks.delete(899,event);"><i class="bi bi-trash focus pe-2 text-danger"></i> Delete</a>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '<div class="clearfix"></div>';
                });
                $('[data-type="comments-list"]').html(comments);
            } else {
                $('[data-type="comments-count"]').html('');
                $('[data-type="comments-list"]').hide();
            }

            // Assigned
            if (assignedCount > 0) {
                $('[data-type="assigned-count"]').html(' (' + assignedCount + ')');
            } else {
                $('[data-type="assigned-count"]').html('');
            }
            // Show task added by in the modal
            $(target).find('#task-added-by').html(task.addedByName);
            UI.confirmWithoutSave('modal-edit-task');
        });

        if (tab != '') {
            // Todo
        }
    }

    static openEditModal(taskId) {
        var target = $('#modal-edit-task').find('form');
        $(target).find('.copy-link').html('Copy Link');
        $(target).find('.copy-link').removeClass('active');
        // Move to the correct tab
        $.getJSON('/ajax/Tasks/Get.php', { taskId: taskId }).done(function (json) {
            var task = json.task;
            if (!task) {
                let errorMsg = json.response ? json.response : 'Failed to get the task details';
                Notifications.showMessage(errorMsg, 'error');
                return false;
            }
            var userId = json.userId;
            // Set task name in the modal title
            let modalTitle = target.find('.modal-title');
            let newtitle = 'Edit task - ' + task.task;
            modalTitle.html(newtitle);
            $(target).find('.copy-link-value').val(task.link);

            $(target).find('input[name=taskId]').val(taskId);

            $(target).find('input[name=title]').val(task.task);
            $(target).find('select[name=statusId]').val(task.statusId);
            $(target).find('select[name=projectId]').val(task.projectId);
            $(target).find('select[name=deliverableId]').val(task.deliverableId);
            $(target).find('textarea[name=description]').val(task.description);
            let startDateFp = document.querySelector('#editStartDateTask')._flatpickr;
            startDateFp.setDate(task.startDateUk);
            let dueDateFp = document.querySelector('#editDueDateTask')._flatpickr;
            dueDateFp.setDate(task.dueDateUk);
            $(target).find('input[name=duration]').val(task.duration);
            $(target).find('select[name=durationType]').val(task.durationType);
            $(target).find('select[name=deliverableId]').val(((task.deliverableId == 0)) ? '' : task.deliverableId);

            // Handle assigned users/teams etc.
            $('#modal-edit-task-members .member-item-selection').html(''); // Clear the box
            $('#modal-edit-task-members').find('.member-item').removeClass('selected'); // Clear the box

            // Loop through each option and trigger a click
            var assignedCount = 0;
            $(task.assignedTo.users).each(function (key, userId) {
                $('#modal-edit-task-members').find('.member-item').each(function () {
                    if ($(this).data('type') == 'user' && $(this).data('id') == userId) {
                        $(this).trigger('click');
                        assignedCount++;
                    }
                });
            });

            $(task.assignedTo.teams).each(function (key, teamId) {
                $('#modal-edit-task-members').find('.member-item').each(function () {
                    if ($(this).data('type') == 'team' && $(this).data('id') == teamId) {
                        $(this).trigger('click');
                        assignedCount++;
                    }
                });
            });

            $(task.assignedTo.roles).each(function (key, roleId) {
                $('#modal-edit-task-members').find('.member-item').each(function () {
                    if ($(this).data('type') == 'role' && $(this).data('id') == roleId) {
                        $(this).trigger('click');
                        assignedCount++;
                    }
                });
            });

            // Files
            if (task.files > 0) {
                $('[data-type="files-count"]').html(' (' + task.files + ')');
            } else {
                $('[data-type="files-count"]').html('');
            }

            // Comments
            if (task.comments > 0) {
                $('[data-type="comments-count"]').html(' (' + task.comments + ')');
                $('[data-type="comments-list"]').show();

                var comments = '';
                var i = 0;

                $(task.commentsarr).each(function (key, comment) {
                    i++;
                    comments += '<div class="card ' + (i > 1 ? 'mt-2' : '') + ((comment.addedBy == userId) ? " comment-right-side-card" : " comment-left-side-card") + ((UI.isInternalRecord(comment.addedBy))? " internal-task-comment":" ")+'">';
                    comments += '<div class="card-body">';
                    comments += '<div class="row no-gutters">';
                    comments += '<div class="d-flex">';
                    comments += '<div class="flex-shrink-0">';
                    comments += comment.avatar;
                    comments += '</div>';
                    comments += '<div class="flex-grow-1 ms-3">';
                    comments += '<div class="row">';
                    comments += '<div class="col-sm-auto mb-sm-0">';
                    comments += '<span class="d-block text-dark">' + comment.poster + '</span>';
                    comments += '<small class="d-block text-muted">' + comment.ukdate + '</small>';
                    comments += comment.note;
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '<div class="clearfix"></div>';
                });
                $('[data-type="comments-list"]').html(comments);
            } else {
                $('[data-type="comments-count"]').html('');
                $('[data-type="comments-list"]').hide();
            }

            // Assigned
            if (assignedCount > 0) {
                $('[data-type="assigned-count"]').html(' (' + assignedCount + ')');
            } else {
                $('[data-type="assigned-count"]').html('');
            }
            // Show task added by in the modal
            $(target).find('#task-added-by').html(task.addedByName);

            let taskModal = new bootstrap.Modal(document.getElementById("modal-edit-task"), {});
            taskModal.show();
            UI.confirmWithoutSave('modal-edit-task');
        });
    }

    static loadView(event, taskId, buttons = []) {
        var target = $('#modal-view-task').find('form');
        $(target).find('.copy-link').html('Copy Link');
        $(target).find('.copy-link').removeClass('active');

        // Move to the correct tab
        $('[data-step="1"]').trigger('click');

        // $.getJSON('/ajax/Tasks/GetTaskStatus.php', { taskId: taskId }).done(function (json) {
        //     var $el = $(target).find('select[name=statusId]');
        //     $el.html(' ');
        //     var taskStatus = json.taskStatus;
        //     $.each(taskStatus, function(key, value) {
        //         $el.append($("<option></option>")
        //         .attr("value", key).text(value));
        //     });
        // });

        $.getJSON('/ajax/Tasks/Get.php', { taskId: taskId }).done(function (json) {
            var task = json.task;
            var userId = json.userId;
            // Set task name in the modal title
            let modalTitle = target.find('.modal-title');
            let newtitle = 'View task - ' + task.task;
            modalTitle.html(newtitle);
            $(target).find('.copy-link-value').val(task.link);

            $(target).find('input[name=taskId]').val(taskId);

            $(target).find('input[name=title]').val(task.task);
            $(target).find('select[name=statusId]').val(task.statusId);
            $(target).find('select[name=projectId]').val(task.projectId);
            $(target).find('select[name=deliverableId]').val(task.deliverableId);
            $(target).find('textarea[name=description]').val(task.description);
            let startDateFp = document.querySelector('#editStartDateTask')._flatpickr;
            startDateFp.setDate(task.startDateUk);
            let dueDateFp = document.querySelector('#editDueDateTask')._flatpickr;
            dueDateFp.setDate(task.dueDateUk);
            $(target).find('input[name=duration]').val(task.duration);
            $(target).find('select[name=durationType]').val(task.durationType);
            $(target).find('select[name=deliverableId]').val(((task.deliverableId == 0)) ? '' : task.deliverableId);

            if(parseInt(task.isCompleted) == 1){
                $(target).find('#submit-update-task-form').css('display','none');
            }else{
                $(target).find('#submit-update-task-form').css('display','block');
            }

            // Handle assigned users/teams etc.
            // $('#modal-edit-task-members .member-item-selection').html(''); // Clear the box
            // $('#modal-edit-task-members').find('.member-item').removeClass('selected'); // Clear the box

            // // Loop through each option and trigger a click
            var assignedCount = 0;
            // $(task.assignedTo.users).each(function (key, userId) {
            //     $('#modal-edit-task-members').find('.member-item').each(function () {
            //         if ($(this).data('type') == 'user' && $(this).data('id') == userId) {
            //             $(this).trigger('click');
            //             assignedCount++;
            //         }
            //         $(this).prop('onclick', null);
            //     });
            // });

            // $(task.assignedTo.teams).each(function (key, teamId) {
            //     $('#modal-edit-task-members').find('.member-item').each(function () {
            //         if ($(this).data('type') == 'team' && $(this).data('id') == teamId) {
            //             $(this).trigger('click');
            //             assignedCount++;
            //         }
            //         $(this).prop('onclick', null);
            //     });
            // });

            // $(task.assignedTo.roles).each(function (key, roleId) {
            //     $('#modal-edit-task-members').find('.member-item').each(function () {
            //         if ($(this).data('type') == 'role' && $(this).data('id') == roleId) {
            //             $(this).trigger('click');
            //             assignedCount++;
            //         }
            //         $(this).prop('onclick', null);
            //     });
            // });

            // // Files
            // if (task.files > 0) {
            //     $('[data-type="files-count"]').html(' (' + task.files + ')');
            // } else {
            //     $('[data-type="files-count"]').html('');
            // }

            // Comments
            if (task.comments > 0) {
                $('[data-type="comments-count"]').html(' (' + task.comments + ')');
                $('[data-type="comments-list"]').show();

                var comments = '';
                var i = 0;

                $(task.commentsarr).each(function (key, comment) {
                    i++;
                    comments += '<div class="card ' + (i > 1 ? 'mt-2' : '') + ((comment.addedBy == userId) ? " comment-right-side-card" : " comment-left-side-card") + ((UI.isInternalRecord(comment.addedBy))? " internal-task-comment":" ") + '">';
                    comments += '<div class="card-body">';
                    comments += '<div class="row no-gutters">';
                    comments += '<div class="d-flex">';
                    comments += '<div class="flex-shrink-0">';
                    comments += comment.avatar;
                    comments += '</div>';
                    comments += '<div class="flex-grow-1 ms-3">';
                    comments += '<div class="row">';
                    comments += '<div class="col-sm-auto mb-sm-0">';
                    comments += '<span class="d-block text-dark">' + comment.poster + '</span>';
                    comments += '<small class="d-block text-muted">' + comment.ukdate + '</small>';
                    comments += comment.note;
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '<div class="clearfix"></div>';
                });
                $('[data-type="comments-list"]').html(comments);
            } else {
                $('[data-type="comments-count"]').html('');
                $('[data-type="comments-list"]').hide();
            }

            // Assigned
            if (assignedCount > 0) {
                $('[data-type="assigned-count"]').html(' (' + assignedCount + ')');
            } else {
                $('[data-type="assigned-count"]').html('');
            }

            if (buttons) {
                let bContainer = target.find('#button-container');
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

    static getComments(taskId, userId) {
        $.getJSON('/ajax/Tasks/Get.php', { taskId: taskId }).done(function (json) {
            var task = json.task;

            // Comments
            if (task.comments > 0) {
                $('[data-type="comments-count"]').html(' (' + task.comments + ')');
                $('[data-type="comments-list"]').show();

                var comments = '';
                var i = 0;

                $(task.commentsarr).each(function (key, comment) {
                    i++;
                    comments += '<div class="card ' + (i > 1 ? 'mt-2' : '') + ((comment.addedBy == userId) ? " comment-right-side-card" : " comment-left-side-card") + ((UI.isInternalRecord(comment.addedBy))? " internal-task-comment":" ") + '">';
                    comments += '<div class="card-body">';
                    comments += '<div class="row no-gutters">';
                    comments += '<div class="d-flex">';
                    comments += '<div class="flex-shrink-0">';
                    comments += comment.avatar;
                    comments += '</div>';
                    comments += '<div class="flex-grow-1 ms-3">';
                    comments += '<div class="row">';
                    comments += '<div class="col-sm-auto mb-sm-0">';
                    comments += '<span class="d-block text-dark">' + comment.poster + '</span>';
                    comments += '<small class="d-block text-muted">' + comment.ukdate + '</small>';
                    comments += comment.note;
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '<div class="flex-shrink-0">';
                    comments += '<div class="card-pinned custom-pin-tog">';
                    comments += '<div class="card-pinned-top-end">';
                    comments += '<div class="dropdown" data-display="static">';
                    comments += '<button type="button" class="btn btn-ghost-secondary btn-icon btn-sm rounded-circle" id="connectionsDropdown2" data-bs-toggle="dropdown" aria-expanded="true">';
                    comments += '<i class="bi-three-dots-vertical"></i>';
                    comments += '</button>';
                    comments += '<div class="dropdown-menu dropdown-menu-sm dropdown-menu-end" aria-labelledby="connectionsDropdown2" style="margin: 0.5rem 0px 0px; position: absolute; inset: 0px 0px auto auto; transform: translate(0px, 32px);" data-display="static" data-popper-placement="bottom-end">';
                    comments += '<a class="dropdown-item js-clipboard text-primary" href="javascript:;" >';
                    comments += '<i class="bi-pencil pe-2 text-muted"></i> Edit Comment';
                    comments += '</a>';
                    comments += '<a class="dropdown-item js-clipboard text-primary" href="javascript:;">';
                    comments += '<i class="bi-eye-slash pe-2 text-muted"></i> Make internal';
                    comments += '</a>';
                    comments += '<a class="dropdown-item text-danger border-top" href="javascript:;" onclick="Tasks.delete(899,event);"><i class="bi bi-trash focus pe-2 text-danger"></i> Delete</a>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '</div>';
                    comments += '<div class="clearfix"></div>';
                });
                $('[data-type="comments-list"]').html(comments);
                const element = document.getElementById('comments-list');
                element.scrollTop = element.scrollHeight;
            } else {
                $('[data-type="comments-count"]').html('');
                $('[data-type="comments-list"]').hide();
            }
        });
    }

    static complete(obj) {
        var taskId = $(obj).data('taskid');

        $.get('/ajax/Tasks/Complete.php', { taskId: taskId }).done(function (data) {
            data = jQuery.parseJSON(data);
            if (data.response == 'OK') {
                let currentTaskRow =$('#taskId-'+taskId);

                let totalPercentage = 100;
                let percentageValue = 0;
                if (data.tasksCompleted && data.tasksCount) {
                    percentageValue = (data.tasksCompleted / data.tasksCount) * 100;
                }
                let roundPercentageValue = Math.round(percentageValue);

                Circles.create({
                    id: 'chartProjectTasksComplete',
                    radius: 25,
                    value: roundPercentageValue,
                    maxValue: totalPercentage,
                    width: 3,
                    text: function (value) { return value + '%'; },
                    colors: ["rgba(55, 125, 255, 0.1)", "#377dff"],
                    duration: 2000,
                    wrpClass: 'circles-wrp',
                    textClass: 'circles-text1',
                    textColor: "#377dff",
                    styleWrapper: true,
                    styleText: true
                });

                $('#task-widget-text-id').text(data.widgetText);

                //Update current count
                $("span[data-status-count='" + data.prevStatusID + "']").text(data.countPrev);
                var overdueTaskId = document.getElementById("total-overdue-task");
                if (overdueTaskId) {
                    var totalOverdueTask = overdueTaskId.getAttribute("data-value");
                    overdueTaskId.setAttribute("data-value", (parseInt(totalOverdueTask) - 1));
                    overdueTaskId.innerHTML = (parseInt(totalOverdueTask) - 1);
                }

                // $("#total-overdue-task").text(data.countPrev);
                $('#status' + data.statusId).find('.kanban-items').append(data.html);
                $("span[data-status-count='" + data.statusId + "']").text(data.count);
                if ($('#taskId-' + data.taskId).length) {
                    //Focus current task
                    document.getElementById('taskId-' + data.taskId).scrollIntoView({
                        behavior: "smooth"
                    });

                }
                currentTaskRow.fadeOut('', function () {
                    currentTaskRow.hide();
                });

                let title = '<strong>Task Complete - <a href="javascript:;" onClick="Tasks.undoComplete(' + taskId + ', ' + data.prevStatusID + ')">Undo Action</a></strong>';
                let taskmessage = '<p style="font-size: 0.7em;"><b>Note:</b> You can undo the status change.</p>';
                Notifications.showMessage(title, 'success', taskmessage);


            }
        });
    }

    static open(e, taskId, doNotRecallSidebar) {
        if (e != null && e.target.tagName == 'I' && e.target.onclick != null) {
            // Don't launch the task if the user has clicked the 'tick' icon to mark the task as completed  
        } else {
            var sidebar = 'sidebar-edit-task';
            var form = '#frm-sidebar-edit-task';

            // Handle loading visual
            //$('#'+sidebar+' .sidebar-loading').removeClass('d-none');
            //$('#'+sidebar+' .sidebar-content').addClass('d-none');

            $(form).trigger('reset');

            if (!doNotRecallSidebar) {
                $('#' + sidebar).sidebar('open', { keepOpen: 1 });
            }
            $('#' + sidebar).sidebar('tab', { element: '#' + sidebar }); // Set the sidebar to the first tab
            $.getJSON('/ajax.php', { method: 'getTask', taskId: taskId }).done(function (json) {
                if (json.response == 'OK') {
                    $('#' + sidebar).find('form input[name=taskId]').val(taskId);

                    // Populate edit tab - do this first because we'll then add html to some empty fields
                    $('#' + sidebar).find('h3').next('div').html(json.status);
                    $(form + ' input[name=title]').val(json.title);
                    $(form + ' textarea[name=description]').val(json.description);
                    $(form + ' select[name=statusId]').val(json.statusId);
                    $(form + ' input[name=dueDate]').val(json.dueDate);
                    $(form + ' input[name=startDate]').val(json.startDate);
                    $(form + ' input[name=duration]').val(json.duration);
                    if (json.durationType != '') {
                        $(form + ' select[name=durationType]').val(json.durationType);
                    } else {
                        $(form + ' select[name=durationType]').val('hours'); // Default to hours
                    }
                    $(form + ' input[name=origProjectId]').val(json.projectId);
                    $(form + ' select[name=projectId]').val(json.projectId);

                    loadProjectDeliverablesList($(form + ' select[name=projectId]'), 'frm-sidebar-edit-task');

                    $(form + ' select[name=userId]').val(json.assignedUserId);
                    $(form + ' input[name=priority]').prop('checked', false);
                    if (json.priority > 0) {
                        $(form + ' input[name=priority]').prop('checked', true);
                    }

                    // Populate comments tab
                    if (json.comments == '') {
                        $('#' + sidebar + ' [data-json="comments"]').html('');
                        $('#' + sidebar + ' [data-json="comments"]').hide();
                    } else {
                        $('#' + sidebar + ' [data-json="comments"]').html(json.comments);
                        $('#' + sidebar + ' [data-json="comments"]').show();
                    }
                    $('[data-json="comments"]').scrollTop(0);

                    // Populate files tab
                    if (json.files == '') {
                        $('#' + sidebar + ' [data-json="files"]').html('');
                        $('#' + sidebar + ' [data-json="files"]').hide();
                    } else {
                        $('#' + sidebar + ' [data-json="files"]').html(json.files);
                        $('#' + sidebar + ' [data-json="files"]').show();
                    }

                    // Populate info tab
                    if (json.priority > 0) {
                        $('#' + sidebar + ' [data-json="priority"]').removeClass('d-none');
                    } else {
                        $('#' + sidebar + ' [data-json="priority"]').addClass('d-none');
                    }
                    $('#' + sidebar + ' [data-json="title"]').html(json.title);
                    if (json.description == '') {
                        json.description = '<a href="#" data-toggle="sidebartab" data-tab="1" data-target="#sidebar-edit-task" data-focusto="description" onclick="return false;" class="text-link text-dashed-underline">Add a description</a>';
                    }
                    $('#' + sidebar + ' [data-json="description"]').html(json.description);
                    $('#' + sidebar + ' [data-json="status"]').html(json.status);
                    if (json.dueDate == '' || json.dueDate == '0000-00-00') {
                        json.dueDate = '<a href="#" data-toggle="sidebartab" data-tab="1" data-target="#sidebar-edit-task" data-focusto="dueDate" onclick="return false;" class="text-link text-dashed-underline">Set due date</a>';
                    } else {
                        json.dueDate = json.displayDueDate;
                    }
                    $('#' + sidebar + ' [data-json="duedate"]').html(json.dueDate);
                    if (json.startDate == '' || json.startDate == '0000-00-00') {
                        json.startDate = '<a href="#" data-toggle="sidebartab" data-tab="1" data-target="#sidebar-edit-task" data-focusto="startDate" onclick="return false;" class="text-link text-dashed-underline">Set start date</a>';
                    } else {
                        json.startDate = json.displayStartDate;
                    }
                    $('#' + sidebar + ' [data-json="startdate"]').html(json.startDate);
                    if (json.deliverable == '' || json.deliverable == 'Unassigned') {
                        json.deliverable = '<a href="#" data-toggle="sidebartab" data-tab="1" data-target="#sidebar-edit-task" data-focusto="" onclick="return false;" class="text-link text-dashed-underline">Assign deliverable</a>';
                    }
                    if (json.duration > 0) {
                        $('#' + sidebar + ' [data-json="duration"]').html(json.durationDisplay);
                    } else {
                        $('#' + sidebar + ' [data-json="duration"]').html('<a href="#" data-toggle="sidebartab" data-tab="1" data-target="#sidebar-edit-task" data-focusto="" onclick="return false;" class="text-link text-dashed-underline">Set duration</a>');
                    }
                    $('#' + sidebar + ' [data-json="deliverable"]').html(json.deliverable);

                    var html = '';
                    $(json.assignedTo).each(function (key, assignee) {
                        html += assignee.html;
                    });
                    if (html == '') {
                        html = '<a href="#" data-toggle="sidebartab" data-tab="1" data-target="#sidebar-edit-task" data-focusto="" onclick="return false;" class="text-link text-dashed-underline">Assign task</a>';
                    }
                    $('#' + sidebar + ' [data-json="assignedto"]').html(html);

                    // Clear the user/team/role dropdown
                    $('#' + sidebar + ' .dropdown-menu').each(function () {
                        $(this).find('.container-checkbox.checked').each(function () {
                            $(this).removeClass('checked');
                            $(this).find('input[type=checkbox]').prop('checked', false);
                        });
                    });

                    // Loop through assigned users/teams/roles
                    $(json.assignedTo).each(function (key, assigned) {
                        var type = assigned.type;
                        var id = assigned.id;
                        var typeId = type + '_' + id;

                        // We also need to 'tick' the user/team/role in the dropdown list
                        $('[data-list="sidebar-edit-task-list-assigned"]').find('[data-type="' + type + '"]').each(function () {
                            if ($(this).data('remove-type-id') == typeId) {
                                $('[data-list="sidebar-edit-task-list-assigned"] [data-remove-type-id="' + typeId + '"]').click();
                            }
                        });
                    });

                    $('#' + sidebar + ' [data-json="createdby"]').html(json.addedBy);
                    $('#' + sidebar + ' [data-json="datetime"]').html(json.dtmAdded);

                    // If the task is completed, don't show the 'complete' button
                    if (json.isCompleted == 1) {
                        $('#' + sidebar + ' [data-sidebar-tab-footer="0"]').addClass('d-none');
                    } else {
                        $('#' + sidebar + ' [data-sidebar-tab-footer="0"]').removeClass('d-none');
                    }
                }
            });
        }
    }

    static delete(taskId, event) {

        if (event != "undefined") {
            event.stopPropagation();
        }
        var deleteNotes = '<p style="font-size: 0.7em;"><b>Note:</b> The task will be deleted and remain in the system for 30 days. During this time you can restore the task, If no action is taken the task will be permanently deleted after 30 days.</p>';

        swal.fire({
            title: 'Are you sure, you want to delete the task?',
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
                $.getJSON('/ajax/Tasks/Delete.php', { taskId: taskId }).done(function (json) {
                    if (json.response == 'OK') {
                        $('[data-taskid="' + taskId + '"]').fadeOut('', function () {
                            $('[data-taskid="' + taskId + '"]').hide();
                        });
                        
                        $('[data-status-count="' + json.statusId + '"]').html(json.count);

                        let taskmessage = '<p style="font-size: 0.7em;"><b>Note:</b> The task will be deleted and remain in the system for 30 days. During this time you can restore the task, If no action is taken the task will be permanently deleted after 30 days.</p>';
                        let title = '<strong>Task Deleted - <a href="javascript:;" onClick="Tasks.undo(' + taskId + ')">Undo Action</a></strong>';
                        Notifications.showMessage(title, 'success', taskmessage);

                    }
                });


            }
        });

        // return false;
        // if (confirm('Are you sure?')) {
        //     $.getJSON('/ajax/Tasks/Delete.php', { taskId: taskId }).done(function (json) {
        //         if (json.response == 'OK') {
        //             $('[data-taskid="' + taskId + '"]').fadeOut('', function () {
        //                 $('[data-taskid="' + taskId + '"]').remove();
        //             });
        //             $('[data-status-count="' + json.statusId + '"]').html(json.count);
        //         }
        //     });
        // }
    }

    static undo(taskId) {
        swal.clickConfirm();
        $.getJSON('/ajax/Tasks/Undo.php', { taskId: taskId }).done(function (json) {
            if (json.response == 'OK') {
                $('[data-taskid="' + taskId + '"]').show();
                $('[data-status-count="' + json.statusId + '"]').html(json.count);
            }
        });
    }

    static undoComplete(taskId, prevStatusId) {
        swal.clickConfirm();
        $.getJSON('/ajax/Tasks/UndoComplete.php', { taskId: taskId, prevStatusId: prevStatusId }).done(function (data) {
            if (data.response == 'OK') {
                let completedStatusId = 4;
                let totalPercentage = 100;
                let percentageValue = 0;
                if (data.tasksCompleted && data.tasksCount) {
                    percentageValue = (data.tasksCompleted / data.tasksCount) * 100;
                }
                let roundPercentageValue = Math.round(percentageValue);

                Circles.create({
                    id: 'chartProjectTasksComplete',
                    radius: 25,
                    value: roundPercentageValue,
                    maxValue: totalPercentage,
                    width: 3,
                    text: function (value) { return value + '%'; },
                    colors: ["rgba(55, 125, 255, 0.1)", "#377dff"],
                    duration: 2000,
                    wrpClass: 'circles-wrp',
                    textClass: 'circles-text1',
                    textColor: "#377dff",
                    styleWrapper: true,
                    styleText: true
                });

                var overdueTaskId = document.getElementById("total-overdue-task");
                if (overdueTaskId) {
                    var totalOverdueTask = overdueTaskId.getAttribute("data-value");
                    overdueTaskId.setAttribute("data-value", (parseInt(totalOverdueTask) + 1));
                    overdueTaskId.innerHTML = (parseInt(totalOverdueTask) + 1);
                }

                $('#task-widget-text-id').text(data.widgetText);

                // remove the tasks from the completed list
                // 4 statusid is for completed status
                $('div[id="taskId-' + taskId + '"][data-statusid="' + completedStatusId + '"]').remove();
                // show the previous task by prevStatusId 
                $('div[id="taskId-' + taskId + '"][data-statusid="' + prevStatusId + '"]').show();
                
                // update the counts
                let prevStatusIdCount = $('[data-status-count="' + prevStatusId + '"]').html();
                let completedStatusIdCount = $('[data-status-count="' + completedStatusId + '"]').html();
                let newStatusCount = parseFloat(prevStatusIdCount) + 1;
                let newCompleteTaskCount = parseFloat(completedStatusIdCount) - 1;
                if (newStatusCount >= 0) {
                    $('[data-status-count="' + prevStatusId + '"]').html(newStatusCount);
                }
                if (newCompleteTaskCount >= 0) {
                    $('[data-status-count="' + completedStatusId + '"]').html(newCompleteTaskCount);
                }

                // 
                var completehtml = "";
                if(parseInt(prevStatusId) != completedStatusId){
                    completehtml += '<div class="pe-0 kanban-complete">';
                    completehtml += '<i class="fal fa-check-circle cursor-pointer" onmouseover="$(this).addClass(\'fas text-success\');" onmouseout="$(this).removeClass(\'fas text-success\');" onclick="Tasks.complete(this);" data-taskid="'+ taskId +'"  title="Click to complete this task"></i>';
                    completehtml += '</div>';
                }
                
                $('#taskId-'+taskId).find('.mark-as-complete-options').html(completehtml);
                if ($('#taskId-' + data.taskId).length) {
                    //Focus current task
                    document.getElementById('taskId-' + data.taskId).scrollIntoView({
                        behavior: "smooth"
                    });

                }
            }
        });
    }

    static addList(obj) {
        var form = $(obj).closest('form');
        var list = $(form).find('textarea[name=list]').val();
        var projectId = $(form).find('input[name=projectId]').val();

        if (list != '') {
            $.ajax({
                url: '/ajax/Tasks/AddList.php',
                type: 'post',
                data: {
                    projectId: projectId,
                    list: list,
                },
                dataType: 'json',
                success: function (json) {
                    console.log(json);
                    if (json.response == 'OK') {
                        // Reload with clean url so that no previous task pop up should be shown
                        // in case url has ?tag=activity parameters 
                        let taskTabUrl = '';
                        let currentUrl = window.location.href;
                        const urlSearchParams = new URLSearchParams(window.location.search);
                        const params = Object.fromEntries(urlSearchParams.entries());
                        if (params.hasOwnProperty('tag') && params.tag == 'activity') {
                            taskTabUrl = currentUrl.substring(0, currentUrl.indexOf("/tasks/"));
                            taskTabUrl = taskTabUrl + '/tasks';
                        } else {
                            taskTabUrl = currentUrl;
                        }
                        location.href = taskTabUrl // Todo - look at adding all of the tasks using ajax	
                    } else {
                        UI.modalError('Error adding multiple tasks, please try again');
                    }
                },
                error: function () {
                    UI.modalError('Error adding multiple tasks, please check connection and try again');
                },
            });
        } else {
            UI.modalError('Please enter a task');
        }
    }

    static saveStatusName(item) {
        var statusId = $(item).parent().prev('input[type=text]').data('statusid');
        var status = $(item).parent().prev('input[type=text]').val();

        $.get('/ajax.php', { method: 'editStatusName', statusId: statusId, status: status }).done(function (response) {
            if (response == 'OK') {
                $('[data-status-name="' + statusId + '"]').html(status);
            }
        });
    }

    static editStatusNameOnEnter(e, item) {
        if (e.keyCode == 13) {
            e.preventDefault();

            var statusId = $(item).data('statusid');
            var status = $(item).val();

            $.get('/ajax.php', { method: 'editStatusName', statusId: statusId, status: status }).done(function (response) {
                if (response == 'OK') {
                    $('[data-status-name="' + statusId + '"]').html(status);
                    $(item).blur();
                }
            });
        }
    }
}