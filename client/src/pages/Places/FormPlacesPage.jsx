import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";

import { PhotosUploader, Perks } from "../../components";

import {
  UploadRoute,
  UploadByLink,
  addPlaceRoute,
  GetUserPlacesRoute,
} from "../../utils/Routes";

import axios from "axios";

const FormPlacesPage = () => {
  const { id } = useParams();

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
  const [price, setPrice] = useState(100);
  const [redirectToPlacesList, setRedirectToPlacesList] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    axios
      .get(`${GetUserPlacesRoute}/${id}`, { withCredentials: true })
      .then((res) => {
        const { data } = res;
        setTitle(data.title);
        setAddress(data.address);
        setAddedPhotos(data.photos);
        setPhotoLink(data.photoLink);
        setDescription(data.description);
        setPerks(data.perks);
        setExtraInfo(data.extraInfo);
        setCheckIn(data.checkIn);
        setCheckOut(data.checkOut);
        setMaxGuests(data.maxGuests);
        setPrice(data.price);
      })
      .catch((error) => {
        console.error("Error fetching place:", error);
      });
  }, [id]);

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

  const addPhotoByLink = async (e) => {
    e.preventDefault();
    const { data } = await axios.post(UploadByLink, {
      link: photoLink,
    });

    setAddedPhotos((prev) => {
      console.log(data.filename);
      return [...prev, data.filename];
    });
    // setPhotoLink("");
  };

  const uploadPhotoHandler = async (ev) => {
    try {
      const files = ev.target.files;
      const data = new FormData();

      // Append each file to the FormData
      Array.from(files).forEach((file) => {
        data.append("photos", file);
      });

      const response = await axios.post(UploadRoute, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { data: uploadedFile } = response;

      // Construct image URLs for each uploaded file
      const imageUrls = uploadedFile.map((file) => {
        return `${file.filename}`;
      });

      setAddedPhotos((prev) => [...prev, ...imageUrls]);
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  const savePlaceHandler = async (ev) => {
    ev.preventDefault();

    const placeData = {
      title,
      address,
      photos: addedPhotos,
      photoLink,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    };
    try {
      if (id) {
        // update

        await axios.put(
          `${addPlaceRoute}/${id}`,
          { id, ...placeData },
          {
            withCredentials: true,
          }
        );
        setRedirectToPlacesList(true);
      } else {
        // new place
        console.log(`Hello ${placeData.photos}`);
        await axios.post(addPlaceRoute, placeData, { withCredentials: true });

        setRedirectToPlacesList(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (redirectToPlacesList) {
    return <Navigate to={"/account/places"} />;
  }

  return (
    <div>
      <form action="" onSubmit={savePlaceHandler}>
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
        <PhotosUploader
          addPhotoByLink={addPhotoByLink}
          photoLink={photoLink}
          setPhotoLink={setPhotoLink}
          addedPhotos={addedPhotos}
          setAddedPhotos={setAddedPhotos}
          uploadPhotoHandler={uploadPhotoHandler}
        />
        {preInput("Description", "description of that place")}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {preInput("Select all the perks of your place")}

        <div className="mt-2 grid grid-cols-2  md:grid-cols-4 lg:grid-cols-6 gap-2">
          <Perks selected={perks} onChange={setPerks} />
        </div>
        {preInput("Extra in&out times", "house rule, etc")}

        <textarea
          value={extraInfo}
          onChange={(e) => setExtraInfo(e.target.value)}
        />
        <h2 className="text-2xl mt-4">Check in&out times, size , max guests</h2>
        <p className="text-gray-500 text-sm">
          add check in and out times , remember to have some time window for
          cleaning the room between guests
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
          <div>
            <h3 className="mt-2 -mb-1">Price</h3>
            <input
              type="text"
              value={price}
              placeholder="2"
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
        <button className="primary my-4">Save</button>
      </form>
    </div>
  );
};

export default FormPlacesPage;
