import { useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState([]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

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

  const uploadImage = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    if (location) {
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lng);
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData
      );

      setResult(res.data.detections || []);
      alert("Upload successful!");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Road Damage Detection</h1>

      <h2>Upload Image</h2>

      <input type="file" onChange={handleFileChange} />

      {preview && (
        <div>
          <h4>Preview:</h4>
          <img src={preview} width="300" alt="preview" />
        </div>
      )}

      <button onClick={getLocation}>Get GPS Location</button>

      {location && (
        <p>
          Latitude: {location.lat}, Longitude: {location.lng}
        </p>
      )}

      <button onClick={uploadImage}>Upload</button>

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

      <hr />

      <Dashboard />
    </div>
  );
}

export default App;