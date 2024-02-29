import React from 'react';

const WeatherSummary = ({ summary }) => {
  return (
    <>
      <span className="flex justify-center sm:text-4xl h-[15%]">
        {summary.days[0].day}
      </span>
      <span className="flex justify-center h-[7.5%] text-xs sm:text-base">
        {summary.currentTime.split(',')[0]}
      </span>
      <span className="flex justify-center h-[7.5%] text-xs sm:text-base">
        {summary.currentTime.split(',')[1]}
      </span>
      <img
        src={`/img/${summary.icon}.png`}
        alt={summary.desc
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
        className="flex justify-center object-cover w-auto mx-auto h-1/2"
      />
      <span className="flex justify-center h-[10%] sm:text-4xl">
        {summary.temp}&#176;C
      </span>
      <span className="flex justify-center h-[10%] text-xs sm:text-2xl capitalize">
        {summary.desc}
      </span>
    </>
  );
};

export default WeatherSummary;
