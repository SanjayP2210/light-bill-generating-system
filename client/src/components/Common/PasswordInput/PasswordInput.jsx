/* eslint-disable react/prop-types */
import { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Enter password",
  autoComplete = "current-password",
  ...rest
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup>
      <Form.Control
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...rest}
      />
      <Button
        type="button"
        variant="outline-dark"
        className="password-toggle-btn"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? (
          <IconEyeOff size={18} stroke={1.75} />
        ) : (
          <IconEye size={18} stroke={1.75} />
        )}
      </Button>
    </InputGroup>
  );
};

export default PasswordInput;
