import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);

  // 📸 Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // 📍 Get GPS location
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  };

  // 🚀 Upload to backend
  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData
      );

      console.log(res.data);
      alert("Upload successful!");
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
          <img src={preview} width="300" />
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
    </div>
  );
}

export default App;