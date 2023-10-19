/* README
To use this, you need to have a <div> with a text input inside
This input must have the following attribute: data-type="autocomplete"
Then a sibling <div> with the class "autocomplete-selection"

Example:

<div class="col-12" pb-2">
    <div>
        <input type="text" data-type="autocomplete" data-params='{"mode": "avatar", "users": true, "teams": true, "roles": false}' class="form-control" placeholder="Search for users or teams to assign to this project">
    </div>
</div>
<div class="col-12">
    <div data-type="autocomplete-selection"></div>
</div>
*/

var autoCompleteToken = 0;

class AutoComplete {
    static init(obj) {
        $(obj).after('<div class="autocomplete"></div>');
    }

    static get(obj, params) { // params should always be json
        var search = $(obj).val();
        var length = search.length;
        var html = '';
        var width = $(obj).outerWidth();
        var max = 0;
        var setWidth = false;
        if(params.width > 0) {
            setWidth = true;
            width = params.width;
        }
        if(params.max > 0) {
            max = params.max;
        }

        if(length > 1) {
            autoCompleteToken++;
            $.getJSON('/ajax/UI/AutoComplete.php', {search: search, token: autoCompleteToken, params: params}).done(function(json) {
                console.log(json);
                if(json.response == 'OK' && json.token == autoCompleteToken) {
                    $(obj).next('.autocomplete').html('');
                    if(setWidth) {
                        $(obj).next('.autocomplete').addClass('set-width');
                    } else {
                        $(obj).next('.autocomplete').removeClass('set-width');
                    }
                    
                    if(json.mode == 'avatar') {
                        if (json.results && json.results.length > 0) {
                            $(json.results).each(function(key, result) {
                                html+= '<div class="autocomplete-item" data-type="'+result.type+'" data-max="'+max+'" data-id="'+result.id+'" data-label="'+result.name+'">';
                                html+= result.avatar;
                                html+= '<div class="ps-3 my-auto">';
                                html+= result.name;
                                if(result.subtitle != '' && typeof result.subtitle != 'undefined') {
                                    html+= '<br><span>'+result.subtitle+'</span>';
                                }
                                html+= '</div>';
                                html+= '</div>';
                            });
                        } else {
                            // add option with create new company button in case of company autocomplete dropdown
                            if (params.hasOwnProperty('customers')) {
                                html = `<div class="autocomplete-item" data-type="customer" data-max="1" data-id="0" data-label="${search}">
                                            <div class="avatar avatar-soft-primary avatar-circle " style="background:#84ffff; color:black;" title="test ">
                                                <span class="avatar-initials">${search[0]}</span>
                                            </div>
                                            <div class="ps-3 my-auto">
                                            ${search} 
                                            <a href="#" class="link-primary drop-down-add-new-record" onclick="event.stopPropagation();AutoComplete.createRecord(this);"  data-params='{"type": "company", "data": {"companyName": "${search}"}}'>Add new company</a>
                                            </div>
                                        </div>`;
                            }
                        }
                    }

                    $(obj).addClass('autocomplete-input');
                    $(obj).next('.autocomplete').outerWidth(width);
                    $(obj).next('.autocomplete').html(html);
                    $(obj).next('.autocomplete').slideDown();
                }
            });
        } else {
            AutoComplete.hide(obj);
        }
    }

    static hide(obj) {
        $('.autocomplete').hide();
        $(obj).parent().parent().find('input[type=text]').first().show(); // Only present if max is 1
        $('input[data-type="autocomplete"]').removeClass('autocomplete-input');
        $('input[data-type="autocomplete"]').html('');
    }

    static select(obj) {
        var label = $(obj).data('label');
        var type = $(obj).data('type');
        var max = $(obj).data('max'); // Currently, we only support max = 1, where we replace the selection
        var id = $(obj).data('id');
        if (id == 0) {
            return false;
        }
        var exists = false;
        var total = 0;

        // Check this item hasn't already been selected - we won't add it again if it has
        $(obj).parent().parent().parent().siblings().next('.autocomplete-selection').children().each(function() {
            total++;
            if($(this).data('type') == type && $(this).data('id') == id) {
                exists = true;
            }
        });

        if(!exists) {
            var html = '<div class="'+(max == 1 ? 'w-100 mt-2' : 'd-inline-block mt-2')+' me-2" data-type="'+type+'" data-id="'+id+'">';
            html+= '<div class="autocomplete-selection-item">';
            html+= '<input type="hidden" name="'+type+'[]" value="'+id+'">';
            html+= '<span>'+label+'</span>';
            html+= '<i class="far fa-times"></i>';
            html+= '</div>';
            html+= '</div>';

            if(max == 1) {
                //$(obj).parent().parent().parent().siblings('.autocomplete-selection').html(html);
                $(obj).parent().parent().find('input[type=text]').first().hide();
                $(obj).parent().parent().find('.autocomplete-selection').html(html);
            } else {
                $(obj).parent().parent().parent().siblings('.autocomplete-selection').append(html);
            }
        }

        AutoComplete.hide(obj);
    }

    static remove(obj) {
        $(obj).parent().fadeOut('fast', function() {
            $(obj).parent().remove();
        })
    }

    static createRecord(bntElmt) {
        var params = $(bntElmt).data('params');
        let type = params.type;
        let data = params.data;

        switch(type) {
            case 'company':
                return Companies.createRecord(data).then(result => {
                    if (result) {
                        let autocompleteItem = $(bntElmt).closest('.autocomplete-item');
                        autocompleteItem.data('id', result.companyId);
                        autocompleteItem.find('.drop-down-add-new-record').remove();
                        AutoComplete.select(autocompleteItem);
                    }
                });
            default:
                return false;
        };
    }
}