import React, { useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";

const PhotosUploader = ({
  addedPhotos,
  setAddedPhotos,
  uploadPhotoHandler,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const removePhotoHandler = (ev, filename) => {
    ev.preventDefault();
    setAddedPhotos([...addedPhotos.filter((photo) => photo !== filename)]);
  };

  const selectAsMainPhotoHandler = (ev, filename) => {
    ev.preventDefault();
    const addedPhotoWithoutFilename = addedPhotos.filter(
      (photo) => photo !== filename
    );
    const newAddedPhotos = [filename, ...addedPhotoWithoutFilename];
    setAddedPhotos(newAddedPhotos);
  };

  const handleFileInputChange = async (e) => {
    setIsUploading(true);
    await uploadPhotoHandler(e);
    setIsUploading(false);
  };

  return (
    <>
      <div className="mt-2 grid gap-2 grid-cols-3 lg:grid-cols-6 md:grid-cols-4">
        {addedPhotos.length > 0 &&
          addedPhotos.map((link, index) => {
            return (
              <div key={index} className="h-32 flex relative">
                <img
                  loading="lazy"
                  className="rounded-2xl w-full object-cover aspect-square"
                  src={link} // Use Firebase Storage URL here
                  alt=""
                />
                <button
                  onClick={(ev) => removePhotoHandler(ev, link)}
                  className="absolute bottom-1 right-1 text-white cursor-pointer bg-black bg-opacity-50 rounded-2xl p-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
                <button
                  onClick={(ev) => selectAsMainPhotoHandler(ev, link)}
                  className="absolute bottom-1 left-1 text-white cursor-pointer bg-black bg-opacity-50 rounded-2xl p-2"
                >
                  {link === addedPhotos[0] && <AiFillStar />}
                  {link !== addedPhotos[0] && <AiOutlineStar />}
                </button>
              </div>
            );
          })}
        <label className="cursor-pointer h-32 flex items-center justify-center gap-1 border bg-transparent rounded-2xl p-2 text-2xl text-gray-600">
          {isUploading ? (
            <div className="spinner-border text-primary" role="status">
              <h1 className="text-3xl text-red-900">Loading...</h1>
            </div>
          ) : (
            <>
              <input
                multiple
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <AiOutlineCloudUpload className="w-8 h-8" />
              Upload
            </>
          )}
        </label>
      </div>
    </>
  );
};

export default PhotosUploader;
