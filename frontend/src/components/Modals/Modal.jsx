import React, { useCallback, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import Button from "../Button/Button";
import ReactDOM from "react-dom";

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  body,
  actionLabel,
  footer,
  disabled,
  secondaryAction,
  secondaryActionLabel,
}) => {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (disabled) return;
    setShowModal(false);
    setTimeout(() => onClose(), 300);
  }, [onClose, disabled]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    onSubmit();
  }, [disabled, onSubmit]);

  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) return;
    secondaryAction();
  }, [disabled, secondaryAction]);

  if (!isOpen) return null;
  const overlayRootPortal = document.getElementById("overlay");

  return (
    <>
      {ReactDOM.createPortal(
        <div className="flex justify-center items-center  overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-neutral-800/70">
          <div className="relative w-full md:w-4/6 lg:w-3/6 xl:w-2/5 my-6 mx-auto h-full lg:h-auto md:h-auto">
            <div
              className={`translate duration-300 h-full ${
                showModal ? "translate-y-0" : "translate-y-full"
              } ${showModal ? "opacity-100" : "opacity-0"}`}
            >
              <div className="translate h-full lg:h-auto md:h-auto border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-center p-6 rounded-t justify-center relative border-b-[1px]">
                  <button
                    className="bg-white rounded-full hover:opacity-70 transition absolute left-9"
                    onClick={handleClose}
                  >
                    <AiOutlineClose size={18} className="" />
                  </button>

                  <div className="text-lg font-semibold">{title}</div>
                </div>
                <div className="relative p-6 flex-auto">{body}</div>
                <div className="flex flex-col gap-2 p-6">
                  <div className="flex flex-row items-center gap-4 w-full">
                    {secondaryAction && secondaryActionLabel && (
                      <Button
                        disabled={disabled}
                        label={secondaryActionLabel}
                        onClick={handleSecondaryAction}
                        outline
                      />
                    )}
                    <Button
                      disabled={disabled}
                      label={actionLabel}
                      onClick={handleSubmit}
                    />
                  </div>
                  {footer}
                </div>
              </div>
            </div>
          </div>
        </div>,
        overlayRootPortal
      )}
    </>
  );
};

export default Modal;
