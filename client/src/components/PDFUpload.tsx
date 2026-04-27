import { FileUp } from "lucide-react";
import { useState } from "react";
import api from "../config/axios";

export const PdfUpload = ({ onUploadSuccess, setIsLoading }: { onUploadSuccess: () => void, setIsLoading: (isLoading: boolean) => void }) => {
    const [file, setFile] = useState<File | null>(null);
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setFile(e.target.files[0]);
      }
    };

    const resetDatabase = async () => { 
      try {
        const { data } = await api.post(
          `/api/reset`
        );
        console.log(data);
      } catch (error) {
        console.error(error)
      }
    }
  
    const handleUpload = async () => {
      if (!file) {
        alert("Please select a file first!");
        return;
      }
  
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        resetDatabase();
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('File upload failed');
        }
  
        const result = await response.json();
        console.log('Upload successful:', result);
        alert('PDF processed successfully! You can now ask questions.');
        onUploadSuccess(); // Notify the parent component
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('There was an error uploading or processing the PDF.');
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className='pdf-upload-container'>
        <h2>Upload PDF for RAG</h2>
        <p>Upload a PDF document to start asking questions about its content.</p>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file} className="upload-button"><FileUp size={25} /> Upload and Process PDF</button>
      </div>
    );
  }