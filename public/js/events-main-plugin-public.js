( function($){
    jQuery(document).ready(function () {

        //single-dffmain-events
        //is-language
        // if (jQuery('body').hasClass('single-dffmain-events')) {
        //     singleEventLangLinks = '';
        //     formObj.diffmainTranslations.forEach(element => {
        //         singleEventLangLinks += `<a class="button button--ghost is-icon is-language" href="${element.remote_site_url}">${element.language_locale}</a>`
        //     });

        //     jQuery('.is-language').remove();
        //     jQuery('.page-headActions').prepend(singleEventLangLinks)
        // }











        $(document).ready(function () {
            $('input[type="mobile-number"]').keypress(function (e) {
                if (e.which != 8 && e.which != 0 && String.fromCharCode(e.which) != '-' && String.fromCharCode(e.which) != '(' && String.fromCharCode(e.which) != ')' && String.fromCharCode(e.which) != '+' && (e.which < 48 || e.which > 57)) {
                    return false;
                }
            });

            $('input[type="number"]').keypress(function (e) {
                if(!((e.keyCode > 95 && e.keyCode < 106) // numpad numbers
                    || (e.keyCode > 47 && e.keyCode < 58) // numbers
                    || [8, 9, 35, 36, 37, 39].indexOf(e.keyCode) >= 0 // backspace, tab, home, end, left arrow, right arrow
                    || (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) // Ctrl/Cmd + A
                    || (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) // Ctrl/Cmd + C
                    || (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) // Ctrl/Cmd + X
                    || (e.keyCode == 86 && (e.ctrlKey === true || e.metaKey === true)) // Ctrl/Cmd + V
                    )) {
                    return false;
                }
            });
        });

        // TODO: spaghetti code.. Should be divided to components for better clarity
        $(document).on('click', '.button-wrap .register', function (e) {
            e.preventDefault();
            let errorCount = 0;
            let errorMessage = '';
            let error = false;
            let radioBtnValidation='';
            let checkboxBtnValidation='';
            let selectBtnValidation='';
            let notValidateMessage = '';
            let validateMessage = '';
            let emailValidateMessage = '';
            let codeValidateMessage = '';
            let urlValidateMessage = '';
            let emailExistMessage = '';
            const theLanguage = $('html').attr('lang');
            const lang = theLanguage.slice(0, 2);
            if ('ar' === lang) {
                notValidateMessage = 'هذه الخانة مطلوبه.';
                validateMessage = 'موافق';
                emailValidateMessage = 'عنوان بريد إلكتروني غير صحيح.';
                codeValidateMessage = 'رمز دعوة غير صحيح.';
                urlValidateMessage = 'URL غير صحيح.';
                emailExistMessage = 'لبريد الإلكتروني الذي تم إدخاله مسجل مسبقاُ.' +'يرجى استخدام بريد إلكتروني آخر.'
            } else {
                notValidateMessage = 'This field is required.';
                validateMessage = 'OK';
                emailValidateMessage = 'Invalid email address.';
                codeValidateMessage = 'Invalid invitation code.';
                urlValidateMessage = 'Invalid URL.';
                emailExistMessage = 'The email address you have entered is already registered. Please use a different email address.';
            }

            $('.button-wrap .error').remove();
            $('.not-validate').remove();
            $('.validate').remove();
            $(".field-wrap").each(function (index) {
                if ($(this).hasClass('required')) {
                    if ($(this).hasClass('google-captcha')) {
                        if ('' === grecaptcha.getResponse()) {
                            e.preventDefault();
                            errorCount++;
                            $(this).addClass('invalid');
                            $(this).removeClass('valid');
                            $('.captcha-field').append('<span class="not-validate">' + notValidateMessage + '</span>');
                        } else {
                            errorCount--;
                            $(this).addClass('valid');
                            $(this).removeClass('invalid');
                            $('.captcha-field').append('<span class="validate"></span>');
                        }
                    }else if ($(this).find('input[type="radio"]').length) {
                        if (0 === $(this).find('input[type="radio"]:checked').length) {
                            errorCount++;
                            $(this).addClass('invalid');
                            $(this).removeClass('valid');
                            let label = $(this).find('.field-label').contents().eq(0).text();
                            if( '' !== label ){
                                label = label.toLowerCase();
                            }
                            if ('ar' === lang) {
                                radioBtnValidation = 'يرجى اختيار '+label+'.';
                                $(this).find('.field-label').append('<span class="not-validate">'+radioBtnValidation+'</span>');
                            } else {
                                radioBtnValidation = 'Please select '+label+'.';
                                $(this).find('.field-label').append('<span class="not-validate">'+radioBtnValidation+'</span>');
                            }
                        } else {
                            errorCount--;
                            $(this).addClass('valid');
                            $(this).removeClass('invalid');
                            $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                        }
                    } else if ($(this).find('input[type="checkbox"]').length) {
                        if (0 === $(this).find('input[type="checkbox"]:checked').length) {
                            errorCount++;
                            $(this).addClass('invalid');
                            $(this).removeClass('valid');
                            let label = $(this).find('.field-label').contents().eq(0).text();
                            if( '' !== label ){
                                label = label.toLowerCase();
                            }
                            if ('ar' === lang) {
                                checkboxBtnValidation = 'يرجى اختيار '+label+'.';
                                $(this).find('.field-label').append('<span class="not-validate">'+checkboxBtnValidation+'</span>');
                            } else {
                                checkboxBtnValidation = 'Please select '+label+'.';
                                $(this).find('.field-label').append('<span class="not-validate">'+checkboxBtnValidation+'</span>');
                            }
                        } else {
                            errorCount--;
                            $(this).addClass('valid');
                            $(this).removeClass('invalid');
                            $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');

                        }
                    } else if ($(this).find('select').length) {
                        if ('' === $(this).find('select').val()) {
                            errorCount++;
                            $(this).addClass('invalid');
                            $(this).removeClass('valid');
                            let label = $(this).find('.field-label').contents().eq(0).text();
                            if( '' !== label ){
                                label = label.toLowerCase();
                            }
                            if ('ar' === lang) {
                                selectBtnValidation = 'يرجى اختيار '+label+'.';
                                $(this).find('.field-label').append('<span class="not-validate">'+selectBtnValidation+'</span>');
                            } else {
                                selectBtnValidation = 'Please select '+label+'.';
                                $(this).find('.field-label').append('<span class="not-validate">'+selectBtnValidation+'</span>');
                            }
                        } else {
                            errorCount--;
                            $(this).addClass('valid');
                            $(this).removeClass('invalid');
                            $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');

                        }
                    } else if ($(this).find('textarea').length) {
                        let label = $(this).find('.field-label').contents().eq(0).text();
                        if( '' !== label ){
                            label = label.toLowerCase();
                        }
                        let textAreaNotValidateMessage = '';
                        if ('ar' === lang) {
                            textAreaNotValidateMessage = 'يرجى ادخال'+label+'.';
                        } else {
                            textAreaNotValidateMessage = 'Please enter the '+label+'.';
                        }
                        if (/\S/.test($(this).find('textarea').val())) {
                            if ('' === $(this).find('textarea').val()) {
                                errorCount++;
                                $(this).addClass('invalid');
                                $(this).removeClass('valid');
                                $(this).find('.field-label').append('<span class="not-validate">'+textAreaNotValidateMessage+'</span>');
                            } else {
                                errorCount--;
                                $(this).addClass('valid');
                                $(this).removeClass('invalid');
                                $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                            }
                        } else {
                            errorCount++;
                            $(this).addClass('invalid');
                            $(this).removeClass('valid');
                            $(this).find('.field-label').append('<span class="not-validate">'+textAreaNotValidateMessage+'</span>');
                        }

                    } else if (0 < $(this).find('input').length) {
                        let inputFieldNotValidationMessage = '';
                        let label = $(this).find('.field-label').contents().eq(0).text();
                        if( '' !== label ){
                            label = label.toLowerCase();
                        }
                        if ('ar' === lang) {
                            inputFieldNotValidationMessage = 'يرجى ادخال '+label+'.';
                        } else {
                            inputFieldNotValidationMessage = 'Please enter the '+label+'.';
                        }
                        if (/\S/.test($(this).find('input').val())) {
                            if (0 < $(this).find('input[type="email"]').length) {
                                if ('' === $(this).find('input[type="email"]').val()) {
                                    errorCount++;
                                    $(this).addClass('invalid');
                                    $(this).removeClass('valid');
                                    $(this).find('.field-label').append('<span class="not-validate">'+emailValidateMessage+'</span>');
                                } else {
                                    let regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                                    if (!regex.test($(this).find('input[type="email"]').val())) {
                                        errorCount++;
                                        $(this).addClass('invalid');
                                        $(this).removeClass('valid');
                                        $(this).find('.field-label').append('<span class="not-validate">' + emailValidateMessage + '</span>');
                                    } else {
                                        errorCount--;
                                        $(this).addClass('valid');
                                        $(this).removeClass('invalid');
                                        $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                                    }
                                }
                            } else if (0 < $(this).find('input[type="mobile-number"]').length) {
                                if ('' === $(this).find('input[type="mobile-number"]').val()) {
                                    errorCount++;
                                    $(this).addClass('invalid');
                                    $(this).removeClass('valid');
                                    if ('ar' === lang) {
                                        $(this).find('.field-label').append('<span class="not-validate">يرجى ادخال رقم الهاتف.</span>');
                                    } else {
                                        $(this).find('.field-label').append('<span class="not-validate">Please enter your mobile number.</span>');
                                    }
                                } else {
                                    let regex = /^[\+]?([0-9][\s]?|[0-9]?)([(][0-9]{3}[)][\s]?|[0-9]{3}[-\s\.]?)[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
                                    let rawNumber = $(this).find('input[type="mobile-number"]').val();
                                    let numbersOnly = rawNumber.replace(/\D/g,'');
                                    if (regex.test($(this).find('input[type="mobile-number"]').val())
                                        && numbersOnly.length < 16) {
                                        errorCount--;
                                        $(this).addClass('valid');
                                        $(this).removeClass('invalid');
                                        $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                                    } else {
                                        errorCount++;
                                        $(this).addClass('invalid');
                                        $(this).removeClass('valid');
                                        if ('ar' === lang) {
                                            $(this).find('.field-label').append('<span class="not-validate">يرجى ادخال رقم هاتف صحيح.</span>');
                                        } else {
                                            $(this).find('.field-label').append('<span class="not-validate">Please enter a valid mobile number.</span>');
                                        }
                                    }
                                }
                            } else if (0 < $(this).find('input[type="url"]').length) {
                                if ('' === $(this).find('input[type="url"]').val()) {
                                    errorCount++;
                                    $(this).addClass('invalid');
                                    $(this).removeClass('valid');
                                    $(this).find('.field-label').append('<span class="not-validate">'+inputFieldNotValidationMessage+'</span>');
                                } else {
                                    let regex = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
                                    if (!regex.test($(this).find('input[type="url"]').val())) {
                                        errorCount++;
                                        $(this).addClass('invalid');
                                        $(this).removeClass('valid');
                                        $(this).find('.field-label').append('<span class="not-validate">' + urlValidateMessage + '</span>');
                                    } else {
                                        errorCount--;
                                        $(this).addClass('valid');
                                        $(this).removeClass('invalid');
                                        $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                                    }
                                }
                            } else if (0 < $(this).find('input[type="file"]').length) {
                                let fileFieldNotValidationMessage = '';
                                let label = $(this).find('.field-label').contents().eq(0).text();
                                if( '' !== label ){
                                    label = label.toLowerCase();
                                }
                                if ('ar' === lang) {
                                    fileFieldNotValidationMessage = 'يرجى تحميل الملف المطلوب.';
                                } else {
                                    fileFieldNotValidationMessage = 'Please upload the required file.';
                                }
                                if ($(this).hasClass('invalid')) {
                                    errorCount++;
                                    $(this).find('.field-label').append('<span class="not-validate">'+fileFieldNotValidationMessage+'</span>');
                                } else if ($(this).hasClass('valid')) {
                                    errorCount--;
                                    $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                                } else {
                                    if ('' === $(this).find('input').val()) {
                                        errorCount++;
                                        $(this).addClass('invalid');
                                        $(this).removeClass('valid');
                                        $(this).find('.field-label').append('<span class="not-validate">'+fileFieldNotValidationMessage+'</span>');
                                    } else {
                                        errorCount--;
                                        $(this).addClass('valid');
                                        $(this).removeClass('invalid');
                                        $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                                    }
                                }
                            } else if (0 < $(this).find('#security_code').length) {
                                console.log($(this).find('#security_code').val());
                                console.log($('.scode').val());
                                if ($(this).find('#security_code').val() !== $('.scode').val()) {
                                    errorCount++;
                                    $(this).addClass('invalid');
                                    $(this).removeClass('valid');
                                    $(this).find('.field-label').append('<span class="not-validate">' + codeValidateMessage + '</span>');
                                } else {
                                    errorCount--;
                                    $(this).addClass('valid');
                                    $(this).removeClass('invalid');
                                    $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                                }
                            } else if ('' === $(this).find('input').val()) {
                                errorCount++;
                                $(this).addClass('invalid');
                                $(this).removeClass('valid');

                                if ('ar' === lang) {
                                    if( 'arFirstName' === $(this).find('input').attr('id') ){
                                        $(this).find('.field-label').append('<span class="not-validate">يرجى ادخال الاسم الأول.</span>');
                                    }else if( 'arLastName' === $(this).find('input').attr('id') ){
                                        $(this).find('.field-label').append('<span class="not-validate">يرجى ادخال الاسم الأخير.</span>');
                                    }else{
                                        $(this).find('.field-label').append('<span class="not-validate">'+inputFieldNotValidationMessage+'</span>');
                                    }
                                } else {
                                    if( 'enFirstName' === $(this).find('input').attr('id') ){
                                        $(this).find('.field-label').append('<span class="not-validate">Please enter your first name.</span>');
                                    }else if( 'enLastName' === $(this).find('input').attr('id') ){
                                        $(this).find('.field-label').append('<span class="not-validate">Please enter your last name.</span>');
                                    }else{
                                        $(this).find('.field-label').append('<span class="not-validate">'+inputFieldNotValidationMessage+'</span>');
                                    }
                                }
                            } else {
                                errorCount--;
                                $(this).addClass('valid');
                                $(this).removeClass('invalid');
                                $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                            }
                        } else {
                            errorCount++;
                            $(this).addClass('invalid');
                            $(this).removeClass('valid');

                            if ('ar' === lang) {
                                if( 'arFirstName' === $(this).find('input').attr('id') ){
                                    $(this).find('.field-label').append('<span class="not-validate">يرجى ادخال الاسم الأول.</span>');
                                }else if( 'arLastName' === $(this).find('input').attr('id') ){
                                    $(this).find('.field-label').append('<span class="not-validate">يرجى ادخال الاسم الأخير.</span>');
                                }else if( 'mobile-number' === $(this).find('input').attr('type') ){
                                    $(this).find('.field-label').append('<span class="not-validate">يرجى ادخال رقم الهاتف.</span>');
                                }else if( 0 < $(this).find('.filename').length ){
                                    $(this).find('.field-label').append('<span class="not-validate">يرجى تحميل الملف المطلوب.</span>');
                                }else if( 'email' === $(this).find('input').attr('type') ){
                                    $(this).find('.field-label').append('<span class="not-validate">'+emailValidateMessage+'</span>');
                                }else if( 'url' === $(this).find('input').attr('type') ){
                                    $(this).find('.field-label').append('<span class="not-validate">' + urlValidateMessage + '</span>');
                                }else{
                                    $(this).find('.field-label').append('<span class="not-validate">'+inputFieldNotValidationMessage+'</span>');
                                }
                            } else {
                                if( 'enFirstName' === $(this).find('input').attr('id') ){
                                    $(this).find('.field-label').append('<span class="not-validate">Please enter your first name.</span>');
                                }else if( 'enLastName' === $(this).find('input').attr('id') ){
                                    $(this).find('.field-label').append('<span class="not-validate">Please enter your last name.</span>');
                                }else if( 'mobile-number' === $(this).find('input').attr('type') ){
                                    $(this).find('.field-label').append('<span class="not-validate">Please enter your mobile number.</span>');
                                }else if( 0 < $(this).find('.filename').length ){
                                    $(this).find('.field-label').append('<span class="not-validate">Please upload the required file.</span>');
                                }else if( 'email' === $(this).find('input').attr('type') ){
                                    $(this).find('.field-label').append('<span class="not-validate">'+emailValidateMessage+'</span>');
                                }else if( 'url' === $(this).find('input').attr('type') ){
                                    $(this).find('.field-label').append('<span class="not-validate">' + urlValidateMessage + '</span>');
                                }else{
                                    $(this).find('.field-label').append('<span class="not-validate">'+inputFieldNotValidationMessage+'</span>');
                                }
                            }
                        }
                    }
                }else if ( 0 < $(this).find('input').length ) {
                    let inputFieldNotValidationMessage = '';
                    let label = $(this).find('.field-label').contents().eq(0).text();
                    if( '' !== label ){
                        label = label.toLowerCase();
                    }
                    if ('ar' === lang) {
                        inputFieldNotValidationMessage = 'يرجى ادخال '+label+'.';
                    } else {
                        inputFieldNotValidationMessage = 'Please enter the '+label+'.';
                    }
                    if (/\S/.test($(this).find('input').val())) {
                        if (0 < $(this).find('input[type="mobile-number"]').length) {
                            if ('' === $(this).find('input[type="mobile-number"]').val()) {
                                errorCount++;
                                $(this).addClass('invalid');
                                $(this).removeClass('valid');
                                if ('ar' === lang) {
                                    $(this).find('.field-label').append('<span class="not-validate">يرجى ادخال رقم الهاتف.</span>');
                                } else {
                                    $(this).find('.field-label').append('<span class="not-validate">Please enter your mobile number.</span>');
                                }
                            } else {
                                let regex = /^[\+]?([0-9][\s]?|[0-9]?)([(][0-9]{3}[)][\s]?|[0-9]{3}[-\s\.]?)[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
                                let rawNumber = $(this).find('input[type="mobile-number"]').val();
                                let numbersOnly = rawNumber.replace(/\D/g,'');
                                if (regex.test($(this).find('input[type="mobile-number"]').val())
                                    && numbersOnly.length < 16) {
                                    errorCount--;
                                    $(this).addClass('valid');
                                    $(this).removeClass('invalid');
                                    $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                                } else {
                                    errorCount++;
                                    $(this).addClass('invalid');
                                    $(this).removeClass('valid');
                                    if ('ar' === lang) {
                                        $(this).find('.field-label').append('<span class="not-validate">يرجى ادخال رقم هاتف صحيح.</span>');
                                    } else {
                                        $(this).find('.field-label').append('<span class="not-validate">Please enter a valid mobile number.</span>');
                                    }
                                }
                            }
                        } else if (0 < $(this).find('input[type="url"]').length) {
                            if ('' === $(this).find('input[type="url"]').val()) {
                                errorCount++;
                                $(this).addClass('invalid');
                                $(this).removeClass('valid');
                                $(this).find('.field-label').append('<span class="not-validate">'+inputFieldNotValidationMessage+'</span>');
                            } else {
                                let regex = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
                                if (!regex.test($(this).find('input[type="url"]').val())) {
                                    errorCount++;
                                    $(this).addClass('invalid');
                                    $(this).removeClass('valid');
                                    $(this).find('.field-label').append('<span class="not-validate">' + urlValidateMessage + '</span>');
                                } else {
                                    errorCount--;
                                    $(this).addClass('valid');
                                    $(this).removeClass('invalid');
                                    $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                                }
                            }
                        } else if (0 < $(this).find('input[type="file"]').length) {
                            let fileFieldNotValidationMessage = '';
                            if ('ar' === lang) {
                                fileFieldNotValidationMessage = 'يرجى تحميل الملف المطلوب.';
                            } else {
                                fileFieldNotValidationMessage = 'Please upload the required file.';
                            }
                            if ($(this).hasClass('invalid')) {
                                errorCount++;
                                $(this).find('.field-label').append('<span class="not-validate">'+fileFieldNotValidationMessage+'</span>');
                            } else if ($(this).hasClass('valid')) {
                                errorCount--;
                                $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                            } else {
                                if ('' === $(this).find('input').val()) {
                                    errorCount++;
                                    $(this).addClass('invalid');
                                    $(this).removeClass('valid');
                                    $(this).find('.field-label').append('<span class="not-validate">'+fileFieldNotValidationMessage+'</span>');
                                } else {
                                    errorCount--;
                                    $(this).addClass('valid');
                                    $(this).removeClass('invalid');
                                    $(this).find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                                }
                            }
                        }
                    }
                }
            });

            if (0 === $('.invalid').length) {
                $('body').addClass('is-loading');
                let event_id = $('.event_id').val();
                let email = $('.field-wrap input[type="email"]').val();
                jQuery.ajax({
                    url: formObj.ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'check_email_exist',
                        event_id: event_id,
                        email: email,
                    },
                    success: function (result) {
                        if (result.status) {
                            let fieldWrap = $('.field-wrap input[type="email"]').parents('.field-wrap');
                            fieldWrap.find('.not-validate').remove();
                            fieldWrap.find('.validate').remove();
                            $('body').removeClass('is-loading');
                            if (0 === result.count) {
                                fieldWrap.addClass('valid');
                                fieldWrap.removeClass('invalid');
                                fieldWrap.find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                                $(".attendee-form").submit();
                                document.getElementById("attendee-form").reset();
                            } else {
                                fieldWrap.addClass('invalid');
                                fieldWrap.removeClass('valid');
                                fieldWrap.find('.field-label').append('<span class="not-validate">' + emailExistMessage + '</span>');
                                $('html, body').animate({
                                    'scrollTop': $('.field-wrap input[type="email"]').position().top
                                });
                                return false;
                            }
                        }

                    }
                })
            }

        });

    });

} )(jQuery)

function HandleBrowseClick(fileinput) {
    let browse = jQuery('#' + fileinput).parents('.field-group').find('.form-control').attr('id');
    console.log('browse', browse); 
    jQuery('#' + browse).trigger('click');
}

function Handlechange(fileinput) {
    let textinput = jQuery('#' + fileinput).parents('.file-upload-wrap').find('.filename').attr('id');
    let textinputDom = document.getElementById(textinput);
    let fileinputDom = document.getElementById(fileinput);
    let allowedFileType = jQuery('#' + fileinput).attr('allowed-file-type');
    let exts = allowedFileType.split(", ");
    let enFileTypeArr = [];
    let arFileTypeArr = [];
    for (let e = 0; e < exts.length; e++) {
        if ('pdf' === exts[e]) {
            enFileTypeArr.push('.pdf');
            arFileTypeArr.push('.بي دي إف');
        } else if ('doc' === exts[e]) {
            enFileTypeArr.push('.doc');
            arFileTypeArr.push('.وثيقة');
        } else if ('png' === exts[e]) {
            enFileTypeArr.push('.png');
            arFileTypeArr.push('.بي إن جي');
        } else if ('xlsx' === exts[e]) {
            enFileTypeArr.push('.xlsx');
            arFileTypeArr.push('.xlsx');
        } else if ('pptx' === exts[e]) {
            enFileTypeArr.push('.pptx');
            arFileTypeArr.push('.جزء لكل تريليون');
        } else if ('jpg' === exts[e]) {
            enFileTypeArr.push('.jpg');
            arFileTypeArr.push('.jpg');
        }
    }

    if (-1 < jQuery.inArray('doc', exts)) {
        exts.push('docx');
    }
    if (-1 < jQuery.inArray('pptx', exts)) {
        exts.push('ppt');
    }
    if (-1 < jQuery.inArray('xlsx', exts)) {
        exts.push('xls');
    }
    if (-1 < jQuery.inArray('jpg', exts)) {
        exts.push('jpeg');
    }
    let validateMessage = '';
    let fileUploadMessage = '';
    let fileFieldNotValidationMessage = '';

    if ('ar' === jQuery('.language_type').val()) {
        if (0 < arFileTypeArr.length) {
            fileUploadMessage = 'إن نوع الملف الذي ترغي بتحميله غير مسموح.' +'يرجى اختيار ملف من نوع آخر.';
        }
        validateMessage = 'حسنا';
        fileFieldNotValidationMessage = 'يرجى تحميل الملف المطلوب.';
    } else {
        if (0 < enFileTypeArr.length) {
            fileUploadMessage = 'The type of file you are uploading is not permitted. Please try a different filetype.';
        }
        validateMessage = 'OK';
        fileFieldNotValidationMessage = 'Please upload the required file.';
    }

    jQuery('#' + fileinput).parents('.field-container').find('.field-label .not-validate').remove();
    jQuery('#' + fileinput).parents('.field-container').find('.field-label .validate').remove();
    if (fileinputDom) {
        if (0 < fileinputDom.files.length) {
            let fileArr = [];
            let uploadfileError = 0;
            for (let i = 0; i < fileinputDom.files.length; i++) {
                if (2000000 < fileinputDom.files[i]['size']) {
                    uploadfileError++;
                    if ('ar' === jQuery('.language_type').val()) {
                        fileUploadMessage = 'الحد الأقصى لحجم الملف هو 2 ميغابايت.' +'يرجى تحميل ملف أصغر.';
                    }else{
                        fileUploadMessage = 'A maximum file size of 2MB is allowed. Please try uploading a smaller file.';
                    }

                }
                let file = fileinputDom.files[i]['name'];

                if (file) {
                    let get_ext = file.split('.');
                    get_ext = get_ext.reverse();
                    if (-1 >= jQuery.inArray(get_ext[0].toLowerCase(), exts)) {
                        uploadfileError++;
                        if ('ar' === jQuery('.language_type').val()) {
                            fileUploadMessage = 'إن نوع الملف الذي ترغي بتحميله غير مسموح.' +'يرجى اختيار ملف من نوع آخر.';
                        }else{
                            fileUploadMessage = 'The type of file you are uploading is not permitted. Please try a different filetype.';
                        }

                    }
                }
                fileArr.push(fileinputDom.files[i]['name']);
            }

            let files = fileArr.join(", ");
            if (0 === uploadfileError) {
                // TODO: Unneeded call several times the same css selector
                jQuery('#' + fileinput).parents('.field-wrap').removeClass('invalid').addClass('valid');
                jQuery('#' + fileinput).parents('.field-container').find('.field-label').append('<span class="validate">' + validateMessage + '</span>');
                textinputDom.value = files;
            } else {
                jQuery('#' + fileinput).parents('.field-wrap').removeClass('valid').addClass('invalid');
                jQuery('#' + fileinput).parents('.field-container').find('.field-label').append('<span class="not-validate">' + fileUploadMessage + '</span>');
                textinputDom.value = '';
            }
        } else {
            if (jQuery('#' + fileinput).parents('.field-wrap').hasClass('required')) {
                jQuery('#' + fileinput).parents('.field-wrap').removeClass('valid').addClass('invalid');
                jQuery('#' + fileinput).parents('.field-container').find('.field-label').append('<span class="not-validate">' + fileFieldNotValidationMessage + '</span>');
                textinputDom.value = '';

            }
        }
    }

}