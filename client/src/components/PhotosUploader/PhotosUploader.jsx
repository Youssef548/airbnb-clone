import React from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";

const PhotosUploader = ({
  photoLink,
  addPhotoByLink,
  addedPhotos,
  setPhotoLink,
  uploadPhotoHandler,
}) => {
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
              <div key={index} className="h-32 flex">
                {/* {link} */}
                <img
                  className="rounded-2xl w-full object-cover"
                  src={`http://localhost:3000/uploads/${link}`}
                  alt=""
                />
              </div>
            );
          })}
        <label className="cursor-pointer h-32 flex items-center justify-center gap-1 border bg-transparent rounded-2xl p-2 text-2xl text-gray-600">
          <input
            multiple
            type="file"
            className="hidden"
            onChange={uploadPhotoHandler}
          />
          <AiOutlineCloudUpload className="w-8 h-8" />
          Upload
        </label>
      </div>
    </>
  );
};

export default PhotosUploader;
