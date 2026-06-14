import React, { useState, useEffect } from 'react';
import { db, isMock } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { uploadImageToCloudinary } from '../../services/cloudinary';
import { FolderPlus, Image, Trash2, Edit2, Link, ToggleLeft, ToggleRight, Check, AlertCircle } from 'lucide-react';

const PortfolioCMS = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editId, setEditId] = useState(null); // If null, we are in CREATE mode
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('eCommerce');
  const [techStackInput, setTechStackInput] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // File Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = ['eCommerce', 'CRM', 'CMS', 'Landing Page', 'Custom'];

  useEffect(() => {
    if (isMock) {
      // Mock portfolio items
      const loadMockPortfolio = () => {
        const stored = localStorage.getItem('mock_portfolio');
        const list = stored ? JSON.parse(stored) : [
          {
            id: 'mock-p-1',
            title: 'DevCraft CRM Dashboard',
            description: 'Custom React dashboard featuring real-time client management pipelines.',
            category: 'CRM',
            techStack: ['React', 'Firebase', 'Tailwind CSS'],
            thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
            liveUrl: 'https://example.com',
            isVisible: true,
            createdAt: new Date().toISOString()
          }
        ];
        setProjects(list);
        setLoading(false);
      };

      loadMockPortfolio();
      const interval = setInterval(loadMockPortfolio, 1500);
      return () => clearInterval(interval);
    }

    // Real Firebase listener
    const pQuery = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(pQuery, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setProjects(list);
      setLoading(false);
    }, (error) => {
      console.error("Error loading portfolio CMS:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle Image File Selection and direct Cloudinary Upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const url = await uploadImageToCloudinary(file);
      setThumbnailUrl(url);
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploadError("Failed to upload image. Please verify presets.");
    } finally {
      setUploading(false);
    }
  };

  const handleResetForm = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setCategory('eCommerce');
    setTechStackInput('');
    setThumbnailUrl('');
    setLiveUrl('');
    setIsVisible(true);
    setUploadError(null);
  };

  const handleEditClick = (project) => {
    setEditId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setCategory(project.category);
    setTechStackInput(project.techStack?.join(', ') || '');
    setThumbnailUrl(project.thumbnailUrl);
    setLiveUrl(project.liveUrl || '');
    setIsVisible(project.isVisible);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!thumbnailUrl) {
      setUploadError("A project thumbnail image is required.");
      return;
    }

    setSubmitting(true);

    const techArray = techStackInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');

    const projectData = {
      title,
      description,
      category,
      techStack: techArray,
      thumbnailUrl,
      liveUrl: liveUrl.trim(),
      isVisible,
      createdAt: isMock ? new Date().toISOString() : new Date()
    };

    if (isMock) {
      // Mock portfolio Save/Update
      const stored = localStorage.getItem('mock_portfolio') || '[]';
      let list = JSON.parse(stored);
      if (editId) {
        // Edit mode
        list = list.map(p => p.id === editId ? { ...p, ...projectData, id: editId } : p);
      } else {
        // Create mode
        list = [{ id: `mock-p-${Date.now()}`, ...projectData }, ...list];
      }
      localStorage.setItem('mock_portfolio', JSON.stringify(list));
      
      // Update local storage preview cache for Home/Portfolio page fallback
      const mockHomeProjects = list.filter(p => p.isVisible);
      localStorage.setItem('mock_home_portfolio', JSON.stringify(mockHomeProjects.slice(0, 3)));

      setSubmitting(false);
      handleResetForm();
      return;
    }

    try {
      if (editId) {
        // Update document
        await updateDoc(doc(db, 'portfolio', editId), projectData);
      } else {
        // Create document
        await addDoc(collection(db, 'portfolio'), projectData);
      }
      handleResetForm();
    } catch (err) {
      console.error("CMS form save error:", err);
      setUploadError("Failed to save project document in Firestore.");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Visibility in-place
  const handleToggleVisible = async (project) => {
    const nextVal = !project.isVisible;

    if (isMock) {
      const stored = localStorage.getItem('mock_portfolio');
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.map(p => p.id === project.id ? { ...p, isVisible: nextVal } : p);
        localStorage.setItem('mock_portfolio', JSON.stringify(updated));
      }
      return;
    }

    try {
      await updateDoc(doc(db, 'portfolio', project.id), { isVisible: nextVal });
    } catch (err) {
      console.error("Toggle visibility error:", err);
    }
  };

  // Delete project
  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this portfolio case study?")) return;

    if (isMock) {
      const stored = localStorage.getItem('mock_portfolio');
      if (stored) {
        const list = JSON.parse(stored);
        localStorage.setItem('mock_portfolio', JSON.stringify(list.filter(p => p.id !== id)));
      }
      return;
    }

    try {
      await deleteDoc(doc(db, 'portfolio', id));
    } catch (err) {
      console.error("Delete project error:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Form Panel */}
      <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-soft h-fit">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
          <FolderPlus size={18} className="text-primary-600" />
          <h3 className="font-display font-bold text-gray-800 text-sm sm:text-base">
            {editId ? 'Modify Project Case Study' : 'Create Project Case Study'}
          </h3>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
          
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Boutique Apparel Store"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-800 font-semibold"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Showcase Summary</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed, compelling description outlining the product features..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all resize-none leading-relaxed"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-700 font-semibold"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Live URL */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Live URL (Optional)</label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://client-demo.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Tech Stack Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tech Stack badges (Comma separated)</label>
            <input
              type="text"
              required
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="e.g. React, Firebase, Tailwind CSS, Recharts"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all font-mono"
            />
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Thumbnail Image</label>
            
            {thumbnailUrl ? (
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-gray-200 bg-gray-50 flex items-center justify-center shadow-inner group mb-2">
                <img 
                  src={thumbnailUrl} 
                  alt="Thumbnail Preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setThumbnailUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 hover:border-primary-400 bg-gray-50 hover:bg-white rounded-2xl cursor-pointer transition-all min-h-36">
                {uploading ? (
                  <div className="space-y-2 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <span className="text-[10px] text-gray-400 font-bold block">Uploading to Cloudinary...</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-center text-gray-400">
                    <Image className="mx-auto text-gray-300" size={28} />
                    <span className="text-xs font-semibold block text-primary-600">Click to upload image</span>
                    <span className="text-[9px] block">Supports JPG, PNG, WEBP (Ratio 16:10)</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Visibility Checkbox */}
          <div className="flex items-center gap-2 py-2 select-none">
            <input
              type="checkbox"
              id="isVisibleCheck"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
            />
            <label htmlFor="isVisibleCheck" className="text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer">
              Display Live on Public Website
            </label>
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            {editId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold transition-all"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold shadow-md transition-all flex-grow"
            >
              {submitting ? 'Saving Item...' : editId ? 'Update Case Study' : 'Publish Case Study'}
            </button>
          </div>

        </form>
      </div>

      {/* Right List Panel */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-soft">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">
            Active Showcase items
          </span>
          <h3 className="font-display font-extrabold text-gray-800 text-sm sm:text-base">
            Total Case Studies Posted: {projects.length}
          </h3>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 space-y-2 shadow-soft">
            <Image size={32} className="mx-auto text-gray-300" />
            <p className="text-xs">No showcase items created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-soft hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img 
                      src={project.thumbnailUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm border border-white text-[9px] font-extrabold text-primary-600 uppercase tracking-widest">
                      {project.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h4 className="font-display font-bold text-gray-900 text-sm leading-snug truncate">
                      {project.title}
                    </h4>
                    <p className="text-gray-400 text-[10px] leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-4">
                  {/* Visibility Toggler */}
                  <button
                    onClick={() => handleToggleVisible(project)}
                    className="flex items-center gap-1 text-[10px] text-gray-500 font-bold hover:text-primary-600 transition-colors"
                  >
                    {project.isVisible ? (
                      <ToggleRight size={18} className="text-primary-600" />
                    ) : (
                      <ToggleLeft size={18} className="text-gray-300" />
                    )}
                    <span>{project.isVisible ? 'Visible' : 'Hidden'}</span>
                  </button>

                  {/* CRUD Operations */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditClick(project)}
                      className="p-1.5 rounded-lg border border-gray-200 bg-white hover:border-primary-100 hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-all shadow-sm"
                      title="Edit Case Study"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1.5 rounded-lg border border-red-100 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all shadow-sm"
                      title="Delete Case Study"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PortfolioCMS;
