import React from 'react';

const WeatherSummary = ({ summary }) => {
  return (
    <>
      <span className="sm:text-5xl">{summary.days[0].day}</span>
      <div className="text-xs sm:text-base grid gap-0">
        <span>{summary.currentTime.split(',')[0]}</span>
        <span>{summary.currentTime.split(',')[1]}</span>
      </div>
      <div>
        <img
          src={`https://openweathermap.org/img/wn/${summary.icon}@4x.png`}
          alt={summary.desc
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
          className="inline h-24 w-24 lg:h-48 lg:w-48"
        />
      </div>
      <span className="sm:text-5xl">{summary.temp}&#176;C</span>
      <span className="text-xs sm:text-2xl capitalize">{summary.desc}</span>
    </>
  );
};

export default WeatherSummary;
