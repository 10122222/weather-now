import React, { useCallback, useEffect, useState } from "react";
import ForecastCard from "@/Components/ForecastCard";
import LocationForm from "@/Components/LocationForm";
import WeatherDetails from "@/Components/WeatherDetails";
import WeatherSummary from "@/Components/WeatherSummary";
import { Link, Head } from "@inertiajs/react";

import defaultData from "/forecast.json";

export default function Weather({ auth, laravelVersion, phpVersion, apiKey }) {
    const [forecast, setForecast] = useState(defaultData);
    const [location, setLocation] = useState(defaultData[0].name);
    const [lat, setLat] = useState(0);
    const [lon, setLon] = useState(0);
    const [currentImgLoc, setCurrentImgLoc] = useState(defaultData[0].name);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const API = apiKey;

    const fetchWeatherForecast = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const currentData = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API}`
            ).then((response) => response.json());
            const forecastData = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API}`
            ).then((response) => response.json());

            if (currentData.cod === "404" || forecastData.cod === "404") {
                throw new Error("Location not found. Please try again.");
            }

            const c = new Date();
            //5:05 PM, Mon, Nov 23, 2020
            const currentTime = c.toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
            });

            function addDays(date, days) {
                var result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            }
            const timeUpdated = new Date();

            let time = [];
            let temp = [];
            let currentDate = timeUpdated.toLocaleString("en-US", {
                day: "numeric",
            });
            let nextDate = addDays(timeUpdated, 1);
            let prevDate = new Date();
            nextDate = nextDate.toLocaleString("en-US", {
                day: "numeric",
            });
            let transformedDays = [];
            let tempData = [];
            let j = 0;
            // add in our current time and temp
            temp.push(Math.trunc(currentData.main.temp - 273.15));
            time.push("Now");
            for (let i = 0; i < forecastData.list.length; i++) {
                const fData = forecastData.list[i];

                const t = new Date(parseInt(fData.dt * 1000));
                const humanDateFormat = t.toLocaleString("en-US", {
                    weekday: "short",
                });
                const hour = t.toLocaleString("en-US", {
                    hour: "numeric",
                });
                currentDate = t.toLocaleString("en-US", {
                    day: "numeric",
                });
                if (timeUpdated < t && j <= 6) {
                    // get only 7 items
                    time.push(hour);
                    temp.push(Math.trunc(fData.main.temp - 273.15));
                    j++;
                }

                if (currentDate === nextDate) {
                    transformedDays.push({
                        day: prevDate.toLocaleDateString("en-US", {
                            weekday: "long",
                        }),
                        forecast: tempData,
                    });
                    nextDate = addDays(t, 1);
                    nextDate = nextDate.toLocaleString("en-US", {
                        day: "numeric",
                    });
                    tempData = [];
                }
                // add new day entry
                tempData.push({
                    time: humanDateFormat,
                    hour: hour,
                    temp: Math.trunc(fData.main.temp - 273.15),
                    feels_like: Math.trunc(fData.main.feels_like - 273.15),
                    desc: fData.weather[0].description,
                    icon: fData.weather[0].icon,
                    humidity: Math.trunc(fData.main.humidity),
                    pressure: Math.trunc(fData.main.pressure),
                    wind: Math.trunc(fData.wind.speed * 3.6),
                });
                prevDate = new Date(t);
            }

            const transformedForecast = [
                {
                    name: currentData.name,
                    currentTime: currentTime,
                    temp: Math.trunc(currentData.main.temp - 273.15),
                    feels_like: Math.trunc(
                        currentData.main.feels_like - 273.15
                    ),
                    desc: currentData.weather[0].description,
                    icon: currentData.weather[0].icon,
                    humidity: Math.trunc(currentData.main.humidity),
                    pressure: Math.trunc(currentData.main.pressure),
                    wind: Math.trunc(currentData.wind.speed * 3.6),
                    days: transformedDays,
                    current: {
                        chartLabels: time,
                        chartData: temp,
                        chartMin: Math.min(...temp),
                        chartMax: Math.max(...temp),
                    },
                },
            ];

            setForecast(transformedForecast);

            if (!currentData.ok || !forecastData.ok) {
                throw new Error(
                    "Something went wrong, please check your connection and try again!"
                );
            }
        } catch (error) {
            setError(error.message);
        }
        setIsLoading(false);
    }, [location, API]);
    useEffect(() => {
        if (forecast[0].name !== location) fetchWeatherForecast();
    }, [fetchWeatherForecast]);

    const fetchLocation = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const uri = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API}`;

        try {
            const response = await fetch(uri);
            const loc = await response.json();

            setLocation(loc[0].name);

            if (loc[0].name !== location) {
                fetchWeatherForecast();
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [lat, lon, API, fetchWeatherForecast]);
    useEffect(() => {
        if (lat !== 0 && lon !== 0) fetchLocation();
    }, [fetchLocation]);

    const changBgImage = useCallback(async () => {
        const response = await fetch(
            `https://source.unsplash.com/1600x900/?${location}`
        );
        const imageUrl = response.url;
        document.body.style.backgroundImage = `url(${imageUrl})`;
    }, [location]);
    useEffect(() => {
        if (location !== currentImgLoc) {
            setCurrentImgLoc(location);
            changBgImage();
        }
    }, [changBgImage]);

    const handleSuccess = (pos) => {
        const crd = pos.coords;
        setLat(crd.latitude);
        setLon(crd.longitude);
    };

    const handleErrors = (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        setError("Location access error. Please check your settings.");
    };

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by this browser.");
            return;
        }

        navigator.permissions
            .query({ name: "geolocation" })
            .then((result) => {
                if (result.state === "granted" || result.state === "prompt") {
                    navigator.geolocation.getCurrentPosition(
                        handleSuccess,
                        handleErrors
                    );
                } else if (result.state === "denied") {
                    setError("Location permission denied.");
                }
            })
            .catch((error) => {
                setError(error.message);
            });
    }, []);

    const locationHandler = useCallback(
        (newLocation) => {
            if (newLocation !== location) {
                // Check for actual changes
                setLat(0);
                setLon(0);
                setLocation(newLocation);
                fetchWeatherForecast(newLocation); // Fetch only if the location changes
            }
        },
        [location, fetchWeatherForecast]
    );

    return (
        <>
            <Head title={auth.user ? "Dasboard" : "Weather Now"} />
            <div className="relative sm:flex sm:justify-center sm:items-center min-h-screen selection:bg-red-500 selection:text-white">
                <div className="sm:fixed sm:top-0 sm:right-0 p-6 text-end">
                    {auth.user ? (
                        <>
                            <Link
                                href={route("schedule.index")}
                                className="font-semibold text-gray-600 hover:text-gray-900 focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >
                                Schedule
                            </Link>

                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="ms-4 font-semibold text-gray-600 hover:text-gray-900 focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >
                                Log out
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href={route("login")}
                                className="font-semibold text-gray-600 hover:text-gray-900 focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >
                                Log in
                            </Link>

                            <Link
                                href={route("register")}
                                className="ms-4 font-semibold text-gray-600 hover:text-gray-900 focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
                <div className="max-w-7xl mx-auto p-6 lg:p-8">
                    <div className="scale-100 p-6 bg-white bg-opacity-50 from-gray-700/50 via-transparent rounded-lg shadow-2xl shadow-gray-500/20 flex motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500">
                        <div className="grid grid-flow-col-dense gap-2 lg:gap-4 text-center font-semibold text-gray-800">
                            <div className="grid gap-2 sm:gap-4 p-2 sm:p-4">
                                <WeatherSummary summary={forecast[0]} />
                            </div>

                            <div className="grid gap-2 sm:gap-4 p-2 sm:p-4">
                                <LocationForm
                                    onSubmitHandler={locationHandler}
                                />
                                <WeatherDetails details={forecast[0]} />
                                <ForecastCard card={forecast[0]} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-16 px-6 sm:items-center sm:justify-between">
                        <div className="text-center text-sm sm:text-start">
                            &nbsp;
                        </div>

                        <div className="text-center text-sm text-gray-500 sm:text-end sm:ms-0">
                            Laravel v{laravelVersion} (PHP v{phpVersion})
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
