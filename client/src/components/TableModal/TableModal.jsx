/* eslint-disable react/prop-types */
import { Button, Card, Modal } from 'react-bootstrap';
import { IconDownload, IconX } from "@tabler/icons-react";
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TableModal = ({
  showModal,
  handleCloseModal,
  setShowLoader,
  customer_id,
  bodyContainer,
  newBillButton = <></>,
  disablePdfButton = false,
  showFooter = true,
  style,
}) => {
  const tableRef = useRef(null);

  const handleDownloadPDF = () => {
    var today = new Date();
    setShowLoader(true);
    if (tableRef.current) {
      html2canvas(tableRef.current, { scale: 1.5 }).then((canvas) => {
        // Increased scale for better quality
        // Create a new jsPDF instance
        const pdf = new jsPDF({
          orientation: "p", // Portrait orientation
          unit: "mm", // Unit of measurement
          format: "a4", // A4 paper size
        });

        // Convert the canvas to an image
        const imgData = canvas.toDataURL("image/png");

        // Calculate the PDF dimensions based on A4 size
        const imgWidth = 130; // Image width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Adjust the height to make the table appear smaller
        const scaleFactor = 1; // Adjust this factor to scale the image
        const scaledImgHeight = imgHeight * scaleFactor;

        // Add the image to the PDF with scaled height
        pdf.addImage(imgData, "PNG", 40, 10, imgWidth, scaledImgHeight);

        // Save the PDF
        pdf.save(`bill_${customer_id?.name}_${today.getTime()}.pdf`);
        setShowLoader(false);
      });
    }
  };
  return (
    <div>
      {" "}
      <Modal
        className="bill-modal-body"
        show={showModal}
        onHide={handleCloseModal}
        centered
      >
        <Modal.Body>
          <Card>
            <Card.Body ref={tableRef} style={style}>
              {bodyContainer}
            </Card.Body>
          </Card>
        </Modal.Body>
        {showFooter && (
          <Modal.Footer className="m-2 center-item align-items-center">
            <div>
              {newBillButton}
              <Button
                variant="outline-primary"
                type="button"
                disabled={disablePdfButton}
                style={{ marginRight: "10px" }}
                onClick={handleDownloadPDF}
              >
                <IconDownload /> PDF
              </Button>
              <Button
                variant="outline-danger"
                type="button"
                onClick={handleCloseModal}
              >
                <IconX /> Close
              </Button>
            </div>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
};

export default TableModal