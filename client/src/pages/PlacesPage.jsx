import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Perks } from "../components";

import { AiOutlinePlus, AiOutlineCloudUpload } from "react-icons/ai";
import { UploadByLink } from "../utils/Routes";
import axios from "axios";

const PlacesPage = () => {
  const { action } = useParams();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [photoLink, setPhotoLink] = useState("");
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);

  const inputHeader = (text) => {
    return <h2 className="text-2xl mt-4">{text}</h2>;
  };

  const inputDescription = (text) => {
    return <p className="text-gray-500 text-sm">{text}</p>;
  };

  const preInput = (header, description) => {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  };

  const addPhotoLink = async (e) => {
    e.preventDefault();
    const { data } = await axios.post(UploadByLink, {
      link: photoLink,
    });
    console.log(data.fileName);
    setAddedPhotos((prev) => {
      return [...prev, data.filename];
    });
    // setPhotoLink("");
  };

  return (
    <div>
      {action !== "new" && (
        <div className="text-center">
          <Link
            className="inline-flex gap-1 items-center bg-primary py-2 px-6 rounded-full text-white"
            to={"/account/places/new"}
          >
            <AiOutlinePlus /> Add new place
          </Link>
        </div>
      )}
      {action == "new" && (
        <div>
          <form action="">
            {preInput(
              "Title",
              "title/heading for your place. should be short and catchy as in advertisment"
            )}
            <input
              type="text"
              placeholder="title, for example: My lovely apt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {preInput("Address", "Address to this place")}
            <input
              type="text"
              placeholder="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {preInput("Photos", "more = better")}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={"Add using a link ...jpg"}
                value={photoLink}
                onChange={(e) => setPhotoLink(e.target.value)}
              />
              <button
                className="bg-gray-200 px-4 rounded-2xl"
                onClick={addPhotoLink}
              >
                Add&nbsp;photo
              </button>
            </div>
            <div className="mt-2 grid gap-2 grid-cols-3 lg:grid-cols-6 md:grid-cols-4">
              {addedPhotos.length > 0 &&
                addedPhotos.map((link, index) => {
                  return (
                    <div key={index}>
                      {/* {link} */}
                      <img
                        className="rounded-2xl"
                        src={`http://localhost:3000/uploads/${link}`}
                        alt=""
                      />
                    </div>
                  );
                })}
              {console.log(addedPhotos)}
              <label className="cursor-pointer flex items-center justify-center gap-1 border bg-transparent rounded-2xl p-2 text-2xl text-gray-600">
                <input type="file" className="hidden" />
                <AiOutlineCloudUpload className="w-8 h-8" />
                Upload
              </label>
            </div>
            {preInput("Description", "description of that place")}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <h2 className="text-2xl mt-4">Perks</h2>
            <p className="text-gray-500 text-sm">
              Select all the perks of your place
            </p>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <Perks selected={perks} onChange={setPerks} />
            </div>
            <h2 className="text-2xl mt-4">Extra info</h2>
            <p className="text-gray-500 text-sm">house rule, etc</p>
            <textarea
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
            />
            <h2 className="text-2xl mt-4">
              Check in&out times, size , max guests
            </h2>
            <p className="text-gray-500 text-sm">
              add check in and out times , remember to have some time window for
              cleaning the room between guests
            </p>

            <div className="grid sm:grid-cols-3 gap-2">
              <div>
                <h3 className="mt-2 -mb-1">Check in time</h3>
                <input
                  type="text"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  placeholder="14"
                />
              </div>
              <div>
                <h3 className="mt-2 -mb-1">Check out time</h3>
                <input
                  type="text"
                  value={checkOut}
                  placeholder="11"
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <div>
                <h3 className="mt-2 -mb-1">Max number of guests</h3>
                <input
                  type="text"
                  value={maxGuests}
                  placeholder="2"
                  onChange={(e) => setMaxGuests(e.target.value)}
                />
              </div>
            </div>
            <button className="primary my-4">Save</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlacesPage;
