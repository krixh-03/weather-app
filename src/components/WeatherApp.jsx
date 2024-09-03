import axios from "axios";
import { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const debouncedValue = useDebounce(searchCity, 500);
  const [position, setPosition] = useState({ lat: 0, lon: 0 });
  const [temp, setTemp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cityNotFound, setCityNotFound] = useState(false);

  useEffect(() => {
    const request = async () => {
      try {
        setLoading(true); 
        const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${debouncedValue}&limit=5&appid=fb77cb688071f2d3c66d51916aa9accf`);
        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          setPosition({ lat: parseFloat(lat.toFixed(2)), lon: parseFloat(lon.toFixed(2)) });
          setCityNotFound(false);
        } else {
          setCityNotFound(true);
          console.log('No data found for the city');
        }
      } catch (e) {
        console.error(e);
        setCityNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (debouncedValue) {
      request();
    } else {
      setPosition({ lat: 0, lon: 0 });
      setTemp(null);
      setCityNotFound(false);
    }
  }, [debouncedValue]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${position.lat}&longitude=${position.lon}&current=temperature_2m`);
        if (response.data && response.data.current) {
          setTemp(response.data.current.temperature_2m);
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (position.lat !== 0 && position.lon !== 0) {
      fetchWeather();
    }
  }, [position]);

  const handleSearch = () => {
    setSearchCity(city);
  };

  const handleInputChange = (e) => {
    setCity(e.target.value);
    if (e.target.value === '') {
      setPosition({ lat: 0, lon: 0 });
      setTemp(null);
      setCityNotFound(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-blue-500">
      <div className="border rounded h-[30%] w-[20%] flex flex-col">
        <label htmlFor="search" className="font-semibold text-lg ml-4 mt-2">Search</label>
        <div className="flex">
          <input
            onChange={handleInputChange}
            type="text"
            className="rounded p-2 w-[50%] ml-4"
            placeholder="enter city name"
          />
          <button
            className="border rounded p-2 bg-blue-900 text-white border-blue-500 ml-2"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <div className="ml-4 text-lg font-semibold">
          {loading ? (
            <div>Loading...</div>
          ) : cityNotFound ? (
            <div>No city found</div>
          ) : (
            city && position.lat !== 0 && position.lon !== 0 && (
              <div>
                <p>Latitude: {position.lat.toFixed(2)}</p>
                <p>Longitude: {position.lon.toFixed(2)}</p>
                {temp !== null && <p>Temperature: {temp}°C</p>}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
