import { useMemo, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import useRentModal from "../../hooks/useRentModal";
import Modal from "./Modal";
import Heading from "../Heading";
import Map from "../Map";

import { categories } from "../layouts/Navbar/Categories";
import CategoryInput from "../Inputs/CategoryInput";
import CountrySelect from "../Inputs/CountrySelect";
import Counter from "../Inputs/Counter";
import ImageUpload from "../Inputs/ImageUpload";

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  PRICE = 5,
}

interface StepComponents {
  [key: string]: JSX.Element;
}

const RentModal = () => {
  const rentModal = useRentModal();

  const [step, setStep] = useState(STEPS.CATEGORY);
  const [error, setError] = useState<string | null>(null);

  const onBack = () => {
    setStep((value) => value - 1);
    setError(null); // Clear error when navigating back
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      category: "",
      location: null,
      guestCount: 1,
      roomCount: 1,
      bathroomCount: 1,
      imageSrc: "",
      price: 1,
      title: "",
      description: "",
    },
  });

  const onClose = () => {
    rentModal.onClose();
    reset();
    setStep(STEPS.CATEGORY);
    setError(null);
  };

  const category = watch("category");
  const location = watch("location");
  const guestCount = watch("guestCount");
  const roomCount = watch("roomCount");
  const bathroomCount = watch("bathroomCount");
  const imageSrc = watch("imageSrc");
  const price = watch("price");
  const title = watch("title");
  const description = watch("description");

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setError(null);
  };

  // Validation rules for each step
  const validationRules = {
    [STEPS.CATEGORY]: () => !!category,
    [STEPS.LOCATION]: () => !!location,
    [STEPS.INFO]: () => guestCount > 0 && roomCount > 0 && bathroomCount > 0,
    [STEPS.IMAGES]: () => !!imageSrc,
    [STEPS.DESCRIPTION]: () => title.length > 0 && description.length > 0,
    [STEPS.PRICE]: () => price > 0,
  };

  const validateStep = () => {
    const validate = validationRules[step];
    return validate ? validate() : true;
  };

  const stepErrorMessages = {
    [STEPS.CATEGORY]: "Please select a category.",
    [STEPS.LOCATION]: "Please choose a location.",
    [STEPS.INFO]: "Please ensure all info fields are filled correctly.",
    [STEPS.IMAGES]: "Please upload an image.",
    [STEPS.DESCRIPTION]: "Please provide a title and description.",
    [STEPS.PRICE]: "Please set a price.",
  };

  const getStepErrorMessage = (step: STEPS) => {
    return stepErrorMessages[step] || "Please complete all required fields.";
  };

  const onNext = () => {
    if (!validateStep()) {
      setError(getStepErrorMessage(step));
      return;
    }
    setStep((value) => value + 1);
    setError(null); // Clear error when navigating to the next step
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return "Create";
    }

    return "Next";
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }

    return "Back";
  }, [step]);

  const CategoryContent = () => {
    return (
      <div className="flex flex-col gap-8">
        <Heading
          title="Which of these best describes your place?"
          subTitle="Pick a category"
        />
        <div
          className="
  grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto"
        >
          {categories.map((item) => {
            return (
              <div key={item.label} className="col-span-1">
                <CategoryInput
                  onClick={(category) => {
                    setCustomValue("category", category);
                  }}
                  selected={category === item.label}
                  label={item.label}
                  icon={item.icon}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const LocationContent = () => {
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
  };

  const InfoContent = () => {
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
          value={bathroomCount}
          onChange={(value) => setCustomValue("bathroomCount", value)}
        />
      </div>
    );
  };

  const ImageContent = () => {
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
  };
  const stepComponents: StepComponents = {
    [STEPS.CATEGORY]: <CategoryContent />,
    [STEPS.LOCATION]: <LocationContent />,
    [STEPS.INFO]: <InfoContent />,
    [STEPS.IMAGES]: <ImageContent />,
  };

  const getStepComponent = (step: STEPS) => {
    return stepComponents[step];
  };

  let bodyContent = getStepComponent(step);

  return (
    <Modal
      isOpen={rentModal.isOpen}
      onClose={onClose}
      onSubmit={onNext}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      title="Airbnb your home!"
      body={bodyContent}
      {...(error ? { error: error } : {})}
    ></Modal>
  );
};

export default RentModal;
