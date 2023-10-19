var sidebarOpen = false;
var reSortToken = 0; // Ajax request

$(document).ready(function () {
    UI.setFullHeightContainers();
    UI.setBetaItems();
    UI.sidebarSizing();

    // THIS NEEDS CATEGORISING CORRECTLY
    // Header
    // Search container
    // When the user hovers over the search input, highlight the container
    $('.search-container input[type=search]').on('mouseover', function () {
        $(this).parent().addClass('active');
    });

    // When the user moves the mouse away, remove highlight
    $('.search-container input[type=search]').on('mouseout', function () {
        $(this).parent().removeClass('active');
    });

    // When the user focuses on the search input, show the 'clear' icon
    $('.search-container input[type=search]').on('focus', function () {
        $(this).next('.clear-input').fadeIn();
    });

    // Blur search input, hid the 'clear' icon
    $('.search-container input[type=search]').on('blur', function () {
        $(this).next('.clear-input').hide();
    });

    // Create small animation on dropdowns as they come into view
    $(document.body).on('shown.bs.dropdown', function () {
        $('.dropdown-menu').animate({
            marginTop: '0.5rem',
        }, 250);
    });

    // Stop the dropdown from closing when clicking an item which launches as modal
    $('.dropdown-menu').click(function (e) {
        e.stopPropagation();
        if ($(e.target).is('[data-toggle=modal]')) {
            $($(e.target).data('target')).modal();
            $('.dropdown-menu.show').removeClass('show');
        }
    });

    // Reset dropdown on hide
    $(document.body).on('hidden.bs.dropdown', function () {
        $('.dropdown-menu').css('margin-top', '1rem');
    });

    // Ensure 'data-display="static" is set on all dropdowns
    $('.dropdown').attr('data-display', 'static');
    $('.dropdown-menu').attr('data-display', 'static');

    // Auto-complete
    // Adds a div to anything with data-type=autocomplete
    // This is so we can easily add to/hide the autocomplete container in the DOM
    $('input[data-type="autocomplete"]').each(function () {
        AutoComplete.init($(this));
    });

    // Auto-complete on key up
    $('input[data-type="autocomplete"]').on('keyup', function () {
        AutoComplete.get($(this), $(this).data('params'));
    });

    // If we re-focus on an input which has a value, we want to open the search window again
    $('input[data-type="autocomplete"]').on('focus', function () {
        AutoComplete.get($(this), $(this).data('params'));
    });

    // Hide on blur
    // Don't do this for now as there were some cases we wanted the autocomplete to show
    $('input[data-type="autocomplete"]').blur(function (event) {
        //AutoComplete.hide();
    });

    // Select something from the autocomplete, we want to add it to the selection list (if it doesn't already exist)
    $(document).on('click', '.autocomplete-item', function () {
        AutoComplete.select($(this));
    });

    // Remove an autocomplete selection
    $(document).on('click', '.autocomplete-selection-item', function () {
        AutoComplete.remove($(this));
    });

    // Check a container's checkbox/radio if the container is clicked
    $('[data-check]').on('click', function (event) {
        if (event.target.tagName != 'INPUT') {
            var type = $(this).data('check');
            $(this).find('input[type=' + type + ']').trigger('click');
        }
    });

    // Dynamic search
    // Show/hide elements matching the user's search using jquery, rather than lots of ajax calls
    $('input[data-type="dynamicsearch"]').on('keyup', function () {
        UI.dynamicSearch($(this));
    });

    // Beta only?
    $('.beta').click(function () {
        let title = '';
        let description = '';
        let picture = '';
        if ($(this).data('beta-title')) {
            title = $(this).data('beta-title');
        }
        if ($(this).data('beta-description')) {
            description = $(this).data('beta-description');
        } else {
            description = 'This feature will be available from Beta';
        }
        if ($(this).data('beta-picture')) {
            picture = $(this).data('beta-picture');
        }

        let htmlContent = '';
        if (title) {
            htmlContent += `<h1 class='beta-title'><strong>${title}</strong></h1>`;
        }
        if (picture) {
            let path = '/assets/images/beta-images/' + picture;
            htmlContent += `<img class='beta-picture' src='${path}' />`;
        }
        if (description) {
            htmlContent += `<p class='beta-description'>${description}</p>`;
        }
        Swal.fire({
            title: '<strong>Coming Soon!</strong>',
            icon: 'info',
            html: htmlContent,
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonText: 'OK',
            customClass: {
                popup: 'coming-soon-modal',
                title: 'pt-1',
            }
        });
        return false;
    });

    // Sidebars
    $('[data-toggle="sidebar"]').on('click', function (event) {
        var open = true;

        // If we've clicked a tag which we want to ignore, don't open the sidebar
        var ignore = $(this).data('ignore');
        if (ignore != '' && typeof ignore != 'undefined') {
            ignore = ignore.split(',');
            var clicked = event.target.tagName;
            $(ignore).each(function (key, val) {
                if (val == clicked) {
                    open = false;
                }
            });
        }
        if (open) {
            $(this).sidebar('open');
        }
    });

    $('[data-dismiss="sidebar"]').on('click', function () {
        $('.sidebar-active').sidebar('close');
    });

    // Key presses
    $('body').on('keydown', function (event) {
        var keyCode = event.which;

        // Escape
        if (keyCode == 27) {
            // If the sidebar is open, close it when esc is pressed
            if (sidebarOpen) {
                $('.sidebar-active').sidebar('close');
            }
        }
    });

    // Date picker
    // Note, we set 'autoUpdateInput' to false so that the input does not default to today's date if it's empty
    // We then have to run functions on apply.daterangepicker and cancel.daterangepicker events to handle the inputs
    // This isn't ideal but it's the way it has to work
    $('.datepicker').daterangepicker({
        autoUpdateInput: false,
        singleDatePicker: true,
        autoApply: true,
        showDropdowns: true,
        locale: {
            format: 'DD/MM/YYYY',
            cancelLabel: 'Clear',
        },
        drops: 'auto',
    }, function (start, end, label) {

    });

    $('.datepicker').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY'));
        $(this).trigger('change');
    });

    $('.datepicker').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
        $(this).trigger('change');
    });

    // Make sure the year selector is scrolled to the selected, or current, year
    $(document).on('click', '[data-type="yearselect"]', function () {
        var year = $(this).parent().find('.yearselect').val();
        var thisYear;
        var itemHeight;
        var years = 0;
        if (year == 0) {
            year = 2022; // Todo - get from javascript date
        }
        $(this).parent().find('a').each(function () {
            years++;
            thisYear = $(this).data('year');
            itemHeight = $(this).find('.dropdown-item').outerHeight();
            console.log(thisYear + ': ' + itemHeight);
            if (year == thisYear) {
                $(this).parent().scrollTop(itemHeight * (years - 4.5));
            }
        });
    });

    // Modal date pickers need to work slightly differently
    $('.datepicker-modal').daterangepicker({
        autoUpdateInput: false,
        singleDatePicker: true,
        autoApply: true,
        showDropdowns: true,
        locale: {
            format: 'DD/MM/YYYY',
            cancelLabel: 'Clear',
        },
        drops: 'down', // Todo - this should be 'auto', but there were issues with dropping up in modals, so for now ...
        parentEl: '.modal',
    }, function (start, end, label) {

    });

    $('.datepicker-modal').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY'));
        $(this).trigger('change');
    });

    $('.datepicker-modal').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
        $(this).trigger('change');
    });

    // Sidebar date pickers need to work slightly differently
    $('.datepicker-sidebar').daterangepicker({
        autoUpdateInput: false,
        singleDatePicker: true,
        autoApply: true,
        showDropdowns: true,
        locale: {
            format: 'DD/MM/YYYY',
            cancelLabel: 'Clear',
        },
        opens: 'right',
        drops: 'auto',
        parentEl: '.sidebar',
    }, function (start, end, label) {

    });

    $('.datepicker-sidebar').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY'));
        $(this).trigger('change');
    });

    $('.datepicker-sidebar').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
        $(this).trigger('change');
    });

    // Todo - find a more sophisticated way of doing this, using a params object
    // But for now, just use this class to have an opening-left daterangepicker
    // Sidebar date pickers need to work slightly differently
    $('.datepicker-sidebar-left').daterangepicker({
        autoUpdateInput: false,
        singleDatePicker: true,
        autoApply: true,
        showDropdowns: true,
        locale: {
            format: 'DD/MM/YYYY',
            cancelLabel: 'Clear',
        },
        opens: 'left',
        drops: 'auto',
        parentEl: '.sidebar',
    }, function (start, end, label) {

    });

    $('.datepicker-sidebar-left').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY'));
        $(this).trigger('change');
    });

    $('.datepicker-sidebar-left').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
        $(this).trigger('change');
    });

    // Make all daterangepicker inputs readonly
    $('.datepicker').prop('readonly', true);
    $('.datepicker-modal').prop('readonly', true);
    $('.datepicker-sidebar').prop('readonly', true);
    $('.datepicker-sidebar-left').prop('readonly', true);

    // Add a clear button appear on any daterangepicker inputs
    // Todo - make this more sophisticated
    $('input[type=text].datepicker,input[type=text].datepicker-modal,input[type=text].datepicker-sidebar,input[type=text].datepicker-sidebar-left').each(function () {
        if (!$(this).hasClass('link')) {
            $(this).wrap('<div class="position-relative"></div>');
            $(this).after('<i class="far fa-times position-absolute cursor-pointer" style="top:0.6rem; right:0.5rem; opacity:0.5;" onclick="$(this).prev(\'input[type=text]\').val(\'\');"></i>');
        }
    });

    // Modals
    // When a modal is opened, focus on the first input we find
    $('.modal').on('shown.bs.modal', function () {
        $(this).find('.modal-body input[type=text]').first().focus();
    });

    // Load text editor(s)
    $('.text-editorREMOVED').richText(); // All options
    $('.text-editor-basicREMOVED').richText({ // Basic options
        // text formatting
        bold: true,
        italic: true,
        underline: true,

        // text alignment
        leftAlign: false,
        centerAlign: false,
        rightAlign: false,
        justify: false,

        // lists
        ol: true,
        ul: true,

        // title
        heading: true,

        // fonts
        fonts: false,
        fontList: [
            "Arial",
            "Arial Black",
            "Comic Sans MS",
            "Courier New",
            "Geneva",
            "Georgia",
            "Helvetica",
            "Impact",
            "Lucida Console",
            "Tahoma",
            "Times New Roman",
            "Verdana"
        ],
        fontColor: true,
        fontSize: true,

        // uploads
        imageUpload: false,
        fileUpload: false,

        // media
        videoEmbed: false,

        // link
        urls: true,

        // tables
        table: false,

        // code
        removeStyles: false,
        code: true,

        // colors
        colors: [],

        // dropdowns
        fileHTML: '',
        imageHTML: '',

        // translations
        translations: {
            'title': 'Title',
            'white': 'White',
            'black': 'Black',
            'brown': 'Brown',
            'beige': 'Beige',
            'darkBlue': 'Dark Blue',
            'blue': 'Blue',
            'lightBlue': 'Light Blue',
            'darkRed': 'Dark Red',
            'red': 'Red',
            'darkGreen': 'Dark Green',
            'green': 'Green',
            'purple': 'Purple',
            'darkTurquois': 'Dark Turquois',
            'turquois': 'Turquois',
            'darkOrange': 'Dark Orange',
            'orange': 'Orange',
            'yellow': 'Yellow',
            'imageURL': 'Image URL',
            'fileURL': 'File URL',
            'linkText': 'Link text',
            'url': 'URL',
            'size': 'Size',
            'responsive': 'Responsive',
            'text': 'Text',
            'openIn': 'Open in',
            'sameTab': 'Same tab',
            'newTab': 'New tab',
            'align': 'Align',
            'left': 'Left',
            'center': 'Center',
            'right': 'Right',
            'rows': 'Rows',
            'columns': 'Columns',
            'add': 'Add',
            'pleaseEnterURL': 'Please enter an URL',
            'videoURLnotSupported': 'Video URL not supported',
            'pleaseSelectImage': 'Please select an image',
            'pleaseSelectFile': 'Please select a file',
            'bold': 'Bold',
            'italic': 'Italic',
            'underline': 'Underline',
            'alignLeft': 'Align left',
            'alignCenter': 'Align centered',
            'alignRight': 'Align right',
            'addOrderedList': 'Add ordered list',
            'addUnorderedList': 'Add unordered list',
            'addHeading': 'Add Heading/title',
            'addFont': 'Add font',
            'addFontColor': 'Add font color',
            'addFontSize': 'Add font size',
            'addImage': 'Add image',
            'addVideo': 'Add video',
            'addFile': 'Add file',
            'addURL': 'Add URL',
            'addTable': 'Add table',
            'removeStyles': 'Remove styles',
            'code': 'Show HTML code',
            'undo': 'Undo',
            'redo': 'Redo',
            'close': 'Close'
        },

        // privacy
        youtubeCookies: false,

        // preview
        preview: false,

        // placeholder
        placeholder: '',

        // developer settings
        useSingleQuotes: false,
        height: 150,
        heightPercentage: 0,
        adaptiveHeight: false,
        id: "",
        class: "",
        useParagraph: false,
        maxlength: 0,
        callback: undefined,
        useTabForNext: false
    });

    $('body').on('click', '[data-toggle="sidebartab"]', function () {
        var tab = $(this).data('tab');
        var target = $(this).data('target');
        var focus = $(this).data('focusto');

        $(target).sidebar('tab', { tab: tab, focus: focus });
    });

    // Function to handle sidebar actions
    $.fn.sidebar = function (action, params) {
        if (typeof params == 'undefined') {
            params = [];
        }
        params.swap = 0; // DD - 1/10/21 - Bug with swapping sidebars, so just don't allow it for now
        // DD - 28/10/21 - A bit more about the above bug - if a sidebar is opened, when we open another the page does a bit of a resize (the header is most noticeable)
        // So for example in 'tasks', the 'create' button will move into view using the new content space

        if (action == 'open') {
            if ($('.sidebar-active').attr('id') == $(this).attr('id')) {
                $('.sidebar-active').sidebar('close', { swap: 1 });
            } else {
                $('.sidebar-active').sidebar('close');
            }
            var sidebar = this;
            if (!$(this).hasClass('sidebar')) {
                sidebar = $(this).data('target');
            }

            var windowWidth = $(window).outerWidth();

            var moduleMenuWidth = 0;
            if ($('.menu-nav').is(':visible')) {
                moduleMenuWidth = $('.menu-nav').width();
            }

            // The window width might actually be higher


            var scrollbarWidth = window.innerWidth - document.getElementsByTagName('html')[0].clientWidth;
            console.log('scrollbar ' + scrollbarWidth);

            if (scrollbarWidth > 0) {
                windowWidth += scrollbarWidth;
            }

            var sidebarWidth = $(sidebar).outerWidth();
            var outerWidth = windowWidth - moduleMenuWidth;
            var contentWidth = outerWidth - sidebarWidth;
            //outerWidth = windowWidth+10;
            /*if(windowIsScrolling()) {
                //contentWidth-= 16; // Hacky!
                //outerWidth-= 16;
            } else {
                //contentWidth-= 48; // Hacky!
                //outerWidth-= 48;
            }*/

            console.log('Sidebar width ' + sidebarWidth);
            console.log('Window width ' + windowWidth);
            console.log('Module menu width ' + moduleMenuWidth);

            $(sidebar).addClass('sidebar-active', 250, function () {
                sidebarOpen = true;

                $('.content-container').css('width', outerWidth + 'px');
                $('.section-header').css('width', outerWidth + 'px');

                // Main container stuff
                //$('.main-container').addClass('sidebar');
                $('main').css('width', contentWidth + 'px');
                console.log('Setting main container to ' + contentWidth);
                $('main').addClass('h-100vh');
                $('main').css('overflow-x', 'auto');
                setTimeout(function () {
                    $('main').removeClass('hide-scroll');
                }, 250);

                // Focus on the first text element in the tab
                // Note, this won't work on mobile (iOS at least) because Apple aren't keen on the keyboard popping up, which is fine
                $('.sidebar-active input:text, .sidebar-active textarea').first().select();
            });
        } else if (action == 'close') {
            if (sidebarOpen) {
                sidebarOpen = false;
                setTimeout(function () {
                    $('.content-container').css('width', '');
                    $('.section-header').css('width', '');
                }, 250);

                // Main container stuff
                //$('.main-container').removeClass('sidebar');
                $('main').css('width', '');
                $('main').removeClass('h-100vh');
                $('main').css('overflow-x', 'hidden');
                $('main').addClass('hide-scroll');

                // Clear any user/team/role selection lists
                $('.sidebar-active [data-list]').each(function () {
                    $(this).find('.filter-applied').each(function () {
                        if (!$(this).hasClass('clear')) {
                            $(this).remove();
                        }
                    });
                });

                // Clear any comment replies
                //Comments.clearReplies();

                // Clear any @mentions
                $('.mentions').html('<div></div>');

                if (typeof params != 'undefined' && params.swap == 1) {

                } else {
                    $('.sidebar').removeClass('sidebar-active', 250);
                }
            }
        } else if (action == 'tab') {
            var sidebar = this.selector;
            var tab = 0;
            if (params.tab > 0) tab = params.tab;
            var focus = '';
            if (typeof params.focus != 'undefined' && params.focus != '') focus = params.focus;
            if (typeof params.element != 'undefined' && params.element != '') sidebar = params.element;

            $(sidebar + ' [data-sidebar-tab]').removeClass('active');
            $(sidebar + ' [data-sidebar-tab="' + tab + '"]').addClass('active');
            $(sidebar + ' [data-sidebar-tab-content]').hide();
            $(sidebar + ' [data-sidebar-tab-footer]').addClass('d-none');
            $(sidebar + ' [data-sidebar-tab-content="' + tab + '"]').show();
            $(sidebar + ' [data-sidebar-tab-footer="' + tab + '"]').removeClass('d-none');

            sidebarSizing(); // If we've just put a footer in view, we'll need to resize the body height to enable scrolling within the sidebar

            // Do some bespoke stuff
            if (sidebar == '#sidebar-edit-task') {
                if (tab == 0 && typeof params.element == 'undefined') {
                    var taskId = $(sidebar).find('input[name=taskId]').val();
                    openTask(null, taskId, true);
                }
            }

            // Focus on the designated input or the first text element in the tab
            if (focus != '') {
                setTimeout(function () {
                    $('[data-sidebar-tab-content="' + tab + '"] input[name=' + focus + '], [data-sidebar-tab-content="' + tab + '"] textarea[name=' + focus + ']').first().focus();
                }, 350);
            } else {
                setTimeout(function () {
                    $('[data-sidebar-tab-content="' + tab + '"] input:text, [data-sidebar-tab-content="' + tab + '"] textarea').first().select();
                }, 350);
            }
        }
    };

    // Update any '2 minutes ago' values dynamically
    UI.updateMinutesAgo();
    setInterval(function () {
        UI.updateMinutesAgo();
    }, 60 * 1000);
});

