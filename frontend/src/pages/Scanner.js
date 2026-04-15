import BarcodeScanner from "react-qr-barcode-scanner";

export default function Scanner({ onScan }) {
  return (
    <div>
      <h3>Scan Product</h3>

      <BarcodeScanner
        width={300}
        height={300}
        onUpdate={(err, result) => {
          if (result) {
            onScan(result.text);
          }
        }}
      />
    </div>
  );
}