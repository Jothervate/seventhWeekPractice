import { useState,useEffect } from "react";
import axios from "axios";
import { API_BASE,API_PATH } from "../Constants/config";
import { Link } from "react-router-dom";
const Order = ({isAuth}) => {
    const [orderSources, setOrderSources] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getOrderDatas = async () => {
            setIsLoading(true);
            try {
                // 通常 API 會有分頁，這裡先示範取得預設第一頁
                const res = await axios.get(`${API_BASE}/api/${API_PATH}/orders`);
                console.log("訂單資料:", res.data);
                setOrderSources(res.data?.orders || []);
            } catch (err) {
                console.error("取得訂單失敗", err);
            } finally {
                setIsLoading(false);
            }
        }

        getOrderDatas();
    }, []);

    // 格式化時間戳記的輔助函式 (Unix Timestamp -> YYYY/MM/DD)
    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString(); // 例如：2026/2/5 上午10:00:00
    };

    let content;

    if(!isAuth){
        content=(
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
        )
    }

    else{
        content=(
            <>
            {isLoading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-primary">
                            <tr>
                                <th scope="col" width="120">訂單編號</th>
                                <th scope="col" width="150">下單時間</th>
                                <th scope="col">購買人資訊</th>
                                <th scope="col">購買品項</th>
                                <th scope="col" width="100" className="text-end">總金額</th>
                                <th scope="col" width="120" className="text-center">付款狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderSources.length > 0 ? (
                                orderSources.map((order) => (
                                    <tr key={order.id}>
                                        {/* 訂單編號 (取前幾碼顯示就好，太長不好看) */}
                                        <td>
                                            <span className="badge bg-secondary">{order.id.slice(0, 8)}...</span>
                                        </td>
                                        
                                        {/* 時間 */}
                                        <td className="small text-muted">{formatDate(order.create_at)}</td>
                                        
                                        {/* 購買人 (顯示 Name 與 Email) */}
                                        <td>
                                            <div className="fw-bold">{order.user.name}</div>
                                            <div className="small text-muted">{order.user.email}</div>
                                        </td>
                                        
                                        {/* 產品列表 (因為 products 是物件，要轉成陣列來跑 map) */}
                                        <td>
                                            <ul className="list-unstyled mb-0 small">
                                                {Object.values(order.products).map((product) => (
                                                    <li key={product.id}>
                                                        • {product.product.title} x {product.qty} {product.product.unit}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        
                                        {/* 總金額 */}
                                        <td className="text-end fw-bold">
                                            NT$ {Math.round(order.total).toLocaleString()}
                                        </td>
                                        
                                        {/* 付款狀態 (根據 boolean 變換顏色) */}
                                        <td className="text-center">
                                            {order.is_paid ? (
                                                <span className="text-success fw-bold">
                                                    <i className="bi bi-check-circle-fill me-1"></i>已付款
                                                </span>
                                            ) : (
                                                <span className="text-danger fw-bold">
                                                    <i className="bi bi-x-circle-fill me-1"></i>未付款
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // 如果沒有訂單顯示這個
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        目前沒有任何訂單資料
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            </>
        )
    }
    return (
        
        <div className="container mt-5">
            <h1 className='text-center mb-4'>訂單列表</h1>
            {content}
        </div>
    );
}

export default Order;