import React from "react";
import billImage from "../../assets/sidebar-bill.png";
import "./SidebarBottom.css";

const SidebarBottom = () => {
  return (
    <div className="sidebar-bottom-card">
      <div className="sidebar-bottom-image">
        <img src={billImage} alt="Bill illustration" />
      </div>

      <div className="sidebar-bottom-content">
        <p>Create bills quickly 
            <br />
          and manage customers
          <br />
          efficiently.
        </p>
      </div>
    </div>
  );
};

export default SidebarBottom;