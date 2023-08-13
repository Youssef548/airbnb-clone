import React from "react";

import { AiOutlineWifi } from "react-icons/ai";
import { BsTruck } from "react-icons/bs";
import { PiMonitor } from "react-icons/pi";
import { FaCat } from "react-icons/fa";
import { HiOutlineArrowLeftOnRectangle } from "react-icons/hi2";

const perks = ({ selected, onChange }) => {
  const checkBoxHandler = (ev) => {
    const { checked, name } = ev.target;

    if (checked) {
      onChange([...selected, name]);
    } else {
      onChange([...selected.filter((slectedName) => slectedName !== name)]);
    }
  };

  return (
    <>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input
          checked={selected.includes("wifi")}
          type="checkbox"
          name="wifi"
          onChange={checkBoxHandler}
        />
        <AiOutlineWifi />
        <span>Wifi</span>
      </label>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input
          checked={selected.includes("parking")}
          type="checkbox"
          name="parking"
          onChange={checkBoxHandler}
        />
        <BsTruck />
        <span>Free parking spot</span>
      </label>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input
          checked={selected.includes("tv")}
          type="checkbox"
          name="tv"
          onChange={checkBoxHandler}
        />
        <PiMonitor />
        <span>TV</span>
      </label>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input
          checked={selected.includes("pets")}
          type="checkbox"
          name="pets"
          onChange={checkBoxHandler}
        />
        <FaCat />
        <span>pets</span>
      </label>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input
          checked={selected.includes("radio")}
          type="checkbox"
          name="radio"
          onChange={checkBoxHandler}
        />
        <HiOutlineArrowLeftOnRectangle />
        <span>Private Entrance</span>
      </label>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input
          checked={selected.includes("entrance")}
          type="checkbox"
          name="entrance"
          onChange={checkBoxHandler}
        />
        <HiOutlineArrowLeftOnRectangle />
        <span>Private Entrance</span>
      </label>
    </>
  );
};

export default perks;
