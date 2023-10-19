class Companies {
    static open(e, companyId, url) {
        var valid = true;

        // Don't count clicks on icons or links
        if(e != null && e.target.tagName == 'I' && e.target.onclick != null) {
            valid = false;
        } else if(e != null && e.target.tagName == 'A') {
            valid = false;
            noLoadingScreen = true;
        }

        if(valid) {
            document.location.href=url+companyId;
        }
    }

    static edit(companyId) {
        var form = 'frm-sidebar-edit-company';

        $('#'+form).trigger('reset');

        $.getJSON('/ajax/Companies/Get.php', {companyId: companyId}).done(function(json) {
            if(json.id == companyId) {
                // Todo - find a slicker way to do this
                $('#'+form+' input[name=companyId]').val(companyId);
                $('#'+form+' [data-json="companyname"]').val(json.companyname);
                $('#'+form+' [data-json="favourites"]').prop('checked', (json.favourites == 1 ? true : false));
                $('#'+form+' [data-json="typeid"]').val(json.typeid);
                $('#'+form+' [data-json="colour"]').val(json.colour);
                $('#'+form+' [data-json="abbreviation"]').val(json.abbreviation);
                $('#'+form+' [data-json="add1"]').val(json.add1);
                $('#'+form+' [data-json="add2"]').val(json.add2);
                $('#'+form+' [data-json="add3"]').val(json.add3);
                $('#'+form+' [data-json="city"]').val(json.city);
                $('#'+form+' [data-json="postcode"]').val(json.postcode);
                $('#'+form+' [data-json="country"]').val(json.country);
                $('#'+form+' [data-json="accountnumber"]').val(json.accountnumber);
                $('#'+form+' [data-json="email"]').val(json.email);
                $('#'+form+' [data-json="telephone"]').val(json.telephone);
            }
        });
    }

    static save(obj) {
        var data = $($(obj).closest('form')).serialize();

        $.getJSON('/ajax/Companies/Save.php', {data: data}).done(function(json) {
            if(json.response == 'OK') {
                if(json.existing) {
                    // Update any references to the company data across the screen
                    // Todo - look into a slicker way to do this
                    $('[data-company-details="companyname"][data-companyid='+json.companyId+']').html(json.companyName);
                    $('[data-company-details="email"][data-companyid='+json.companyId+']').html('<a href="mailto:'+json.email+'" class="text-link">'+json.email+'</a>');
                    $('[data-company-details="telephone"][data-companyid='+json.companyId+']').html('<a href="tel:'+json.telephone+'" class="text-link">'+json.telephone+'</a>');
                    $('[data-company-details="add1"][data-companyid='+json.companyId+']').html(json.add1);
                    $('[data-company-details="add2"][data-companyid='+json.companyId+']').html(json.add2);
                    $('[data-company-details="add3"][data-companyid='+json.companyId+']').html(json.add3);
                    $('[data-company-details="city"][data-companyid='+json.companyId+']').html(json.city);
                    $('[data-company-details="postcode"][data-companyid='+json.companyId+']').html(json.postcode);
                    $('[data-company-details="country"][data-companyid='+json.companyId+']').html(json.country);
                    $('[data-company-details="accountnumber"][data-companyid='+json.companyId+']').html(json.accountNumber);
                    $('[data-company-details="type"][data-companyid='+json.companyId+']').html(json.type); // This will be the actual name (customer/supplier) rather than id (1/2)
                    $('[data-company-details="abbreviation"][data-companyid='+json.companyId+']').html(json.abbreviation);
                    $('[data-company-details="colour"][data-companyid='+json.companyId+']').css('background', json.colour);
                } else {
                    // Simply add the new company to the bottom of the list of companies
                    // This is not perfect because if we're sorting or have pagination, the bottom probably won't be the right place
                    // BUT this is ok for now
                    $('#companiesTable').append(json.html);
                }

                // Is the company a favourite?
                if(json.favhtml != '') {
                    $('[data-company-details="favourite"][data-companyid='+json.companyId+']').removeClass('d-none');
                    $('#favouritesContainer').append(json.favhtml);
                    if(json.favcount < 3) {
                        setTimeout(function() {
                            $('#favouritesContainer').siblings().each(function() {
                                if($(this).hasClass('drop-message')) {
                                    $(this).fadeIn();
                                }
                            });
                        }, 500);
                    } else {
                        $('#favouritesContainer').siblings().each(function() {
                            if($(this).hasClass('drop-message')) {
                                $(this).fadeOut();
                            }
                        });
                    }
                } else {
                    // Make sure to remove the company from favourites, if it's there
                    $('[data-company-details="favourite"][data-companyid='+json.companyId+']').addClass('d-none');
                    $('#favouritesContainer [data-companyid="'+json.companyId+'"]').fadeOut();
                    // Use setTimeout to do this instead of a function in fadeOut because there's more than one matching element and the fade doesn't work
                    setTimeout(function() {
                        $('#favouritesContainer [data-companyid="'+json.companyId+'"]').remove();
                    }, 500);
                    if(json.favcount < 3) {
                        setTimeout(function() {
                            $('#favouritesContainer').siblings().each(function() {
                                if($(this).hasClass('drop-message')) {
                                    $(this).fadeIn();
                                }
                            });
                        }, 500);
                    } else {
                        $('#favouritesContainer').siblings().each(function() {
                            if($(this).hasClass('drop-message')) {
                                $(this).fadeOut();
                            }
                        });
                    }
                }

                $(document).sidebar('close');
            } else {
                let errorMsg = 'Failed to save the company';
                if (json.response) {
                    errorMsg += '. Error - ' + json.response;
                }
                Notifications.showMessage(errorMsg, 'error');
            }
        });
    }

    static delete(companyId) {
        if(confirm('Are you sure you would like to delete this company?')) {
            $.getJSON('/ajax/Companies/Delete.php', {companyId: companyId}).done(function(json) {
                if(json.response == 'OK') {
                    document.location.href='/companies';
                }
            });
        }
    }

    static addMultiple(obj) {
        var data = $($(obj).closest('form')).serialize();

        $.getJSON('/ajax/Companies/AddMultiple.php', {data: data}).done(function(json) {
            if(json.response == 'OK') {
                document.location.href=json.redirect; // If we're viewing customers but have just added suppliers, we will be sent to the suppliers page now
            } else {
                Alerts.alert(json.response);
            }
        });
    }

    static async createRecord(obj) {
        var data = obj;
        data.method = 'createCompany';

        let jsonStr = await $.post('/ajax.php', data);
        let json = jQuery.parseJSON(jsonStr);

        if(json.response == 'OK') {
            if (json.companyId) {
                Notifications.showMessage('Company created successfully', 'success')
            } else {
                Notifications.showMessage('Failed to create the company', 'error')
            }
            return json;
        } else {
            Notifications.showMessage('Failed to create the company', 'error')
            return false;
        }
    }
}