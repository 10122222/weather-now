import React, { useCallback, useEffect, useState } from 'react';
import ForecastCard from '@/Components/ForecastCard';
import LocationForm from '@/Components/LocationForm';
import WeatherDetails from '@/Components/WeatherDetails';
import WeatherSummary from '@/Components/WeatherSummary';
import { Link, Head } from '@inertiajs/react';

const addDays = (date, days) => {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const convertTemp = temp => Math.trunc(temp - 273.15);

const formatDate = (date, formatOptions) =>
  date.toLocaleString('en-US', formatOptions);

const handleApiError = status => {
  const errorMessages = {
    401: 'Unauthorized, please try again later',
    404: 'Location not found, please try again',
    429: 'Too many requests, please try again later',
    default: 'Server error, please try again later',
  };
  return errorMessages[status] || errorMessages.default;
};

const transformWeatherData = (currentData, forecastData) => {
  const c = new Date();
  const currentTime = formatDate(c, {
    hour: '2-digit',
    minute: '2-digit',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
  const timeUpdated = new Date();
  let time = [];
  let temp = [];
  let currentDate = formatDate(timeUpdated, {
    day: 'numeric',
  });
  let nextDate = addDays(timeUpdated, 1);
  let prevDate = new Date();

  nextDate = formatDate(nextDate, {
    day: 'numeric',
  });

  let transformedDays = [];
  let tempData = [];
  let j = 0;

  temp.push(convertTemp(currentData.main.temp));
  time.push('Now');

  for (let i = 0; i < forecastData.list.length; i++) {
    const fData = forecastData.list[i];
    const t = new Date(parseInt(fData.dt * 1000));
    const humanDateFormat = formatDate(t, {
      weekday: 'short',
    });
    const hour = formatDate(t, {
      hour: 'numeric',
    });

    currentDate = formatDate(t, {
      day: 'numeric',
    });

    if (timeUpdated < t && j <= 6) {
      time.push(hour);
      temp.push(convertTemp(fData.main.temp));
      j++;
    }

    if (currentDate === nextDate) {
      transformedDays.push({
        day: formatDate(prevDate, {
          weekday: 'long',
        }),
        forecast: tempData,
      });
      nextDate = addDays(t, 1);
      nextDate = formatDate(nextDate, {
        day: 'numeric',
      });
      tempData = [];
    }

    tempData.push({
      time: humanDateFormat,
      hour: hour,
      temp: convertTemp(fData.main.temp),
      feels_like: convertTemp(fData.main.feels_like),
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
      temp: convertTemp(currentData.main.temp),
      feels_like: convertTemp(currentData.main.feels_like),
      desc: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      humidity: Math.trunc(currentData.main.humidity),
      pressure: Math.trunc(currentData.main.pressure),
      wind: Math.trunc(currentData.wind.speed * 3.6),
      lat: currentData.coord.lat,
      lon: currentData.coord.lon,
      days: transformedDays,
      current: {
        chartLabels: time,
        chartData: temp,
        chartMin: Math.min(...temp),
        chartMax: Math.max(...temp),
      },
    },
  ];

  return transformedForecast;
};

export default function Weather({
  auth,
  initialForecast,
  laravelVersion,
  owmApiKey,
  phpVersion,
}) {
  const [backgroundImage, setBackgroundImage] = useState('/img/bg.jpg');
  const [forecast, setForecast] = useState(initialForecast);
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherForecast = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [imageResponse, currentResponse, forecastResponse] =
        await Promise.all([
          fetch(`https://source.unsplash.com/1600x900/?${location}`),
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${owmApiKey}`
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${owmApiKey}`
          ),
          { concurrencyLimit: 3 },
        ]);

      const [imgUrl, currentData, forecastData] = await Promise.all([
        imageResponse.url,
        currentResponse.json(),
        forecastResponse.json(),
        { concurrencyLimit: 3 },
      ]);

      if (currentData.cod !== 200 || forecastData.cod !== '200') {
        setError(handleApiError(currentData.cod));
        setIsLoading(false);
        return;
      }

      const transformedForecast = transformWeatherData(
        currentData,
        forecastData
      );

      setBackgroundImage(imgUrl);
      setForecast(transformedForecast);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [location, owmApiKey]);

  useEffect(() => {
    if (location && location != forecast[0].name) {
      fetchWeatherForecast();
    }
  }, [location, forecast, fetchWeatherForecast]);

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${owmApiKey}`
      );

      if (!response.ok) {
        setError(handleApiError(response.status));
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setLocation(data[0].name);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
      setLatitude(0);
      setLongitude(0);
    }
  }, [latitude, longitude, owmApiKey]);

  useEffect(() => {
    if (latitude && longitude) fetchLocation();
  }, [latitude, longitude, fetchLocation]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted' || result.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(
          pos => {
            setLatitude(pos.coords.latitude);
            setLongitude(pos.coords.longitude);
          },
          err => {
            if (err.code === 1) return;
            setError(`Error ${err.code}: ${err.message}`);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 60000,
          }
        );
      }
    });
  }, []);

  const locationHandler = useCallback(
    newLocation => {
      if (newLocation !== location) {
        setLocation(newLocation);
      }
    },
    [location]
  );

  return (
    <>
      <Head title={auth.user ? 'Dasboard' : 'Weather Now'} />
      <div
        className="relative min-h-screen sm:flex sm:justify-center sm:items-center selection:bg-red-500 selection:text-white"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <div className="p-6 sm:fixed sm:top-0 sm:right-0 lg:p-8 text-end">
          {auth.user ? (
            <>
              <Link
                href={route('schedule.index')}
                className="font-semibold text-gray-600 hover:text-gray-900 focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
              >
                Schedule
              </Link>

              <Link
                href={route('logout')}
                method="post"
                as="button"
                className="font-semibold text-gray-600 ms-4 hover:text-gray-900 focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
              >
                Log out
              </Link>
            </>
          ) : (
            <>
              <Link
                href={route('login')}
                className="font-semibold text-gray-600 hover:text-gray-900 focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
              >
                Log in
              </Link>

              <Link
                href={route('register')}
                className="font-semibold text-gray-600 ms-4 hover:text-gray-900 focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
              >
                Register
              </Link>
            </>
          )}
        </div>
        <div className="max-w-screen-xl p-6 mx-auto lg:p-8">
          <div className="scale-100 p-6 lg:p-8 bg-white bg-opacity-50 from-gray-700/50 via-transparent rounded-lg shadow-2xl shadow-gray-500/20 flex motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500">
            <div className="flex justify-between w-full font-semibold text-center text-gray-800">
              {isLoading ? (
                <div>Loading...</div>
              ) : error ? (
                <div>{error}</div>
              ) : (
                <>
                  <div className="flex flex-col w-[35%]">
                    <WeatherSummary summary={forecast[0]} />
                  </div>

                  <div className="flex flex-col justify-between w-3/5">
                    <LocationForm onSubmitHandler={locationHandler} />
                    <WeatherDetails details={forecast[0]} />
                    <ForecastCard card={forecast[0]} />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center px-6 mt-16 sm:items-center sm:justify-between">
            <div className="text-sm text-center sm:text-start">&nbsp;</div>

            <div className="text-sm text-center text-gray-500 sm:text-end sm:ms-0">
              Laravel v{laravelVersion} (PHP v{phpVersion})
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
