import './OrientationLock.css';

/**
 * Pure CSS orientation lock.
 * Uses CSS media queries to rotate content when in portrait.
 * No JavaScript needed - browser handles everything.
 */
const OrientationLock = ({ children }) => {
  return (
    <div className="orientation-lock-wrapper">
      {children}
    </div>
  );
};

export default OrientationLock;
