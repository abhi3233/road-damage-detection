import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Upload.css";

function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState([]);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    setFile(selected);

    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        alert("Location access denied");
      }
    );
  };

  const uploadImage = async () => {
    if (!file) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    if (location) {
      formData.append("latitude", location.lat);
      formData.append("longitude", location.lng);
    }

    formData.append("username", localStorage.getItem("username"));

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(res.data.detections || []);

      alert("Upload Successful!");

      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (error) {

      console.error(error);

      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      } else {
        alert("Upload Failed");
      }
    }
  };

  return (
    <div className="uploadPage">

      <div className="uploadCard">

        <h1 className="uploadTitle">
          Road Damage Detection
        </h1>

        <h2 className="uploadSubtitle">
          Upload Road Image
        </h2>

        <input
          className="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        {preview && (
          <div className="previewContainer">

            <h3>Preview</h3>

            <img
              className="previewImage"
              src={preview}
              alt="Preview"
            />

          </div>
        )}

        <div className="buttonGroup">

          <button
            className="locationButton"
            onClick={getLocation}
          >
            📍 Get GPS Location
          </button>

          <button
            className="uploadButton"
            onClick={uploadImage}
          >
            ⬆ Upload
          </button>

        </div>

        {location && (
          <div className="locationCard">

            <p><strong>Latitude:</strong> {location.lat}</p>

            <p><strong>Longitude:</strong> {location.lng}</p>

          </div>
        )}

        {result.length > 0 && (

          <div className="resultSection">

            <h2>Detection Results</h2>

            {result.map((item,index)=>(

              <div
                className="resultCard"
                key={index}
              >

                <p>
                  <strong>Damage:</strong> {item.damage_type}
                </p>

                <p>
                  <strong>Confidence:</strong> {item.confidence}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Upload;