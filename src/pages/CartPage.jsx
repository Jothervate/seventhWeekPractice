import Cart from "../component/Cart";
import { Outlet } from "react-router-dom";
const CartPage=({checkLogin,carts,removeTargetItem,clearCart,updateQty,total,finalTotal,getCart,resetCart})=>{
    return (
        <>
            <h1 className="text-dark text-center">
                購物車
            </h1>

            <div className="container mt-5">
                <div className="row">
                    <Cart 
                        checkLogin={checkLogin}
                        carts={carts}
                        removeTargetItem={removeTargetItem}
                        clearCart={clearCart}
                        updateQty={updateQty}
                        total={total}
                        finalTotal={finalTotal}
                        getCart={getCart}/>
                </div>
            </div>

            <div className='checkout-selection'>
                <Outlet context={{carts,total,finalTotal,resetCart}}/>
            </div>
        </>
    )
}

export default CartPage;