/* eslint-disable react/prop-types */
import { Container } from "react-bootstrap";
import { IconReceipt2, IconFileInvoice, IconCurrencyRupee, IconCoinRupee, IconReceiptRupee } from "@tabler/icons-react";
import InputBoxes from "../components/Common/InputBoxes/InputBoxes";
import { useAuth } from "../context/AuthContext";
import homeBannerImage from "../assets/home-screen-banner.png";

const Home = ({ setShowLoader }) => {
  const { user } = useAuth();

  return (
    <Container className="app-container">
      <div className="page-hero">
        <div className="page-hero-copy">
          <div className="page-hero-icon">
            <IconReceiptRupee size={30} stroke={1.75} />
          </div>
          <div>
            <p className="page-hero-eyebrow">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
            </p>
            <h1 className="page-hero-title">Bill Generating System</h1>
            <p className="page-hero-subtitle">
              Manage your customers and bills efficiently.
            </p>
          </div>
        </div>
        <div className="page-hero-art" aria-hidden="true">
        <img src={homeBannerImage} alt="Bill illustration" />
          {/* <div className="hero-art-sheet">
            <IconFileInvoice size={54} stroke={1.45} />
            <span className="hero-art-line long" />
            <span className="hero-art-line" />
            <span className="hero-art-line short" />
          </div>
          <div className="hero-art-coin">
            <IconCurrencyRupee size={24} stroke={2} />
          </div>
          <span className="hero-art-dot dot-one" />
          <span className="hero-art-dot dot-two" />
          <span className="hero-art-dot dot-three" /> */}
        </div>
      </div>

      <InputBoxes setShowLoader={setShowLoader} />
    </Container>
  );
};

export default Home;