// Used in members-list.php snippet
function selectMember(obj, elementId) {
    var type = $(obj).data('type');
    var id = $(obj).data('id');
    var text = $(obj).find('.name').text();
    var avatarImg = $(obj).find('.avatar-circle').clone();;
    avatarImg.find('.avatar-img').after('<a href="#" class="remove-member"><i class="bi bi-x"></i></a>');
    avatarImgHtml = avatarImg.html();
    var html = '';

    if (type == 'role') {
        text += ' (role)';
    } else if (type == 'team') {
        text += ' (team)';
    }

    if ($(obj).hasClass('selected')) {
        $(obj).removeClass('selected');
        // Remove from list
        $(elementId).find('.selected-membes').each(function () {
            if (type != '' && id > 0 && $(this).data('type') == type && $(this).data('id') == id) {
                console.log('found ' + type + ':' + id + ' to remove');
                $(this).fadeOut('fast', function () {
                    $(this).remove();
                });
            }
        });
    } else {
        $(obj).addClass('selected');
        // Add to list
        // html = '<div data-type="' + type + '" data-id="' + id + '" class="member-selection" onclick="deselectMember(this, \'' + elementId + '\');">';
        // html += '<input type="hidden" name="' + type + '[]" value="' + id + '">';
        // html += text;
        // html += '<i class="fal fa-times ms-3 text-sm"></i>';
        // html += '</div>';

        html = '<div data-type="' + type + '" data-id="' + id + '" onclick="deselectMember(this, \'' + elementId + '\');" class="selected-membes external-user">';
        html += '<input type="hidden" name="' + type + '[]" value="' + id + '">';
        html += avatarImgHtml;
        html += '</div>';
        $(elementId).find('.member-item-selection').append(html);
    }
}

