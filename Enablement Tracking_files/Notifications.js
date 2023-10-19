var footerNotificationTimeout = '';

class Notifications {
    static footer(notification, icon) {
        clearTimeout(footerNotificationTimeout);
        $('#footer-notification').css('bottom', '-200px');
        if(icon != '') {
            notification = '<i class="'+icon+' mr-2"></i>'+notification;
        }
        $('#footer-notification').show();
        $('#footer-notification').html(notification);
        $('#footer-notification').animate({
            bottom: '1rem',
        }, 500);
        footerNotificationTimeout = setTimeout(function() {
            hideFooterNotification();
        }, 4500);
    }

    static markReadByDiv(el, activityId) {
        let div = $(el);
        let checkbox = div.find('#notificationCheck'+activityId);

        // if notification already read, then return
        if (!checkbox.is(":checked")) {
            return;
        }

        let reqData = {activityId: activityId};
        reqData.isRead = true;

        Notifications.sendUpdateReq(reqData).then(status => {
            if (status) {
                // marked as read
                if (reqData.isRead) {
                    checkbox.prop('checked', false);
                    let currentNotfCount = Notifications.getUnreadNotificationsCount();
                    Notifications.setNotificationCount(currentNotfCount);
                } 
            } 
        });
    }

    static markReadByCheckbox(el, activityId) {
        let checkbox = $(el);
        let reqData = {activityId: activityId};
        reqData.isRead = checkbox.is(":checked") ? false : true;

        Notifications.sendUpdateReq(reqData).then(status => {
            if (status) {
                if (reqData.isRead) {
                    checkbox.prop('checked', false);
                } else {
                    checkbox.prop('checked', true);
                }
                let currentNotfCount = Notifications.getUnreadNotificationsCount();
                Notifications.setNotificationCount(currentNotfCount);
            } 
        });
    }

    static async sendUpdateReq(reqData) {
        const promise = new Promise(function (resolve, reject) {
            $.post('/ajax/Activities/Update.php', reqData).done(function (data) {
                data = jQuery.parseJSON(data);
                if (data.response == 'OK') {
                    resolve(true);
                } else {
                    resolve(false);

                }
            });
        });
        return promise;
    }

    static markAllNotifactionsRead() {
        
        $.post('/ajax.php', 
            {method: 'markAllNotifactionsRead'}
        )
        .done(function (data) {
            data = jQuery.parseJSON(data);
            if (data.response == 'OK') {
                // set all notifications as read in the notifiaction tab
                let notifactionTab = $('#notificationNavOne');
                notifactionTab.find('li').each( function() {
                    let checkbox = $(this).find('.form-check-input');
                    if (checkbox.is(":checked")) {
                        checkbox.prop('checked', false);
                    }
                });
                // set notifications count to 0
                Notifications.setNotificationCount(0);
                Notifications.showMessage('All notifications marked as read.', 'success');

                
            } else {

            }
        });
    }

    static markAllNotifactionsArchived() {
        $.post('/ajax.php', 
            {method: 'markAllNotifactionsArchived'}
        )
        .done(function (data) {
            data = jQuery.parseJSON(data);
            if (data.response == 'OK') {
                // remove all notifications from the notifiaction tab
                let notifactionTab = $('#notificationNavOne');
                let arNotifactionTab = $('#notificationNavTwo');
                let ulElmt = arNotifactionTab.find('.list-group');

                let liArr = []; 
                notifactionTab.find('.list-group .list-group-item').each(function() {
                   
                    // mark notification read 
                    let liElmt = $(this);
                    if (liElmt.attr('id') && liElmt.attr('id') != 'noNotificationMsg') {
                        let checkbox = liElmt.find('.mark-read-btn');
                        if (checkbox.is(":checked")) {
                            checkbox.prop('checked', false);
                        }
                        checkbox.prop('disabled', true);
                        checkbox.removeAttr('onclick');
                        checkbox.tooltip('hide');
                        liElmt.find('.archive-btn').remove();
                        
                        liArr.push(liElmt);
                    }
                });
                
                if (liArr.length > 0) {
                    let elemt = arNotifactionTab.find('.list-group > #noNotificationMsg');
                    if (elemt && elemt.length > 0) {
                        elemt.remove();
                    }
                    for(let i = liArr.length -1; i>= 0; i--) {
                        liArr[i].prependTo(ulElmt);
                    }
                }

                // set notifications count to 0
                Notifications.setNotificationCount(0);
                // hide all the tooltips of notifications
                $(".tooltip").hide();
                notifactionTab.find('.list-group').html(`<li id='noNotificationMsg' class="list-group-item">
                    <div class="row">
                    <div class="col">
                        <p class="fs-5 mt-5 text-primary text-center">No Notifications</p>
                    </div>
                    </div>
                </li>`);
                Notifications.showMessage('All notifications archived.', 'success');

            } else {

            }
        });
    }

