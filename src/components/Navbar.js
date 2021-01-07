import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Navbar extends Component {
    render() {
        return (
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                <a
                    className="navbar-brand col-sm-3 col-md-2 mr-0"
                    href="http://localhost:3000/"
                    rel="noopener noreferrer"
                >
                    Eth Social Network
                </a>
                <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                    <small className="text-secondary">
                        <small id="account">{this.props.account}</small>
                    </small>
                    {this.props.account
                        ? <img
                            className='ml-2'
                            width='30'
                            height='30'
                            src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString()}`}
                            alt="account identicon"
                        />
                        : <span></span>
                    }
                </li>
            </nav>
        );
    }
}

export default Navbar