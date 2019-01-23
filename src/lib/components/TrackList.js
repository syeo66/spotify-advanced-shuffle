import React, { Component } from 'react';
import { connect } from 'react-redux';
import { importDb, retrieveLibrary, nextPage, previousPage } from '../actions';
import db from '../database';

class TrackList extends Component {
    componentDidMount() {
        if (db.isOpen) {
            this.initDb();
            return;
        }
        db.on('ready', this.initDb.bind(this));
    }

    initDb() {
        this.props.importDb();
        this.props.retrieveLibrary(this.props.authenticated);
    }

    render() {
        const perPage = this.props.itemsPerPage;
        const currentPage = this.props.currentPage;
        const maxPage = Math.ceil(this.props.library.length / perPage);
        const listItemWindow = this.props.library
            .sort((a,b) => {return a.name.toUpperCase()<b.name.toUpperCase() ? -1 : 1})
            .slice((currentPage-1)*perPage, currentPage*perPage);
        const listItems = listItemWindow.map(entry => 
            <div className="row mt-1" key={entry.id}>
                <div className="col-md-2 xol-sm-3 col-4 pr-0">
                    <img src={entry.image} className="img-thumbnail img-fluid" />
                </div>
                <div className="col pl-2">
                    <strong>{entry.name}</strong><br />
                    {entry.artist} - {entry.album}
                </div>
            </div>
        );

        const previous = currentPage > 1 ? (
            <li className="page-item"><a className="page-link" onClick={this.props.previousPage}><i className="fas fa-arrow-left" /></a></li>
        ) : '';
        const next = currentPage < maxPage ? (
            <li className="page-item"><a className="page-link" onClick={this.props.nextPage}><i className="fas fa-arrow-right" /></a></li>
        ) : '';
        const pagination = (
            <nav aria-label="Page navigation example">
                <ul className="pagination">
                    {previous}
                    <li className="page-item"><a className="page-link">{currentPage}/{maxPage}</a></li>
                    {next}
                </ul>
            </nav>
        );

        return (
            <div>
                {pagination}
                {listItems}
                <div className="mt-3">
                    {pagination}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        authenticated: state.auth,
        library: state.data.library ? state.data.library : [],
        librarySize: state.data.librarySize ? state.data.librarySize : 0,
        currentPage: state.data.currentPage ? state.data.currentPage : 1,
        itemsPerPage: state.data.itemsPerPage ? state.data.itemsPerPage : 20,
    }
}

export default connect(mapStateToProps, { importDb, retrieveLibrary, nextPage, previousPage })(TrackList);