import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import CompulsoryFields from './CompulsoryFields.jsx';
import AdditionalFields from './AdditionalFields.jsx';
import axios from '../services/axios';

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            postID: window.formBuilderObj.postID,
            restUrl: '/wp-json/register-form/v1/',
            registrationFormData: [],
            response: false,
            defaultField: [
                {
                    'en': {
                        'control': 'input',
                        'type': 'text',
                        'required': true,
                        'label': 'First Name',
                        'id': 'enFirstName',
                        'className': 'form-control',
                        'name': 'enFirstName',
                        'language': 'English',
                        'abbrivation': 'en'
                    },
                    'ar': {
                        'control': 'input',
                        'type': 'text',
                        'required': true,
                        'label': 'الاسم الاول',
                        'id': 'arFirstName',
                        'className': 'form-control',
                        'name': 'arFirstName',
                        'language': 'Arabic',
                        'abbrivation': 'ar'
                    }

                }, {
                    'en': {
                        'control': 'input',
                        'type': 'text',
                        'required': true,
                        'label': 'Last Name',
                        'id': 'enLastName',
                        'className': 'form-control',
                        'name': 'enLastName',
                        'language': 'English',
                        'abbrivation': 'en'
                    },
                    'ar': {
                        'control': 'input',
                        'type': 'text',
                        'required': true,
                        'label': 'الكنية',
                        'id': 'arLastName',
                        'className': 'form-control',
                        'name': 'arLastName',
                        'language': 'Arabic',
                        'abbrivation': 'ar'
                    }
                }, {
                    'en': {
                        'control': 'input',
                        'type': 'email',
                        'required': true,
                        'label': 'Email',
                        'id': 'enEmail',
                        'className': 'form-control',
                        'name': 'enEmail',
                        'language': 'English',
                        'abbrivation': 'en'
                    },
                    'ar': {
                        'control': 'input',
                        'type': 'email',
                        'required': true,
                        'label': 'البريد الإلكتروني',
                        'id': 'arEmail',
                        'className': 'form-control',
                        'name': 'arEmail',
                        'language': 'Arabic',
                        'abbrivation': 'ar'
                    }
                }
            ]
        };
    }

    // TODO: Best practice to use some async request like fetch is using some decorator function with public interface and inside this decorator is using fetch requests
    // https://www.telerik.com/blogs/decorators-in-javascript
    // benefit of this approach - you can easy change way how you make request and public interface in this case will be the same

    componentDidMount() {
        if (null !== document.getElementById('registration_form')) {
            let body = document.body;
            body.classList.add('is-loading');
            axios.post(`${this.state.restUrl}get-form`, {
                postID: this.state.postID,
            })
            .then((data) => {
                if (data.success) {
                    let registrationFormData = [];
                    0 < data.registration_form_data.length ? data.registration_form_data.map((item) => {
                        registrationFormData.push(item);
                    }) : registrationFormData.push({
                        'en': {
                            'control': 'input',
                            'type': 'text',
                            'required': true,
                            'label': 'First Name',
                            'id': 'enFirstName',
                            'className': 'form-control',
                            'name': 'enFirstName',
                            'language': 'English',
                            'abbrivation': 'en'
                        },
                        'ar': {
                            'control': 'input',
                            'type': 'text',
                            'required': true,
                            'label': 'الاسم الاول',
                            'id': 'arFirstName',
                            'className': 'form-control',
                            'name': 'arFirstName',
                            'language': 'Arabic',
                            'abbrivation': 'ar'
                        }

                    }, {
                        'en': {
                            'control': 'input',
                            'type': 'text',
                            'required': true,
                            'label': 'Last Name',
                            'id': 'enLastName',
                            'className': 'form-control',
                            'name': 'enLastName',
                            'language': 'English',
                            'abbrivation': 'en'
                        },
                        'ar': {
                            'control': 'input',
                            'type': 'text',
                            'required': true,
                            'label': 'الكنية',
                            'id': 'arLastName',
                            'className': 'form-control',
                            'name': 'arLastName',
                            'language': 'Arabic',
                            'abbrivation': 'ar'
                        }
                    }, {
                        'en': {
                            'control': 'input',
                            'type': 'email',
                            'required': true,
                            'label': 'Email',
                            'id': 'enEmail',
                            'className': 'form-control',
                            'name': 'enEmail',
                            'language': 'English',
                            'abbrivation': 'en'
                        },
                        'ar': {
                            'control': 'input',
                            'type': 'email',
                            'required': true,
                            'label': 'البريد الإلكتروني',
                            'id': 'arEmail',
                            'className': 'form-control',
                            'name': 'arEmail',
                            'language': 'Arabic',
                            'abbrivation': 'ar'
                        }
                    });
                    body.classList.remove('is-loading');
                    this.setState({registrationFormData: registrationFormData, response: true});
                }
            }).catch((e) => {
                console.log(e);
            });
        }
    }

    handleSave = (event) => {
        event.preventDefault();
        if( '' === $('.post-type-registration-forms #titlewrap input').val() ){
            alert('Please enter a title to publish this registration form.');
        }else{
            let body = document.body;
            body.classList.add('is-loading');
            axios.post(`${this.state.restUrl}add-form-data`, {
                postID: this.state.postID,
                registrationFormData: this.state.registrationFormData,
            })
            .then(res => {
                if (res.success) {
                    $('#publish').trigger('click');
                }
            }).catch((e) => {
                console.log(e);
            });
        }


    };
    allFieldsData = (data) => {
        this.setState({registrationFormData: data});
    };

    render() {
        const {response, registrationFormData} = this.state;
        return (
            <div id="registration-template" className="registration-template">
                <div className="button-wrap">
                    <button className="button button-primary btn-save"
                            onClick={this.handleSave}>Save</button>
                </div>
                <div className="compulsory-field-main">
                    {
                        response &&
                        <CompulsoryFields wpObject={window.formBuilderObj}
                                          registrationFormData={registrationFormData} />
                    }
                </div>
                <div className="additional-field-main">
                    {
                        response &&
                        <AdditionalFields wpObject={window.formBuilderObj}
                                          registrationFormData={registrationFormData}
                                          allFieldsData={this.allFieldsData}/>
                    }
                </div>
            </div>
        );
    }
}

export default Main;

document.addEventListener('DOMContentLoaded', function () {
    if (null !== document.getElementById('registration-form-wrap')) {
        ReactDOM.render(<Main/>, document.getElementById('registration-form-wrap'));
    }
});


