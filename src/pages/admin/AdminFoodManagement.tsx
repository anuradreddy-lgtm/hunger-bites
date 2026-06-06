import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { type Product } from '../../services/db';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiEyeOff, FiEye, FiActivity } from 'react-icons/fi';

export const AdminFoodManagement: React.FC = () => {
  const { products, createProduct, editProduct, removeProduct, showToast } = useApp();

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Burgers');
  const [price, setPrice] = useState(150);
  const [vegType, setVegType] = useState<'veg' | 'non-veg'>('veg');
  const [imageUrl, setImageUrl] = useState('');
  const [discount, setDiscount] = useState(0);
  const [available, setAvailable] = useState(true);
  
  // New local flag: hidden (not shown on client website, default to false)
  const [hidden, setHidden] = useState(false);

  const categories = ['All', 'Burgers', 'Pizza', 'Sandwiches', 'Biryani', 'Chinese', 'Snacks', 'Desserts', 'Beverages'];
  const formCategories = ['Burgers', 'Pizza', 'Sandwiches', 'Biryani', 'Chinese', 'Snacks', 'Desserts', 'Beverages'];

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory('Burgers');
    setPrice(150);
    setVegType('veg');
    setImageUrl('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80');
    setDiscount(0);
    setAvailable(true);
    setHidden(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setCategory(product.category);
    setPrice(product.price);
    setVegType(product.veg_type);
    setImageUrl(product.image_url);
    setDiscount(product.discount);
    setAvailable(product.available);
    // Cast hidden property check (in case it is set locally/globally)
    setHidden(product.hidden || false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a product name', 'warning');
      return;
    }
    if (price <= 0) {
      showToast('Please enter a valid price', 'warning');
      return;
    }

    const itemData = {
      name,
      description,
      category,
      price,
      veg_type: vegType,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      discount,
      available,
      rating: editingProduct ? editingProduct.rating : 4.2,
      hidden // save the hidden property
    };

    try {
      if (editingProduct) {
        await editProduct(editingProduct.id, itemData);
      } else {
        await createProduct(itemData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this food item permanently?')) {
      await removeProduct(id);
    }
  };

  const toggleStockStatus = async (product: Product) => {
    try {
      await editProduct(product.id, { available: !product.available });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHideStatus = async (product: Product) => {
    try {
      const currentHidden = product.hidden || false;
      await editProduct(product.id, { hidden: !currentHidden });
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Products list
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white">
            Food Menu Management
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
            Create, modify, hide, or delete products displayed on the Hunger Bites menu.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 cursor-pointer"
        >
          <FiPlus /> Add Food Item
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search bar */}
        <div className="relative w-full sm:max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search food by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Category selector */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 text-gray-600 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
          {categories.length > 5 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 dark:bg-gray-700 border-none text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="All" disabled={selectedCategory === 'All'}>More Categories</option>
              {categories.slice(5).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Food items inventory table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden lg:block">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700/60">
                <th className="p-4">Dish Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/30">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 text-xs">
                    No food items match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isHidden = product.hidden || false;
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-50/20 dark:hover:bg-gray-750/10 transition-colors ${
                        !product.available ? 'bg-red-50/10 dark:bg-red-950/5' : ''
                      }`}
                    >
                      {/* Dish title and image info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-gray-700"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900 dark:text-white">{product.name}</span>
                              <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${
                                product.veg_type === 'veg' 
                                  ? 'text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200' 
                                  : 'text-red-650 bg-red-50 dark:bg-red-950/20 border-red-200'
                              }`}>
                                {product.veg_type}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 font-semibold text-gray-650 dark:text-gray-305">
                        {product.category}
                      </td>

                      {/* Price */}
                      <td className="p-4">
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          ₹{Math.round(product.price * (1 - product.discount / 100))}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-[10px] text-gray-400 line-through block">
                            ₹{product.price}
                          </span>
                        )}
                      </td>

                      {/* Discount percentage */}
                      <td className="p-4 font-bold text-primary">
                        {product.discount > 0 ? `${product.discount}% OFF` : 'None'}
                      </td>

                      {/* Stock Status toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => toggleStockStatus(product)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-black tracking-wide uppercase transition-colors cursor-pointer ${
                            product.available
                              ? 'bg-green-105 text-green-700 hover:bg-green-200'
                              : 'bg-red-105 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {product.available ? 'In Stock' : 'Out Of Stock'}
                        </button>
                      </td>

                      {/* Visibility Status toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => toggleHideStatus(product)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-[10px] font-bold ${
                            !isHidden
                              ? 'bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-700 border-gray-100 dark:border-gray-600'
                              : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-202'
                          }`}
                          title={!isHidden ? 'Currently Visible to customer' : 'Hidden from customer'}
                        >
                          {!isHidden ? <FiEye /> : <FiEyeOff />}
                          <span>{!isHidden ? 'Visible' : 'Hidden'}</span>
                        </button>
                      </td>

                      {/* Item Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100/30 cursor-pointer"
                            title="Edit product"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors border border-red-100/30 cursor-pointer"
                            title="Delete product"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="block lg:hidden p-4 space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              No food items match your filter criteria.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isHidden = product.hidden || false;
              return (
                <div
                  key={product.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    !product.available
                      ? 'bg-red-50/10 dark:bg-red-950/5 border-red-100/30'
                      : 'bg-gray-50/50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-700/60'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 dark:border-gray-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                              {product.name}
                            </span>
                            <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${
                              product.veg_type === 'veg' 
                                ? 'text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200' 
                                : 'text-red-650 bg-red-50 dark:bg-red-950/20 border-red-200'
                            }`}>
                              {product.veg_type}
                            </span>
                          </div>
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold px-2 py-0.5 rounded mt-1 inline-block">
                            {product.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-405 mt-1.5 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-705 flex items-center justify-between gap-4">
                    {/* Price and Discount Info */}
                    <div>
                      <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                        ₹{Math.round(product.price * (1 - product.discount / 100))}
                      </span>
                      {product.discount > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-gray-400 line-through">
                            ₹{product.price}
                          </span>
                          <span className="text-[9px] font-bold text-primary">
                            {product.discount}% OFF
                          </span>
                        </div>
                      ) : (
                        <div className="text-[9px] text-gray-400">Regular price</div>
                      )}
                    </div>

                    {/* Stock & Visibility Toggles */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStockStatus(product)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wide uppercase transition-colors cursor-pointer ${
                          product.available
                            ? 'bg-green-100 text-green-700 hover:bg-green-205'
                            : 'bg-red-100 text-red-700 hover:bg-red-205'
                        }`}
                      >
                        {product.available ? 'In Stock' : 'Out Of Stock'}
                      </button>

                      <button
                        onClick={() => toggleHideStatus(product)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-[9px] font-bold ${
                          !isHidden
                            ? 'bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-700 border-gray-100 dark:border-gray-600'
                            : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'
                        }`}
                        title={!isHidden ? 'Visible to customers' : 'Hidden from customers'}
                      >
                        {!isHidden ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
                        <span>{!isHidden ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Row (Edit, Delete) */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-705 flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100/30 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    >
                      <FiEdit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors border border-red-100/30 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ADD / EDIT FOOD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-700/50 pb-3">
              <h3 className="font-display font-extrabold text-xl text-gray-900 dark:text-white flex items-center gap-1.5">
                <FiActivity className="text-primary" /> {editingProduct ? 'Edit Food Details' : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Food Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Food Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cheese Burst Burger"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe ingredients, cooking details, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Category & Diet Choice */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {formCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block">Diet Badge</label>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-xl border border-gray-105 dark:border-gray-700/60 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setVegType('veg')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        vegType === 'veg'
                          ? 'bg-white dark:bg-gray-800 text-green-650 shadow-sm border border-green-100/30'
                          : 'text-gray-500'
                      }`}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setVegType('non-veg')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        vegType === 'non-veg'
                          ? 'bg-white dark:bg-gray-800 text-red-650 shadow-sm border border-red-100/30'
                          : 'text-gray-500'
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              {/* Price & Discount percentage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Price (INR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Food Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Food Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-105 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Checkbox Options */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span>Mark as In Stock</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hidden}
                    onChange={(e) => setHidden(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                  <span>Hide from Customer Menu</span>
                </label>
              </div>

              {/* Save / Cancel buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-600 dark:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminFoodManagement;
