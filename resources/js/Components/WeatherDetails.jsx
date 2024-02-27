import React from "react";

const WeatherDetails = ({ details }) => {
    return (
        <dl className="weather-details text-xs sm:text-base grid grid-cols-2 gap-0.5 lg:gap-1">
            <dt className="text-left">Name</dt>
            <dd className="text-right">{details.name}</dd>
            <dt className="text-left">Temp</dt>
            <dd className="text-right">{details.temp}&#176;C</dd>
            <dt className="text-left">Humidity</dt>
            <dd className="text-right">{details.humidity}&#37;</dd>
            <dt className="text-left">Wind</dt>
            <dd className="text-right">{details.wind} km&#47;h</dd>
        </dl>
    );
};

export default WeatherDetails;