function deselectMember(obj, elementId) {
    var type = $(obj).data('type');
    var id = $(obj).data('id');

    $(elementId).find('.member-item').each(function () {
        if (type != '' && id > 0 && $(this).data('type') == type && $(this).data('id') == id) {
            console.log('found ' + type + ':' + id + ' to CLICK');
            $(this).trigger('click');
        }
    });
}

// Window resizing
$(window).on('resize', function () {
    UI.setFullHeightContainers();
    UI.resizeActivityCards();
    UI.sidebarSizing();

    // Make sure the mobile menu disappears if we resize
    menuActive = true;
    UI.toggleMenu(true);
});

// Window scrolling
$(window).on('scroll', function () {
    UI.setStickyItems();
});

// --------------------------------------------------------------
/**
 * System Search
 */
// --------------------------------------------------------------



// Auto-complete
// Adds a div to anything with data-type=autocomplete
// This is so we can easily add to/hide the autocomplete container in the DOM
$('input[data-type="autoCompleteSystemSearch"]').each(function () {
    SystemSearch.init($(this));
});

// Auto-complete on key up
$('input[data-type="autoCompleteSystemSearch"]').on('keyup', function () {
    SystemSearch.get($(this), $(this).data('params'));
});

// If we re-focus on an input which has a value, we want to open the search window again
$('input[data-type="autoCompleteSystemSearch"]').on('focus', function () {
    SystemSearch.get($(this), $(this).data('params'));
});

