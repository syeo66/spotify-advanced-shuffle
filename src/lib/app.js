import React, { Component } from 'react';
import Overview from "./components/Overview";
import Signin from "./components/Signin";
import Signout from "./components/Signout";
import requireAuth from "./components/auth/requireAuth";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import { fetchUser, doLogin } from './actions';

class App extends Component {
    componentWillMount() {
        window.addEventListener("message", this.onMessage.bind(this));
        this.props.fetchUser();
    }

    onMessage(message) {
        if (message.data.type && message.data.type == 'access_token') {
            this.props.doLogin(message.data.token);
        }
    }

    render() {
        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                    <a className="navbar-brand mr-auto" href="#">Spotify Advanced Shuffle</a>
                    <Signout />
                </nav>
                <BrowserRouter>
                    <div className="container-fluid">
                        <Route exact path="/" component={Signin} />
                        <Route path="/app" component={requireAuth(Overview)} />
                    </div>
                </BrowserRouter>
            </div>
        );
    }
}

export default connect(null, { fetchUser, doLogin })(App);
