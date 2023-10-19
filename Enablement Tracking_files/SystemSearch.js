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

class SystemSearch {
    static init(obj) {
        $(obj).after('<div class="autocomplete"></div>');
    }

    static get(obj, params) { // params should always be json
        var search = $(obj).val();
        var type = 'listing';
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
            $.getJSON('/ajax/UI/SystemSearch.php', {search: search,systemFilterType:type, token: autoCompleteToken}).done(function(json) {
                
                if(json.response == 'OK' && json.token == autoCompleteToken) {
                    $('#systemSearchContent').html(json.results);
                    $('.system-search-see-all').attr("href", "/filter?search="+search);
                }
            });
        } else {
            SystemSearch.hide(obj);
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

        SystemSearch.hide(obj);
    }

    static remove(obj) {
        $(obj).parent().fadeOut('fast', function() {
            $(obj).parent().remove();
        })
    }
}