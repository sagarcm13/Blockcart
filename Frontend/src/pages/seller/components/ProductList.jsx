import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { updateProduct, deleteProduct } from '../../../api';

const ProductList = ({ products, isLoading }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  const updateProductMutation = useMutation(updateProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('sellerProducts');
      setEditingProduct(null);
    }
  });

  const deleteProductMutation = useMutation(deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('sellerProducts');
    }
  });

  if (isLoading) {
    return <div className="text-center">Loading products...</div>;
  }

  if (!products?.length) {
    return <div className="text-center">No products found. Add your first product!</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product.id} className="bg-gray-800 rounded-lg p-6">
          {editingProduct?.id === product.id ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editingProduct.name}
                onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full bg-gray-700 rounded p-2"
              />
              <textarea
                value={editingProduct.description}
                onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="w-full bg-gray-700 rounded p-2"
              />
              <input
                type="number"
                value={editingProduct.price}
                onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
                className="w-full bg-gray-700 rounded p-2"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => updateProductMutation.mutate(editingProduct)}
                  className="bg-blue-500 px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="bg-gray-500 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover rounded-lg"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-400 mb-4">{product.description}</p>
              <p className="text-2xl font-bold mb-4">${product.price}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="bg-blue-500 px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProductMutation.mutate(product.id)}
                  className="bg-red-500 px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductList; 