// Hide on blur
// Don't do this for now as there were some cases we wanted the autocomplete to show
$('input[data-type="autoCompleteSystemSearch"]').blur(function (event) {
    //SystemSearch.hide();
});

// Select something from the autocomplete, we want to add it to the selection list (if it doesn't already exist)
$(document).on('click', '.autoCompleteSystemSearch-item', function () {
    SystemSearch.select($(this));
});

// Remove an autocomplete selection
$(document).on('click', '.autoCompleteSystemSearch-selection-item', function () {
    SystemSearch.remove($(this));
});

$('.lastrecentsearchtext').on('click', function () {
    var searchtext = $(this).attr('data-value');
    $('input[data-type="autoCompleteSystemSearch"]').val(searchtext);
    $('input[data-type="autoCompleteSystemSearch"]').focus();
});

function storeSystemSearchText() {
    var search = $('input[data-type="autoCompleteSystemSearch"]').val();
    var type = 'save';
    var autoCompleteToken = 0;
    $.getJSON('/ajax/UI/SystemSearch.php', { search: search, systemFilterType: type, token: autoCompleteToken }).done(function (json) {

        if (json.response == 'OK' && json.token == autoCompleteToken) {
            // $('#systemSearchContent').html(json.results);
        }
    });
}

//----------------------------------------------------
/**
 * End System Search
 */
