<?php

/**
 *  Register Route for form builder & form fetch
 */
function register_routes() {
	$namespace = 'register-form/v1';
	register_rest_route(
		$namespace,
		'get-form',
		array(
			'methods'  => \WP_REST_Server::CREATABLE,
			'callback' => 'get_form',
		)
	);

	register_rest_route(
		$namespace,
		'add-form-data',
		array(
			'methods'  => \WP_REST_Server::CREATABLE,
			'callback' => 'add_form_data',
		)
	);

	register_rest_route(
		$namespace,
		'register-attendee',
		array(
			'methods'  => 'GET',
			'callback' => 'register_attendee',
		)
	);

}

function register_attendee( $request ) {
	$parameters = $request->get_params();

	$required_fields = array();

	// Update the keys for consistency in other Rest Endpoints parameters.
	$parameters['event_id'] = $parameters['id'];
	unset( $parameters['id'] );
	$parameters['language_type'] = $parameters['lang'];
	unset( $parameters['lang'] );

	// Guilty until proven.
	$token                    = $parameters['token'];
	$required_fields['token'] = $token = isset( $token ) ? $token : '';

	$domain                    = $parameters['domain'];
	$required_fields['domain'] = $domain = isset( $domain ) ? $domain : '';

	$event_id              = $parameters['event_id'];
	$required_fields['id'] = $event_id = isset( $event_id ) ? $event_id : '';

	$fname                          = $parameters['__FirstName'];
	$required_fields['__FirstName'] = $fname = isset( $fname ) ? $fname : '';

	$lname                         = $parameters['__LastName'];
	$required_fields['__LastName'] = $lname = isset( $lname ) ? $lname : '';

	$email                      = $parameters['__Email'];
	$required_fields['__Email'] = $email = isset( $email ) ? $email : '';

	// Check require fields.
	$empty_fields = array();
	if ( isset( $required_fields ) && ! empty( $required_fields ) ) {
		foreach ( $required_fields as $rk => $rv ) {
			if ( empty( $rv ) ) {
				$empty_fields[] = $rk;
			}
		}
	}

	if ( 0 !== count( $empty_fields ) ) {
		$empty_fields = implode( ', ', $empty_fields );

		return new \WP_REST_Response(
			array(
				'status'  => 400,
				'message' => 'Missing Data Fields: ' . $empty_fields,
			),
			400
		);
	}

	// Check if event exists.
	$status = get_post_status( $event_id );	

	$event_title = get_post_meta( $event_id, 'dffmain_post_title', true );
	if ( 'publish' !== $status || empty( 'dffmain_post_title' ) ) {
		return new \WP_REST_Response(
			array(
				'status'  => 404,
				'message' => 'Event Not Found',
			),
			404
		);
	}

	$verified = false;

	$token_added_sites = get_option( 'npm_added_child_sites' );

	if ( isset( $token_added_sites ) && ! empty( $token_added_sites ) ) {
		foreach ( $token_added_sites as $token_added_sites ) {
			if ( $token_added_sites['token'] === $token
				&& strpos( $domain, $token_added_sites['siteurl'] ) !== false ) {
				$verified = true;
			}
		}
	}

	if ( true === $verified ) {

		// Check if email already registered for specific event.
		if ( ! empty( $event_id ) ) {
			$arg = array(
				'post_type'      => 'attendees',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'meta_query'     => array(
					array(
						'relation' => 'AND',
						array(
							'key'     => 'event_id',
							'value'   => $event_id,
							'compare' => '=',
						),
						array(
							'key'     => 'email',
							'value'   => $email,
							'compare' => '=',
						),
					),
				),
			);

			$query = new WP_Query( $arg );
			$email_already_registered_count =  $query->found_posts ? $query->found_posts : 0;
			wp_reset_postdata();
		}

		$args        = array(
			'post_type'  => 'attendees',
			'meta_query' => array(
				array(
					'key'   => 'event_id',
					'value' => $event_id,
				),
			),
		);
		$query_count = new WP_Query( $args );
		$found_posts = $query_count->found_posts ? $query_count->found_posts : 0;
		$event_attendee_limit_count = get_post_meta( $event_id, 'event_attendee_limit_count', true );
		wp_reset_postdata();
		
		if( $found_posts >= $event_attendee_limit_count ) {
			return new \WP_REST_Response(
				array(
					'status'  => 408,
					'message' => 'Maximum Attendee Count Reached.',
				),
				408
			);
		}

		if ( 0 !== $email_already_registered_count ) {
			return new \WP_REST_Response(
				array(
					'status'  => 409,
					'message' => 'User Already Registered.',
				),
				404
			);
		}

		$_POST['api_registration'] = 'yes';

		if ( isset( $parameters ) && ! empty( $parameters ) ) {
			foreach ( $parameters as $k => $v ) {
				$_POST[ $k ] = $v;
			}
		}
		$html = '';

		require get_template_directory() . '/templates/thank-you.php';

		if ( 'success' === $html ) {

			// Resetting header to avoid sendgrid headers created in the included file.
			header( 'Content-type: text/json; charset=utf-8' );

			return new \WP_REST_Response(
				array(
					'status'  => 201,
					'message' => 'User Registered Successfully.',
				),
				201
			);
		}
	} else {
		return new \WP_REST_Response(
			array(
				'status'  => 404,
				'message' => 'Unauthorized Token.',
			),
			404
		);
	}
}

