import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState([]);

  // 📸 Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // 📍 Get GPS location
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.log(error);
        alert("Location access denied");
      }
    );
  };

  // 🚀 Upload to backend
  const uploadImage = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    // ✅ Send GPS if available
    if (location) {
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lng);
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData
      );

      console.log(res.data);

      // ✅ Store detection results
      setResult(res.data.detections);

      alert("Upload + Detection successful!");
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Road Damage Detection Upload</h2>

      {/* File input */}
      <input type="file" onChange={handleFileChange} />

      {/* Preview */}
      {preview && (
        <div>
          <h4>Preview:</h4>
          <img src={preview} width="300" alt="preview" />
        </div>
      )}

      {/* Location */}
      <button onClick={getLocation}>Get GPS Location</button>

      {location && (
        <p>
          Latitude: {location.lat}, Longitude: {location.lng}
        </p>
      )}

      {/* Upload button */}
      <button onClick={uploadImage}>Upload</button>

      {/* 🔥 Detection Results */}
      {result.length > 0 && (
        <div>
          <h3>Detection Results:</h3>
          {result.map((item, index) => (
            <div key={index}>
              <p>Damage: {item.damage_type}</p>
              <p>Confidence: {item.confidence}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;