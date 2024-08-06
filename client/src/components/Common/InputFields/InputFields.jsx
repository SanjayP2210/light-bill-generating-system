import { useState, useRef } from "react";
import "./InputFields.css";

const InputFields = () => {
  const [values, setValues] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (index, event) => {
    const newValue = event.target.value;

    // Ensure the new value is a single digit
    if (newValue.length <= 1 && /^[0-9]*$/.test(newValue)) {
      const newValues = [...values];
      newValues[index] = newValue;
      setValues(newValues);

      // Move to the next input if the current input has a value and it's not the last input
      if (newValue && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && values[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="input-container">
      {values.map((value, index) => (
        <input
          key={index}
          type="text"
          value={value}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          ref={(el) => (inputRefs.current[index] = el)}
          className="input-box"
          maxLength="1"
        />
      ))}
    </div>
  );
};

export default InputFields;
