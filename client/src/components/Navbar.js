import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import '../style/navbar.css';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
    this.state = {
      logoOpacity: 1
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const headerHeight = document.getElementById('header').offsetHeight;
    const y = window.scrollY;

    if (y > headerHeight) {
      this.setState({ logoOpacity: 1 });
    } else {
      this.setState({ logoOpacity: 0 });
    }
  }

  authStatus() {
    if (this.props.user.isLoading) {
      return null;
    }
    switch (this.props.user.auth) {
      case null:
        return null;
      case undefined:
        return (
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <NavLink to={'/login'} className="nav-link">
                <FontAwesome name="sign-in" className="icon-left" />
                <span className="nav-label">Login</span>
              </NavLink>
            </li>
          </ul>
        );
      default:
        return (
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <NavLink to={'/release/add/'} className="nav-link">
                <FontAwesome name="plus-square" className="icon-left" />
                <span className="nav-label">Add Release</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to={'/dashboard'} className="nav-link">
                <FontAwesome name="user-circle" className="icon-left" />
                <span className="nav-label">Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/api/logout">
                <FontAwesome name="sign-out" className="icon-left" />
                <span className="nav-label">Log out</span>
              </a>
            </li>
          </ul>
        );
    }
  }

  render() {
    return (
      <nav className="navbar sticky-top navbar-expand-lg">
        <Link
          to={'/'}
          className="navbar-brand-link"
          style={{ opacity: this.state.logoOpacity }}
        >
          <svg
            className="navbar-brand"
            width="500"
            height="143.34"
            version="1.1"
            viewBox="0 0 132.29167 37.925649"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m132.29 20.857q0 1.8128-.69252 3.4015-.69252 1.5887-1.8942 2.7904-1.1814 1.1814-2.7701 1.8739t-3.4015.69252h-11.691v-5.8457h11.691q.61104 0 1.1406-.22405.52957-.22405.91657-.61105.40736-.40736.63141-.93694.22405-.52957.22405-1.1406 0-.61105-.22405-1.1406t-.63141-.91657q-.387-.40736-.91657-.63142-.52958-.22405-1.1406-.22405h-7.964v-5.8457h7.964q.61104 0 1.1406-.22405.52957-.22405.91657-.61105.40736-.40736.63141-.93694.22405-.54994.22405-1.161 0-.61105-.22405-1.1406-.22405-.52957-.63141-.91657-.387-.40736-.91657-.63142-.52958-.22405-1.1406-.22405h-11.691v-5.8457h11.691q1.8128 0 3.4015.69252 1.5887.69252 2.7701 1.8942 1.2017 1.1814 1.8942 2.7701.69252 1.5887.69252 3.4015 0 1.6091-.59068 3.1367-.59068 1.5072-1.6702 2.709 1.0795 1.2017 1.6702 2.7293.59068 1.5072.59068 3.1163z" />
            <path d="m92.105 37.926h-5.6013v-30.125h1.3443l2.2201 2.6275q.75363-.71289 1.6498-1.3443t1.8535-1.0795q.97768-.46847 2.0165-.73326 1.0388-.26479 2.0979-.26479 2.3016 0 4.3181.8351 2.0368.81473 3.5441 2.322 1.5276 1.5072 2.4034 3.6459.87584 2.1183.87584 4.7051 0 2.6886-.87584 4.8476-.87583 2.1387-2.4034 3.6459-1.5072 1.4869-3.5441 2.2812-2.0165.79436-4.3181.79436-.73326 0-1.4665-.16296-.71289-.16295-1.4258-.42773-.69252-.28515-1.385-.63141-.67215-.34626-1.3036-.71289zm11.141-19.411q0-1.385-.4481-2.4849-.42773-1.0999-1.1814-1.8535-.75362-.77399-1.772-1.1814-1.0184-.40736-2.159-.40736-1.1406 0-2.159.40736-.99804.40737-1.7517 1.1814-.75362.75362-1.2017 1.8535-.42773 1.0999-.42773 2.4849 0 1.3239.42773 2.4238.4481 1.0999 1.2017 1.8739.75362.77399 1.7517 1.2017 1.0184.42773 2.159.42773 1.1406 0 2.159-.42773 1.0184-.42773 1.772-1.2017.75363-.77399 1.1814-1.8739.4481-1.0999.4481-2.4238z" />
            <path d="m81.86 29.615h-5.8253v-20.857q0-.61105-.24442-1.1406-.22405-.52958-.63142-.91657-.387-.40737-.91657-.63142-.52958-.22405-1.1406-.22405t-1.1406.22405-.93694.63142q-.387.387-.61105.91657-.22405.52957-.22405 1.1406v20.857h-5.8457v-20.857q0-.61105-.22405-1.1406-.22405-.52958-.63142-.91657-.387-.40737-.91657-.63142-.52958-.22405-1.1406-.22405-.61105 0-1.1406.22405-.52957.22405-.93694.63142-.387.387-.61104.91657-.22405.52957-.22405 1.1406v20.857h-5.8457v-20.857q0-1.8128.67215-3.4015.69252-1.6091 1.8739-2.7904 1.2017-1.2017 2.7904-1.8739 1.6091-.69252 3.4219-.69252 1.6295 0 3.1367.59068 1.5072.57031 2.709 1.6702 1.2017-1.0999 2.6886-1.6702 1.5072-.59068 3.1367-.59068 1.8128 0 3.4015.69252 1.6091.67215 2.7904 1.8739 1.2017 1.1814 1.8739 2.7904.69252 1.5887.69252 3.4015z" />
            <path d="m23.362 29.615h-6.253l-11.264-19.228v19.228h-5.8457v-29.208h6.253l11.264 19.248v-19.248h5.8457z" />
            <path d="m48.782 29.615h-20.022v-29.208h20.022v5.8457h-14.176v5.8457h9.5934v5.8457h-9.5934v5.8253h14.176z" />
          </svg>
        </Link>
        {this.authStatus()}
      </nav>
    );
  }
}

export default Navbar;
