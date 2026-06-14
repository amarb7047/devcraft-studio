/**
 * Service to upload files directly to Cloudinary from the client-side.
 * Requires an unsigned upload preset configured in the Cloudinary dashboard.
 */
export const uploadImageToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Check if credentials are mock/default placeholders
  if (!cloudName || cloudName.includes('mock') || !uploadPreset || uploadPreset.includes('mock')) {
    console.warn("Cloudinary upload is running with MOCK settings. Simulating upload and returning mock preview.");
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Return a temporary local preview URL or a reliable design placeholder
    try {
      return URL.createObjectURL(file);
    } catch (e) {
      return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60";
    }
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error in uploadImageToCloudinary:', error);
    throw error;
  }
};
