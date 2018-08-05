import axios from 'axios';
import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import RenderRecaptcha from './RenderRecaptcha';
import { fetchUser, toastError, toastSuccess } from '../actions';

class Register extends Component {
  onSubmit = values => {
    const captcha = this.captcha;
    this.register(values, () => {
      this.props.reset();
      captcha.getRenderedComponent().reset();
      this.props.fetchUser();
      this.props.history.push('/');
    });
  };

  register = async (values, callback) => {
    try {
      const res = await axios.post('/api/auth/register', values);
      this.props.toastSuccess(res.data.success);
      callback();
    } catch (e) {
      this.props.toastError(e.response.data.error || e.message);
    }
  };

  required = value => (value ? undefined : 'Please enter a value.');

  renderField = field => {
    const {
      hint,
      icon,
      id,
      input,
      label,
      meta: { touched, error },
      name,
      placeholder,
      required,
      type
    } = field;

    return (
      <div className="form-group">
        <label htmlFor={id}>
          <FontAwesome name={icon} className="red mr-2" />
          {label}
        </label>
        <input
          {...input}
          className="form-control"
          name={name}
          placeholder={placeholder}
          required={required}
          type={type}
        />
        {error && (
          <div className="invalid-feedback">{touched && error && error}</div>
        )}
        {hint && <small className="form-text text-muted">{hint}</small>}
      </div>
    );
  };

  render() {
    const { handleSubmit, pristine, submitting, invalid } = this.props;

    return (
      <main className="container">
        <div className="row">
          <div className="col">
            <h2 className="text-center red mt-4">Register</h2>
            <form
              className="form-row mt-5"
              onSubmit={handleSubmit(this.onSubmit)}
            >
              <div className="col-md-6 mx-auto">
                <Field
                  component={this.renderField}
                  icon="envelope-o"
                  id="email"
                  label="Email Address:"
                  name="email"
                  placeholder="Email Address"
                  required
                  type="email"
                  validate={this.required}
                />
                <Field
                  className="form-control"
                  component={this.renderField}
                  hint="A strong and unique alphanumeric password recommended."
                  icon="key"
                  id="password"
                  label="Password:"
                  name="password"
                  placeholder="Password"
                  required
                  type="password"
                  validate={this.required}
                />
                <Field
                  classNames="justify-content-end"
                  component={RenderRecaptcha}
                  name="recaptcha"
                  ref={el => {
                    this.captcha = el;
                  }}
                  validate={this.required}
                  withRef
                />
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-outline-primary my-3"
                    disabled={invalid || pristine || submitting}
                    type="submit"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    );
  }
}

export default reduxForm({
  form: 'registerForm'
})(
  connect(
    null,
    { fetchUser, toastError, toastSuccess }
  )(withRouter(Register))
);
