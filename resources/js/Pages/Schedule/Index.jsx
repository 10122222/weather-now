import React, { useRef, useEffect, useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useForm, Head, Link, router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

export default function ScheduleModal() {
  const [settingSchedule, setSettingSchedule] = useState(true);
  const [minDateFmt, setMinDateFmt] = useState('');
  const [maxDateFmt, setMaxDateFmt] = useState('');
  const dateInput = useRef();
  const locationInput = useRef();

  const { data, setData, setDefaults, post, processing, reset, errors } =
    useForm({
      date: '',
      location: '',
    });

  //   const setSchedule = () => {
  //     setSettingSchedule(true);
  //   };

  const submit = e => {
    e.preventDefault();

    post(route('schedule.store'), {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onError: () =>
        errors.date ? dateInput.current.focus() : locationInput.current.focus(),
      onFinish: () => reset(),
    });
  };

  useEffect(() => {
    const today = new Date();

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    setMinDateFmt(minDateStr);
    setMaxDateFmt(maxDateStr);

    setDefaults({
      date: minDateStr,
      location: '',
    });
  }, [setDefaults]);

  const closeModal = () => {
    setSettingSchedule(false);

    reset();
  };

  const cancel = e => {
    e.preventDefault();

    post(route('schedule.cancel'), {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onError: () => {},
      onFinish: () => reset(),
    });
  };

  const onOuterClick = () => {
    router.visit('/');
  };

  return (
    <>
      <Head title="Schedule" />
      <Modal show={settingSchedule} onClose={onOuterClick} maxWidth="md">
        <div className="scale-100 p-6 focus:outline focus:outline-2 focus:outline-red-500 w-full">
          <div>
            <Link href="/">
              <ApplicationLogo className="w-20 h-20 fill-current mx-auto" />
            </Link>
          </div>

          <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <form onSubmit={submit}>
              <div>
                <InputLabel htmlFor="date" value="Date" />

                <TextInput
                  name="date"
                  id="date"
                  type="date"
                  value={data.date}
                  ref={dateInput}
                  min={minDateFmt}
                  max={maxDateFmt}
                  className="mt-1 block w-full text-gray-700 bg-white bg-opacity-75"
                  onChange={e => setData('date', e.target.value)}
                />

                <InputError message={errors.date} className="mt-2" />
              </div>

              <div className="mt-4">
                <InputLabel htmlFor="location" value="Location" />
                <TextInput
                  name="location"
                  id="location"
                  value={data.location}
                  ref={locationInput}
                  placeholder="Enter location"
                  className="mt-1 block w-full text-gray-700 bg-white bg-opacity-75"
                  onChange={e => setData('location', e.target.value)}
                />
                <InputError message={errors.location} className="mt-2" />
              </div>

              <div className="flex items-center justify-between mt-4">
                <SecondaryButton onClick={cancel}>Cancel</SecondaryButton>
                <PrimaryButton className="ms-4" disabled={processing}>
                  Schedule
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