//----------------------------------------------------




var menuCollapsed = false; // Tablet/desktop
var menuActive = false; // Mobile
if (localStorage.getItem('menuCollapsed') == 1) menuCollapsed = true;
class UI {
    static toggleMenu(mobile) {
        if (mobile) {
            if (menuActive) {
                $('.menu.mobile').css('left', '-16.25rem');
                $('.menu').removeClass('mobile');
                menuActive = false;
            } else {
                $('.menu').addClass('mobile');
                $('.menu.mobile').animate({
                    left: '0',
                }, 300);
                menuActive = true;
            }
        } else {
            if (menuCollapsed) {
                $('.expand-contract i').toggleClass('fa-angle-left');
                $('.expand-contract i').toggleClass('fa-angle-right');
                $('.menu').removeClass('collapsed');
                $('.header').removeClass('collapsed');
                $('.page').removeClass('collapsed');
                $('.menu li.title').show();
                $('.menu li.title').next('li').not('.collapsed-only').remove();
                menuCollapsed = false;
            } else {
                $('.expand-contract i').toggleClass('fa-angle-left');
                $('.expand-contract i').toggleClass('fa-angle-right');
                $('.menu').addClass('collapsed');
                $('.header').addClass('collapsed');
                $('.page').addClass('collapsed');
                $('.menu li.title').hide();
                $('.menu li.title').after('<li><i class="fas fa-fw fa-ellipsis-h opacity-50"></i></li>');
                menuCollapsed = true;
            }

            $.get('/ajax/UI/ToggleMenu.php', { collapsed: menuCollapsed }).done(function (response) {
                if (response != 1) {
                    console.log('Unable to set menu state');
                }
            });

            localStorage.setItem('menuCollapsed', (menuCollapsed ? 1 : 0));
        }
    }

    static toggleSideMenu(data) {

            $.get('/ajax/UI/ToggleSideMenu.php', { collapsed: data }).done(function (response) {
                if (response != 1) {
                    console.log('Unable to set menu state');
                }
            });

            localStorage.setItem('sideMenuCollapsed', ((parseInt(data) == 1)?true:false));
        
    }

    static toggleMode() {
        var mode = $('#mode-stylesheet').data('mode');
        if (mode == 'light') {
            $('#mode-stylesheet').attr('href', '/assets/css/dark-mode.css');
            $('#mode-stylesheet').data('mode', 'dark');
        } else {
            $('#mode-stylesheet').attr('href', '/assets/css/light-mode.css');
            $('#mode-stylesheet').data('mode', 'light');
        }
        $.get('/ajax/UI/ToggleMode.php').done(function (response) {
            if (response != 1) {
                console.log('Unable to set mode');
            }
        });
    }

    static showUnsaved() {
        $('.header-save').slideDown('fast');
    }

    static hideUnsaved() {
        $('.header-save').slideUp('fast');
    }

