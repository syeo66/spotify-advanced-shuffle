import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

export default (ComposedComponent) => {
    class Authentication extends PureComponent {
        static contextTypes = {
            router: PropTypes.object
        }

        componentWillMount() {
            if (!this.props.authenticated) {
                this.context.router.history.push('/');
            }
        }

        componentDidUpdate() {
            if (!this.props.authenticated) {
                this.context.router.history.push('/');
            }
        }

        render() {
          if (this.props.authenticated) {
            return <ComposedComponent {...this.props} />;
          }
          return null;
        }
    }

    const mapStateToProps = ({auth}) => {
        return { authenticated: auth };
    }

    return connect(mapStateToProps)(Authentication);
}
