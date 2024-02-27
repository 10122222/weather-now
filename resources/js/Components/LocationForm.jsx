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
    <div className="h-14 sm:h-20 grid content-center">
      <form
        className="m-auto h-12 w-40 sm:w-96 relative"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          className="w-full h-full text-xs sm:text-sm md:text-base placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base px-4 py-2 text-gray-700 bg-white bg-opacity-75 border border-white border-opacity-0 rounded-3xl focus:border-transparent focus:ring-transparent"
          placeholder="Search for places"
          value={locationInput} // Bind value to state
          onChange={handleChange} // Handle input changes
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
