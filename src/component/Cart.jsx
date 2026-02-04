import { useEffect } from "react";
import { Link } from "react-router-dom";

const Cart=({
    carts,
    removeTargetItem,
    clearCart,
    updateQty,
    total,
    finalTotal,
    getCart
    })=>{

    // 當進入此頁面時，主動呼叫 API 取得最新購物車內容
    useEffect(()=>{
        getCart();
    },[]);

    // 檢查是否有購物車資料
    const hasItems = carts&&carts.length>0

    return(
    <div className="col-md-12">

        {/* 按鈕區 */}
        <div className="d-flex justify-content-end mb-3">
            <div className='d-flex gap-2'>
                <button
                    className={`btn btn-outline-primary ${!hasItems? "disabled":""}`}
                    type="button">
                        <Link to='/cart/CheckOutPage' className="text-decoration-none" style={{color:"inherit"}}>
                            結帳 <i className='bi bi-cart-check' />
                        </Link>
                </button>

                <button
                    className={`btn btn-outline-danger`}
                    type="button"
                    onClick={()=>clearCart()}
                    disabled={!hasItems}>
                        刪除全部 <i className="bi bi-trash"></i>
                </button>
            </div>
        </div>

        {/* 表格區 */}
        <table className="table">
            <thead>
                <tr>
                    <th>產品名稱</th>
                    <th>售價</th>
                    <th>數量</th>
                    <th>小計</th>
                    <th>操作</th>
                </tr>
            </thead>
            
            <tbody>
                {
                    hasItems?(
                        // 有物件
                        carts.map((item)=>(
                            <tr key={item.id}>
                                <td>{item.product.title}</td>
                                <td>{item.product.price}</td>
                                <td className="align-middle">
                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-secondary border-0 px-1"
                                            onClick={()=>updateQty(item,'minus')}
                                            disabled={item.qty<=1}>

                                            <i className="bi bi-dash-lg" style={{ fontSize: "0.8rem" }} />

                                        </button>

                                        <span className="fw-bold">{item.qty}</span>

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary border-0 px-1"
                                            onClick={() => updateQty(item, "add")}
                                        >
                                            <i className="bi bi-plus-lg" style={{ fontSize: "0.8rem" }} />
                                        </button>
                                    </div>
                                </td>

                                <td>
                                    {/* 判斷：如果不相等，代表有打折 */}
                                    {item.total !== item.final_total ? (
                                        <>
                                        {/* 原價：加上刪除線、變灰色、變小字 */}
                                        <del className="text-secondary">
                                            {item.total}
                                        </del>
                                        {/* 優惠價：正常顯示 */}
                                        {item.final_total}
                                        </>
                                    ) : (
                                        // 如果相等（沒打折），直接顯示原價即可
                                        item.total
                                    )}
                                </td>

                                <td>
                                    {/* 3. 修正 Bug: 這裡要傳 item.id，而不是 item */}
                                    <button 
                                        type="button" 
                                        className="btn btn-danger" 
                                        onClick={() => removeTargetItem(item.id)}
                                    >
                                        移除 <i className="bi bi-trash"></i>
                                    </button>
                                </td>

                            </tr>
                        ))
                    ):(
                        // 空狀態
                        <tr>
                            <td colSpan="5" className="text-center py-5">
                                <div className="d-flex flex-column align-items-center">
                                    <i className="bi bi-cart-x text-muted" style={{ fontSize: "2rem" }}></i>
                                    <p className="text-muted mt-2">購物車目前沒有商品</p>
                                    <Link to="/products" className="btn btn-primary btn-sm mt-2">
                                        去逛逛
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    )
                }
            </tbody>

            {/* 總計區 */}
            <tfoot>
                {hasItems&& (
                    <tr>
                        <td colSpan="3" className="text-end fw-bold">總計</td>
                        <td className="text-end fw-bold text-danger">
                            {finalTotal!==total?(
                                <>
                                    <del className="text-secondary">NT {total}</del>
                                    NT {finalTotal}
                                </>
                            ):(
                                <>
                                    NT {total}
                                </>
                            )}
                        </td>
                        <td></td>
                    </tr>
                )}
            </tfoot>

        </table>
    </div>)
}

export default Cart;