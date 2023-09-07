import React, { useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { HiOutlineTrash } from "react-icons/hi";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";
// import { storage } from "./firebase"; // Import Firebase storage

const PhotosUploader = ({
  photoLink,
  addPhotoByLink,
  addedPhotos,
  setAddedPhotos,
  setPhotoLink,
  uploadPhotoHandler,
}) => {
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

  // Modify the uploadPhotoHandler function to upload images to Firebase Storage

  // we have problem here will resolve when comeback from sheikh nada in shaa allah

  return (
    <>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={"Add using a link ...jpg"}
          value={photoLink}
          onChange={(e) => setPhotoLink(e.target.value)}
        />
        <button
          className="bg-gray-200 px-4 rounded-2xl"
          onClick={addPhotoByLink}
        >
          Add&nbsp;photo
        </button>
      </div>

      <div className="mt-2 grid gap-2 grid-cols-3 lg:grid-cols-6 md:grid-cols-4">
        {addedPhotos.length > 0 &&
          addedPhotos.map((link, index) => {
            return (
              <div key={index} className="h-32 flex relative">
                <img
                  className="rounded-2xl w-full object-cover"
                  src={link} // Use Firebase Storage URL here
                  alt=""
                />
                <button
                  onClick={(ev) => removePhotoHandler(ev, link)}
                  className="absolute bottom-1 right-1 text-white cursor-pointer bg-black bg-opacity-50 rounded-2xl p-2"
                >
                  <HiOutlineTrash />
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
          <input
            multiple
            type="file"
            className="hidden"
            onChange={uploadPhotoHandler}
            onSubmit={() => {
              console.log("HI");
            }}
          />
          <AiOutlineCloudUpload className="w-8 h-8" />
          Upload
        </label>
      </div>
    </>
  );
};

export default PhotosUploader;
