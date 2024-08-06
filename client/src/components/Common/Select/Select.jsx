/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import ReactSelect from "react-select";

export default function Select({ options, value, onChange, ...rest }) {
   const [windowWidth, setWindowWidth] = useState(window.innerWidth);
   useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
   }, []);
  
  const customStyles = {
    menu: (provided) => ({
      ...provided,
      backgroundColor: "white",
    }),
    option: (provided, { isFocused, isSelected, isDisabled }) => ({
      ...provided,
      color: (() => {
        if (isFocused) {
          return (windowWidth > 500) ? 'white' : '';
        }
        if (isSelected) {
          return "white";
        }
        return "black";
      })(),
      cursor: "pointer",
      backgroundColor: (() => {
        if (isFocused) {
          return (windowWidth > 500) ? 'black' : '';
        }
        if (isSelected) {
          return "#0c0b0b";
        }
        return "white";
      })(),
      ":active": {
        ...customStyles[":active"],
        backgroundColor: !isDisabled ? isSelected : "",
      },
    }),
    control: (provided, { isFocused, isSelected, isDisabled }) => ({
      ...provided,
      backgroundColor: isSelected ? "black" : "white",
      borderColor: isFocused ? "black !important" : provided.borderColor,
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "black",
    }),
  };
  return (
    <div className="Select">
      <ReactSelect
        defaultValue={value}
        onChange={onChange}
        value={value}
        options={options}
        isClearable={true}
        isSearchable={true}
        styles={customStyles}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: "black",
          },
        })}
        {...rest}
      />
    </div>
  );
}
