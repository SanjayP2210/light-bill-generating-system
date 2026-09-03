import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { IconLanguage } from "@tabler/icons-react";
import { LANGUAGES, getCurrentLanguage, setLanguage } from "./googleTranslate";
import "./LanguageSwitcher.css";

const LanguageSwitcher = ({ variant = "sidebar" }) => {
  const [selected, setSelected] = useState("en");

  useEffect(() => {
    setSelected(getCurrentLanguage());
  }, []);

  const handleSelect = (code) => {
    setSelected(code);
    setLanguage(code);
  };

  const currentLabel = LANGUAGES.find((lang) => lang.code === selected)?.label || "English";

  return (
    <Dropdown className={`language-switcher language-switcher-${variant}`}>
      <Dropdown.Toggle as="button" className="language-switcher-toggle" id={`language-switcher-${variant}`}>
        <IconLanguage size={20} stroke={1.8} />
        <span>{currentLabel}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu className="language-switcher-menu">
        {LANGUAGES.map(({ code, label }) => (
          <Dropdown.Item key={code} active={selected === code} onClick={() => handleSelect(code)}>
            {label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
