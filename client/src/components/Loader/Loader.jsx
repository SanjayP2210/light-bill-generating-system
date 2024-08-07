/* eslint-disable react/prop-types */
import "./Loader.css";

const Loader = ({ style, visible }) => {
  return (
    <>
      {visible && (
        <>
          <div className="spinner-div" style={style}>
            <div className="loader"></div>
            <div className="loader2"></div>
            <div className="loader3"></div>
          </div>
        </>
      )}
    </>
  );
};

export default Loader;
