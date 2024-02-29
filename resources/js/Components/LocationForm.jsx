import React, { memo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { MdArrowForwardIos } from 'react-icons/md';

function LocationForm({ onSubmitHandler }) {
  const [locationInput, setLocationInput] = useState('');
  const { processing } = useForm({
    //
  });

  const handleSubmit = e => {
    e.preventDefault();
    onSubmitHandler(locationInput);
    setLocationInput(''); // Clear input after submission
  };

  const handleChange = e => {
    setLocationInput(e.target.value);
  };

  return (
    <div className="flex h-1/5">
      <form
        className="self-center m-auto h-3/4 md:h-12 min-w-full relative"
        onSubmit={handleSubmit}
      >
        <input
          id="location"
          value={locationInput}
          name="location"
          className="w-full h-full text-xs sm:text-sm md:text-base placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base px-4 py-2 text-gray-700 bg-white bg-opacity-50 border border-white border-opacity-0 rounded-3xl focus:border-transparent focus:ring-transparent"
          placeholder="Search for places"
          onChange={handleChange}
        />
        <button
          type="submit"
          disabled={processing}
          className="absolute right-0 top-0 h-full w-1/5 sm:w-12 bg-opacity-0 rounded-r-3xl node-button"
        >
          <MdArrowForwardIos className="inline h-4 sm:h-6 w-4 sm:w-6 mr-2 m-auto sm:mr-3 text-gray-700" />
        </button>
      </form>
    </div>
  );
}

export default memo(LocationForm);