    // For 'steps' to work, you need to make sure the steps are contained within a <form>
    // A working example can be found in /template/modals/add-project.php
    // There is a flaw in the way we currently handle disabled steps in that if the disabled step is the last step,
    // we will still land on it. So for now, only use step disabling if there are 3 or more, and the step to be disabled
    // is not the first or last step!
    // Todo - improve step disabling
    static step(obj) {
        var step = $(obj).data('step');
        var current = 0;
        var total = 0;
        var direction = 'down';
        var i = 0;

        $(obj).closest('form').find('.steps').find('.step-item').each(function () {
            total++;
            if ($(this).hasClass('active')) {
                current = $(this).data('step');
            }
        });

        if (!isNaN(step) && step >= current) {
            direction = 'up';
        }

        if (step == 'prev' || step == 'next') {
            if (step == 'prev') {
                step = current - 1;
                for (i = 0; i < total; i++) {
                    // Is this step disabled? If so, allow the loop to continue until we find the next available step
                    if ($(obj).closest('form').find('.steps').find('.step-item[data-step=' + step + ']').hasClass('disabled')) {
                        step -= 1;
                    }
                }
                if (step <= 0) {
                    step = 1;
                }
            }
            if (step == 'next') {
                step = current + 1;
                for (i = 0; i < total; i++) {
                    // Is this step disabled? If so, allow the loop to continue until we find the next available step
                    if ($(obj).closest('form').find('.steps').find('.step-item[data-step=' + step + ']').hasClass('disabled')) {
                        step += 1;
                    }
                }
                if (step > total) {
                    step = total
                }
            }
        } else {
            for (i = 0; i < total; i++) {
                // Is this step disabled? If so, allow the loop to continue until we find the next available step
                if ($(obj).closest('form').find('.steps').find('.step-item[data-step=' + step + ']').hasClass('disabled')) {
                    if (direction == 'up') {
                        step += 1;
                    } else {
                        step -= 1;
                    }
                }
                if (direction == 'up') {
                    if (step > total) {
                        step = total
                    }
                } else {
                    if (step <= 0) {
                        step = 1;
                    }
                }
            }
        }

        $(obj).closest('form').find('.steps').find('.step-item').removeClass('active');
        $(obj).closest('form').find('.steps').find('.step-item[data-step="' + step + '"]').addClass('active');
        $(obj).closest('form').find('.step-containers').find('[data-step]').hide();
        $(obj).closest('form').find('.step-containers').find('[data-step="' + step + '"]').fadeIn();
        $(obj).closest('form').find('.step-containers').find('[data-step="' + step + '"]').find('input[type=text]').first().focus();

        // Show/hide the 'prev' button?
        if (step <= 1) {
            $(obj).closest('form').find('button[data-step="prev"]').hide();
        } else {
            $(obj).closest('form').find('button[data-step="prev"]').show();
        }

        // Show/hide the 'next' and 'save' buttons?
        if (step >= total) {
            step = total;
            $(obj).closest('form').find('button[data-step="next"]').hide();
            $(obj).closest('form').find('button[data-step="save"]').show();
        } else {
            $(obj).closest('form').find('button[data-step="next"]').show();
            $(obj).closest('form').find('button[data-step="save"]').hide();
        }

        // fix the focus tab on click
        // it will remove the foucs from all the right side tabs on clicking on the tab
        let currentLiElmt = $(obj).parents('li');

        let ulElmt = currentLiElmt.parents('.js-step-progress');

        ulElmt.find('li').each(function () {
            $(this).removeClass('focus');
            $(this).removeClass('active');
            $(this).removeClass('is-valid');
        });
 
    }

    // Disable/enable a step
    // An example of where we use this can be found in /template/modals/add-project.php
    // If the user sets the project to 'private', the second step is disabled because there is
    // no need to add members
    static disableStep(obj, step) {
        $(obj).closest('form').find('.steps').find('[data-step=' + step + ']').addClass('disabled');
    }

    static enableStep(obj, step) {
        $(obj).closest('form').find('.steps').find('[data-step=' + step + ']').removeClass('disabled');
    }

    static setFullHeightContainers(obj) {
        var viewportHeight = $(window).height();
        var newHeight = 0;
        var offsetTop;
        var scrollbarHeight = 40;

        if (typeof obj == 'undefined' || obj == '') obj = '.full-height';

        $(obj).each(function () {
            offsetTop = $(this).offset().top;
            newHeight = viewportHeight - offsetTop - scrollbarHeight;

            $(this).outerHeight(newHeight);
            if (!$(this).hasClass('full-height-no-min')) {
                $(this).css('min-height', '100%');
            }
        });
    }

    static resizeActivityCards() {
        // Activity cards need resizing
        var recentActivityContainerWidth = $('#recent-activity-container').width();
        recentActivityContainerWidth = recentActivityContainerWidth * 0.7;
        $('.recent-activity-card-description').width(recentActivityContainerWidth + 'px');
    }

    static updateMinutesAgo() {
        console.log('Updating minutes...');
        $('[data-minutes-ago]').each(function () {
            var minutes = $(this).data('minutes-ago');
            var hours = (minutes > 60 ? Math.round(minutes / 60) : 0);
            var days = (hours > 24 ? Math.round(hours / 24) : 0);
            var weeks = (days > 7 ? Math.round(days / 7) : 0);
            var months = (weeks > 4 ? Math.round(weeks / 4) : 0);
            var years = (months > 12 ? Math.round(months / 12) : 0);

            var html = '';

            if (years > 0) {
                html = years + ' year' + (years == 1 ? '' : 's') + ' ago';
            } else if (months > 0) {
                html = months + ' month' + (months == 1 ? '' : 's') + ' ago';
            } else if (weeks > 0) {
                html = weeks + ' week' + (weeks == 1 ? '' : 's') + ' ago';
            } else if (days > 0) {
                html = days + ' day' + (days == 1 ? '' : 's') + ' ago';
            } else if (hours > 0) {
                html = hours + ' hour' + (hours == 1 ? '' : 's') + ' ago';
            } else if (minutes > 0) {
                html = minutes + ' min' + (minutes == 1 ? '' : 's') + ' ago';
            } else {
                html = 'just now';
            }

            $(this).html(html);

            // Update the figure so the next time we loop round it gets updated again
            $(this).data('minutes-ago', parseInt(minutes + 1));
        });
    }

    static setStickyItems() {
        var scrollTop = $(window).scrollTop();
        var headerHeight = $('.header').outerHeight();
        var width;
        var height;
        var css;
        var reset;

        var checkHeight = headerHeight;
        checkHeight += $('.header-title').outerHeight();
        checkHeight += $('.tabs').outerHeight();

        // Loop through each item with the class name 'make-sticky'
        // If the scroll height exceeds the offset.top value for this item, make it sticky
        // Get the height of the item
        // Offset the content below's top-margin by the height

        // The make-sticky class is only designed to make a single container sticky, such as a navigation menu
        var screenWidth = $(window).width();
        if (screenWidth >= 768) { // Don't do this in mobile view
            $('.make-sticky').each(function () {
                reset = false;
                width = $(this).outerWidth();
                height = $(this).outerHeight();
                css = $(this).data('css');
                if (scrollTop >= checkHeight) {
                    if (!$(this).hasClass('sticky') && ($(this).offset().top - headerHeight) < scrollTop) {
                        $(this).css('width', width + 'px');
                        $(this).addClass('sticky');
                        $(this).css('top', headerHeight + 'px');
                        $(this).css('margin-top', '1.25rem');

                        // Set the next container to have a bit of extra margin
                        // Not sure what this was for, but keep it here in case it's needed
                        //$(this).next('div').css('margin-top', height+'px');
                    } else {
                        // Todo - handle smoother revert
                    }
                } else {
                    reset = true;
                }

                if (reset) {
                    $(this).css('width', '');
                    $(this).removeClass('sticky');
                    $(this).css('top', '');
                    $(this).css('margin-top', '');
                    $(this).next('div').css('margin-top', '');
                }
            });
        }
    }

