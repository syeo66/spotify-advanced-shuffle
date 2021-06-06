import React from 'react';

import Loading from './Loading';

const Fallback = () => (
  <div className="p-1 px-2 rounded m-1 text-muted border" style={{ background: '#ddd' }}>
    <Loading />
  </div>
);

export default Fallback;
