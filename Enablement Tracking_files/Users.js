class Users {
    static open(userId) {
        var form = $('#modal-edit-user').find('form');

        $.getJSON('/ajax/Users/Get.php', { userId: userId }).done(function (json) {
            var user = json.user;

            $(form).find('input[name=userId]').val(userId);
            $(form).find('input[name=firstName]').val(user.firstname);
            $(form).find('input[name=lastName]').val(user.lastname);
            $(form).find('input[name=email]').val(user.email);
            $(form).find('input[name=telephone]').val(user.telephone);
            $(form).find('input[name=add1]').val(user.add1);
            $(form).find('input[name=add2]').val(user.add2);
            $(form).find('input[name=city]').val(user.city);
            $(form).find('input[name=country]').val(user.country);
        });
    }

    static openView(userId) {
        var form = $('#modal-view-user').find('form');

        $.getJSON('/ajax/Users/Get.php', { userId: userId, includeDeleted: true }).done(function (json) {
            var user = json.user;

            $(form).find('input[name=userId]').val(userId);
            $(form).find('input[name=firstName]').val(user.firstname);
            $(form).find('input[name=lastName]').val(user.lastname);
            $(form).find('input[name=email]').val(user.email);
            $(form).find('input[name=telephone]').val(user.telephone);
            $(form).find('input[name=add1]').val(user.add1);
            $(form).find('input[name=add2]').val(user.add2);
            $(form).find('input[name=city]').val(user.city);
            $(form).find('input[name=country]').val(user.country);
        });
    }

    static delete(userId, name) {
        if (parseInt(userId) > 0) {
            var deleteNotes = '';
            var deleteMessage = 'The user has been deleted.';
            swal.fire({
                title: 'Are you sure, you want to delete ' + name + '?',
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
                    swal.fire({
                        title: 'Do you want to assign ' + name.trim() + "'s task to another user?",
                        html: deleteNotes,
                        icon: 'warning',
                        confirmButtonText: 'Yes, assign them',
                        cancelButtonText: 'No, cancel',
                        denyButtonText: 'No, leave unassigned',
                        confirmButtonColor: '#d33',
                        reverseButtons: true,
                        showDenyButton: true,
                        showCloseButton: true,
                        showCancelButton: true,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            $.ajax({
                                type: 'GET',
                                url: '/ajax/Tasks/GetAllAssignTask.php',
                                data: { userId: userId },
                                dataType: 'json',
                                async: false,
                                success: function (json) {
                                    // var json = jQuery.parseJSON(json);
                                    if (json.response == 'OK') {
                                        var projects = json.projects;
                                        var currentUserId = json.userId;
                                        if (Object.keys(projects).length > 0) {
                                            var html = '';
                                            var numberOfProject = 1;
                                            var userListData;
                                            html += '<div class="accordion" id="accordionExample">';
                                            $.each(projects, function (key, project) {


                                                html += '<div class="accordion-item">';
                                                html += '<div class="accordion-header" id="heading' + key + '">';
                                                html += '<div class="row">';
                                                html += '<div class="col-sm-6">';
                                                html += '<div class="form-check">';
                                                html += '<input type="checkbox" id="parent-checkbox' + key + '" data-projectId="' + key + '" class="form-check-input parent-checkbox">';
                                                html += '<label class="form-check-label" for="parent-checkbox' + key + '">' + project.projectName + '</label>';
                                                html += '</div>';
                                                html += '</div>';
                                                html += '<div class="col-sm-6 d-flex">';
                                                if (Object.keys(project.userLists).length > 0) {
                                                    userListData = project.userLists;
                                                    html += '<select class="form-select form-select-lg filter-select2 assignUserOptions parentAssignUserOptions" data-projectId="' + key + '" >';
                                                    $.each(project.userLists, function (key, user) {
                                                        html += '<option value="' + project.projectId + '_' + user.userId + '" ' + ((parseInt(currentUserId) == parseInt(user.userId)) ? " selected" : "") + '>' + user.fullname + '</options>';
                                                    });

                                                    html += '</select>';
                                                }
                                                html += '<a class="accordion-button btn-icon" role="button" data-bs-toggle="collapse" data-bs-target="#collapse' + key + '" aria-expanded="' + ((numberOfProject == 1)?'true': 'false') +'" aria-controls="collapse' + key + '"></a>';
                                                html += '</div>';
                                                html += '</div>';
                                                html += '</div>';
                                                html += '<div id="collapse' + key + '" class="accordion-collapse collapse '+ ((numberOfProject == 1)?'  show':'')+'" aria-labelledby="heading' + key + '" data-bs-parent="#accordionExample">';
                                                html += '<div class="accordion-body" id="projectId-body' + key + '">';
                                                if (Object.keys(project.tasks).length > 0) {
                                                    $.each(project.tasks, function (key1, task) {

                                                        html += '<div class="row">';
                                                        html += '<div class="col-sm-6">';
                                                        html += '<div class="form-check mt-2 mb-2">';
                                                        html += '<input type="checkbox"  class="form-check-input parent-checkbox' + key + '">';
                                                        html += '<label class="form-check-label">' + task.task + '</label>';
                                                        html += '</div>';
                                                        html += '</div>';
                                                        html += '<div class="col-sm-6">';
                                                        if (Object.keys(project.userLists).length > 0) {
                                                            html += '<select class="form-select form-select-lg filter-select2 assignUserOptions mb-3" data-taskId="' + task.id + '" name="toAssignUserId[]" >';
                                                            $.each(project.userLists, function (key, user) {
                                                                html += '<option value="' + project.projectId + '_' + user.userId + '_' + task.id + '" ' + ((parseInt(currentUserId) == parseInt(user.userId)) ? " selected" : "") + '>' + user.fullname + '</options>';
                                                            });

                                                            html += '</select>';
                                                        }

                                                        html += '</div>';
                                                        html += '</div>';

                                                    });
                                                }
                                                html += '</div>';
                                                html += '</div>';
                                                html += '</div>';











                                                // html += '<div class="card mb-2">';
                                                // html += '<div class="card-header card-header-content-md-between">';
                                                // html += '<div class="form-check">';
                                                // html += '<input type="checkbox" id="parent-checkbox' + key + '" data-projectId="' + key + '" class="form-check-input parent-checkbox">';
                                                // html += '<label class="form-check-label card-header-title" for="parent-checkbox' + key + '">' + project.projectName + '</label>';
                                                // html += '</div>';
                                                // html += '<div class="">';
                                                // if (Object.keys(project.userLists).length > 0) {
                                                //     html += '<select class="form-select form-select-lg filter-select2 assignUserOptions parentAssignUserOptions" data-projectId="' + key + '" >';
                                                //     $.each(project.userLists, function (key, user) {
                                                //         html += '<option value="' + project.projectId + '_' + user.userId + '" ' + ((parseInt(currentUserId) == parseInt(user.userId)) ? " selected" : "") + '>' + user.fullname + '</options>';
                                                //     });

                                                //     html += '</select>';
                                                // }

                                                // html += '</div>';
                                                // html += '</div>';
                                                // html += '<div class="card-body">';
                                                // if (Object.keys(project.tasks).length > 0) {
                                                //     html += '<table class="table">';
                                                //     html += '<tbody id="projectId-body' + key + '">';
                                                //     $.each(project.tasks, function (key1, task) {
                                                //         html += '<tr>';
                                                //         html += '<td scope="row" class="col-sm-1">';
                                                //         html += '<input type="checkbox" class="form-check-input parent-checkbox' + key + '">';
                                                //         html += '</td>';
                                                //         html += '<td class="text-start col-sm-7">' + task.task;
                                                //         html += '</td>';
                                                //         html += '<td class="col-auto text-start">';
                                                //         if (Object.keys(project.userLists).length > 0) {
                                                //             html += '<select class="form-select form-select-lg filter-select2 assignUserOptions" data-taskId="' + task.id + '" name="toAssignUserId[]" >';
                                                //             $.each(project.userLists, function (key, user) {
                                                //                 html += '<option value="' + project.projectId + '_' + user.userId + '_' + task.id + '" ' + ((parseInt(currentUserId) == parseInt(user.userId)) ? " selected" : "") + '>' + user.fullname + '</options>';
                                                //             });

                                                //             html += '</select>';
                                                //         }

                                                //         html += '</td>';
                                                //         html += '';
                                                //         html += '<tr>';
                                                //     });
                                                //     html += '</tbody>';
                                                //     html += '</table>';
                                                // }
                                                // html += '</div>';
                                                // html += '</div>';
                                                // html += '</div>';

                                                // html += '<tr>';
                                                // html += '<th class="text-start">';
                                                // html += project.projectName;
                                                // html += '</th>';
                                                // html += '<th class="text-start">';
                                                // html += task.task;
                                                // html += '</th>';
                                                // html += '<th class="text-start">';
                                                // if (Object.keys(task.userLists).length > 0) {
                                                //     html += '<select class="form-select form-select-lg filter-select2 assignUserOptions" name="toAssignUserId[]" >';
                                                //     $.each(task.userLists, function (key, user) {
                                                //         html += '<option value="' + task.id + '_' + user.userId + '" ' + ((parseInt(currentUserId) == parseInt(user.userId)) ? " selected" : "") + '>' + user.fullname + '</options>';
                                                //     });

                                                //     html += '</select>';
                                                // }
                                                // html += '</th>';
                                                // html += '</tr>';

                                                numberOfProject = parseInt(numberOfProject) + 1;
                                            });

                                            html += '<div>';
                                            var html1 = '';
                                            if (Object.keys(userListData).length > 0) {
                                                html1 += '<span class="divider-center mt-0">OR</span>';
                                                html1 += '<div class="row mt-3">';
                                                html1 += '<label class="col-sm-3 col-form-label">Assign All Task to</label>';
                                                html1 += '<div class="col-sm-9">';

                                                html1 += '<select class="form-select mb-0 form-select-lg filter-select2 allTaskAssignToThisUser" name="allTaskAssignToThisUser">';
                                                html1 += '<option selected></options>';
                                                $.each(userListData, function (key2, user) {
                                                    html1 += '<option value="' + user.userId + '" >' + user.fullname + '</options>';
                                                });

                                                html1 += '</select>';

                                                html1 += '</div>';
                                                html1 += '</div>';
                                            }

                                            $('#fromAssignUserId').val(userId);
                                            // $('#assignTaskContainer').html(html);
                                            $('#appendTasks').html(html);
                                            $('#footerHtml').html(html1);
                                            $('#modal-assign-all-task-to-another-user').modal('toggle');

                                        } else {
                                            Users.deleteUser(userId,deleteMessage);
                                        }
                                    }
                                }
                            });
                        } else if (result.isDenied) {
                            Users.deleteUser(userId, deleteMessage);
                        }
                    });


                }
            });
        }
    }
    static assignTask(form) {
        $.ajax({
            url: '/ajax/Tasks/AssignTaskToAnotherUsers.php',
            type: 'post',
            data: form,
            success: function (json) {
                json = jQuery.parseJSON(json);
                if (json.response == 'OK') {
                    var deleteMessage = 'The user has been deleted and tasks have been reassigned.';
                    Users.deleteUser(json.fromAssignUserId, deleteMessage);
                } else {
                    Users.errorMessage('Something is wrong. Please try again');
                }
            },
            error: function () {
                Users.errorMessage('Something is wrong. Please try again');
            },
        });
    }

    static errorMessage(message) {
        Notifications.showMessage(message, 'error');

        window.setTimeout(function () {
            location.reload();
        }, 1000);
    }

    static deleteUser(userId,deleteMessage) {
        $.getJSON('/ajax/Users/Delete.php', { userId: userId }).done(function (json) {
            if (json.response == 'OK') {
                Notifications.showMessage(deleteMessage, 'success');
                window.setTimeout(function () {
                    location.reload();
                }, 1200);
            }
        });
    }

    static resetPassword(userId) {
        $.ajax({
            type: 'POST',
            url: '/ajax/Users/resetPassword.php',
            data: { userId: userId },
            dataType: 'json',
            async: false,
            success: function (json) {
                if (json.response == 'OK') {
                    let msg = 'Reset password link has been sent.';
                    Notifications.showMessage(msg, 'success');
                } else {
                    let errorMsg = 'Failed to send reset password link';
                    Notifications.showMessage(errorMsg, 'error');
                }
            }
        });

    }
}
