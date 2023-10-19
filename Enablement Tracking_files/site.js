function updateSiteLanguage() {
    let select = document.getElementById('site-langauge');
    if (select) {
        let control = select.tomselect;
        if (control) {
            if (window.matchMedia("(max-width: 767px)").matches) {
                control.setValue('US', true);
            } else {
                control.setValue('GB', true);
            }
        }
    }
}
$(document).ready(function() {
    // Set language on page load
    updateSiteLanguage();
    // Check for screen size change to update language
    $(window).resize(function(){
        updateSiteLanguage();
    });

    $('.clear-filter').on('click', function(e) {
        let filterForm = document.getElementById('global-filter-form');
        let input = document.createElement("input");
        filterForm.reset();
        let field = document.getElementsByName("selectedViewFilterId");
        field.value = '0';
        input.type = "text";
        input.name = "clearFilter";
        input.setAttribute('value', 'true');
        filterForm.appendChild(input);
        filterForm.submit();
    });

    $('.js-file-attach-reset-img').on('click', function(e) {
        let fileInput = $(this).parent('div').find('.js-file-attach');
        let fileOptions =fileInput.attr('data-hs-file-attach-options');
        let obj = JSON.parse(fileOptions);
        $(this).parent('div').find('.avatar-img').attr("src", obj.resetImg);
        $(this).parent('div').find('.js-file-attach').val('');
    });

    $('.dropdown-item').on('click', function(e) {
        let dropdownDiv  = $(this).closest('.dropdown');
        let dropdownBtn = dropdownDiv.find('button[data-bs-toggle="dropdown"]');
        let dropdownMmenu = dropdownDiv.find('.dropdown-menu');
        dropdownBtn.removeClass('show');
        dropdownBtn.attr('aria-expanded', 'false')
        dropdownMmenu.removeClass('show');
        dropdownMmenu.removeAttr('data-bs-popper');
        dropdownMmenu.css('margin-top','1rem');
    });

    // Handle ajax error when system is marked as disabled
    $( document ).ajaxError(function( event, jqxhr, settings, thrownError ) {
        if (jqxhr.responseJSON && jqxhr.responseJSON.hasOwnProperty('systemStatus')) {
            let systemStatus = jqxhr.responseJSON.systemStatus;
            // Check system status
            if (systemStatus === 0 ) {
                // Redirect to login page
                location.href = '/login';
            }
        }
    });

    
    // Copy link to the clipboard
    $(".copy-link").on("click", function() {
        var copyTextarea = document.querySelector('.copy-link-value');
        copyTextarea.type = "text";
        copyTextarea.focus();
        copyTextarea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
            $(this).html('Link copied!');
            $(this).addClass('active');
        } catch (err) {
            console.log('Oops, unable to copy');
        }
        copyTextarea.type = "hidden";
    });

    $(".dropdown-item.js-clipboard").on("click", function() {
        Notifications.showMessage('Link copied to clipboard!', 'success');
    });

});