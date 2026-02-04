
import Pages from "./Pages";
import { Link } from 'react-router-dom'; //改成用鏈結來帶入詳細頁面

const ProductList=({checkLogin,products,pagination,onChangePages,addToCart,isLoading,isGetProducts})=>{

    // 換頁
    const handlePageChange=async(e,page)=>{
        e.preventDefault();
        onChangePages(page);
    };

    // 根據條件確認要顯示內容
    let content;

    
        if(isLoading){
            content =(
                <div className="d-flex justify-content-center" style={{marginTop: '100px'}}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )
        }
        
        else if(isGetProducts){
            content= (
                <div className="col-md-12">
                    <div className="d-flex justify-content-end mb-3">
                        <div className="d-flex gap-2">
                            
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
                                <div className="d-flex gap-2 justify-content-center align-item-center " role='group' aria-label="button-group"
                                style={{borderRadius:"10px"}}>
                                    <Link to={`/product/${item.id}`} className="btn btn-outline-success">
                                        查看細節
                                    </Link>
                                            

                                    <button type="button" className='btn btn-outline-primary'
                                    onClick={()=>addToCart(item.id)}>
                                        加入購物車<i className="bi bi-cart ms-1"></i>
                                    </button>       

                                </div>
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                            <td colSpan="5" className="text-center text-muted">
                                尚無產品資料!
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
    
    
    // 3. 既沒載入中，也沒成功：顯示錯誤 (這裡才會是載入失敗)
    else {
        content = (
            <div className="d-flex justify-content-center" style={{ marginTop: '100px' }}>
                <div className="bi bi-exclamation-octagon text-danger" style={{ fontSize: "40px" }}>
                    <h1 className="text-dange mt-3">載入失敗!</h1>
                    <p className="text-muted">請確認網路連線或API網址是否正確?</p>
                </div>
            </div>
        );
    }
    

    return (
        <>
            {content}
        </>
    )

}

export default ProductList;