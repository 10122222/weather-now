import React from 'react';

const ForecastCard = ({ card }) => {
  const forecastDays =
    card.days[0] && card.days[0].forecast[0]
      ? card.days.slice(0, 4)
      : card.days.slice(1, 5);

  const cardElements = forecastDays.map((day, _) => {
    const { time, temp, icon, desc } = day.forecast[0];

    return (
      <div
        key={time}
        className="flex flex-col items-center w-1/4 h-full transition-all cursor-pointer justify-stretch p-auto rounded-xl hover:scale-101 hover:bg-gray-200 hover:bg-opacity-80"
      >
        <span className="flex flex-row h-1/4">{time}</span>
        <img
          className="object-cover w-auto mx-4 flex-flex-row h-2/4 max-w-12 max-h-12 sm:mx-6"
          src={`img/${icon}.png`}
          alt={desc
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        />
        <span className="flex flex-row h-1/4">{temp}&#176;C</span>
      </div>
    );
  });

  return (
    <div className="flex justify-center items-center text-xs sm:text-base rounded-xl shadow-lg shadow-gray-100 h-[30%]">
      {cardElements}
    </div>
  );
};

export default ForecastCard;