/**
 * Get registration form
 *
 * @param $request
 * @return void|WP_REST_Response
 */
function get_form( $request ) {
	$parameters = $request->get_params();
	$post_id    = $parameters['postID'];
	if ( $post_id ) {
		$post_id                = intval( $post_id );
		$registration_form_data = get_post_meta( $post_id, '_registration_form_data', true );
		return new \WP_REST_Response(
			array(
				'success'                => true,
				'registration_form_data' => $registration_form_data,
			),
			200
		);
	} else {
		return;
	}
}

/**
 * add/Update registration form
 *
 * @param $request
 * @return void|WP_REST_Response
 */
function add_form_data( $request ) {
	$parameters           = $request->get_params();
	$post_id              = $parameters['postID'];
	$registrationformdata = $parameters['registrationFormData'];

	if ( !$post_id )  return;

	$post_id                = intval( $post_id );
	$registration_form_data = get_post_meta( $post_id, '_registration_form_data', true );
	if ( ! empty( $registration_form_data ) ) {
		update_post_meta( $post_id, '_registration_form_data', $registrationformdata );
	} else {
		add_post_meta( $post_id, '_registration_form_data', $registrationformdata );
	}
	return new \WP_REST_Response(
		array(
			'success'                => true,
			'registration_form_data' => $registration_form_data,
		),
		200
	);

}

/**
 * Ajax function for Select Registration form for event
 */