    // Currently this is only supported for use with member-items/member-item objects
    // Todo - expand this to work with any provided objects
    static dynamicSearch(obj) {
        var search = $(obj).val();
        search = search.toLowerCase();

        var haystack = '';

        $(obj).parent().siblings().each(function () {
            $(this).find('.member-item').each(function () {
                haystack = $(this).data('search-value');
                haystack = haystack.toLowerCase();
                if (haystack.indexOf(search) == -1) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });

            // We now need to loop through each list and if there are no items showing, display a 'sorry, no results' message
            var html = '<div class="w-100 p-3 text-center" data-type="noresults">Sorry, no results</div>';

            $(this).find('.member-items').each(function () {
                var count = 0;
                $(this).find('.member-item').each(function () {
                    if ($(this).is(':visible')) {
                        count++;
                    }
                });
                if (count == 0) {
                    $(this).find('[data-type="noresults"]').remove();
                    $(this).append(html);
                } else {
                    $(this).find('[data-type="noresults"]').remove();
                }
            });
        });
    }

    static setBetaItems() {
        $(document).find('.beta-label').remove();

        // Attach icons
        $('.beta').each(function () {
            var html = '';
            var width = $(this).outerWidth();
            var height = $(this).outerHeight();
            var isDropdownItem = false;
            var isTabItem = false;
            var isNavItem = false;
            var isSelectRow = false;
            var isHeaderSearch = false;
            var isButton = false;
            if ($(this).hasClass('dropdown-item')) {
                isDropdownItem = true;
            } else if ($(this).hasClass('tab')) {
                isTabItem = true;
            } else if ($(this).parent().parent().hasClass('menu-nav')) {
                isNavItem = true;
            } else if ($(this).hasClass('select-row')) {
                isSelectRow = true;
            } else if ($(this).hasClass('search-container')) {
                isHeaderSearch = true;
            } else if ($(this).hasClass('btn')) {
                isButton = true;
            }
            let betaLabel = 'V2.0';
            if (isDropdownItem) {
                html = '<div class="beta-label" style="right:0px; bottom:-6px;">' + betaLabel + '</div>';
            } else if (isTabItem) {
                html = '<div class="beta-label" style="right:0px; bottom:-6px;">' + betaLabel + '</div>';
            } else if (isNavItem) {
                html = '<div class="beta-label" style="right:0px; bottom:-6px;">' + betaLabel + '</div>';
            } else if (isSelectRow) {
                html = '<div class="beta-label" style="right:-6px; bottom:-6px;">' + betaLabel + '</div>';
            } else if (isHeaderSearch) {
                html = '<div class="beta-label" style="left:' + width + 'px; bottom:-6px;">' + betaLabel + '</div>';
            } else {
                html = '<div class="beta-label" style="top:' + (height - 3) + 'px; right:-5px;">' + betaLabel + '</div>';
            }

            // Apply css if it has not .no-beta-css class
            $(this).append(html);
            if (!$(this).hasClass('no-beta-css')) {
                $(this).css('opacity', '0.625');
                if (!isTabItem && !isButton) {
                    $(this).css('background', '#f2f3f4');
                }
            }
           
        });
    }

    static sidebarSizing() {
        var buffer = 1;
        var screenHeight = $(window).height();
        $('.sidebar').each(function () {
            console.log($(this).attr('id'));
            if ($(this).find('.sidebar-footer').hasClass('sticky')) {
                var headerHeight = $(this).find('.sidebar-header').outerHeight();
                var footerHeight = $(this).find('.sidebar-footer').outerHeight();
                var newBodyHeight = screenHeight - headerHeight - footerHeight - buffer;

                $(this).find('.sidebar-body').outerHeight(newBodyHeight);
                console.log('set outer height to ' + newBodyHeight);
            }
        });
    }

    static togglePasswordInput(obj) {
        var name = $(obj).data('target');
        var input = $('input[name=' + name + ']');

        if ($(input).attr('type') == 'password') {
            $(input).attr('type', 'text');
            $(obj).removeClass('fa-eye-slash');
            $(obj).addClass('fa-eye');
        } else {
            $(input).attr('type', 'password');
            $(obj).removeClass('fa-eye');
            $(obj).addClass('fa-eye-slash');
        }
    }

    static sortTable(obj, column) {
        // This function requires the obj's closest form having a hidden input named 'sort'
        let sortingForm = $('form[name=frm]');
        let actionUrl = window.location.href;
        sortingForm.attr('action', actionUrl);
        sortingForm.find('input[name=sort]').val(column);
        sortingForm.submit();
    }

    // This is currently quite hard coded - todo - make generic
    static reSort(type) {
        if (type == 'deliverables') {
            var sort = [];
            var i = 0;
            $('#deliverablesTable [data-deliverableid]').each(function () {
                sort[i] = $(this).data('deliverableid');
                i++;
            });
            reSortToken++;

            $.get('/ajax/UI/ReSort.php', { type: type, sort: sort, token: reSortToken });

            // Todo - error handling/
        }
    }

