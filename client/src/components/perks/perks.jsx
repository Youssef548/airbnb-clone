import React from "react";

import { AiOutlineWifi } from "react-icons/ai";
import { BsTruck } from "react-icons/bs";
import { PiMonitor } from "react-icons/pi";
import { FaCat } from "react-icons/fa";
import { HiOutlineArrowLeftOnRectangle } from "react-icons/hi2";

const perks = ({ selected, onChange }) => {
  return (
    <>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input type="checkbox" />
        <AiOutlineWifi />
        <span>Wifi</span>
      </label>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input type="checkbox" />
        <BsTruck />
        <span>Free parking spot</span>
      </label>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input type="checkbox" />
        <PiMonitor />
        <span>TV</span>
      </label>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input type="checkbox" />
        <FaCat />
        <span>pets</span>
      </label>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input type="checkbox" />
        <HiOutlineArrowLeftOnRectangle />
        <span>Private Entrance</span>
      </label>
      <label className="border p-4 rounded-2xl flex gap-2 items-center cursor-pointer">
        <input type="checkbox" />
        <HiOutlineArrowLeftOnRectangle />
        <span>Private Entrance</span>
      </label>
    </>
  );
};

export default perks;