function select_registration_form_for_event_callback() {
	$template_id = filter_input( INPUT_POST, 'templateID', FILTER_SANITIZE_NUMBER_INT );
	$template_id = isset( $template_id ) ? $template_id : '';
	$post_id     = filter_input( INPUT_POST, 'postID', FILTER_SANITIZE_NUMBER_INT );
	$post_id     = isset( $post_id ) ? $post_id : '';

	if ( $template_id ) {
		$template_id = intval( $template_id );

		$registration_form_data = get_post_meta( $template_id, '_registration_form_data', true );
		$field_preference       = get_post_meta( $post_id, '_wp_field_preference', true );
		$saved_template_id      = get_post_meta( $post_id, '_wp_template_id', true );
	}
	if ( intval( $saved_template_id ) !== intval( $template_id ) ) {
		$field_preference = [];
	}

	$compulsory_field_html = '';
	$additional_field_html = '';
	$select_all            = true;
	$html                  = '';

	if ( ! empty( $registration_form_data ) && isset( $registration_form_data ) ) {
		foreach ( $registration_form_data as $key => $item ) {
			$en_arr = $item['en'];
			$ar_arr = $item['ar'];
			if ( $en_arr['required'] ) {
				$required_field = '<sup class="medatory"> *</sup>';
			} else {
				$required_field = '';
			}

			if ( 3 > $key ) {

				$compulsory_field_html .= registration_form_compulsory_field_html( $en_arr, $ar_arr );

			} else {

				if ( 'true' === $field_preference[ $en_arr['id'] ] ) {
					$check_html = 'checked';
				} else {
					$check_html = '';
				}
				
				if ( $select_all ) {

					$additional_field_html .= registration_form_if_select_all();
                    $select_all = false;

				}

				if ( 'Text Input' === $en_arr['control'] ) {

					$additional_field_html .= registration_form_text_input( $en_arr, $ar_arr, $check_html, $required_field);
					
				} elseif ( 'Text Area' === $en_arr['control'] ) {

					$additional_field_html .= registration_form_text_area( $en_arr, $ar_arr, $check_html, $required_field );

				} elseif ( 'Dropdown Select' === $en_arr['control'] ) {
					$en_options = $en_arr['values'];
					$ar_options = $ar_arr['values'];

					if ( $ar_arr['multiple'] ) {
						$multiple = 'multiple';
					} else {
						$multiple = '';
					}

					if ( ! empty( $en_options ) ) {
						$en_option_html = '';
						$ar_option_html = '';
						for ( $i = 0; $i < sizeof( $en_options ); $i++ ) {
							$en_option_html .= '<option value="' . $en_options[ $i ]['value'] . '">' . $en_options[ $i ]['value'] . '</option>';
							$ar_option_html .= '<option value="' . $ar_options[ $i ]['value'] . '">' . $ar_options[ $i ]['value'] . '</option>';
						}

						$additional_field_html .= registration_form_dropdown_select( $en_arr, $ar_arr, $check_html, $required_field, $multiple, $en_option_html, $ar_option_html );

					}
				} elseif ( 'Radio' === $en_arr['control'] ) {
					$en_options = $en_arr['values'];
					$ar_options = $ar_arr['values'];

					$en_option_html = '';
					$ar_option_html = '';
					if ( ! empty( $en_options ) ) {
						for ( $i = 0; $i < sizeof( $en_options ); $i++ ) {
							$en_option_html .= 		'<div class="formbuilder-radio">
                                                        <input name="' . $en_arr['id'] . '" id="' . $en_arr['id'] . $i . '" type="radio" value="' . $en_options[ $i ]['value'] . '">
                                                        <label for="' . $en_arr['id'] . $i . '">' . $en_options[ $i ]['value'] . '</label>
                                                    </div>';
							$ar_option_html .= 		'<div class="formbuilder-radio">
                                                        <input name="' . $ar_arr['id'] . '" id="' . $ar_arr['id'] . $i . '" type="radio" value="' . $ar_options[ $i ]['value'] . '">
                                                        <label for="' . $ar_arr['id'] . $i . '">' . $ar_options[ $i ]['value'] . '</label>
                                                    </div>';
						}

						$additional_field_html .= registration_form_radio( $en_arr, $ar_arr, $check_html, $required_field, $en_option_html, $ar_option_html );

					}
				} elseif ( 'Checkbox' === $en_arr['control'] ) {
					$en_options = $en_arr['values'];
					$ar_options = $ar_arr['values'];

					$en_option_html = '';
					$ar_option_html = '';
					if ( ! empty( $en_options ) ) {
						for ( $i = 0; $i < sizeof( $en_options ); $i++ ) {
							$en_option_html .=  '<div class="formbuilder-checkbox">
													<input name="' . $en_arr['id'] . $i . '[]" id="' . $en_arr['id'] . $i . '" type="checkbox" value="' . $en_options[ $i ]['value'] . '">
													<label for="' . $en_arr['id'] . $i . '">' . $en_options[ $i ]['value'] . '</label>
												</div>';
							$ar_option_html .= 	'<div class="formbuilder-checkbox">
													<input name="' . $ar_arr['id'] . $i . '[]" id="' . $ar_arr['id'] . $i . '" type="checkbox" value="' . $ar_options[ $i ]['value'] . '">
													<label for="' . $ar_arr['id'] . $i . '">' . $ar_options[ $i ]['value'] . '</label>
												</div>';
						}

						$additional_field_html .= registration_form_checkbox( $en_arr, $ar_arr, $check_html, $required_field, $en_option_html, $ar_option_html );

					}
				} elseif ( 'File Upload' === $en_arr['control'] ) {
					$additional_field_html .= registration_form_file_upload( $en_arr, $ar_arr, $check_html, $required_field );
				}
			}
		}

		$html .= 	'<div id="registration-template" class="registration-template">
							<div class="compulsory-field-main">
								<div id="compulsory-fields-wrap" class="compulsory-fields-wrap">
									<div class="accordian-main">
										<div class="accordian-title">
											<h3>Compulsory Fields</h3>
										</div>
										<div class="accordian-body">' . $compulsory_field_html . '</div>
									</div>
								</div>
							</div>';
			if( '' !== $additional_field_html ){
				$html .= 	'<div class="additional-field-main">
								<div id="additional-fields-wrap" class="additional-fields-wrap">
									<div class="add-new-fields-wrap" id="add-new-fields-wrap">
										<div class="accordian-main">
											<div class="accordian-title">
												<h3>Additional Fields</h3>
											</div>
											<div class="accordian-body">' . $additional_field_html . '</div>
										</div>
									</div>
								</div>
							</div>';
			}
		$html .= 	'</div>';
	}
	
	$dataArr = [];
	$dataArr['compulsoryFieldHtml']     = $compulsory_field_html;
	$dataArr['additionalFieldHtml']     = $additional_field_html;
	$dataArr['status']                  = ( ! empty( $registration_form_data ) ) ? true : false;
	$dataArr['$registration_form_data'] = $registration_form_data;
	$dataArr['$field_preference']       = $field_preference;
	$dataArr['$saved_template_id']      = $saved_template_id;
	$dataArr['$template_id']            = $template_id;
	$dataArr['formHtml']                = $html;
	
	echo wp_json_encode( $dataArr );
	wp_die();
}


