type Category = {
  id: number;
  name: string;
  image?: string;
  active: boolean;
};

type Product = {
  id: number;
  name: string;
  price: number;
  categoryId?: number;
  category?: Category;
  image?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
};

type CartSidebarProps = {
  cart: CartItem[];
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  invoiceNumber: string;
  orderNumber: string;
  currentDate: Date | null;
  total: number;
  totalQuantity: number;
  increment: (product: Product) => void;
  decrement: (product: Product) => void;
  removeFromCart: (product: Product) => void;
  handlePrint: () => void;
  setShowConfirm: (show: boolean) => void;
};

export default function CartSidebar({
  cart,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  invoiceNumber,
  orderNumber,
  currentDate,
  total,
  totalQuantity,
  increment,
  decrement,
  removeFromCart,
  handlePrint,
  setShowConfirm,
}: CartSidebarProps) {
  return (
    <aside className="w-96 bg-white shadow-xl p-2 flex flex-col border-l border-slate-200 h-[84vh] overflow-hidden scrollbar-thin">
      {/* Invoice Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 flex-shrink-0 text-xs text-slate-400">
        <div>
          Invoice No: <span suppressHydrationWarning={true}>{invoiceNumber || "Loading..."}</span>
        </div>
        <div suppressHydrationWarning={true}>
          {currentDate ? `${currentDate.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "/")} | ${currentDate.toLocaleTimeString("en-US", { hour12: false })}` : ""}
        </div>
      </div>

      {/* Branding */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
          E
        </div>
        <div>
          <div className="text-lg font-bold text-slate-800">Easy Fashion</div>
          <div className="text-xs text-slate-500">info@easyfashion.com.bd</div>
        </div>
      </div>

      {/* Table & Order Info */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 flex-shrink-0">
        <div className="text-sm">
          <span className="text-slate-600">Items: <span className="text-orange-500 font-bold">{cart.length}</span></span>
        </div>
        <div className="text-sm">
          <span className="text-slate-600">Order: <span className="font-bold text-slate-800" suppressHydrationWarning={true}>{orderNumber || "Loading..."}</span></span>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="mb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Customer</label>
          <select
            value={selectedCustomer?.id || ""}
            onChange={(e) => {
              const customerId = e.target.value;
              const customer = customers.find(c => c.id === Number(customerId));
              setSelectedCustomer(customer || null);
            }}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Walk-in Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </option>
            ))}
          </select>
        </div>
        {/* {selectedCustomer && (
          <div className="mt-2 p-2 bg-orange-50 rounded-lg">
            <div className="text-xs text-orange-700">
              <div className="font-semibold">{selectedCustomer.name}</div>
              <div>{selectedCustomer.phone}</div>
              {selectedCustomer.email && <div>{selectedCustomer.email}</div>}
            </div>
          </div>
        )} */}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2 min-h-0 scrollbar-thin max-h-[calc(82vh-400px)]">
        {cart.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5"
          >
            {/* Product Image */}
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center shrink-0 overflow-hidden">
              {item.product.image ? (
                <img
                  src={`http://localhost:4000${item.product.image}`}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">🍕</span>
              )}
            </div>
            
            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-800 mb-0.5">
                {item.product.name}
              </div>
              <div className="text-xs text-orange-500 font-semibold mb-0.5">
                <span className="line-through text-slate-400 mr-1">${Number(item.product.price).toFixed(2)}</span>
              </div>
              <div className="text-xs text-slate-400">Size: large</div>
            </div>

            {/* Price */}
            <div className="text-base font-bold text-orange-500 mr-1">
              ${(Number(item.product.price) * item.quantity).toFixed(0)}
            </div>

            {/* Quantity Controls and Delete */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => decrement(item.product)}
                className="w-7 h-7 rounded-md bg-slate-200 text-slate-700 text-base font-bold flex items-center justify-center hover:bg-slate-300"
              >
                −
              </button>
              <div className="w-8 h-7 bg-slate-200 rounded-md flex items-center justify-center">
                <span className="text-sm font-bold text-slate-700">{item.quantity}</span>
              </div>
              <button
                onClick={() => increment(item.product)}
                className="w-7 h-7 rounded-md bg-slate-200 text-slate-700 text-base font-bold flex items-center justify-center hover:bg-slate-300"
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(item.product)}
                className="w-7 h-7 rounded-md bg-slate-200 text-slate-600 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        {cart.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No items in cart
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-slate-200 pt-3 mb-2 flex-shrink-0">
        <div className="flex justify-between items-center border-slate-200">
            <span className="text-lg font-bold text-slate-800">Total</span>
            <span className="text-2xl font-bold text-orange-500">${total.toFixed(2)}</span>
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Items: <span className="font-semibold text-slate-700">{cart.length}</span>, Quantity: <span className="font-semibold text-slate-700">{totalQuantity}</span>
          </div>

        {/* Action Buttons */}
        <button
          onClick={handlePrint}
          className="w-full py-3.5 mt-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 text-sm font-semibold mb-2 hover:bg-slate-50 transition-colors"
        >
          Print Invoice
        </button>
        <button
          onClick={() => cart.length && setShowConfirm(true)}
          disabled={cart.length === 0}
          className="w-full py-4 rounded-xl bg-teal-500 text-white text-base font-bold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Payment</span>
        </button>
      </div>
    </aside>
  );
}
