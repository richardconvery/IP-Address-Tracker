class Contacts {
    static open(contactId) {
        var form = $('#modal-edit-contact').find('form');

        $.getJSON('/ajax/Contacts/Get.php', { contactId: contactId }).done(function (json) {
            var contact = json.contact;

            $(form).find('input[name=contactId]').val(contactId);
            $(form).find('input[name=firstName]').val(contact.firstname);
            $(form).find('input[name=lastName]').val(contact.lastname);

            // show selected organization
            if (parseInt(contact.organization) > 0) {
                let autoCompSelection = `<div class="w-100 me-2 mt-2" data-type="customer" data-id="${contact.organization}">
                                            <div class="autocomplete-selection-item">
                                                <input type="hidden" name="customer[]" value="${contact.organization}">
                                                <span>${contact.organizationName}</span>
                                                <i class="far fa-times"></i>
                                            </div>
                                        </div>`;
                $(form).find('#organizationAcompSelection').html(autoCompSelection);
            }
            $(form).find('input[name=department]').val(contact.department);
            $(form).find('input[name=position]').val(contact.position);
            $(form).find('input[name=role]').val(contact.role);
            $(form).find('input[name=city]').val(contact.city);
            $(form).find('input[name=email]').val(contact.email);
            $(form).find('input[name=contact_telephone]').val(contact.telephone);
            let telephoneTypeElmt =  document.getElementById('telephoneType');
            if (telephoneTypeElmt) {
                telephoneTypeElmt.value =contact.telephoneType;
                let control = telephoneTypeElmt.tomselect;
                if (control) {
                    control.setValue(contact.telephoneType, true);
                }
            }

            $(form).find("input[name='permissions[]']").prop('checked', false);

            // handle for available permissions to select
            let allDisplayedPermissions = [];
            // all displayed permissions
            $(form).find("input[name='permissions[]']").each(function () {
                allDisplayedPermissions.push(parseInt($(this).val()));
            });

            let availablePermssions = [];
            if (contact.availablePermssions) {
                availablePermssions = contact.availablePermssions;
            }
            $.each(allDisplayedPermissions, function( index, value ) {
                if (availablePermssions.indexOf(value) !== -1 ) {
                    $(form).find((":checkbox[value="+ value +"]")).removeAttr('disabled');
                    $(form).find((":checkbox[value="+ value +"]")).closest('tr').show();
                } else {
                    $(form).find((":checkbox[value="+ value +"]")).attr('disabled', true);
                    $(form).find((":checkbox[value="+ value +"]")).closest('tr').hide();  
                }
            });

            // hide the permission group title
            $(form).find(".permisson-group-title").each(function () {
                let nextTblRow = $(this).closest('tr').next();
                if (!nextTblRow || nextTblRow.css('display') == 'none') {
                    $(this).closest('tr').hide();
                } else {
                    $(this).closest('tr').show();
                }

            });

            if (contact.hasPortalAccess == "1") {
                $(form).find('input[name=hasPortalAccess]').prop('checked', true);
                $(form).find('#permissionsContainer').show();        
            } else {
                $(form).find('input[name=hasPortalAccess]').prop('checked', false);
                $(form).find('#permissionsContainer').hide();        
            } 
            if (contact.allPermission) {
               // let permissions = contact.permissions.split(',');
                let permissions = contact.allPermission;
                $.each(permissions, function( index, value ) {
                    $(form).find((":checkbox[value="+ value.trim() +"]")).prop('checked', true);
                });
            }
            // check how many telephone fields are there
            let createTelephoneFields = 0;
            if (contact.telephone2) {
                createTelephoneFields = 1;
            }
            if (contact.telephone3) {
                createTelephoneFields = 2;
            }
            // add telehphone field
            let addPhoneFieldContainer = $(form).find('#addPhoneFieldContainer');
            // clear the previous phone fields
           addPhoneFieldContainer.html('');

           if (createTelephoneFields) {
                for(let i=0; i<createTelephoneFields; i++) {
                    let number = i +2;
                    let telehphoneValue = contact['telephone'+number];
                    let addPhoneFieldTemplate = $('#addPhoneFieldTemplate').clone();
                    addPhoneFieldTemplate.find('input[name=telephone]').attr('name', 'telephone_'+i);
                    addPhoneFieldTemplate.find('input[name=telephone_'+i+']').attr('value', telehphoneValue);
                    addPhoneFieldTemplate.removeAttr('id');
                    addPhoneFieldTemplate.removeAttr('style');
                    // set telphoneType id
                    let telephoneType = 'telephoneType' + number;
                    addPhoneFieldTemplate.find('select[name="telephoneType[]').attr('id', telephoneType);
                    addPhoneFieldContainer.append(addPhoneFieldTemplate);

                    if (contact[telephoneType]) {
                        let telephoneTypeElement = document.getElementById(telephoneType);
                        telephoneTypeElement.value = contact[telephoneType];
                        let control = telephoneTypeElement.tomselect;
                        if (control) {
                            control.setValue(contact[telephoneType], true);
                        }
                    }
                }
                let addPhoneBtn = $('#addPhoneBtn');
                console.log(addPhoneBtn);
            }
           
            // handle select fields
            if (contact.country) {
                let select = document.getElementById('editContactLocation');
                let control = select.tomselect;
                control.setValue(contact.country, true);
                $(select).parent('.tom-select-custom').find('.ts-custom-placeholder').remove();
            }

            if (contact.timezone) {
                let select = document.getElementById('editContactTimezone');
                let control = select.tomselect;
                control.setValue(contact.timezone, true);
                $(select).parent('.tom-select-custom').find('.ts-custom-placeholder').remove();
            }
        });
    }

    static delete(contactId, name, redirect = false) {
        if (parseInt(contactId) > 0) {
            var deleteNotes = '';
            swal.fire({
                title: 'Are you sure, you want to delete ' + name + '?',
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
                    Contacts.deleteContact(contactId).then(result => {
                        if (result && redirect) {
                            window.setTimeout(function () {
                                document.location.href='/contacts';
                            }, 2000);
                        }
                    });
                }
            });
        }
    }
    static assignTask(form) {
        $.ajax({
            url: '/ajax/Tasks/AssignTask.php',
            type: 'post',
            data: form,
            success: function (json) {
                json = jQuery.parseJSON(json);
                if (json.response == 'OK') {
                    Contacts.deleteContact(json.fromAssignContactId);
                } else {
                    Contacts.errorMessage('Something is wrong. Please try again');
                }
            },
            error: function () {
                Contacts.errorMessage('Something is wrong. Please try again');
            },
        });
    }

    static errorMessage(message) {
        Notifications.showMessage(message, 'error');
        window.setTimeout(function () {
            location.reload();
        }, 1000);
    }

    static async deleteContact(contactId) {
        let response = await $.get('/ajax/Contacts/Delete.php', { contactId: contactId });
        if (response == 'OK') {
            Notifications.showMessage('Contact deleted successfully', 'success');
            let contactRow = $('#contact'+contactId);
            if (contactRow) {
                contactRow.remove();
            }
            return true;
        } else {
            let errorMsg = 'Failed to delete the contact';
            if (response) {
                errorMsg += '. Error - ' + response;
            }
            Notifications.showMessage(errorMsg, 'error');
            return false;
        }
    }

    static resetPassword(contactId) {
        $.ajax({
            type: 'POST',
            url: '/ajax/Users/resetPassword.php',
            data: { userId: contactId },
            dataType: 'json',
            async: false,
            success: function (json) {
                if (json.response == 'OK') {
                    let msg = 'Reset password link has been sent.';
                    Notifications.showMessage(msg, 'success');
                } else {
                    let errorMsg = 'Failed to send reset password link';
                    Notifications.showMessage(errorMsg, 'error');
                }
            }
        });

    }
}