/**
 * Ajax call for Save Registration form field preference
 */
function save_registration_form_for_event_callback() { 

	$template_id = filter_input( INPUT_POST, 'templateID', FILTER_SANITIZE_NUMBER_INT );
	$template_id = isset( $template_id ) ? $template_id : '';
	$post_id     = filter_input( INPUT_POST, 'postID', FILTER_SANITIZE_NUMBER_INT );
	$post_id     = isset( $post_id ) ? $post_id : '';

	$field_preference = filter_input( INPUT_POST, 'fieldPreference', FILTER_SANITIZE_STRING );
	$field_preference = isset( $field_preference ) ? json_decode( html_entity_decode( $field_preference ), true ) : [];

	if ( $post_id ) {
		$post_id = intval( $post_id );

		update_post_meta( $post_id, '_wp_template_id', $template_id );

		$saved_template_id = get_post_meta( $post_id, '_wp_template_id', true );



		if ( isset( $field_preference ) && ! empty( $field_preference ) ) {
			$field_preference_arr = array();
			foreach ( $field_preference as $val ) {
				$field_preference_arr[ $val['fieldName'] ] = $val['preference'];
			}
			$saved_field_preference = get_post_meta( $post_id, '_wp_field_preference', true );
			update_post_meta( $post_id, '_wp_field_preference', $field_preference_arr );
		}
	}
	$dataArr                            = array();
	$dataArr['$postID']                 = $post_id;
	$dataArr['$templateID']             = $template_id;
	$dataArr['$field_preference']       = $field_preference_arr;
	$dataArr['$saved_template_id']      = $saved_template_id;
	$dataArr['$saved_field_preference'] = $saved_field_preference;

	echo wp_json_encode( $dataArr );
	wp_die();
}

