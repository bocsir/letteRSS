export const ToggleSwitch = ({ isChecked, setIsChecked }) => {

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked)
  }

  return (
    <>
      <label className='relative mr-4 mb-1 flex cursor-pointer select-none items-center'>
        <span className='label flex items-center text-sm font-medium'>
          View: <span className='pl-1'> {isChecked ? 'Site' : 'Simple'} </span>
        </span>
        <input
          type='checkbox'
          name='autoSaver'
          className='sr-only'
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <span
          className={`slider ml-1 flex h-[18px] w-[30px] items-center rounded-full p-[2px] duration-200 border ${
            isChecked ? 'bg-amber-300' : 'bg-transparent'
          }`}
        >
          <span
            className={`dot h-[12px] w-[12px] rounded-full bg-white duration-200 ${
              isChecked ? 'translate-x-3' : ''
            }`}
          ></span>
        </span>

      </label>
    </>
  )
};
