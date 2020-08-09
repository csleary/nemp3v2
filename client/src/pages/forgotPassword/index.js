import { Field, reduxForm } from 'redux-form';
import React, { useRef, useState } from 'react';
import Button from 'components/button';
import FontAwesome from 'react-fontawesome';
import InputField from 'components/inputField';
import PropTypes from 'prop-types';
import RenderRecaptcha from 'components/renderRecaptcha';
import axios from 'axios';
import styles from './forgotPassword.module.css';

const ForgotPassword = ({ handleSubmit, pristine, reset, submitting, invalid }) => {
  const captchaRef = useRef();
  const [response, setResponse] = useState();
  const className = response?.error ? 'alert-danger' : 'alert-success';

  const onSubmit = async values => {
    try {
      const res = await axios.post('/api/auth/reset', values);
      setResponse(res.data);
    } catch (error) {
      setResponse(error.response.data);
    }

    reset();
    captchaRef.current.getRenderedComponent().reset();
  };

  return (
    <main className="container">
      <div className="row">
        <div className="col py-3 mb-4">
          <h2 className="text-center mt-4">Reset Password</h2>
          <p className="text-center">
            Please enter your account email address below and submit to receive a password reset link, valid for an
            hour.
          </p>
          <form className="form-row mt-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="col-md-6 mx-auto">
              <Field
                component={InputField}
                icon="envelope-o"
                id="email"
                label="Email Address:"
                name="email"
                placeholder="Email Address"
                required
                type="email"
                validate={required}
              />
              {response ? (
                <div className={`alert ${className} text-center`} role="alert">
                  {response.success ? <FontAwesome name="thumbs-up" className="mr-2" /> : null}
                  {response.error ? <FontAwesome name="bomb" className="mr-2" /> : null}
                  {response.success || response.error}
                </div>
              ) : null}
              <Field
                classNames="justify-content-end"
                component={RenderRecaptcha}
                forwardRef
                name="recaptcha"
                ref={el => {
                  captchaRef.current = el;
                }}
                validate={required}
              />
              <div className="d-flex justify-content-end">
                <Button className={styles.button} disabled={invalid || pristine || submitting} type="submit">
                  Send Reset Email
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

ForgotPassword.propTypes = {
  handleSubmit: PropTypes.func,
  invalid: PropTypes.bool,
  pristine: PropTypes.bool,
  reset: PropTypes.func,
  submitting: PropTypes.bool
};

const required = value => {
  if (value) return;
  return 'Please enter a value.';
};

export default reduxForm({ form: 'forgotPasswordForm' })(ForgotPassword);