/*
 * Ajax call for get Attendee details in for popup
 */
function get_attendee_details_callback() {
	$attendee_id = filter_input( INPUT_POST, 'AttendeeId', FILTER_SANITIZE_NUMBER_INT );
	$attendee_id = isset( $attendee_id ) ? $attendee_id : '';

	if ( $attendee_id ) {
		$post_id       = intval( $attendee_id );
		$attendee_data = get_post_meta( $post_id, 'attendee_data', true );

		$attendee_data_arr = array();
		$details_html      = '';
		if ( isset( $attendee_data ) && ! empty( $attendee_data ) ) {
			$details_html .= '<div class="attendee-wrap">
                                <h3>Attendee Details</h3>
                                <button class="button button-primary close" value="Close">Close</button>
                                <div class="attendee-inner">
                                    <table>
                                        <tr>
                                            <td class="label">Name</td>
                                            <td class="value">' . get_the_title( $attendee_id ) . '</td>
                                        </tr>';
			foreach ( $attendee_data as $key => $value ) {
				if ( 'FirstName' !== $key && 'LastName' !== $key && 'SecurityCode' !== $key ) {
					$updated_key = preg_replace( '/(?<!\ )[A-Z]/', ' $0', $key );
					$updated_key = str_replace( '_', ' ', $updated_key );

					if ( is_array( $value ) ) {
						$attendee_value = implode( ', ', $value );
					} else {
						$attendee_value = $value;
					}
					if ( 'checkin' === $updated_key ) {
						$updated_key    = 'Check In';
						$checkin        = get_post_meta( $post_id, 'checkin', true );
						$attendee_value = ( 'true' === $checkin ) ? 'Yes' : 'No';

					}
					if ( 'languageType' === $key ) {
						$attendee_value = ( 'ar' === $value ) ? 'Arabic' : 'English';
					}

					$attendee_value = ( ! empty( $attendee_value ) ) ? $attendee_value : '-';
					$details_html  .= '<tr>
                                                            <td class="label">' . $updated_key . '</td>
                                                            <td class="value">' . $attendee_value . '</td>
                                                          </tr>';
				}
			}
			$details_html .= '</table>
                            </div>
                         </div>';
		}
	}
	$dataArr                       = array();
	$dataArr['$postID']            = $attendee_id;
	$dataArr['details_html']       = $details_html;
	$dataArr['$attendee_data_arr'] = $attendee_data_arr;
	$dataArr['status']             = ( ! empty( $attendee_data ) ) ? true : false;

	echo wp_json_encode( $dataArr );
	wp_die();
}

/**
 * compulsory field html
 *
 * @param [array] $en_arr
 * @param [array] $ar_arr
 * 
 * @return [string] $html
 */
function registration_form_compulsory_field_html( $en_arr, $ar_arr ){

	$html = 	'<div class="field-wrap">';
	$html .= 		'<div class="field-inner">';
	$html .= 			'<div class="field-container en-field">';
	$html .=				'<span class="field-label">' . $en_arr['label'] . '</span>';
	$html .=				'<label for="' . $en_arr['id'] . '">';
	$html .=					'<input type="' . $en_arr['type'] . '" name="' . $en_arr['id'] . '" id="' . $en_arr['id'] . '">';
	$html .=				'</label>';
	$html .=			'</div>';
	$html .=			'<div class="field-container ar-field">';
	$html .=				'<span class="field-label">' . $ar_arr['label'] . '</span>';
	$html .=				'<label for="' . $ar_arr['id'] . '">';
	$html .=					'<input type="' . $ar_arr['type'] . '" name="' . $ar_arr['id'] . '" id="' . $ar_arr['id'] . '">';
	$html .=				'</label>';
	$html .=			'</div>';
	$html .=		'</div>';
	$html .=	'</div>';

	return $html;
}

