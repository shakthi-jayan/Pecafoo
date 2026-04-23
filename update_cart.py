import sys

cart_path = r'c:\Users\Machodev\OneDrive\Document\Pecafoo\frontend\customer-app\src\pages\CartPage.jsx'

with open(cart_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add payment_method state
if 'const [paymentMethod, setPaymentMethod] = useState(\\'cod\\');' not in content:
    content = content.replace(
        "const [specialInstructions, setSpecialInstructions] = useState('');",
        "const [specialInstructions, setSpecialInstructions] = useState('');\n    const [paymentMethod, setPaymentMethod] = useState('cod');"
    )

    # Load Razorpay script function
    import_scripts = """
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };
"""
    content = content.replace('const handlePlaceOrder = async () => {', import_scripts + '\n    const handlePlaceOrder = async () => {')

    old_place_order = """            await ordersAPI.create({
                restaurant_id: restaurant.id,
                items: cartItems.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
                delivery_address: deliveryAddress,
                delivery_latitude: Number(deliveryCoords[0]).toFixed(6),
                delivery_longitude: Number(deliveryCoords[1]).toFixed(6),
                special_instructions: specialInstructions,
                payment_method: 'cod',
            });
            clearCart();
            toast.success('Order placed! 🎉');
            navigate('/orders');"""

    new_place_order = """            const { data: order } = await ordersAPI.create({
                restaurant_id: restaurant.id,
                items: cartItems.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
                delivery_address: deliveryAddress,
                delivery_latitude: Number(deliveryCoords[0]).toFixed(6),
                delivery_longitude: Number(deliveryCoords[1]).toFixed(6),
                special_instructions: specialInstructions,
                payment_method: paymentMethod, // updated to use state
            });
            
            if (paymentMethod === 'razorpay') {
                const res = await loadRazorpay();
                if (!res) {
                    toast.error('Failed to load Razorpay SDK');
                    setPlacing(false);
                    return;
                }
                
                const { data: initData } = await ordersAPI.initiatePayment(order.id, 'razorpay');
                
                const options = {
                    key: initData.key_id,
                    amount: initData.amount,
                    currency: initData.currency,
                    name: 'Pecafoo',
                    description: 'Order Payment',
                    order_id: initData.razorpay_order_id,
                    handler: async function (response) {
                        try {
                            setPlacing(true);
                            await ordersAPI.verifyRazorpay({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            });
                            clearCart();
                            toast.success('Payment successful! Order placed. 🎉');
                            navigate('/orders');
                        } catch (err) {
                            toast.error('Payment verification failed.');
                            setPlacing(false);
                        }
                    },
                    prefill: {
                        name: 'Customer', // Would use real name if available
                        email: 'customer@pecafoo.com',
                        contact: '9999999999'
                    },
                    theme: {
                        color: '#ff5a1f' // Matches pecafoo accent variable
                    }
                };
                
                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
                paymentObject.on('payment.failed', function () {
                    toast.error('Payment failed. Please try again.');
                    setPlacing(false);
                });
            } else {
                clearCart();
                toast.success('Order placed! 🎉');
                navigate('/orders');
            }"""
            
    content = content.replace(old_place_order, new_place_order)

    payment_ui = """
                {/* Payment Method Selector */}
                <div className="card" style={{ padding: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Payment Method</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={() => setPaymentMethod('cod')}
                            className={`btn ${paymentMethod === 'cod' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1, padding: 12 }}
                        >
                            Cash on Delivery
                        </button>
                        <button
                            onClick={() => setPaymentMethod('razorpay')}
                            className={`btn ${paymentMethod === 'razorpay' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1, padding: 12 }}
                        >
                            Pay Online (Razorpay)
                        </button>
                    </div>
                </div>
"""
    
    content = content.replace('                {/* Place Order */}', payment_ui + '\n                {/* Place Order */}')

    with open(cart_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('CartPage modified to include payment options.')
else:
    print('CartPage already modified.')
