import React from 'react';

const WeatherDetails = ({ details }) => {
  return (
    <dl className="text-xs sm:text-base h-2/5">
      <div className="flex justify-between items-center h-1/4">
        <dt>Name</dt>
        <dd>{details.name}</dd>
      </div>
      <div className="flex justify-between items-center h-1/4">
        <dt>Temp</dt>
        <dd>{details.temp}&#176;C</dd>
      </div>
      <div className="flex justify-between items-center h-1/4">
        <dt>Humidity</dt>
        <dd>{details.humidity}&#37;</dd>
      </div>
      <div className="flex justify-between items-center h-1/4">
        <dt>Wind</dt>
        <dd>{details.wind} km&#47;h</dd>
      </div>
    </dl>
  );
};

export default WeatherDetails;