/**
 * select all html
 *
 * @return [string] $html
 */
function registration_form_if_select_all() {

	$html = 	'<div class="field-wrap">';
    $html .=    	'<div class="select_field_checkbox">';
    $html .=        	'<div class="select_all_checkbox">';
    $html .=            	'<label for="select_all">';
    $html .=                 	'<input  name="select_all" id="select_all" type="checkbox">';
    $html .=                    'Select All';
    $html .=                '</label>';
    $html .=          	'</div>';
    $html .=      	'</div>';
    $html .=  	'</div>';

	return  $html;
}

/**
 * Text Input
 *
 * @param [array] $en_arr
 * @param [array] $ar_arr
 * @param [string] $required_field
 * 
 * @return [string] $html
 */
function registration_form_text_input( $en_arr, $ar_arr, $check_html, $required_field ) {

    $html =     '<div class="field-wrap">';
    $html .=        '<div class="select_field_checkbox">';
    $html .=            '<div class="display-filed-checkbox">';
    $html .=                '<label for="checkbox_' . $en_arr['id'] . '">';
    $html .=                    '<input ' . $check_html . ' name="checkbox_' . $en_arr['id'] . '" id="checkbox_' . $en_arr['id'] . '" type="checkbox">';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=        '<div class="field-inner">';
    $html .=            '<div class="field-container en-field">';
    $html .=                '<span class="field-label">' . $en_arr['label'] . $required_field . '</span>';
    $html .=                '<label for="' . $en_arr['id'] . '">';
    $html .=                    '<input type="' . $en_arr['type'] . '" name="' . $en_arr['id'] . '" id="' . $en_arr['id'] . '"/>';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=            '<div class="field-container ar-field">';
    $html .=                '<span class="field-label">' . $ar_arr['label'] . $required_field . '</span>';
    $html .=                '<label for="' . $ar_arr['id'] . '">';
    $html .=                    '<input type="' . $ar_arr['type'] . '" name="' . $ar_arr['id'] . '" id="' . $ar_arr['id'] . '"/>';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=    '</div>';

	return  $html;
}

/**
 * Text Area
 *
 * @param [array] $en_arr
 * @param [array] $ar_arr
 * @param [string] $check_html
 * @param [string] $required_field
 * 
 * @return [string] $html
 */
function registration_form_text_area( $en_arr, $ar_arr, $check_html, $required_field ) {

    $html =     '<div class="field-wrap">';
    $html .=        '<div class="select_field_checkbox">';
    $html .=            '<div class="display-filed-checkbox">';
    $html .=                '<label for="checkbox_' . $en_arr['id'] . '">';
    $html .=                    '<input ' . $check_html . ' name="checkbox_' . $en_arr['id'] . '" id="checkbox_' . $en_arr['id'] . '" type="checkbox">';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=        '<div class="field-inner">';
    $html .=            '<div class="field-container en-field">';
    $html .=                '<span class="field-label">' . $en_arr['label'] . $required_field . '</span>';
    $html .=                '<label for="' . $en_arr['id'] . '">';
    $html .=                    '<textarea type="textarea" class="form-control" name="' . $en_arr['id'] . '" id="' . $en_arr['id'] . '"></textarea>';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=            '<div class="field-container ar-field">';
    $html .=                '<span class="field-label">' . $ar_arr['label'] . $required_field . '</span>';
    $html .=                '<label for="' . $ar_arr['id'] . '">';
    $html .=                    '<textarea type="textarea" class="form-control" name="' . $ar_arr['id'] . '" id="' . $ar_arr['id'] . '"></textarea>';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=    '</div>';

    return  $html;
}

/**
 * Dropdown Select
 *
 * @param [array] $en_arr
 * @param [array] $ar_arr
 * @param [string] $check_html
 * @param [string] $required_field
 * @param [string] $multiple
 * @param [string] $en_option_html
 * @param [string] $ar_option_html
 * 
 * @return [string] $html
 */
