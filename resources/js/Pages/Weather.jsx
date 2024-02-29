import React, { useCallback, useEffect, useState } from 'react';
import ForecastCard from '@/Components/ForecastCard';
import LocationForm from '@/Components/LocationForm';
import WeatherDetails from '@/Components/WeatherDetails';
import WeatherSummary from '@/Components/WeatherSummary';
import { Link, Head } from '@inertiajs/react';

export default function Weather({
  auth,
  laravelVersion,
  phpVersion,
  apiKey,
  defaultData,
}) {
  const [forecast, setForecast] = useState(defaultData);
  const [location, setLocation] = useState(defaultData[0].name);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const fetchWeatherForecast = useCallback(
    async loc => {
      setIsLoading(true);
      setError(null);

      try {
        const [imageResponse, currentResponse, forecastResponse] =
          await Promise.all([
            fetch(`https://source.unsplash.com/1600x900/?${loc}`),
            fetch(
              `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${apiKey}`
            ),
            fetch(
              `https://api.openweathermap.org/data/2.5/forecast?q=${loc}&appid=${apiKey}`
            ),
          ]);
        const imgUrl = imageResponse.url;
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        if (currentData.cod !== 200 || forecastData.cod !== '200') {
          switch (currentData.cod) {
            case 401:
              setError('Unauthorized, plesase try again later');
              break;
            case 404:
              setError('Location not found, please try again');
              break;
            case 429:
              setError('Too many requests, please try again later');
              break;
            default:
              setError('Server error, please try again later');
              break;
          }
          setIsLoading(false);
          return;
        }

        const c = new Date();
        const currentTime = c.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        });

        const timeUpdated = new Date();

        let time = [];
        let temp = [];
        let currentDate = timeUpdated.toLocaleString('en-US', {
          day: 'numeric',
        });
        let nextDate = addDays(timeUpdated, 1);
        let prevDate = new Date();
        nextDate = nextDate.toLocaleString('en-US', {
          day: 'numeric',
        });
        let transformedDays = [];
        let tempData = [];
        let j = 0;
        // add in our current time and temp
        temp.push(Math.trunc(currentData.main.temp - 273.15));
        time.push('Now');
        for (let i = 0; i < forecastData.list.length; i++) {
          const fData = forecastData.list[i];

          const t = new Date(parseInt(fData.dt * 1000));
          const humanDateFormat = t.toLocaleString('en-US', {
            weekday: 'short',
          });
          const hour = t.toLocaleString('en-US', {
            hour: 'numeric',
          });
          currentDate = t.toLocaleString('en-US', {
            day: 'numeric',
          });
          if (timeUpdated < t && j <= 6) {
            // get only 7 items
            time.push(hour);
            temp.push(Math.trunc(fData.main.temp - 273.15));
            j++;
          }

          if (currentDate === nextDate) {
            transformedDays.push({
              day: prevDate.toLocaleDateString('en-US', {
                weekday: 'long',
              }),
              forecast: tempData,
            });
            nextDate = addDays(t, 1);
            nextDate = nextDate.toLocaleString('en-US', {
              day: 'numeric',
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
            feels_like: Math.trunc(currentData.main.feels_like - 273.15),
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

        document.body.style.backgroundImage = `url(${imgUrl})`;
        setForecast(transformedForecast);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey]
  );
  useEffect(() => {
    if (location !== '' && location != forecast[0].name) {
      fetchWeatherForecast(location);
    }
  }, [forecast, location, fetchWeatherForecast]);

  const fetchLocation = useCallback(
    async (lat, lon) => {
      setIsLoading(true);
      setError(null);

      await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
      )
        .then(res => {
          if (!res.ok) {
            switch (res.status) {
              case 401:
                setError('Unauthorized, plesase try again later');
                break;
              case 404:
                setError('Location not found, please try again');
                break;
              case 429:
                setError('Too many requests, please try again later');
                break;
              default:
                setError('Server error, please try again later');
                break;
            }
            setIsLoading(false);
            return;
          }
          return res.json();
        })
        .then(data => {
          setLocation(data[0].name);
        })
        .catch(error => {
          setError(error.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [apiKey]
  );
  useEffect(() => {
    if (
      latitude !== 0 &&
      longitude !== 0 &&
      latitude !== forecast[0].lat &&
      longitude !== forecast[0].lon
    )
      fetchLocation(latitude, longitude);
  }, [latitude, longitude, forecast, fetchLocation]);

  const handleSuccess = pos => {
    setLatitude(pos.coords.latitude);
    setLongitude(pos.coords.longitude);
  };

  const handleErrors = err => {
    setError(`Error ${err.code}: ${err.message}`);
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted' || result.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(handleSuccess, handleErrors, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      } else if (result.state === 'denied') {
        setError('Location permission denied.');
      }
    });
  }, []);

  const locationHandler = useCallback(
    newLocation => {
      if (newLocation !== location) {
        // Check for actual changes
        setLocation(newLocation);
      }
    },
    [location]
  );

  return (
    <>
      <Head title={auth.user ? 'Dasboard' : 'Weather Now'} />
      <div className="relative min-h-screen sm:flex sm:justify-center sm:items-center selection:bg-red-500 selection:text-white">
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
