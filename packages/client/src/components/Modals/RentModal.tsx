import { useState, useCallback } from "react";
import { useForm, FieldValues } from "react-hook-form";
import useRentModal from "../../hooks/useRentModal";
import Modal from "./Modal";
import Heading from "../Heading";
import Map from "../Map";
import { categories } from "../layouts/Navbar/Categories";
import CategoryInput from "../Inputs/CategoryInput";
import CountrySelect, { CountrySelectValue } from "../Inputs/CountrySelect";
import Counter from "../Inputs/Counter";
import ImageUpload from "../Inputs/ImageUpload";
import Input from "../Inputs/Input";
import toast from "react-hot-toast";
import { ListingRequestBody } from "../../apis/Listing/listing.types";
import { createListing } from "../../apis/Listing/listing";

enum STEPS {
  CATEGORY,
  LOCATION,
  INFO,
  IMAGES,
  DESCRIPTION,
  PRICE,
}

const RentModal = () => {
  const rentModal = useRentModal();
  const [step, setStep] = useState<STEPS>(STEPS.CATEGORY);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Partial<ListingRequestBody>>({
    defaultValues: {
      title: "",
      description: "",
      imageSrc: "",
      category: "",
      roomCount: 0,
      bathRoomCount: 0,
      guestCount: 0,
      price: 0,
      location: {} as CountrySelectValue,
      reviews: [],
      bookings: [],
    },
  });

  // Retrieve form values using watch
  const category = watch("category") || "";
  const location = watch("location") as CountrySelectValue;
  const guestCount = watch("guestCount") || 1;
  const roomCount = watch("roomCount") || 1;
  const bathRoomCount = watch("bathRoomCount") || 1;
  const imageSrc = watch("imageSrc") || "";
  const price = watch("price") || 1;
  const title = watch("title") || "";
  const description = watch("description") || "";

  // Helper to update a value and clear error
  const setCustomValue = (id: keyof ListingRequestBody, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setError(null);
  };

  // Step validation using a switch statement
  const validateStep = () => {
    switch (step) {
      case STEPS.CATEGORY:
        return Boolean(category);
      case STEPS.LOCATION:
        return Boolean(location);
      case STEPS.INFO:
        return guestCount > 0 && roomCount > 0 && bathRoomCount > 0;
      case STEPS.IMAGES:
        return Boolean(imageSrc);
      case STEPS.DESCRIPTION:
        return title.trim() !== "" && description.trim() !== "";
      case STEPS.PRICE:
        return price > 0;
      default:
        return true;
    }
  };

  // Error messages for each step
  const stepErrorMessages: { [key in STEPS]: string } = {
    [STEPS.CATEGORY]: "Please select a category.",
    [STEPS.LOCATION]: "Please choose a location.",
    [STEPS.INFO]: "Please ensure all info fields are filled correctly.",
    [STEPS.IMAGES]: "Please upload an image.",
    [STEPS.DESCRIPTION]: "Please provide a title and description.",
    [STEPS.PRICE]: "Please set a price.",
  };

  // Handle form submission for the final step
  const handleSubmitForm = async (data: FieldValues) => {
    // Client-side bounds validation
    if (!data.price || data.price < 1) {
      toast.error("Price must be at least $1.");
      return;
    }
    if (!data.roomCount || data.roomCount < 1) {
      toast.error("Room count must be at least 1.");
      return;
    }
    if (!data.bathRoomCount || data.bathRoomCount < 1) {
      toast.error("Bathroom count must be at least 1.");
      return;
    }
    if (!data.guestCount || data.guestCount < 1) {
      toast.error("Guest count must be at least 1.");
      return;
    }

    setIsLoading(true);

    const listingData: ListingRequestBody = {
      category: data.category,
      location: data.location,
      guestCount: data.guestCount,
      roomCount: data.roomCount,
      bathRoomCount: data.bathRoomCount,
      imageSrc: data.imageSrc,
      price: data.price,
      title: data.title,
      description: data.description,
    };

    try {
      const res = await createListing(listingData);
      if (res.status === 200 || res.status === 201) {
        toast.success("Listing created successfully!");
        onClose();
      }
    } catch (err) {
      toast.error("Failed to create listing. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to next step or submit form if on final step
  const onNext = async (data: FieldValues) => {
    if (!validateStep()) {
      setError(stepErrorMessages[step]);
      return;
    }
    if (step === STEPS.PRICE) {
      await handleSubmitForm(data);
    } else {
      setStep((prev) => prev + 1);
      setError(null);
    }
  };

  // Navigate back a step
  const onBack = () => {
    setStep((prev) => prev - 1);
    setError(null);
  };

  // Reset form and state on modal close
  const onClose = useCallback(() => {
    rentModal.onClose();
    reset();
    setStep(STEPS.CATEGORY);
    setError(null);
  }, [rentModal, reset]);

  const actionLabel = step === STEPS.PRICE ? "Create" : "Next";
  const secondaryActionLabel = step === STEPS.CATEGORY ? undefined : "Back";

  // Render step-specific content
  const renderStepContent = () => {
    switch (step) {
      case STEPS.CATEGORY:
        return (
          <div className="flex flex-col gap-8">
            <Heading
              title="Which of these best describes your place?"
              subTitle="Pick a category"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
              {categories.map((item) => (
                <div key={item.label}>
                  <CategoryInput
                    onClick={() => setCustomValue("category", item.label)}
                    selected={category === item.label}
                    label={item.label}
                    icon={item.icon}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      case STEPS.LOCATION:
        return (
          <div className="flex flex-col gap-8">
            <Heading
              title="Where is your place located?"
              subTitle="Help guests find you!"
            />
            <CountrySelect
              value={location}
              onChange={(value) => setCustomValue("location", value)}
            />
            <Map center={location?.latlng || [26.8206, 30.8025]} />
          </div>
        );
      case STEPS.INFO:
        return (
          <div className="flex flex-col gap-8">
            <Heading
              title="Share some basics about your place"
              subTitle="What amenities do you have?"
            />
            <Counter
              title="Guests"
              subtitle="How many guests do you allow?"
              value={guestCount}
              onChange={(value) => setCustomValue("guestCount", value)}
            />
            <hr />
            <Counter
              title="Rooms"
              subtitle="How many Rooms do you have?"
              value={roomCount}
              onChange={(value) => setCustomValue("roomCount", value)}
            />
            <hr />
            <Counter
              title="Bathrooms"
              subtitle="How many Bathrooms do you have?"
              value={bathRoomCount}
              onChange={(value) => setCustomValue("bathRoomCount", value)}
            />
          </div>
        );
      case STEPS.IMAGES:
        return (
          <div className="flex flex-col gap-8">
            <Heading
              title="Add a photo of your place"
              subTitle="Show guests what your place looks like"
            />
            <ImageUpload
              value={imageSrc}
              onChange={(value: string) => setCustomValue("imageSrc", value)}
            />
          </div>
        );
      case STEPS.DESCRIPTION:
        return (
          <div className="flex flex-col gap-8">
            <Heading
              title="How would you describe your place?"
              subTitle="Short and sweet works best!"
            />
            <Input
              id="title"
              label="Title"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
            <hr />
            <Input
              id="description"
              label="Description"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
          </div>
        );
      case STEPS.PRICE:
        return (
          <div className="flex flex-col gap-8">
            <Heading
              title="Now, set your price"
              subTitle="How much do you charge per night?"
            />
            <Input
              id="price"
              label="Price"
              formatPrice
              type="number"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
          </div>
        );
      default:
        return <></>;
    }
  };

    return (
      <Modal
        isOpen={rentModal.isOpen}
        onClose={onClose}
        onSubmit={handleSubmit(onNext)}
        actionLabel={actionLabel}
        secondaryActionLabel={secondaryActionLabel}
        secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
        title="Airbnb your home!"
        body={renderStepContent()}
        {...(error ? { error } : {})}
      />
    );

  
};

export default RentModal;