    // Adds an error message to the current modal
    static modalError(error) {
        $('.modal-error').remove();

        var html = '<div class="modal-error mb-3 text-danger font-weight-500">';
        html += '<i class="fas fa-exclamation-triangle mr-2"></i> ' + error;
        html += '</div>';

        $('.modal.show').find('.modal-body').prepend(html);
    }

    //delete Filter
    static deleteFilterView(filterId) {
        swal.fire({
            title: 'Are you sure, you want to delete the filter?',
            icon: 'warning',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            confirmButtonColor: '#d33',
            reverseButtons: true,
            showCloseButton: true,
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                $.getJSON('/ajax/UI/DeleteFilter.php', { filterId: filterId }).done(function (json) {
                    if (json.response == 'OK') {
                        Notifications.showMessage('The filter has been deleted.', 'success');
                        window.setTimeout(function () {
                            location.replace(window.location.href);
                        }, 1000);
                    }
                });


            }
        });
    }

    // Focus the modal tab given in the parameter
    static focusTab(formId, tabId) {
        //return in case of blank tabId
        if(!tabId) {
            return false;
        }

        let form = $('#'+formId);
        if (tabId && form.find(`#${tabId}`)) {
            // focus on this tab
            let liElmt = form.find(`#${tabId}`);
            // show the selected tab
            let liList = liElmt.closest('ul').find('li');
            let totalTabs = liList.length;
            let focusTabIndex =  0;
            liList.each(function(idx, li) {
                if ($(li).attr('id') && $(li).attr('id') == tabId) {
                    focusTabIndex = idx;
                }
            });
            
            // Mark active tabs till the given tab
            liList.each(function(idx, li) {
                let options = $(li).find('.step-content-wrapper').data('hs-step-form-next-options');
                let targetSelector = options.targetSelector;
                if (idx < focusTabIndex) {
                    $(li).addClass('is-valid');
                    $(li).removeClass('active');
                    $(li).removeClass('focus');
                    form.find(targetSelector).removeClass('active');
                    form.find(targetSelector).hide();
                } else if (idx == focusTabIndex) {
                    $(li).addClass('active');
                    $(li).addClass('focus');
                    form.find(targetSelector).addClass('active');
                    form.find(targetSelector).show();
                } else {
                    $(li).removeClass('active');
                    $(li).removeClass('focus');
                    $(li).removeClass('is-valid');
                    form.find(targetSelector).removeClass('active');
                    form.find(targetSelector).hide();
                }
            });
            return true;
        }
        return false;
    }

    // Focus the input field given in the parameter
    static focusElement(formId, input, tabId = '') {
        //return in case of blank input
        if(!input) {
            return false;
        }

        let form = $('#'+formId);

        if (tabId) {
            UI.focusTab(formId, tabId);
        }

        if (form) {
            let inputField = $(form).find(`[name=${input}]`);
            if (inputField) {
                inputField.focus();
            }
        }
    }

    static openModal(modalId, focusInput = '', tabId = '') {
        let modelElmt = document.getElementById(modalId);
        let modal = new bootstrap.Modal(modelElmt, {});
        modal.show();
        // foucs the input element given in the parameter
        if (focusInput) {
            modelElmt.addEventListener('shown.bs.modal', function () {
                UI.focusElement(modalId, focusInput, tabId);
                // remove event listner after being invoked one time 
            }, {once : true});
        } else if (tabId) {
            let form = $('#'+ modalId).find('form');
            if (form && form.attr('id')) {
                UI.focusTab(form.attr('id'), tabId);
            }
        }
    }
    /**
     * Bootstrap modal id
     * @param {string} modalId
     */
    static confirmWithoutSave(modalId) {
        // add event listner for close modal dialog without saving the form in case of edited form data
        let modalElmt =  $('#'+ modalId);
        let target = modalElmt.find('form');
        let initialData = target.serialize();

        // set backdrop to static to validate the unsaved form while closing the modal
        let jsModalEl = document.getElementById(modalId);
        let jsModal = bootstrap.Modal.getInstance(jsModalEl);
        jsModal._config.backdrop = 'static';
        jsModal._config.keyboard = false;

        target.data('initialData', initialData);
        let modelClosebtns = modalElmt.find('button[data-bs-dismiss="modal"]');
        modelClosebtns.each(function () {
            // let remove the data-bs-dismiss="modal" attribute to prevent the modal from closing from the button
            $(this).removeAttr('data-bs-dismiss');
            $(this).off('click');
            $(this).on('click', function (event) {
                event.preventDefault();
                if (target.data('initialData') != target.serialize()) {
                    swal.fire({
                        title: 'Are you sure you want to exit without saving?',
                        html: '',
                        icon: 'warning',
                        confirmButtonText: 'Yes, exit it!',
                        cancelButtonText: 'No, cancel!',
                        confirmButtonColor: '#d33',
                        reverseButtons: true,
                        showCloseButton: true,
                        showCancelButton: true,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            modelClosebtns.each(function () {
                                // add the data-bs-dismiss="modal in case opened by other actions
                                $(this).attr('data-bs-dismiss', 'modal');
                                $(this).off('click');
                            });
                            modalElmt.modal('hide');
                        }
                    });
                } else {
                    modalElmt.modal('hide');
                    // add the data-bs-dismiss="modal in case opened by other actions
                    $(this).attr('data-bs-dismiss', 'modal');
                    $(this).off('click');
                }
            });
        });
    }

    static isInternalRecord(userId) {
        let internaleUsers = [1,2,3, 50];
        if (userId) {
            userId = parseInt(userId);

            if (internaleUsers.indexOf(userId) !== -1) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    }
}

