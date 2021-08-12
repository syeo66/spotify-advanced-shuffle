import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { loadLibraryFromDb, firstPage, nextPage, previousPage } from '../actions';

const TrackList = (props) => {
  const { firstPage, currentPage, itemsPerPage, loadLibraryFromDb } = props;

  useEffect(() => {
    firstPage();
  }, [firstPage]);

  useEffect(() => {
    loadLibraryFromDb(currentPage * itemsPerPage, itemsPerPage);
  }, [currentPage, itemsPerPage, loadLibraryFromDb]);

  const librarySize = props.loadQueue.reduce((acc, queue) => acc + queue.size, 0);
  const perPage = props.itemsPerPage;
  const maxPage = Math.ceil((props.dbSize || librarySize) / perPage);
  const listItemWindow = props.library ? props.library : [];
  const listItems = listItemWindow.map((entry) => (
    <div className="row mt-1" key={entry.id}>
      <div className="col-md-2 xol-sm-3 col-4 pr-0">
        <img src={entry.image} className="img-thumbnail img-fluid" />
      </div>
      <div className="col pl-2">
        <strong>{entry.name}</strong>
        <br />
        {entry.artist} - {entry.album}
      </div>
    </div>
  ));

  const previous =
    currentPage > 1 ? (
      <li className="page-item" style={{ cursor: 'pointer' }}>
        <a className="page-link" onClick={props.previousPage}>
          <i className="fas fa-arrow-left" />
        </a>
      </li>
    ) : (
      ''
    );
  const next =
    currentPage < maxPage ? (
      <li className="page-item" style={{ cursor: 'pointer' }}>
        <a className="page-link" onClick={props.nextPage}>
          <i className="fas fa-arrow-right" />
        </a>
      </li>
    ) : (
      ''
    );
  const pagination = (
    <nav aria-label="Page navigation example">
      <ul className="pagination">
        {previous}
        <li className="page-item">
          <a className="page-link">
            {currentPage}/{maxPage}
          </a>
        </li>
        {next}
      </ul>
    </nav>
  );
  const text = !props.library.length ? (
    <div className="mt-2 text-muted">
      <i className="fas fa-sync fa-spin fa-3x" />
    </div>
  ) : (
    ''
  );

  return (
    <div>
      {pagination}
      {listItems}
      {text}
      <div className="mt-3">{pagination}</div>
    </div>
  );
};

TrackList.propTypes = {
  firstPage: PropTypes.func.isRequired,
  loadLibraryFromDb: PropTypes.func.isRequired,
  previousPage: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
  loadQueue: PropTypes.array.isRequired,
  dbSize: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  library: PropTypes.array.isRequired,
};

function mapStateToProps({ data }) {
  return {
    library: data.library ? data.library : [],
    currentPage: data.currentPage ? data.currentPage : 1,
    itemsPerPage: data.itemsPerPage ? data.itemsPerPage : 20,
    loadQueue: data.loadQueue ? data.loadQueue : [],
    dbSize: data.dbSize ? data.dbSize : 0,
  };
}

export default connect(mapStateToProps, {
  loadLibraryFromDb,
  firstPage,
  nextPage,
  previousPage,
})(TrackList);