    static markNotifactionArchived(el, activityId) {
        let elmt = $(el);
        let reqData = {activityId: activityId};
        reqData.isArchived = true;
        $.post('/ajax/Activities/Update.php', reqData).done(function (data) {
            data = jQuery.parseJSON(data);
            if (data.response == 'OK') {
                let arNotifactionTab = $('#notificationNavTwo');
                let ulElmt = arNotifactionTab.find('.list-group');
                // Remove no notification msg element
                let elemt = arNotifactionTab.find('.list-group > #noNotificationMsg');
                if (elemt && elemt.length > 0) {
                    elemt.remove();
                }
                // mark notification read 
                let liElmt = elmt.closest('.list-group-item');
                let checkbox = liElmt.find('#notificationCheck'+activityId);
                if (checkbox.is(":checked")) {
                    checkbox.prop('checked', false);
                }
                checkbox.prop('disabled', true);
                checkbox.removeAttr('onclick');
                checkbox.tooltip('hide');
                liElmt.find('.archive-btn').remove();

                liElmt.prependTo(ulElmt);
                let currentNotfCount = Notifications.getUnreadNotificationsCount();
                Notifications.setNotificationCount(currentNotfCount);
                // hide all the tooltips of notifications
                $(".tooltip").hide();
            } 
        });
    }


    static getUnreadNotificationsCount() {
        let unreadNotficationsCount = 0;
        let notifactionTab = $('#notificationNavOne');

        notifactionTab.find('.list-group .list-group-item').each(function () {
            let liElmt = $(this);
            let isValidNotificationDiv = true;
            if (liElmt.attr('id') && liElmt.attr('id') == 'noNotificationMsg') {
                isValidNotificationDiv = false;
            }
            if (isValidNotificationDiv) {
                let checkbox = liElmt.find('.mark-read-btn');
                if (checkbox.is(":checked")) {
                    unreadNotficationsCount++;
                }
            }
        });

        return unreadNotficationsCount;
    }

    static setNotificationIndicator(status) {
        if (status) {
            $('#newnNotfyIcon').removeClass('d-none');
            $('#newnNotfyIcon').addClass('d-inline-flex');
        } else {
            $('#newnNotfyIcon').removeClass('d-inline-flex');
            $('#newnNotfyIcon').addClass('d-none');
        }
    }

    static setNotificationCount(count) {
        count = parseInt(count);
        if (count == 0) {
            Notifications.setNotificationIndicator(false);
            $('#notifactionsCount').html(count);
        } else if(count > 0){
            let notifactionCountHtml = count;
            Notifications.setNotificationIndicator(true);
            if (count > 50) {
                notifactionCountHtml = '50+';
            }
            $('#notifactionsCount').html(notifactionCountHtml);

            // delete no notifiation msg if exists
            let elemt = $('#notificationNavOne').find('.list-group > #noNotificationMsg');
            if (elemt && elemt.length > 0) {
                elemt.remove();
            }
        }
    }

    static showMoreText(el) {
        let elmt = $(el);
        let parent = elmt.parent().find('div.recent-activity-text');
        if (parent.hasClass('read-more')) {
            parent.removeClass('read-more');
            elmt.text("Read less");
        } else {
            // read less 
            parent.addClass('read-more');
            let id = elmt.closest('.list-group-item').attr('id');
            elmt.attr('href', '#'+id);
            elmt.text("Read more");
        }
    }

    static showMessage(msg, type, html = '') {
        let msgOptions = {
            title: msg,
            timer: 4000,
            timerProgressBar: true,
            toast: true,
            position: 'bottom-end',
            showCloseButton: true,
            showConfirmButton: false,
            focusConfirm: false,
            customClass: {
                popup: 'app-notification'
            }
        };
        if (html) {
            msgOptions.html = html
        }

        switch(type) {
          case 'success':
            msgOptions.icon = 'success';
            break;
          case 'error':
            msgOptions.icon = 'error';
            break;
          default:

        };
        Swal.fire(msgOptions);
      }
}