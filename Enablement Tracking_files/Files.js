class Files {
    static download(event, fileId, hash) {
        document.location.href='/files/download.php?fileId='+fileId+'&hash='+hash;
    }

    static downloadFromCportal(event, fileId, hash) {
        document.location.href='/customerPortal/files/download.php?fileId='+fileId+'&hash='+hash;
    }

    static delete(fileId, hash) {
        if (fileId > 0) {
            swal.fire({
                title: 'Are you sure you want to delete this file?',
                html: '',
                icon: 'warning',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
                confirmButtonColor: '#d33',
                reverseButtons: true,
                showCloseButton: true,
                showCancelButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    $.get('/ajax/Files/Delete.php', {fileId: fileId, hash: hash}).done(function(response) {
                        if(response == 'OK') {
                            $('[data-fileid='+fileId+']').fadeOut('fast', function() {
                                $('[data-fileid='+fileId+']').remove();
        
                                setTimeout(function() {
                                    // How many files are now showing?
                                    var count = 0;
                                    $('[data-fileid]').each(function() {
                                        count++;
                                    });
                                    if(count == 0) {
                                        // Show 'no files found' message
                                        $('.no-results').show();
                                        $('.file-items').hide();
                                    } else {
                                        $('.no-results').hide();
                                    }
                                    UI.setFullHeightContainers();
                                }, 250);
                            });
                            Notifications.showMessage('File deleted successfully', 'success');
                        }
                    });
                }
            });
        }
    }

    static select(obj) {
        $('#files').click();
    }

    static upload(obj) {
        // This will become more sophisticated, but for now we require the file input to be wrapped in a form, which
        // we will then submit
        // Todo - make this ajax and have a modal upload manager

        let form = $(obj).closest('form');
        let fileInput = form.find('#files')[0];

        if (Files.validate(fileInput)) {
            form.submit();
        }
    }

    static validate(fileInput) {
        // Check if any file is selected.
        if (fileInput.files.length > 0) {
            for (const i = 0; i <= fileInput.files.length - 1; i++) {
 
                const fsize = fileInput.files.item(i).size;
                const file = Math.round((fsize / 1024));
                const maxSize = 20 * 1024
                // The size of the file.
                if (file > maxSize) {
                    let errorMsg = "File is too Big, please select a file less than 20mb";
                    Notifications.showMessage(errorMsg, 'error');
                    return false;
                } else {
                    return true;
                }
            }
        }
        return true;
    }

    static pin(fileId, hash) {
        $.get('/ajax/Files/Pin.php', {fileId: fileId, hash: hash}).done(function(response) {
            var obj = $('.file-item[data-fileid='+fileId+']');

            if(response == 'PINNED') {
                // Move the file into its place in the pinned section
                var moved = false;
                var count = 0;
                var last;
                $('.file-item.pinned').each(function() {
                    count++;
                    if(!moved) {
                        if($(this).data('fileid') < fileId) {
                            $(obj).addClass('pinned');
                            $(obj).find('.pin span').text('Unpin file');
                            var html = $(obj).prop('outerHTML');
                            $(this).before(html);
                            $(obj).remove();
                            moved = true;
                        }
                        last = $(this);
                    }
                });
                if(!moved) {
                    $(obj).addClass('pinned');
                    $(obj).find('.pin span').text('Unpin file');
                    var html = $(obj).prop('outerHTML');
                    if(count > 0) {
                        $(last).after(html);
                    } else {
                        $('.file-items').prepend(html);   
                    }
                    $(obj).remove();
                }
                Notifications.showMessage('File pinned successfully', 'success');
            } else if(response == 'UNPINNED') {
                // Move the file to its position
                var moved = false;
                var count = 0;
                var last;
                $('.file-item').not('.pinned').each(function() {
                    count++;
                    if(!moved) {
                        if($(this).data('fileid') < fileId) {
                            $(obj).removeClass('pinned');
                            $(obj).find('.pin span').text('Pin file 1');
                            var html = $(obj).prop('outerHTML');
                            $(this).before(html);
                            $(obj).remove();
                            moved = true;
                        }
                        last = $(this);
                    }
                });
                if(!moved) {
                    $(obj).removeClass('pinned');
                    $(obj).find('.pin span').text('Pin file 2');
                    var html = $(obj).prop('outerHTML');
                    if(count > 0) {
                        $(last).before(html);
                    } else {
                        $('.file-items').append(html);   
                    }
                    $(obj).remove();
                }
                Notifications.showMessage('File unpinned successfully', 'success');
            }
        });
    }

    static pinAll(projectId) {
        $.get('/ajax/Files/Pin.php', {projectId: projectId}).done(function(response) {
            if(response == 'OK') {
                location.reload(true);
            }
        });
    }

    static unpinAll(projectId) {
        $.get('/ajax/Files/Unpin.php', {projectId: projectId}).done(function(response) {
            if(response == 'OK') {
                location.reload(true);
            }
        });
    }

    static deleteAll(projectId) {
        if(confirm('Are you sure you want to delete all files attached to this project?')) {//Alerts.confirm('Are you sure you want to delete this file?')) {
            $.get('/ajax/Files/Delete.php', {projectId: projectId}).done(function(response) {
                if(response == 'OK') {
                    location.reload();
                }
            });
        }
    }

    static zip(projectId) {
        $.getJSON('/ajax/Files/Zip.php', {projectId: projectId}).done(function(json) {
            if(json.response == 'OK') {
                document.location.href='/files/download?zip='+json.zip;
            }
        });
    }
}