function registration_form_dropdown_select( $en_arr, $ar_arr, $check_html, $required_field, $multiple, $en_option_html, $ar_option_html ) {

    $html =    '<div class="field-wrap">';
    $html .=        '<div class="select_field_checkbox">';
    $html .=            '<div class="display-filed-checkbox">';
    $html .=                '<label for="checkbox_' . $en_arr['id'] . '">';
    $html .=                    '<input ' . $check_html . ' name="checkbox_' . $en_arr['id'] . '" id="checkbox_' . $en_arr['id'] . '" type="checkbox">';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=        '<div class="field-inner">';
    $html .=            '<div class="field-container en-field">';
    $html .=                '<span class="field-label">' . $en_arr['label'] . $required_field . '</span>';
    $html .=                '<label for="' . $en_arr['id'] . '">';
    $html .=                    '<select name="' . $en_arr['id'] . '" id="' . $en_arr['id'] . '" ' . $multiple . '>';
    $html .=                        '<option>Choose</option>';
    $html .=                        $en_option_html;
    $html .=                    '</select>';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=        '<div class="field-container ar-field">';
    $html .=            '<span class="field-label">' . $ar_arr['label'] . $required_field . '</span>';
    $html .=                '<label for="' . $ar_arr['id'] . '">';
    $html .=                    '<select name="' . $ar_arr['id'] . '" id="' . $ar_arr['id'] . '" ' . $multiple . '>';
    $html .=                        '<option>أختر</option>';
    $html .=                        $ar_option_html;
    $html .=                    '</select>';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=    '</div>';

    return  $html;
}

/**
 * Radio
 *
 * @param [array] $en_arr
 * @param [array] $ar_arr
 * @param [string] $check_html
 * @param [string] $required_field
 * @param [string] $en_option_html
 * @param [string] $ar_option_html
 * 
 * @return [string] $html
 */
function registration_form_radio( $en_arr, $ar_arr, $check_html, $required_field, $en_option_html, $ar_option_html ) {

    $html =     '<div class="field-wrap">';
    $html .=        '<div class="select_field_checkbox">';
    $html .=            '<div class="display-filed-checkbox">';
    $html .=                '<label for="checkbox_' . $en_arr['id'] . '">';
    $html .=                    '<input ' . $check_html . ' name="checkbox_' . $en_arr['id'] . '" id="checkbox_' . $html .=$en_arr['id'] . '" type="checkbox">';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=        '<div class="field-inner">';
    $html .=            '<div class="field-container en-field">';
    $html .=                '<span class="field-label">' . $en_arr['label'] . $required_field . '</span>';
    $html .=                '<div class="radio-group">';
    $html .=                    $en_option_html;
    $html .=                '</div>';
    $html .=            '</div>';
    $html .=            '<div class="field-container ar-field">';
    $html .=                '<span class="field-label">' . $ar_arr['label'] . $required_field . '</span>';
    $html .=                '<div class="radio-group">';
    $html .=                    $ar_option_html;
    $html .=                '</div>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=    '</div>';

    return  $html;
}

/**
 * Checkbox
 *
 * @param [array] $en_arr
 * @param [array] $ar_arr
 * @param [string] $check_html
 * @param [string] $required_field
 * @param [string] $en_option_html
 * @param [string] $ar_option_html
 * 
 * @return [string] $html
 */
function registration_form_checkbox( $en_arr, $ar_arr, $check_html, $required_field, $en_option_html, $ar_option_html ) {

    $html =     '<div class="field-wrap">';
    $html .=        '<div class="select_field_checkbox">';
    $html .=            '<div class="display-filed-checkbox">';
    $html .=                '<label for="checkbox_' . $en_arr['id'] . '">';
    $html .=                    '<input ' . $check_html . ' name="checkbox_' . $en_arr['id'] . '" id="checkbox_' . $en_arr['id'] . '" type="checkbox">';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=        '<div class="field-inner">';
    $html .=            '<div class="field-container en-field">';
    $html .=                '<span class="field-label">' . $en_arr['label'] . $required_field . '</span>';
    $html .=                '<div class="checkbox-group">';
    $html .=                    $en_option_html;
    $html .=                '</div>';
    $html .=            '</div>';
    $html .=            '<div class="field-container ar-field">';
    $html .=                '<span class="field-label">' . $ar_arr['label'] . $required_field . '</span>';
    $html .=                '<div class="radio-group">';
    $html .=                    '<div class="checkbox-group">';
    $html .=                        $ar_option_html;
    $html .=                    '</div>';
    $html .=                '</div>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=    '</div>';

    return  $html;
}

