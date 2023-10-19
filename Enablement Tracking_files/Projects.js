class Projects {
    static save(obj) {
        var form = $(obj).closest('form');
        
        // Make sure we have specific fields set
        if($(form).find('input[name=title]').val() == '') {
            alert('Please enter a project name');
        } else {
            $(form).submit();
        }
    }

    static delete(projectId) {
        if(projectId > 0) {
            var deleteNotes = '';
    
            swal.fire({
                title: 'Are you sure you want to delete this project?',
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
                    let data = {};
                    data.method = 'deleteProject';
                    data.projectId = projectId;
                    $.get('/ajax.php', data).done(function(response) {
                        if(response == 'OK') {
                            document.location.href = '/projects/';
                        } else {
                            let errorMsg = 'Failed to delete the project';
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

    static getComments(projectId,userId) {
        $.getJSON('/ajax/Projects/Get.php', { projectId: projectId }).done(function (json) {
            var project = json.project;

            // Comments
            if (project.comments > 0) {
                $('[data-type="comments-count"]').html(' (' + project.comments + ')');
                $('[data-type="comments-list"]').show();

                var comments = '';
                var i = 0;

                $(project.commentsarr).each(function (key, comment) {
                    i++;
                    comments += '<div class="card ' + (i > 1 ? 'mt-2' : '') +  ((comment.addedBy == userId)?" comment-right-side-card":" comment-left-side-card") + ((UI.isInternalRecord(comment.addedBy))? " internal-task-comment":" ")+'">';
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
                const element = document.getElementById('comments-list');
                element.scrollTop = element.scrollHeight;
            } else {
                var comments = '';
                $('[data-type="comments-count"]').html('');
                comments += '<div class="d-table w-100 h-350">';
                comments += '<div class="d-table-cell w-100 h-350 align-middle text-center">';
                comments += 'No comments';
                comments += '</div>';
                comments += '</div>';
                $('[data-type="comments-list"]').html(comments);
            }
        });
    }
}