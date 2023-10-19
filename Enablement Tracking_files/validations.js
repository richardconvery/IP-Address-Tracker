function validateStartDueDate(startDateId, dueDateId, isEditForm) {
    let startDateElmt =  $(startDateId);
    let dueDateElmt =  $(dueDateId);
    startDateElmt.on('change', function(e) {
        let startDateFp = e.target._flatpickr;
        let dueDateFp = document.querySelector(dueDateId)._flatpickr;
        
        let startDate = $(this).val();
        let startDateObject = '';
        if (startDate) {
            let fpOptions = {}; 
            if (startDateFp.config.hasOwnProperty('hsFlatpickrOptions')) {
                fpOptions = JSON.parse(startDateFp.config.hsFlatpickrOptions);
            } 
            if (fpOptions.hasOwnProperty('dateFormat')) {
                startDateObject = flatpickr.parseDate(startDate, fpOptions.dateFormat);
            } else if(startDateFp.config.hasOwnProperty('dateFormat')){
                startDateObject = flatpickr.parseDate(startDate, startDateFp.config.dateFormat);
            }
            // dueDateFp.set('minDate', startDateObject);
        } else {
            // dueDateFp.set('minDate', '');
        }
        //check for due date
        let dueDate = dueDateElmt.val();
        if (dueDate && startDate) {
            let dueDateObject = '';
            fpOptions = {}; 
            if (dueDateFp.config.hasOwnProperty('hsFlatpickrOptions')) {
                fpOptions = JSON.parse(dueDateFp.config.hsFlatpickrOptions);
            } 
            if (fpOptions.hasOwnProperty('dateFormat')) {
                dueDateObject = flatpickr.parseDate(dueDate, fpOptions.dateFormat);
            } else if(dueDateFp.config.hasOwnProperty('dateFormat')){
                dueDateObject = flatpickr.parseDate(dueDate, dueDateFp.config.dateFormat);
            }
            if (dueDateObject.getTime() < startDateObject.getTime()) {
                return false;
            }
        }
     });
     
     dueDateElmt.on('change', function(e) {
        let dueDateFp = e.target._flatpickr;
        let startDateFp = document.querySelector(startDateId)._flatpickr;
        
        let dueDate = $(this).val();
        let dueDateObject = '';
        if (dueDate) {
            let fpOptions = {}; 
            if (dueDateFp.config.hasOwnProperty('hsFlatpickrOptions')) {
                fpOptions = JSON.parse(dueDateFp.config.hsFlatpickrOptions);
            } 
            if (fpOptions.hasOwnProperty('dateFormat')) {
                dueDateObject = flatpickr.parseDate(dueDate, fpOptions.dateFormat);
            } else if(dueDateFp.config.hasOwnProperty('dateFormat')){
                dueDateObject = flatpickr.parseDate(dueDate, dueDateFp.config.dateFormat);
            }
            // startDateFp.set('maxDate', dueDateObject);
        } else {
            // startDateFp.set('maxDate', '');
        }
        //check for start date
        let startDate = startDateElmt.val();
        if (dueDate && startDate) {
            let startDateObject = '';
            fpOptions = {}; 
            if (startDateFp.config.hasOwnProperty('hsFlatpickrOptions')) {
                fpOptions = JSON.parse(startDateFp.config.hsFlatpickrOptions);
            } 
            if (fpOptions.hasOwnProperty('dateFormat')) {
                startDateObject = flatpickr.parseDate(startDate, fpOptions.dateFormat);
            } else if(startDateFp.config.hasOwnProperty('dateFormat')){
                startDateObject = flatpickr.parseDate(startDate, startDateFp.config.dateFormat);
            }
            if (dueDateObject.getTime() < startDateObject.getTime()) {
                return false;
            }
        }
     });

     if (isEditForm) {
        // startDateElmt.trigger("change");
        // dueDateElmt.trigger("change");
     }
}


function validateErrorPlacement(error, element, placement = '') {
    error.addClass("invalid-feedback");
    if (placement == "insertAfter") {
        error.insertAfter(element.parent());
    } else {
        if (element.prop("type") === "checkbox") {
            error.insertAfter(element.parent("label"));
        } else {
            error.insertAfter(element);
        }
    }
}

