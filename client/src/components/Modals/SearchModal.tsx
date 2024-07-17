import { useSearchParams } from "react-router-dom";
import useSearchModal from "../../hooks/useSearchModal";
import Modal from "./Modal";
import { useCallback, useMemo, useState } from "react";
import { Range } from "react-date-range";
import qs from "qs";

import Map from "../Map";
import CountrySelect, { CountrySelectValue } from "../Inputs/CountrySelect";
import { formatISO } from "date-fns";
import Heading from "../Heading";
import Calendar from "../Inputs/Calendar";
import Counter from "../Inputs/Counter";
import { getListing } from "../../apis/Listing/listing";
import ListingStore from "../../store/listingsStore";
enum STEPS {
  LOCATION = 0,
  DATE = 1,
  INFO = 2,
}
const SearchModal = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const searchModal = useSearchModal();
  const { setListings } = ListingStore();

  const [location, setLocation] = useState<CountrySelectValue>();
  const [step, setStep] = useState(STEPS.LOCATION);
  const [guestCount, setGuestCount] = useState(1);
  const [roomCount, setRoomCount] = useState(1);
  const [bathRoomCount, setBathRoomCount] = useState(1);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  console.log(searchParams);

  const onBack = useCallback(() => {
    setStep((value) => value - 1);
  }, []);

  const onNext = useCallback(() => {
    setStep((value) => value + 1);
  }, []);

  const onSubmit = useCallback(async () => {
    if (step !== STEPS.INFO) {
      return onNext();
    }

    let currentQuery = {};

    if (searchParams) {
      currentQuery = qs.parse(searchParams.toString());
    }

    const updatedQuery: any = {
      ...currentQuery,
      locationValue: location?.value,
      guestCount,
      roomCount,
      bathRoomCount,
    };

    if (dateRange.startDate) {
      updatedQuery.startDate = formatISO(dateRange.startDate);
    }

    if (dateRange.endDate) {
      updatedQuery.endDate = formatISO(dateRange.endDate);
    }

    setStep(STEPS.LOCATION);
    searchModal.onClose();
    setSearchParams(updatedQuery);
    getListing({ ...updatedQuery }).then((res) => {
      if (res.status === 200) setListings(res.data);
    });
  }, [
    step,
    searchParams,
    searchModal,
    location,
    guestCount,
    roomCount,
    bathRoomCount,
    dateRange,
    onNext,
  ]);

  const actionLabel = useMemo(() => {
    if (step === STEPS.INFO) {
      return "Search";
    }

    return "Next";
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    // here I return undeifened cuz if it undefined secondary button will disappear and this what we need here
    if (step === STEPS.LOCATION) {
      return undefined;
    }

    return "Back";
  }, []);

  const DateContent = useMemo(
    () => (
      <div className="flex flex-col gap-8">
        <Heading
          title="When do you plan to go?"
          subTitle="Make sure everyone is free!"
        />
        <Calendar
          value={dateRange}
          onChange={(value) => setDateRange(value.selection)}
        />
      </div>
    ),
    [dateRange]
  );

  const LocationContent = useMemo(
    () => (
      <div className="flex flex-col gap-8">
        <Heading
          title="where do you wanna go?"
          subTitle="Find the perfect location!"
        />
        <CountrySelect
          value={location}
          onChange={(value) => setLocation(value as CountrySelectValue)}
        />
        <hr />
        <Map center={location?.latlng} />
      </div>
    ),
    [location, setLocation]
  );

  const InfoContent = useMemo(
    () => (
      <div className="flex flex-col gap-8">
        <Heading
          title="Share some basics about your place"
          subTitle="What amenities do you have?"
        />
        <Counter
          title="Guests"
          subtitle="How many guests do you allow?"
          value={guestCount}
          onChange={(value) => setGuestCount(value)}
        />
        <hr />
        <Counter
          title="Rooms"
          subtitle="How many Rooms do you have?"
          value={roomCount}
          onChange={(value) => setRoomCount(value)}
        />
        <hr />
        <Counter
          title="Bathrooms"
          subtitle="How many Bathrooms do you have?"
          value={bathRoomCount}
          onChange={(value) => setBathRoomCount(value)}
        />
      </div>
    ),
    [guestCount, roomCount, bathRoomCount]
  );

  const stepComponents = useMemo(
    () => ({
      [STEPS.LOCATION]: LocationContent,
      [STEPS.INFO]: InfoContent,
      [STEPS.DATE]: DateContent,
    }),
    [LocationContent, DateContent, InfoContent]
  );

  const getStepComponent = useCallback(
    (step: STEPS) => {
      return stepComponents[step];
    },
    [stepComponents]
  );

  const bodyContent = getStepComponent(step);

  return (
    <Modal
      isOpen={searchModal.isOpen}
      onClose={searchModal.onClose}
      onSubmit={onSubmit}
      title="Filters"
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.LOCATION ? undefined : onBack}
      body={bodyContent}
    />
  );
};

export default SearchModal;
