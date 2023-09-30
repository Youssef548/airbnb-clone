import React, { useContext, useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";

import { PhotosUploader, Perks } from "../../components";

import { addPlaceRoute, GetUserPlacesRoute } from "../../utils/Routes";

import { storage } from "../../firebaseConfig/firebase.js"; // Import Firebase storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import makeReq from "../../libs/axiosInstance";
import { UserContext } from "../../store/UserContext";
const FormPlacesPage = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);

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

  const [titleError, setTitleError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    makeReq
      .get(`${GetUserPlacesRoute}/${id}`)
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
  }, [id, user]);

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

  const validateAndSanitizeImageUrl = (link) => {
    // Regular expression to match valid image file extensions
    const validExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;

    // Remove leading and trailing whitespaces from the URL
    link = link.trim();

    // Check if the URL matches a valid image file extension
    if (!validExtensions.test(link)) {
      throw new Error(
        "Invalid image URL. Please provide a URL with a valid image extension."
      );
    }

    return link;
  };

  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        let width = image.width;
        let height = image.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }

          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(image, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type || "image/jpeg",
          0.9
        );
      };

      image.onerror = (error) => {
        reject(error);
      };

      image.src = URL.createObjectURL(file);
    });
  };

  const uploadPhotoHandler = async (e) => {
    const files = e.target.files;
    const uploadedImageUrls = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const imageUpload = files[i];
        const resizedImageBlob = await resizeImage(imageUpload, 800, 600); // Adjust maxWidth and maxHeight as needed
        const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
        await uploadBytes(imageRef, resizedImageBlob);
        const imageUrl = await getDownloadURL(imageRef);
        uploadedImageUrls.push(imageUrl);
      }

      setAddedPhotos((prev) => [...prev, ...uploadedImageUrls]);
      alert("IMAGES UPLOADED SUCCESSFULLY");
      // Handle success, e.g., update state with the image URLs.
    } catch (error) {
      console.error("Error uploading images:", error);
      // Handle error, e.g., display an error message.
    }
  };

  const savePlaceHandler = async (ev) => {
    ev.preventDefault();

    // Clear previous error messages
    setTitleError("");
    setAddressError("");
    setDescriptionError("");
    setPriceError("");

    // Validate input fields
    let isValid = true;

    if (!title.trim()) {
      setTitleError("Title is required");
      isValid = false;
    }

    if (!address.trim()) {
      setAddressError("Address is required");
      isValid = false;
    }

    if (!description.trim()) {
      setDescriptionError("Description is required");
      isValid = false;
    }

    if (!price || isNaN(price)) {
      setPriceError("Price must be a valid number");
      isValid = false;
    }

    if (!isValid) {
      return; // Prevent form submission if validation fails
    }

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

        await makeReq.put(`${addPlaceRoute}/${id}`, { id, ...placeData });
        setRedirectToPlacesList(true);
      } else {
        // new place

        await makeReq.post(addPlaceRoute, placeData);

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
    <div className="px-4">
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
        <span className="text-red-500">{titleError}</span>
        {preInput("Address", "Address to this place")}
        <input
          type="text"
          placeholder="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />{" "}
        <span className="text-red-500">{addressError}</span>
        {preInput("Photos", "more = better")}
        <PhotosUploader
          addedPhotos={addedPhotos}
          setAddedPhotos={setAddedPhotos}
          uploadPhotoHandler={uploadPhotoHandler}
        />
        {preInput("Description", "description of that place")}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />{" "}
        <span className="text-red-500">{descriptionError}</span>
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
            <span className="text-red-500">{priceError}</span>
          </div>
        </div>
        <button className="primary my-4">Save</button>
      </form>
    </div>
  );
};

export default FormPlacesPage;