$.validator.addMethod("validateStartDueDates", function(value, element, startDateId) {
    let startDateElmt = $(startDateId);
    let dueDateId = element.getAttribute('id');
    let dueDateFp = document.querySelector('#'+dueDateId)._flatpickr;
    let startDateFp = document.querySelector(startDateId)._flatpickr;
    
    let dueDate = value;
    let dueDateObject = '';
    if (dueDate) {
        let fpOptions = {}; 
        if (dueDateFp.config.hasOwnProperty('hsFlatpickrOptions')) {
            fpOptions = JSON.parse(dueDateFp.config.hsFlatpickrOptions);
        } 
        if (fpOptions.hasOwnProperty('dateFormat')) {
            dueDateObject = flatpickr.parseDate(dueDate, fpOptions.dateFormat);
        } else if(dueDateFp.config.hasOwnProperty('dateFormat')){
            dueDateObject = flatpickr.parseDate(dueDate, dueDateFp.config.dateFormat);
        }
    }
    //check for start date
    let startDate = startDateElmt.val();
    if (dueDate && startDate) {
        let startDateObject = '';
        fpOptions = {}; 
        if (startDateFp.config.hasOwnProperty('hsFlatpickrOptions')) {
            fpOptions = JSON.parse(startDateFp.config.hsFlatpickrOptions);
        } 
        if (fpOptions.hasOwnProperty('dateFormat')) {
            startDateObject = flatpickr.parseDate(startDate, fpOptions.dateFormat);
        } else if(startDateFp.config.hasOwnProperty('dateFormat')){
            startDateObject = flatpickr.parseDate(startDate, startDateFp.config.dateFormat);
        }
        if (dueDateObject.getTime() < startDateObject.getTime()) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
},'Due date should be greater than or equal to Start date.');

$.validator.addMethod("pwcheck", function(value) {
    return /[A-Za-z]/.test(value) // has letters
        && /\d/.test(value) // has a digit
        && value.length >=6;
}, 'New password must be at least 6 characters and contain at least 1 number and 1 letter');

$.validator.addMethod("pwdEqualTo", function(value) {
    if (value == $('input[name=newpassword]').val()) {
        return true;
    } else {
        return false;
    }
}, 'New passwords do not match.');

$.validator.addMethod("specialChars", function( value, element ) {
    // '/[^a-zA-Z0-9_ -]/s'
    var regex = new RegExp("^[a-zA-Z0-9_ -]+$");
    var key = value;

    if (!regex.test(key)) {
       return false;
    }
    return true;
}, "Please use only characters, numbers and underscores");

function hasValue(elmtId) {
    return $(elmtId).val() ? true : false; 
}

$(document).ready(function() {
    // add project validations
    let form = $('#addProjectForm');

    form.validate({
        rules: {   
            dueDate: { 
                validateStartDueDates : '#addStartDate'
            }
        },
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
    });

    let submitBtn = form.find('.btn.btn-primary');
    if (submitBtn) {
        submitBtn.on('click', function(e) {
            $("#addProjectForm").validate().element('#addDueDate');
            console.log( $("#addProjectForm").validate().element('#addDueDate'));
            console.log($("#addProjectForm").find('#addDueDate').valid());


            if (!$('#addProjectForm').valid()) {
               e.preventDefault();
            }
        });
    }

    // validateStartDueDate('#addStartDate', '#addDueDate');


    // edit project validations
    form = $('#editProjectForm');

    form.validate({
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
    });

    submitBtn = form.find('.btn.btn-primary');
    if (submitBtn) {
        submitBtn.on('click', function(e) {
            if (!$('#editProjectForm').valid()) {
                e.preventDefault();
            }
        });
    }

    validateStartDueDate('#editStartDate', '#editDueDate', true);

     // add deliverable validations
     form = $('#addDeliverableForm');
 
     form.validate({
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
     });
 
     submitBtn = form.find('.btn.btn-primary');
     if (submitBtn) {
     submitBtn.on('click', function(e) {
         if (!$('#addDeliverableForm').valid()) {
             e.preventDefault();
         }
     });
     }
 
     // edit deliverable validations
     form = $('#editDeliverableForm');
 
     form.validate({
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
     });
 
     submitBtn = form.find('.btn.btn-primary');
     if (submitBtn) {
        submitBtn.on('click', function(e) {
            if (!$('#editDeliverableForm').valid()) {
                e.preventDefault();
            }
        });
     }


    // add task validations
    form = $('#addTaskForm');

    form.validate({
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
    });

    submitBtn = form.find('.btn.btn-primary');
    if (submitBtn) {
        submitBtn.on('click', function(e) {
            if (!$('#addTaskForm').valid()) {
                e.preventDefault();
            }
        });
    }

    validateStartDueDate('#addStartDateTask', '#addDueDateTask');


    // edit task validations
    form = $('#edit-task-form');

    form.validate({
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
    });

    submitBtn = form.find('.btn.btn-primary');
    if (submitBtn) {
        submitBtn.on('click', function(e) {
            if (!$('#edit-task-form').valid()) {
                e.preventDefault();
            }
        });
    }

    validateStartDueDate('#editStartDateTask', '#editDueDateTask', true);

     // add company validations
     form = $('#addCompanyForm');
 
     form.validate({
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
     });
 
     submitBtn = form.find('.btn.btn-primary');
     if (submitBtn) {
     submitBtn.on('click', function(e) {
         if (!$('#addCompanyForm').valid()) {
             e.preventDefault();
         }
     });
     }
 
     // edit deliverable validations
     form = $('#editCompanyForm');
 
     form.validate({
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
     });
 
     submitBtn = form.find('.btn.btn-primary');
     if (submitBtn) {
        submitBtn.on('click', function(e) {
            if (!$('#editCompanyForm').valid()) {
                e.preventDefault();
            }
        });
     }

      // change password modal validations
      form = $('#changePasswordForm');
 
      form.validate({
        rules : {
            newpassword: {
                pwcheck: true
            },
            newpassword2: {
                pwdEqualTo: true,
            }
        },
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
      });
  
      submitBtn = form.find('.btn.btn-primary');
      if (submitBtn) {
         submitBtn.on('click', function(e) {
            if (!$('#changePasswordForm').valid()) {
                e.preventDefault();
            }
         });
      }

    // add contact validations
    form = $('#addContactForm');

    form.validate({
        rules: {
            email: {
                email: true,
                remote: {
                    url: "/ajax/Contacts/CheckEmailAddress.php",
                    type: "post",
                    data: {
                        email: function() {
                            return $('#addContactForm').find("#email").val();
                        },
                        contactId: function() {
                            return $('#addContactForm').find("#contactID").val();
                        },
                    }
                }

            }
        },
        messages: {
            email: {
                remote: jQuery.validator.format("{0} is already taken.")
            },
        },
        errorElement: "div",
        errorPlacement: function(error, element) {
            if(element.attr('name') == 'firstName') {
                validateErrorPlacement(error, element, 'insertAfter');
            } else {
                validateErrorPlacement(error, element);
            }
        },
    });

    submitBtn = form.find('.btn.btn-primary');
    if (submitBtn) {
        submitBtn.on('click', function(e) {
            
            if (!$('#addContactForm').valid()) {
                e.preventDefault();
            } else {
                
            }
        });
    }
   
    let addContactForm = $('#addContactForm');
    addContactForm.find('#hasPortalAccess').on('change', function(e) {
        if (this.checked && addContactForm.find('#email').val() == '') {
            let confirmHtml = '<p style="font-size: 0.7em;">You have not set the email, and enabled the Portal Access, email is required for Portal Access. Do you want to fill email address?</p>';

            swal.fire({
                title: '',
                html: confirmHtml,
                icon: 'warning',
                confirmButtonText: 'Yes, I will update email!',
                cancelButtonText: 'No, I don\'t want Portal access!',
                confirmButtonColor: '#d33',
                reverseButtons: true,
                showCloseButton: true,
                showCancelButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    addContactForm.find('#hasPortalAccess').prop('checked', false);
                    addContactForm.find('#hasPortalAccess').trigger('change');
                    addContactForm.find('#prevContactDetailsBtn').click();
                    addContactForm.find("#email").focus();
                } else {
                    addContactForm.find('#hasPortalAccess').prop('checked', false);
                    addContactForm.find('#hasPortalAccess').trigger('change');
                }
            });
        }
    });

    // edit task validations
    form = $('#editContactForm');

    form.validate({
        rules: {
            email: {
                email: true,
                remote: {
                    url: "/ajax/Contacts/CheckEmailAddress.php",
                    type: "post",
                    data: {
                        email: function() {
                            return $('#editContactForm').find("#email").val();
                        },
                        contactId: function() {
                            return  $('#editContactForm').find("#contactID").val();
                        },
                    },
                }

            }
        },
        messages: {
            email: {
                remote: jQuery.validator.format("{0} is already taken.")
            },
        },
        errorElement: "div",
        errorPlacement: function(error, element) {
            if(element.attr('name') == 'firstName') {
                validateErrorPlacement(error, element, 'insertAfter');
            } else {
                validateErrorPlacement(error, element);
            }
        },
    });

    submitBtn = form.find('.btn.btn-primary');
    if (submitBtn) {
        submitBtn.on('click', function(e) {
            if (!$('#editContactForm').valid()) {
                e.preventDefault();
            }
        });
    }

    let editContactForm = $('#editContactForm');
    editContactForm.find('#hasPortalAccess').on('change', function(e) {
        if (this.checked && editContactForm.find('#email').val() == '') {
            let confirmHtml = '<p style="font-size: 0.7em;">You have not set the email, and enabled the Portal Access, email is required for Portal Access. Do you want to fill email address?</p>';
            swal.fire({
                title: '',
                html: confirmHtml,
                icon: 'warning',
                confirmButtonText: 'Yes, I will update email!',
                cancelButtonText: 'No, I don\'t want Portal access!',
                confirmButtonColor: '#d33',
                reverseButtons: true,
                showCloseButton: true,
                showCancelButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    editContactForm.find('#hasPortalAccess').prop('checked', false);
                    editContactForm.find('#hasPortalAccess').trigger('change');
                    editContactForm.find('#prevContactDetailsBtn').click();
                    editContactForm.find("#email").focus();
                } else {
                    editContactForm.find('#hasPortalAccess').prop('checked', false);
                    editContactForm.find('#hasPortalAccess').trigger('change');
                }
            });
        }
    });

    // add user validations
    form = $('#addUserForm');

    form.validate({
        rules: {
            firstName: {
                required: true
            },
            lastName: {
                required: true
            },
            email: {
                required: true,
                email: true,
                remote: {
                    url: "/ajax/Auth/CheckEmailAddress.php",
                    type: "post",
                    data: {
                        email: function() {
                            return $("#emailAddress").val();
                        },
                        userId: 0
                    }
                }

            },
            password: {
                required: true,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,15}$/
            },
            con_password: {
                required: true,
                equalTo: "#userSrPassword"
            }
        },
        messages: {
            firstName: {
                required: 'Please enter the first name.'
            },
            lastName: {
                required: 'Please enter the last name.'
            },
            email: {
                email: "Your email must be in the format of name@domain.com",
                required: "Please enter your valid email address.",
                remote: "Email is already exists."
            },
            password: {
                required: 'Please enter password.',
                minlength: 'Please enter at least 8 digit.'
            },
            con_password: {
                required: 'Please enter confirm password.',
                minlength: 'Please enter at least 8 digit.',
                equalTo: 'Password and confirm Password must be same .'
            }
        },
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
    });

    submitBtn = form.find('.btn.btn-primary');
    if (submitBtn) {
    submitBtn.on('click', function(e) {
        if (!$('#addUserForm').valid()) {
            e.preventDefault();
        }
    });
    }
  
    // edit user validations
    form = $('#editUserForm');

    form.validate({
        rules: {
            firstName: {
                required: true
            },
            lastName: {
                required: true
            },
            email: {
                required: true,
                email: true,
                remote: {
                    url: "/ajax/Auth/CheckEmailAddress.php",
                    type: "post",
                    data: {
                        email: function() {
                            return $("#editUserFormEmail").val();
                        },
                        userId: function() {
                            return $("#userID").val();
                        },
                    }
                }

            }
        },
        messages: {
            firstName: {
                required: 'Please enter the first name.'
            },
            lastName: {
                required: 'Please enter the last name.'
            },
            email: {
                email: "Your email must be in the format of name@domain.com",
                required: "Please enter your valid email address.",
                remote: "Email is already exists."
            }
        },
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
    });

    submitBtn = form.find('.btn.btn-primary');
    if (submitBtn) {
        submitBtn.on('click', function(e) {
            if (!$('#editUserForm').valid()) {
                e.preventDefault();
            }
        });
    }

     // add event validations
     form = $('#addEventForm');
 
     form.validate({
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
     });
 
     submitBtn = form.find('.btn.btn-primary');
     if (submitBtn) {
        submitBtn.on('click', function(e) {
            if (!$('#addEventForm').valid()) {
                e.preventDefault();
            }
        });
     }

     // edit event validations
     form = $('#editEventForm');
 
     form.validate({
        errorElement: "div",
        errorPlacement: function(error, element) {
            validateErrorPlacement(error, element);
        },
     });
 
     submitBtn = form.find('.btn.btn-primary');
     if (submitBtn) {
        submitBtn.on('click', function(e) {
            if (!$('#editEventForm').valid()) {
                e.preventDefault();
            }
        });
     }

    // set password validations
    form = $('#set-password');

    form.validate({
        rules: {
            newpassword: {
                pwcheck: true
            },
            confirmPassword: {
                pwdEqualTo: true,
            }
        },
        errorElement: "div",
        errorPlacement: function (error, element) {
            validateErrorPlacement(error, element);
        },
    });

    submitBtn = form.find('.btn.btn-primary');
    if (submitBtn) {
        submitBtn.on('click', function (e) {
            if (!$('#set-password').valid()) {
                e.preventDefault();
            }
        });
    }

    // Clear date on cross icon click
    $('.clear-date').on('click', function() {
        let element = $(this).parent('.input-group').find('.js-flatpickr');

        if (element && !element.attr("disabled")) {
            let datePicker = element.get(0);
            datePicker._flatpickr.clear();
        }
    });

    // Sign up step 1 validations
    form = $('#signup-step-1');

    form.validate({
        rules: {
            email: {
                email: true,
                remote: {
                    url: "/ajax/Contacts/CheckEmailAddress.php",
                    type: "post",
                    data: {
                        email: function() {
                            return $('#signup-step-1').find("#email").val();
                        }
                    }
                }

            }
        },
        messages: {
            email: {
                remote: jQuery.validator.format("{0} is already taken.")
            },
        },
        errorElement: "div",
        errorPlacement: function(error, element) {
            if(element.attr('name') == 'termsCheckbox') {
                validateErrorPlacement(error, element, 'insertAfter');
            } else {
                validateErrorPlacement(error, element);
            }
        },
    });

    submitBtn = form.find('.btn.btn-primary');
    if (submitBtn) {
        submitBtn.on('click', function(e) {
            
            if (!$('#signup-step-1').valid()) {
                e.preventDefault();
            }
        });
    }

    // Sign up step 2 validations
    form = $('#signup-step-2');

    form.validate({
        rules: {
            company: {
                specialChars: true,
                remote: {
                    url: "/ajax/Signup/CheckCompany.php",
                    type: "post",
                    data: {
                        company: function() {
                            return $('#signup-step-2').find("#company").val();
                        }
                    }
                },
                maxlength: 50,
            }
        },
        messages: {
            company: {
                remote: jQuery.validator.format("{0} is already taken.")
            },
        },
        errorElement: "div",
        errorPlacement: function(error, element) {
            if(element.attr('name') == 'country' || element.attr('name') == 'timezone') {
                validateErrorPlacement(error, element, 'insertAfter');
            } else {
                validateErrorPlacement(error, element);
            }
        },
    });

    submitBtn = form.find('.btn.btn-primary');
    if (submitBtn) {
        submitBtn.on('click', function(e) {
            // let recaptcha = $("#g-recaptcha-response").val();
            // if (!$('#signup-step-2').valid() || recaptcha === "") {
            //     if (recaptcha === "") {
            //         $('#recaptcha-custom-error').html("Please check the recaptcha.");
            //         $('#recaptcha-custom-error').css('display', 'block');
            //     } else {
            //         $('#recaptcha-custom-error').css('display', 'none');
            //     }
            //     e.preventDefault();
            // }
        });
    }

    form.find('select[name=country]').on('change', function() {
        $(this).valid();
    });

    form.find('select[name=timezone]').on('change', function() {
        $(this).valid();
    });
});