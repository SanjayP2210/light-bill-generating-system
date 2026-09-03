/* eslint-disable react/prop-types */
import { useState } from "react";
import { Container } from "react-bootstrap";
import { IconGauge, IconStairs, IconListDetails } from "@tabler/icons-react";
import MasterSection from "../components/Master/MasterSection";
import mastersBannerImage from "../assets/masters-banner.svg";

const Masters = () => {
  // Bumped whenever a Floor No is added/updated/deactivated, so the Meter No
  // section's Floor No dropdown (and filter) stay in sync automatically.
  const [floorVersion, setFloorVersion] = useState(0);

  return (
    <Container className="app-container">
      <div className="page-hero">
        <div className="page-hero-copy">
          <div className="page-hero-icon">
            <IconListDetails size={28} stroke={1.75} />
          </div>
          <div>
            <p className="page-hero-eyebrow">Masters</p>
            <h1 className="page-hero-title">Meter &amp; Floor Numbers</h1>
            <p className="page-hero-subtitle">
              Manage the Meter No and Floor No lists used on the Customer Form.
            </p>
          </div>
        </div>
        <div className="page-hero-art" aria-hidden="true">
          <img src={mastersBannerImage} alt="Masters illustration" />
        </div>
      </div>

      <div className="mb-4">
        <MasterSection
          type="floor-no"
          title="Floor No"
          subtitle="Floor numbers available to assign to customers"
          icon={IconStairs}
          placeholder="e.g. Ground Floor"
          onItemsChange={() => setFloorVersion((v) => v + 1)}
        />
      </div>

      <div>
        <MasterSection
          type="meter-no"
          title="Meter No"
          subtitle="Meter numbers, grouped under a floor (e.g. 1st Floor has 2 meters, 2nd Floor has 3)"
          icon={IconGauge}
          placeholder="e.g. 1"
          parent={{ type: "floor-no", label: "Floor No" }}
          refreshSignal={floorVersion}
        />
      </div>
    </Container>
  );
};

export default Masters;
