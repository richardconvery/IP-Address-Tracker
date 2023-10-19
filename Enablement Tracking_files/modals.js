// open modal to show details if url has open-modal parameter
function checkUrl() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if (params.hasOwnProperty('tag') && params.tag == 'activity') {
        var pathArray = window.location.pathname.split( '/' );
        // moduleId is taken from footer.php
        if (pathArray && pathArray.length >2 && moduleId) {
            let pathLength = pathArray.length;
            let module = pathArray[pathLength -2];
            switch(module) {
                case 'deliverables':
                    Deliverables.open(moduleId);
                    let deliverableModal = new bootstrap.Modal(document.getElementById("modal-edit-deliverable"), {});
                    deliverableModal.show();
                    break;
                case 'tasks':
                    Tasks.openEditModal(moduleId);
                    if (params.hasOwnProperty('open-tab')) {
                        UI.focusTab('modal-edit-task', params['open-tab']);
                    }
                    break;
                default:    
            }
        }
        // Handle customer portal url
        if (params.hasOwnProperty('tab') && params.hasOwnProperty('recordId')) {
            let module = params.tab;
            let moduleId = params.recordId;
            switch(module) {
                case 'deliverables':
                    Deliverables.open(moduleId);
                    let deliverableModal = new bootstrap.Modal(document.getElementById("modal-edit-deliverable"), {});
                    deliverableModal.show();
                    break;
                case 'tasks':
                    Tasks.loadView('',moduleId);
                    if (params.hasOwnProperty('open-tab')) {
                        UI.openModal('modal-view-task', params['open-tab']);
                    } else {
                        UI.openModal('modal-view-task', '', 'viewDetailsTab');
                    }
                    break;
                default:    
            }
        }
    }
}

window.onload = checkUrl;

// Listen for show edit task modal
$('#modal-edit-task').on('shown.bs.modal', function () {
    setLastMessageFocused($(this).attr('id'));
});

// Scroll till the last message in the comments
function setLastMessageFocused(modalId) {
    let commentList = $('#' + modalId).find('#comments-list');
    let latestMsg = commentList.find('.card').last();
    if (latestMsg) {
        commentList.animate({
            scrollTop: commentList.prop('scrollHeight')
        }, 500);
    }
}