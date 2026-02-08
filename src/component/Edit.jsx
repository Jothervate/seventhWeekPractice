import { NEW_PRODUCT_DATA } from "../Constants/config";
import Pages from "./Pages";
import { Link } from "react-router-dom";

const Edit=({openModal,products,checkLogin,pagination,onChangePages,isLoading,isGetDatas,isAuth})=>{
    // 換頁
    const handlePageChange=async(e,page)=>{
        e.preventDefault();
        onChangePages(page);
    };

    //根據載入內容決定傳入資訊內容
    let content;

    if(isLoading){
            content= (
                <div className="d-flex justify-content-center" style={{marginTop: '100px'}}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )
        }
    
    
        if(isAuth){
            if(isGetDatas){
                content=(
                    <div className="col-md-12">
                        <div className="d-flex justify-content-end mb-3">
                            <div className="d-flex gap-2">
                            
                                <button type="button" className="btn btn-outline-primary" onClick={()=>openModal("create",NEW_PRODUCT_DATA)}>
                                    新增產品
                                </button>
                                
                                <button type="button" className="btn btn-outline-danger" onClick={checkLogin}>
                                    檢查登入狀態
                                </button>
                                
                            </div>
                        </div>

                        <table className="table">
                            <thead>
                            <tr>
                                <th>產品名稱</th>
                                <th>原價</th>
                                <th>售價</th>
                                <th>是否啟用</th>
                                <th>執行動作</th>
                            </tr>
                            </thead>

                            <tbody>
                                {products && products.length > 0 ? (
                                    products.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.title}</td>
                                        <td>{item.origin_price}</td>
                                        <td>{item.price}</td>
                                        <td>
                                        <span className={item.is_enabled ? "text-success" : "text-danger"}>
                                            {item.is_enabled ? "啟用" : "未啟用"}
                                        </span>
                                        </td>
                                        <td>
                                        <div className="d-flex gap-2 justify-content-center align-item-center " role='group' aria-label="button-group"
                                        style={{borderRadius:"10px"}}>
                                            
                                            <button type="button" className="btn btn-outline-primary"
                                            onClick={()=>openModal('edit',item)}>
                                                編輯產品
                                            </button>

                                            <button type="button" className="btn btn-outline-danger"
                                            onClick={()=>openModal("delete",item)}>
                                                刪除產品
                                            </button>                     
                                        </div>
                                        </td>
                                    </tr>
                                    ))
                                ) : (
                                    <tr>
                                    <td colSpan="5" className="text-center text-muted">
                                        正在載入產品或尚無產品資料...
                                    </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                    
                        {/* {Pages start} */}
                        <Pages 
                            handlePageChange={handlePageChange}
                            pagination={pagination}/>
                        {/* {Pages end} */}
                    </div>
                )
            }
            else{
                content=(
                    <div className="d-flex justify-content-center" style={{marginTop: '100px'}}>
                            <div className="bi bi-exclamation-octagon text-danger" style={{fontSize:"40px"}}>
                                <h1 className="text-dange mt-3">載入失敗!</h1>
                                <p className="text-muted">請確認網路連線或API網址是否正確?</p>
                            </div>
                        </div>
                )
            }
        }
    else{
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
        }


    return (
        <>
            {content}
        </>
    )
}


export default Edit;