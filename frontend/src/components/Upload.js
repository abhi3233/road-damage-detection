import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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


    const username = localStorage.getItem("username");

    formData.append("username", username);


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


      // successful upload only
      setResult(res.data.detections || []);

      alert("Upload successful");


      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);


    } catch (error) {

      console.error(error);


      // show backend error message
      if (error.response && error.response.data.detail) {

        alert(error.response.data.detail);

      } else {

        alert("Upload failed");

      }


      // stop here, do not navigate
      return;

    }

  };


  return (

    <div style={{ padding: "20px" }}>

      <h1>Road Damage Detection</h1>

      <h2>Upload Image</h2>


      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />


      {preview && (

        <div>

          <h4>Preview:</h4>

          <img
            src={preview}
            width="300"
            alt="preview"
          />

        </div>

      )}


      <br />


      <button onClick={getLocation}>
        Get GPS Location
      </button>



      {location && (

        <p>
          Latitude: {location.lat}
          <br />
          Longitude: {location.lng}
        </p>

      )}



      <br />


      <button onClick={uploadImage}>
        Upload
      </button>



      {result.length > 0 && (

        <div>

          <h3>Detection Results</h3>


          {result.map((item,index)=>(

            <div key={index}>

              <p>
                Damage: {item.damage_type}
              </p>


              <p>
                Confidence: {item.confidence}
              </p>


            </div>

          ))}

        </div>

      )}


    </div>

  );

}


export default Upload;