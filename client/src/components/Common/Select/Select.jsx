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
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#ffffff",
      borderRadius: 10,
      overflow: "hidden",
      border: "1px solid #e2e8f0",
      boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
      zIndex: 9999,
    }),
    option: (provided, { isFocused, isSelected, isDisabled }) => ({
      ...provided,
      color: (() => {
        if (isSelected) return "#ffffff";
        if (isFocused) return (windowWidth > 500) ? "#1e40af" : "";
        return "#0f172a";
      })(),
      cursor: "pointer",
      backgroundColor: (() => {
        if (isSelected) return "#2563eb";
        if (isFocused) return (windowWidth > 500) ? "#eff6ff" : "";
        return "#ffffff";
      })(),
      ":active": {
        ...customStyles[":active"],
        backgroundColor: !isDisabled ? isSelected : "",
      },
    }),
    control: (provided, { isFocused }) => ({
      ...provided,
      backgroundColor: "#ffffff",
      borderColor: isFocused ? "#2563eb" : "#e2e8f0",
      borderWidth: isFocused ? 2 : 1,
      minHeight: 42,
      borderRadius: 8,
      boxShadow: isFocused ? "0 0 0 3px rgba(37, 99, 235, 0.18)" : "none",
      cursor: "pointer",
      "&:hover": {
        borderColor: "#2563eb",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#0f172a",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#94a3b8",
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
        menuPortalTarget={document.body}
        menuPosition="fixed"
        styles={customStyles}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: "#2563eb",
            primary25: "#eff6ff",
            primary50: "#3b82f6",
          },
        })}
        {...rest}
      />
    </div>
  );
}
