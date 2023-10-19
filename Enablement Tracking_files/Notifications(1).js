$( document ).ready(function() {
    function getNotifications() {
      $.get('/ajax.php', 
        {
          method: 'getNotifications',
          lastRefresh: lastRefreshNotifications
        }
      )
      .done(function (data) {
          data = jQuery.parseJSON(data);
          if (data.response == 'OK') {
              lastRefreshNotifications = data.lastRefresh;
              let notifactionTab = $('#notificationNavOne');
              let ulElmt = notifactionTab.find('.list-group'); 

              if (data.notifications && data.notifications.length > 0) {
                for (let i=0; i<data.notifications.length; i++) {
                  ulElmt.prepend(data.notifications[i]);
                }
              }
              
              let currentNotfCount = Notifications.getUnreadNotificationsCount();
              Notifications.setNotificationCount(currentNotfCount);
          } 
      });
    }
    
    Notifications.setNotificationCount(unReadNotifications);

    setInterval(function() {
      getNotifications();
    }, 15000);
});