/**
 * File Upload
 *
 * @param [array] $en_arr
 * @param [array] $ar_arr
 * @param [string] $check_html
 * @param [string] $required_field
 * 
 * @return [string] $html
 */
function registration_form_file_upload( $en_arr, $ar_arr, $check_html, $required_field ) {

    $html =    '<div class="field-wrap">';
    $html .=        '<div class="select_field_checkbox">';
    $html .=            '<div class="display-filed-checkbox">';
    $html .=                '<label for="checkbox_' . $en_arr['id'] . '">';
    $html .=                    '<input ' . $check_html . ' name="checkbox_' . $en_arr['id'] . '" id="checkbox_' . $en_arr['id'] . '" type="checkbox">';
    $html .=                '</label>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=        '<div class="field-inner">';
    $html .=            '<div class="field-container en-field">';
    $html .=                '<span class="field-label">' . $en_arr['label'] . $required_field . '</span>';
    $html .=                '<div class="field-group">';
    $html .=                    '<div class="file-upload-wrap">';
    $html .=                        '<label for="en_filename">';
    $html .=                            '<input type="text" id="en_filename" class="filename" readOnly="true"/>';
    $html .=                        '</label>';
    $html .=                        '<label for="' . $en_arr['id'] . '">';
    $html .=                            '<input type="file" name="' . $en_arr['id'] . '" id="' . $en_arr['id'] . '" class="form-control" style="display:none" onclick="Handlechange(this.id);" />';
    $html .=                        '</label>';
    $html .=                    '</div>';
    $html .=                    '<div class="button-wrap">';
    $html .=                        '<label for="' . $en_arr['button1'] . '">';
    $html .=                            '<input type="button" name="' . $en_arr['button1'] . '" value="' . $en_arr['button1'] . '" onclick="HandleBrowseClick(this.id);" id="' . $en_arr['button1'] . '" class="button button-primary" />';
    $html .=                        '</label>';
    $html .=                    '</div>';
    $html .=                '</div>';
    $html .=            '</div>';
    $html .=            '<div class="field-container ar-field">';
    $html .=                '<span class="field-label">' . $ar_arr['label'] . $required_field . '</span>';
    $html .=                '<div class="field-group">';
    $html .=                    '<div class="file-upload-wrap">';
    $html .=                        '<label for="ar_filename">';
    $html .=                            '<input type="text" id="ar_filename" class="filename" readOnly="true" />';
    $html .=                        '</label>';
    $html .=                        '<label for="' . $ar_arr['id'] . '">';
    $html .=                            '<input type="file" name="' . $ar_arr['id'] . '" id="' . $ar_arr['id'] . '" class="form-control" style="display:none" onclick="Handlechange(this.id);"/>';
    $html .=                        '</label>';
    $html .=                    '</div>';
    $html .=                    '<div class="button-wrap">';
    $html .=                        '<label for="' . $ar_arr['button1'] . '">';
    $html .=                            '<input type="button" name="' . $ar_arr['button1'] . '" value="' . $ar_arr['button1'] . '" onclick="HandleBrowseClick(this.id);" id="' . $ar_arr['button1'] . '" class="button button-primary" />';
    $html .=                    '</div>';
    $html .=                '</div>';
    $html .=            '</div>';
    $html .=        '</div>';
    $html .=    '</div>';

    return  $html;
}