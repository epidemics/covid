import * as React from "react";
import * as ReactModal from "react-modal";

type Props = {
  isOpen: boolean;
  onCloseRequest: () => any;
};

const Modal: React.FC<Props> = ({ isOpen, onCloseRequest, children }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onCloseRequest}
      className="custom-modal"
      overlayClassName="custom-modal-overlay"
      ariaHideApp={false}
    >
      <button
        type="button"
        className="close"
        data-dismiss="modal"
        aria-label="Close"
        onClick={onCloseRequest}
      >
        <span aria-hidden="true">×</span>
      </button>
      <div className="custom-modal-inner">{children}</div>
    </ReactModal>
  );
};

export default Modal;
