import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UploadCloud, MapPin, CheckCircle, ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";

function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (selected) => {
    if (selected && selected.type.startsWith("image/")) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    } else {
      alert("Please select a valid image file.");
    }
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
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
        alert("Location access denied. You can still upload without GPS.");
      }
    );
  };

  const uploadImage = async () => {
    if (!file) {
      alert("Please select an image first");
      return;
    }

    setIsUploading(true);
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
      const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResult(res.data.detections || []);
      
      // Wait a moment to show results, then redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);

    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        alert("Upload failed. Please try again.");
      }
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="app-background"></div>
      <div className="page-container animate-fade-in">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <button className="btn btn-secondary" onClick={() => navigate("/dashboard")} style={{ padding: '12px' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ margin: 0, fontSize: '32px' }}>Upload New Scan</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          
          {/* Left Side: Upload Area */}
          <div className="animate-fade-up delay-100">
            <div className="glass-card">
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="file-input-hidden"
              />
              
              <div 
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <div className="pulse-circle">
                  <UploadCloud size={40} />
                </div>
                <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>Select an Image</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Drag & drop or click to browse</p>
              </div>

              <div style={{ margin: '32px 0' }}>
                <button 
                  className={`btn btn-full ${location ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={getLocation}
                  style={location ? { background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.4)' } : {}}
                >
                  <MapPin size={18} />
                  {location ? 'GPS Attached Successfully' : 'Attach GPS Location'}
                </button>
              </div>

              <button 
                className="btn btn-primary btn-full" 
                onClick={uploadImage}
                disabled={!file || isUploading}
                style={{ padding: '18px', fontSize: '18px' }}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> 
                    Analyzing Image...
                  </>
                ) : 'Run AI Analysis & Upload'}
              </button>
            </div>
          </div>

          {/* Right Side: Preview & Results */}
          <div className="animate-fade-up delay-200">
            <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <ImageIcon size={20} color="var(--accent-primary)" /> Image Preview
              </h3>
              
              {!preview ? (
                <div style={{ 
                  flexGrow: 1,
                  minHeight: '300px',
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px dashed var(--glass-border)',
                  borderRadius: '16px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                  Waiting for upload...
                </div>
              ) : (
                <div style={{ flexGrow: 1 }}>
                  <img
                    src={preview}
                    alt="preview"
                    style={{ 
                      width: '100%', 
                      maxHeight: '400px', 
                      objectFit: 'contain', 
                      borderRadius: '16px', 
                      marginBottom: '24px',
                      background: 'rgba(0,0,0,0.5)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                  />
                  
                  {location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                      <MapPin size={16} color="var(--success)" />
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </div>
                  )}
                </div>
              )}

              {result.length > 0 && (
                <div className="animate-fade-up" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                  <h3 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={20} /> Analysis Complete
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Redirecting to your dashboard...</p>
                  
                  {result.map((item, index) => (
                    <div key={index} style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--glass-border)',
                      padding: '16px', 
                      borderRadius: '12px', 
                      marginBottom: '12px', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: '600', fontSize: '16px' }}>
                        {item.damage_type === "none" ? "No Damage Detected" : item.damage_type}
                      </span>
                      <span style={{ 
                        color: 'var(--accent-primary)', 
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: '700'
                      }}>
                        {(item.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default Upload;