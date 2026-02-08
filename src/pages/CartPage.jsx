import Cart from "../component/Cart";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
const CartPage=({checkLogin,carts,removeTargetItem,clearCart,updateQty,total,finalTotal,getCart,resetCart,isAuth})=>{

    let content;

    if(!isAuth){
        content = (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ marginTop: '100px' }}>
                {/* 加個鎖頭 icon 更有感覺 (需有 Bootstrap Icons) */}
                <i className="bi bi-shield-lock text-secondary" style={{ fontSize: "60px" }}></i>
                <h2 className="text-danger mt-3">你無此權限</h2>
                <p className="text-muted fs-5">請先登入驗證身分才可進行編輯</p>
                {/* 貼心小功能：給個按鈕讓他們去登入 */}
                <Link className="btn btn-primary mt-2" to='/login'>
                    前往登入
                </Link>
            </div>
        );
    }else{
        content=(
            <>
                

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

    return (
        <>
            <h1 className="text-dark text-center mt-5">購物車</h1>
            {content}
        </>
    )
}

export default CartPage;