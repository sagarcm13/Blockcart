import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { addProduct } from '../../../api';

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    features: ['', '', '', ''],
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const queryClient = useQueryClient();

  const addProductMutation = useMutation(addProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('sellerProducts');
      setFormData({
        name: '',
        description: '',
        price: '',
        features: ['', '', '', ''],
        images: []
      });
      setImageFiles([]);
    }
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    // Convert files to base64
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(base64Images => {
      setFormData(prev => ({ ...prev, images: base64Images }));
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addProductMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full bg-gray-700 rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full bg-gray-700 rounded p-2"
          rows="4"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Price</label>
        <input
          type="number"
          value={formData.price}
          onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
          className="w-full bg-gray-700 rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Features</label>
        {[0, 1, 2, 3].map(index => (
          <input
            key={index}
            type="text"
            value={formData.features[index]}
            onChange={e => handleFeatureChange(index, e.target.value)}
            className="w-full bg-gray-700 rounded p-2 mb-2"
            placeholder={`Feature ${index + 1}`}
            required
          />
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Product Images (4 images required)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="w-full bg-gray-700 rounded p-2"
          required
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {formData.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Preview ${index + 1}`}
              className="w-full h-32 object-cover rounded"
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        disabled={addProductMutation.isLoading}
      >
        {addProductMutation.isLoading ? 'Adding Product...' : 'Add Product'}
      </button>
    </form>
  );
};

export default AddProductForm; 