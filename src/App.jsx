import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, ArrowLeft, Package, Star, Sparkles, Gift } from 'lucide-react';

const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState('search');
  const [cart, setCart] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Products', icon: '🛒' },
    { id: 'fruit', name: 'Fruit', icon: '🍎' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
    { id: 'bakery', name: 'Bakery', icon: '🥖' }
  ];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://uxdlyqjm9i.execute-api.eu-west-1.amazonaws.com/s?category=${selectedCategory}`);
        const data = await response.json();
        
        // Ensure all numeric fields are properly converted
        const processedData = data.map(product => {
          // Handle different price formats
          let price = product.price;
          if (typeof price === 'string') {
            // Remove any currency symbols and convert to number
            price = parseFloat(price.replace(/[$£€,]/g, ''));
          }
          // If still NaN, set a default price
          if (isNaN(price) || price === null || price === undefined) {
            price = 0.00;
          }

          let stock = product.stock;
          if (typeof stock === 'string') {
            stock = parseInt(stock);
          }
          if (isNaN(stock) || stock === null || stock === undefined) {
            stock = 0;
          }

          // Handle image URLs - check multiple possible fields
          let imageUrl = product.image || product.imageUrl || product.img || product.picture;
          
          // If no image URL provided, create a better fallback
          if (!imageUrl) {
            // Create a colorful placeholder based on category
            const categoryColors = {
              'fruit': '4ADE80/FFFFFF',
              'drinks': '3B82F6/FFFFFF', 
              'bakery': 'F59E0B/FFFFFF',
              'default': '8B5CF6/FFFFFF'
            };
            const colorScheme = categoryColors[product.category] || categoryColors.default;
            imageUrl = `https://placehold.co/300x200/${colorScheme}?text=${encodeURIComponent(product.name || 'Product')}`;
          }

          return {
            ...product,
            price: price,
            stock: stock,
            image: imageUrl,
            id: product.id || Math.random().toString(36).substr(2, 9) // Generate ID if missing
          };
        });
        
        console.log('Processed products:', processedData); // Debug log
        setProducts(processedData);
        setFilteredProducts(processedData);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback data for demo
        const fallbackData = [
          { id: 1, name: 'Coca-Cola', price: 2.99, stock: 15, category: 'drinks', image: 'https://placehold.co/200x200/FF0000/FFFFFF?text=Coke' },
          { id: 2, name: 'Apple', price: 0.99, stock: 8, category: 'fruit', image: 'https://placehold.co/200x200/FF6B6B/FFFFFF?text=Apple' },
          { id: 3, name: 'Croissant', price: 1.49, stock: 12, category: 'bakery', image: 'https://placehold.co/200x200/F4A261/FFFFFF?text=Croissant' },
          { id: 4, name: 'Coffee', price: 3.99, stock: 20, category: 'drinks', image: 'https://placehold.co/200x200/8B4513/FFFFFF?text=Coffee' },
          { id: 5, name: 'Banana', price: 0.79, stock: 5, category: 'fruit', image: 'https://placehold.co/200x200/FFE135/000000?text=Banana' },
          { id: 6, name: 'Bread', price: 2.29, stock: 18, category: 'bakery', image: 'https://placehold.co/200x200/DEB887/000000?text=Bread' }
        ];
        setProducts(fallbackData);
        setFilteredProducts(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Search functionality
  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Enhanced offer calculation with better product matching
  const calculateCartDetails = () => {
    let subtotal = 0;
    let freeItems = [];
    let totalDiscount = 0;
    let appliedOffers = [];

    // Calculate base subtotal
    Object.entries(cart).forEach(([productId, quantity]) => {
      const product = products.find(p => p.id.toString() === productId);
      if (product) {
        const price = getSafePrice(product.price);
        subtotal += price * quantity;
      }
    });

    // Apply offers with improved product matching
    Object.entries(cart).forEach(([productId, quantity]) => {
      const product = products.find(p => p.id.toString() === productId);
      if (!product) return;

      const price = getSafePrice(product.price);

      // Offer 1: Buy 6 Coca-Cola, get 1 free (more flexible matching)
      if (product.name.toLowerCase().includes('coca') || 
          product.name.toLowerCase().includes('coke') ||
          product.name.toLowerCase().includes('cola')) {
        if (quantity >= 6) {
          const freeQuantity = Math.floor(quantity / 6);
          freeItems.push({ 
            ...product, 
            price, 
            freeQuantity, 
            reason: 'Buy 6 Coca-Cola, get 1 free',
            offerId: 'coca-cola-offer'
          });
          totalDiscount += price * freeQuantity;
          appliedOffers.push({
            id: 'coca-cola-offer',
            description: `Buy 6 Coca-Cola, get ${freeQuantity} free`,
            discount: price * freeQuantity
          });
        }
      }

      // Offer 2: Buy 3 croissants, get free coffee (improved matching)
      if (product.name.toLowerCase().includes('croissant')) {
        if (quantity >= 3) {
          const freeQuantity = Math.floor(quantity / 3);
          // Find coffee product with better matching
          const coffee = products.find(p => 
            p.name.toLowerCase().includes('coffee') || 
            p.name.toLowerCase().includes('espresso') ||
            p.name.toLowerCase().includes('cappuccino')
          );
          
          if (coffee) {
            const coffeePrice = getSafePrice(coffee.price);
            freeItems.push({ 
              ...coffee, 
              price: coffeePrice, 
              freeQuantity, 
              reason: 'Buy 3 croissants, get free coffee',
              offerId: 'croissant-coffee-offer'
            });
            totalDiscount += coffeePrice * freeQuantity;
            appliedOffers.push({
              id: 'croissant-coffee-offer',
              description: `Buy 3 croissants, get ${freeQuantity} free coffee`,
              discount: coffeePrice * freeQuantity
            });
          }
        }
      }
    });

    const total = Math.max(0, subtotal - totalDiscount); // Ensure total doesn't go negative

    return { subtotal, freeItems, totalDiscount, total, appliedOffers };
  };

  const addToCart = (productId) => {
    const product = products.find(p => p.id.toString() === productId);
    if (product && product.stock > 0) {
      setCart(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) + 1
      }));
    }
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  // Helper function to safely get price
  const getSafePrice = (price) => {
    if (typeof price === 'string') {
      const cleanPrice = parseFloat(price.replace(/[$£€,]/g, ''));
      return isNaN(cleanPrice) ? 0 : cleanPrice;
    }
    return isNaN(price) || price === null || price === undefined ? 0 : price;
  };

  const getTotalCartItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const getStockDisplay = (stock) => {
    return stock >= 10 ? 'Available' : `${stock} left`;
  };

  // Check if product qualifies for offers
  const getProductOfferInfo = (product) => {
    const quantity = cart[product.id] || 0;
    const offers = [];

    // Coca-Cola offer
    if (product.name.toLowerCase().includes('coca') || 
        product.name.toLowerCase().includes('coke') ||
        product.name.toLowerCase().includes('cola')) {
      const needed = 6 - (quantity % 6);
      if (quantity >= 6) {
        offers.push({ type: 'active', text: `${Math.floor(quantity / 6)} FREE items applied!` });
      } else if (quantity > 0) {
        offers.push({ type: 'progress', text: `Buy ${needed} more for 1 FREE` });
      } else {
        offers.push({ type: 'available', text: 'Buy 6, get 1 FREE' });
      }
    }

    // Croissant offer
    if (product.name.toLowerCase().includes('croissant')) {
      const needed = 3 - (quantity % 3);
      if (quantity >= 3) {
        offers.push({ type: 'active', text: `${Math.floor(quantity / 3)} FREE coffee applied!` });
      } else if (quantity > 0) {
        offers.push({ type: 'progress', text: `Buy ${needed} more for FREE coffee` });
      } else {
        offers.push({ type: 'available', text: 'Buy 3, get FREE coffee' });
      }
    }

    return offers;
  };

  const SearchResultsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-gradient-to-r from-purple-500 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl">
                <Package className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Fresh Market
              </h1>
            </div>
            <button
              onClick={() => setCurrentPage('checkout')}
              className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">Cart</span>
              {getTotalCartItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold animate-pulse">
                  {getTotalCartItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-purple-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-lg"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Offers Banner */}
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Gift className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Special Offers Available!</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-2">🥤 Coca-Cola Deal</h3>
              <p>Buy 6 cans of Coca-Cola and get 1 absolutely FREE!</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-2">🥐 Breakfast Combo</h3>
              <p>Buy 3 croissants and get a FREE coffee to go with it!</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => {
              const offers = getProductOfferInfo(product);
              const isOutOfStock = product.stock === 0;
              const quantity = cart[product.id] || 0;
              
              return (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.image || `https://placehold.co/300x200/6366F1/FFFFFF?text=${encodeURIComponent(product.name)}`}
                      alt={product.name}
                      className={`w-full h-48 object-cover ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                    />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${
                      isOutOfStock ? 'bg-red-100 text-red-800' :
                      product.stock >= 10 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : getStockDisplay(product.stock)}
                    </div>
                    
                    {/* Offer badges */}
                    {offers.length > 0 && (
                      <div className="absolute top-4 left-4">
                        {offers.map((offer, index) => (
                          <div key={index} className={`px-2 py-1 rounded-full text-xs font-bold mb-1 ${
                            offer.type === 'active' ? 'bg-green-500 text-white animate-pulse' :
                            offer.type === 'progress' ? 'bg-yellow-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            <Gift className="w-3 h-3 inline mr-1" />
                            {offer.type === 'active' ? 'OFFER ACTIVE!' : 
                             offer.type === 'progress' ? 'ALMOST THERE!' : 'OFFER'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                    
                    {/* Offer details */}
                    {offers.length > 0 && (
                      <div className="mb-3">
                        {offers.map((offer, index) => (
                          <p key={index} className={`text-sm font-semibold ${
                            offer.type === 'active' ? 'text-green-600' :
                            offer.type === 'progress' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`}>
                            {offer.text}
                          </p>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-purple-600">
                        ${getSafePrice(product.price).toFixed(2)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-gray-600 text-sm">4.5</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      {quantity > 0 ? (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-lg min-w-[2rem] text-center">{quantity}</span>
                          <button
                            onClick={() => addToCart(product.id)}
                            disabled={isOutOfStock || quantity >= product.stock}
                            className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product.id)}
                          disabled={isOutOfStock}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );

  const CheckoutPage = () => {
    const { subtotal, freeItems, totalDiscount, total, appliedOffers } = calculateCartDetails();

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-100">
        {/* Header */}
        <div className="bg-white shadow-lg border-b-4 border-gradient-to-r from-green-500 to-blue-500">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage('search')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
                <span className="text-lg font-semibold">Back to Shopping</span>
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Checkout
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {Object.keys(cart).length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-6">🛒</div>
              <h2 className="text-3xl font-bold text-gray-600 mb-4">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">Add some products to get started!</p>
              <button
                onClick={() => setCurrentPage('search')}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Regular Cart Items */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <ShoppingCart className="w-6 h-6 mr-3" />
                    Cart Items
                  </h2>
                  
                  <div className="space-y-4">
                    {Object.entries(cart).map(([productId, quantity]) => {
                      const product = products.find(p => p.id.toString() === productId);
                      if (!product) return null;
                      
                      return (
                        <div key={productId} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          <img
                            src={product.image || `https://placehold.co/80x80/6366F1/FFFFFF?text=${encodeURIComponent(product.name)}`}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{product.name}</h3>
                            <p className="text-gray-600">
                              ${getSafePrice(product.price).toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => removeFromCart(productId)}
                              className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-lg min-w-[2rem] text-center">{quantity}</span>
                            <button
                              onClick={() => addToCart(productId)}
                              className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              ${(getSafePrice(product.price) * quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Applied Offers Summary */}
                {appliedOffers.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
                    <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                      <Sparkles className="w-6 h-6 mr-3" />
                      Applied Offers
                    </h2>
                    
                    <div className="space-y-3">
                      {appliedOffers.map((offer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-green-200">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-500 text-white p-2 rounded-full">
                              <Gift className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-gray-800">{offer.description}</span>
                          </div>
                          <span className="font-bold text-green-600">-${offer.discount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Free Items */}
                {freeItems.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
                    <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                      <Gift className="w-6 h-6 mr-3" />
                      Free Items Added!
                    </h2>
                    
                    <div className="space-y-4">
                      {freeItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-green-300 shadow-md">
                          <div className="relative">
                            <img
                              src={item.image || `https://placehold.co/60x60/10B981/FFFFFF?text=FREE`}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              FREE
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{item.name} (FREE)</h3>
                            <p className="text-sm text-green-600">{item.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">Qty: {item.freeQuantity}</p>
                            <p className="text-sm text-gray-500 line-through">${(item.price * item.freeQuantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-lg">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-lg text-green-600">
                        <span>Discount:</span>
                        <span>-${totalDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-2xl font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg mt-6 hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Proceed to Payment
                  </button>
                  
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Secure checkout with 256-bit SSL encryption
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return currentPage === 'search' ? <SearchResultsPage /> : <CheckoutPage />;
};

export default App;
