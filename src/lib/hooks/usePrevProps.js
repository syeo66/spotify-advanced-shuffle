import { useRef, useEffect } from 'react';

export const usePrevProps = props => {
  const prevProps = useRef();
  const returnProps = prevProps.current;

  useEffect(() => {
    prevProps.current = props;
  });

  return returnProps;
}
