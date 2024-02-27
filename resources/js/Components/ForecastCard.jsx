import React from 'react';

const ForecastCard = ({ card }) => {
  return (
    <div className="flex justify-between items-center text-xs sm:text-base rounded-xl shadow-lg shadow-gray-100">
      {card.days.slice(0, 4).map((day, _) => (
        <div
          key={day.forecast[0].time}
          className="flex flex-col items-center h-full w-full rounded-2xl transition-all hover:scale-105 hover:bg-gray-200 hover:bg-opacity-80 cursor-pointer"
        >
          <span className="m-auto mb-0">{day.forecast[0].time}</span>
          <img
            className="object-cover w-1/2 m-auto my-0"
            src={`https://openweathermap.org/img/wn/${day.forecast[0].icon}@2x.png`}
            alt={day.forecast[0].desc
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          ></img>
          <span className="m-auto mt-0 text">
            {day.forecast[0].temp}&#176;C
          </span>
        </div>
      ))}
    </div>
  );
};

export default ForecastCard;
