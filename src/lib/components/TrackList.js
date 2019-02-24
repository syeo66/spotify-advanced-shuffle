import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  loadLibraryFromDb,
  firstPage,
  nextPage,
  previousPage,
} from '../actions';

class TrackList extends Component {
  componentDidMount() {
    this.props.firstPage();
  }

  componentDidUpdate(prevState) {
    if(prevState.loadQueue != this.props.loadQueue
      || prevState.currentPage != this.props.currentPage) {
      this.props.loadLibraryFromDb(this.props.currentPage * this.props.itemsPerPage, this.props.itemsPerPage);
    }
  }

  render() {
    const librarySize = this.props.loadQueue.reduce((acc, queue) => acc + queue.size, 0);
    const perPage = this.props.itemsPerPage;
    const currentPage = this.props.currentPage;
    const maxPage = Math.ceil((this.props.dbSize | librarySize) / perPage);
    const listItemWindow = this.props.library ? this.props.library : [];
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
    const text = !this.props.library.length ? (
        <div className="mt-2 text-muted"><i className="fas fa-sync fa-spin fa-3x"></i></div>
    ) : "";

    return (
        <div>
            {pagination}
            {listItems}
            {text}
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
    current: state.data.current ? state.data.current : 0,
    librarySize: state.data.librarySize ? state.data.librarySize : 0,
    currentPage: state.data.currentPage ? state.data.currentPage : 1,
    itemsPerPage: state.data.itemsPerPage ? state.data.itemsPerPage : 20,
    loadQueue: state.data.loadQueue ? state.data.loadQueue : [],
    dbSize: state.data.dbSize ? state.data.dbSize : 0,
  }
}

export default connect(mapStateToProps, {
  loadLibraryFromDb,
  firstPage,
  nextPage,
  previousPage,
})(TrackList);
